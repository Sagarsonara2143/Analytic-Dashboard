import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.deps import get_current_user, get_org_member, require_role
from app.models.user import User
from app.models.org_member import Role
from app.schemas.org import OrgCreate, OrgOut, InviteRequest, MemberOut
from app.services.org_service import create_org, get_org, add_member, list_orgs_for_user
from app.services.user_service import get_user_by_email, create_user
import secrets

router = APIRouter(prefix="/orgs", tags=["organizations"])


@router.post("", response_model=OrgOut, status_code=201)
async def create_organization(
    body: OrgCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    org = await create_org(db, body.name, body.slug, current_user.id)
    return org


@router.get("", response_model=list[OrgOut])
async def my_orgs(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    return await list_orgs_for_user(db, current_user.id)


@router.get("/{org_id}", response_model=OrgOut)
async def get_organization(
    org_id: uuid.UUID,
    _member=Depends(get_org_member),
    db: AsyncSession = Depends(get_session),
):
    org = await get_org(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.post("/{org_id}/invite", response_model=MemberOut, status_code=201)
async def invite_member(
    org_id: uuid.UUID,
    body: InviteRequest,
    _admin=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    user = await get_user_by_email(db, body.email)
    if not user:
        # Auto-provision user with temp password
        user = await create_user(db, body.email, secrets.token_urlsafe(16), body.email.split("@")[0])
    member = await add_member(db, org_id, user.id, body.role)
    return member
