import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.deps import get_current_user, get_org_member, require_role
from app.models.user import User
from app.models.org_member import Role
from app.schemas.alert import AlertCreate, AlertUpdate, AlertOut, MuteRequest
from app.services import alert_service

router = APIRouter(prefix="/orgs/{org_id}/alerts", tags=["alerts"])


@router.post("", response_model=AlertOut, status_code=201)
async def create_alert(
    org_id: uuid.UUID,
    body: AlertCreate,
    current_user: User = Depends(get_current_user),
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    return await alert_service.create_alert(db, org_id, current_user.id, body)


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    org_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    return await alert_service.list_alerts(db, org_id)


@router.get("/{alert_id}", response_model=AlertOut)
async def get_alert(
    org_id: uuid.UUID,
    alert_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    alert = await alert_service.get_alert(db, alert_id, org_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return alert


@router.patch("/{alert_id}", response_model=AlertOut)
async def update_alert(
    org_id: uuid.UUID,
    alert_id: uuid.UUID,
    body: AlertUpdate,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    alert = await alert_service.get_alert(db, alert_id, org_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return await alert_service.update_alert(db, alert, body)


@router.delete("/{alert_id}", status_code=204)
async def delete_alert(
    org_id: uuid.UUID,
    alert_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    alert = await alert_service.get_alert(db, alert_id, org_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    await alert_service.delete_alert(db, alert)


@router.post("/{alert_id}/mute", response_model=AlertOut)
async def mute_alert(
    org_id: uuid.UUID,
    alert_id: uuid.UUID,
    body: MuteRequest,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN, Role.ANALYST)),
    db: AsyncSession = Depends(get_session),
):
    alert = await alert_service.get_alert(db, alert_id, org_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return await alert_service.mute_alert(db, alert, body.minutes)
