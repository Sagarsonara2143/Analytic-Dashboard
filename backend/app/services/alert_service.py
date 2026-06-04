import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.alert import Alert, AlertEvent, AlertStatus
from app.schemas.alert import AlertCreate, AlertUpdate


async def create_alert(db: AsyncSession, org_id: uuid.UUID, user_id: uuid.UUID, data: AlertCreate) -> Alert:
    alert = Alert(org_id=org_id, created_by=user_id, **data.model_dump())
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


async def get_alert(db: AsyncSession, alert_id: uuid.UUID, org_id: uuid.UUID) -> Alert | None:
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.org_id == org_id)
    )
    return result.scalar_one_or_none()


async def list_alerts(db: AsyncSession, org_id: uuid.UUID) -> list[Alert]:
    result = await db.execute(select(Alert).where(Alert.org_id == org_id))
    return list(result.scalars().all())


async def update_alert(db: AsyncSession, alert: Alert, data: AlertUpdate) -> Alert:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(alert, field, value)
    await db.commit()
    await db.refresh(alert)
    return alert


async def delete_alert(db: AsyncSession, alert: Alert) -> None:
    await db.delete(alert)
    await db.commit()


async def mute_alert(db: AsyncSession, alert: Alert, minutes: int) -> Alert:
    alert.status = AlertStatus.MUTED
    alert.muted_until = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    await db.commit()
    await db.refresh(alert)
    return alert


async def record_alert_event(db: AsyncSession, alert_id: uuid.UUID, value: float, message: str) -> AlertEvent:
    event = AlertEvent(
        alert_id=alert_id,
        triggered_at=datetime.now(timezone.utc),
        value=value,
        message=message,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event
