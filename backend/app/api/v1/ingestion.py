import uuid
import csv
import io
import time
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.deps import get_api_key_org, get_current_user, get_org_member
from app.models.user import User
from app.schemas.ingestion import EventIngest, DataSourceCreate, DataSourceOut
from app.tasks.ingestion_tasks import process_event
from app.models.data_source import DataSource, SourceType
from sqlalchemy import select

router = APIRouter(tags=["ingestion"])


# --- Data Sources ---
@router.post("/orgs/{org_id}/sources", response_model=DataSourceOut, status_code=201)
async def create_source(
    org_id: uuid.UUID,
    body: DataSourceCreate,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    source = DataSource(org_id=org_id, **body.model_dump())
    db.add(source)
    await db.flush()
    return source


@router.get("/orgs/{org_id}/sources", response_model=list[DataSourceOut])
async def list_sources(
    org_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(DataSource).where(DataSource.org_id == org_id))
    return list(result.scalars().all())


@router.delete("/orgs/{org_id}/sources/{source_id}", status_code=204)
async def delete_source(
    org_id: uuid.UUID,
    source_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    from sqlalchemy import delete
    await db.execute(
        delete(DataSource).where(DataSource.id == source_id, DataSource.org_id == org_id)
    )
    await db.commit()


# --- REST Ingestion (API Key auth) ---
@router.post("/ingest/events")
async def ingest_events(
    events: list[EventIngest],
    org_id: uuid.UUID = Depends(get_api_key_org),
):
    for e in events:
        process_event.delay(str(org_id), str(e.source_id), e.payload, e.timestamp)
    return {"queued": len(events)}


# --- CSV Upload ---
@router.post("/orgs/{org_id}/ingest/csv")
async def ingest_csv(
    org_id: uuid.UUID,
    source_id: uuid.UUID,
    file: UploadFile = File(...),
    _member=Depends(get_org_member),
):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    count = 0
    for row in reader:
        process_event.delay(str(org_id), str(source_id), dict(row), int(time.time() * 1000))
        count += 1
    return {"queued": count}


# --- Webhook Receiver ---
@router.post("/ingest/webhook/{source_id}")
async def webhook_receiver(
    source_id: uuid.UUID,
    payload: dict,
    org_id: uuid.UUID = Depends(get_api_key_org),
):
    process_event.delay(str(org_id), str(source_id), payload, int(time.time() * 1000))
    return {"status": "received"}
