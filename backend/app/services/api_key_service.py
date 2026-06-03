import uuid
import secrets
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.api_key import ApiKey
from app.core.security import hash_password, verify_password
from app.core.config import settings


def _generate_key() -> tuple[str, str]:
    raw = secrets.token_urlsafe(32)
    full_key = f"{settings.API_KEY_PREFIX}{raw}"
    return full_key, hash_password(full_key)


async def create_api_key(db: AsyncSession, org_id: uuid.UUID, name: str) -> str:
    full_key, key_hash = _generate_key()
    prefix = full_key[:12]
    api_key = ApiKey(org_id=org_id, name=name, key_hash=key_hash, prefix=prefix)
    db.add(api_key)
    await db.flush()
    return full_key  # shown only once


async def validate_api_key(db: AsyncSession, raw_key: str) -> uuid.UUID | None:
    prefix = raw_key[:12]
    result = await db.execute(
        select(ApiKey).where(ApiKey.prefix == prefix, ApiKey.is_active == True)
    )
    key = result.scalar_one_or_none()
    if not key:
        return None
    if key.expires_at and key.expires_at < datetime.now(timezone.utc):
        return None
    if not verify_password(raw_key, key.key_hash):
        return None
    return key.org_id


async def revoke_api_key(db: AsyncSession, key_id: uuid.UUID, org_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.org_id == org_id)
    )
    key = result.scalar_one_or_none()
    if not key:
        return False
    key.is_active = False
    return True
