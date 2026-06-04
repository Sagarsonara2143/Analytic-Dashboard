import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_session
from app.core.deps import get_current_user, get_org_member, require_role
from app.models.user import User
from app.models.org_member import Role
from app.models.report import Report, ReportRun
from app.schemas.report import ReportCreate, ReportOut, ReportRunOut
from datetime import datetime, timezone

router = APIRouter(prefix="/orgs/{org_id}/reports", tags=["reports"])


@router.post("", response_model=ReportOut, status_code=201)
async def create_report(
    org_id: uuid.UUID,
    body: ReportCreate,
    current_user: User = Depends(get_current_user),
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    report = Report(org_id=org_id, created_by=current_user.id, **body.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("", response_model=list[ReportOut])
async def list_reports(
    org_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(Report).where(Report.org_id == org_id))
    return list(result.scalars().all())


@router.get("/{report_id}/runs", response_model=list[ReportRunOut])
async def list_runs(
    org_id: uuid.UUID,
    report_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(ReportRun).where(ReportRun.report_id == report_id).order_by(ReportRun.ran_at.desc())
    )
    return list(result.scalars().all())


@router.get("/{report_id}/runs/{run_id}/download")
async def download_report(
    org_id: uuid.UUID,
    report_id: uuid.UUID,
    run_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(ReportRun).where(ReportRun.id == run_id))
    run = result.scalar_one_or_none()
    if not run or not run.file_path:
        raise HTTPException(404, "Report file not found")
    return FileResponse(run.file_path, media_type="application/pdf")
