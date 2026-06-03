import asyncio
from app.tasks.celery_app import celery_app
from app.db.base import AsyncSessionLocal
from app.models.data_source import Event


@celery_app.task(name="app.tasks.ingestion_tasks.process_event", bind=True, max_retries=3)
def process_event(self, org_id: str, source_id: str, payload: dict, timestamp: int):
    async def _run():
        async with AsyncSessionLocal() as db:
            event = Event(
                org_id=org_id,
                source_id=source_id,
                payload=payload,
                timestamp=timestamp,
            )
            db.add(event)
            await db.commit()

    try:
        asyncio.run(_run())
    except Exception as exc:
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
