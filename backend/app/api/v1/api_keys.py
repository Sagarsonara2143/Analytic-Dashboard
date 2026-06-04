import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_session
from app.core.deps import require_role
from app.models.org_member import Role
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut

router = APIRouter(prefix="/orgs/{org_id}/api-keys", tags=["api-keys"])


@router.post("", response_model=dict, status_code=201)
async def create_api_key(
    org_id: uuid.UUID,
    body: ApiKeyCreate,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    from app.services.api_key_service import create_api_key as create_key
    key_value = await create_key(db, org_id, body.name)
    return {"id": "created", "key": key_value}


@router.get("", response_model=list[ApiKeyOut])
async def list_api_keys(
    org_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(ApiKey).where(ApiKey.org_id == org_id, ApiKey.is_active == True))
    keys = result.scalars().all()
    return [
        ApiKeyOut(
            id=str(k.id),
            name=k.name,
            key_preview=f"{k.prefix}...",
            created_at=k.created_at.isoformat(),
        )
        for k in keys
    ]


@router.delete("/{key_id}", status_code=204)
async def delete_api_key(
    org_id: uuid.UUID,
    key_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    from app.services.api_key_service import revoke_api_key
    success = await revoke_api_key(db, key_id, org_id)
    if not success:
        raise HTTPException(404, "API key not found")