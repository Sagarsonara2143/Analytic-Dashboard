import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.deps import get_current_user, get_org_member, require_role
from app.models.user import User
from app.models.org_member import Role
from app.schemas.dashboard import DashboardCreate, DashboardUpdate, DashboardOut, WidgetCreate, WidgetOut
from app.services import dashboard_service

router = APIRouter(prefix="/orgs/{org_id}/dashboards", tags=["dashboards"])


@router.post("", response_model=DashboardOut, status_code=201)
async def create_dashboard(
    org_id: uuid.UUID,
    body: DashboardCreate,
    current_user: User = Depends(get_current_user),
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    try:
        print(f"Creating dashboard for org {org_id}, user {current_user.id}")
        print(f"Dashboard data: {body.model_dump()}")
        result = await dashboard_service.create_dashboard(db, org_id, current_user.id, body)
        print(f"Dashboard created: {result.id}")
        return result
    except Exception as e:
        print(f"Error creating dashboard: {e}")
        import traceback
        traceback.print_exc()
        raise


@router.get("", response_model=list[DashboardOut])
async def list_dashboards(
    org_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    return await dashboard_service.list_dashboards(db, org_id)


@router.get("/{dashboard_id}", response_model=DashboardOut)
async def get_dashboard(
    org_id: uuid.UUID,
    dashboard_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    dash = await dashboard_service.get_dashboard(db, dashboard_id, org_id)
    if not dash:
        raise HTTPException(404, "Dashboard not found")
    return dash


@router.patch("/{dashboard_id}", response_model=DashboardOut)
async def update_dashboard(
    org_id: uuid.UUID,
    dashboard_id: uuid.UUID,
    body: DashboardUpdate,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    dash = await dashboard_service.get_dashboard(db, dashboard_id, org_id)
    if not dash:
        raise HTTPException(404, "Dashboard not found")
    return await dashboard_service.update_dashboard(db, dash, body)


@router.delete("/{dashboard_id}", status_code=204)
async def delete_dashboard(
    org_id: uuid.UUID,
    dashboard_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    dash = await dashboard_service.get_dashboard(db, dashboard_id, org_id)
    if not dash:
        raise HTTPException(404, "Dashboard not found")
    await dashboard_service.delete_dashboard(db, dash)


@router.post("/{dashboard_id}/share")
async def share_dashboard(
    org_id: uuid.UUID,
    dashboard_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    dash = await dashboard_service.get_dashboard(db, dashboard_id, org_id)
    if not dash:
        raise HTTPException(404, "Dashboard not found")
    token = await dashboard_service.generate_share_token(db, dash)
    return {"share_token": token}


@router.post("/{dashboard_id}/widgets", response_model=WidgetOut, status_code=201)
async def add_widget(
    org_id: uuid.UUID,
    dashboard_id: uuid.UUID,
    body: WidgetCreate,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    return await dashboard_service.add_widget(db, dashboard_id, body)


@router.delete("/{dashboard_id}/widgets/{widget_id}", status_code=204)
async def delete_widget(
    org_id: uuid.UUID,
    dashboard_id: uuid.UUID,
    widget_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    deleted = await dashboard_service.delete_widget(db, widget_id, dashboard_id)
    if not deleted:
        raise HTTPException(404, "Widget not found")
