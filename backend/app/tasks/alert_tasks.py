import asyncio
from datetime import datetime, timezone
from app.tasks.celery_app import celery_app
from app.db.base import AsyncSessionLocal
from app.models.alert import Alert, AlertStatus
from app.services.alert_service import record_alert_event
from app.services.email_service import send_email
from sqlalchemy import select


@celery_app.task(name="app.tasks.alert_tasks.check_all_alerts")
def check_all_alerts():
    asyncio.run(_check_alerts())


async def _check_alerts():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Alert).where(Alert.status.in_([AlertStatus.ACTIVE, AlertStatus.TRIGGERED]))
        )
        alerts = result.scalars().all()
        now = datetime.now(timezone.utc)

        for alert in alerts:
            # Un-mute if muted_until passed
            if alert.status == AlertStatus.MUTED:
                if alert.muted_until and alert.muted_until <= now:
                    alert.status = AlertStatus.ACTIVE
                continue

            # Evaluate threshold (placeholder — real impl queries events aggregate)
            triggered, value = await _evaluate_alert(db, alert)
            if triggered:
                alert.status = AlertStatus.TRIGGERED
                await record_alert_event(db, alert.id, value, f"Alert '{alert.name}' triggered: {value}")
                await _notify(alert, value)

        await db.commit()


async def _evaluate_alert(db, alert: Alert) -> tuple[bool, float]:
    # Stub: real implementation executes alert.query against events table
    return False, 0.0


async def _notify(alert: Alert, value: float):
    for channel in alert.channels:
        if channel == "email":
            pass  # wired up via send_email in real usage
        elif channel == "in_app":
            pass  # push notification stored in notifications table
