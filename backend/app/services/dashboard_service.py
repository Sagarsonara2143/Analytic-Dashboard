import uuid
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.dashboard import Dashboard, Widget
from app.schemas.dashboard import DashboardCreate, DashboardUpdate, WidgetCreate


async def create_dashboard(db: AsyncSession, org_id: uuid.UUID, user_id: uuid.UUID, data: DashboardCreate) -> Dashboard:
    dash = Dashboard(org_id=org_id, created_by=user_id, **data.model_dump())
    db.add(dash)
    await db.commit()
    await db.refresh(dash)
    return dash


async def get_dashboard(db: AsyncSession, dashboard_id: uuid.UUID, org_id: uuid.UUID) -> Dashboard | None:
    result = await db.execute(
        select(Dashboard)
        .options(selectinload(Dashboard.widgets))
        .where(Dashboard.id == dashboard_id, Dashboard.org_id == org_id)
    )
    return result.scalar_one_or_none()


async def list_dashboards(db: AsyncSession, org_id: uuid.UUID) -> list[Dashboard]:
    result = await db.execute(
        select(Dashboard).where(Dashboard.org_id == org_id).order_by(Dashboard.created_at.desc())
    )
    return list(result.scalars().all())


async def update_dashboard(db: AsyncSession, dashboard: Dashboard, data: DashboardUpdate) -> Dashboard:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(dashboard, field, value)
    await db.commit()
    await db.refresh(dashboard)
    return dashboard


async def delete_dashboard(db: AsyncSession, dashboard: Dashboard) -> None:
    await db.delete(dashboard)
    await db.commit()


async def generate_share_token(db: AsyncSession, dashboard: Dashboard) -> str:
    token = secrets.token_urlsafe(32)
    dashboard.share_token = token
    dashboard.is_public = True
    await db.commit()
    return token


async def add_widget(db: AsyncSession, dashboard_id: uuid.UUID, data: WidgetCreate) -> Widget:
    widget = Widget(dashboard_id=dashboard_id, **data.model_dump())
    db.add(widget)
    await db.commit()
    await db.refresh(widget)
    return widget


async def delete_widget(db: AsyncSession, widget_id: uuid.UUID, dashboard_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(Widget).where(Widget.id == widget_id, Widget.dashboard_id == dashboard_id)
    )
    widget = result.scalar_one_or_none()
    if not widget:
        return False
    await db.delete(widget)
    await db.commit()
    return True
