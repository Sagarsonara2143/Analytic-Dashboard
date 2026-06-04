import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.db.session import get_session
from app.core.deps import get_org_member, require_role
from app.models.org_member import Role
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut
from app.core.security import generate_api_key

router = APIRouter(prefix="/orgs/{org_id}/api-keys", tags=["api-keys"])


@router.post("", response_model=dict, status_code=201)
async def create_api_key(
    org_id: uuid.UUID,
    body: ApiKeyCreate,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    key_value = generate_api_key()
    api_key = ApiKey(
        org_id=org_id,
        name=body.name,
        key_hash=key_value,  # In production, hash this
    )
    db.add(api_key)
    await db.commit()
    return {"id": str(api_key.id), "key": key_value}


@router.get("", response_model=list[ApiKeyOut])
async def list_api_keys(
    org_id: uuid.UUID,
    _member=Depends(require_role(Role.OWNER, Role.ADMIN)),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(select(ApiKey).where(ApiKey.org_id == org_id))
    keys = result.scalars().all()
    return [
        ApiKeyOut(
            id=str(k.id),
            name=k.name,
            key_preview=f"ak_...{k.key_hash[-4:]}",
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
    await db.execute(
        delete(ApiKey).where(ApiKey.id == key_id, ApiKey.org_id == org_id)
    )
    await db.commit()