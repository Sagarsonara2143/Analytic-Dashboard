import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.organization import Organization
from app.models.org_member import OrgMember, Role


async def create_org(db: AsyncSession, name: str, slug: str, owner_id: uuid.UUID) -> Organization:
    org = Organization(name=name, slug=slug)
    db.add(org)
    await db.flush()
    member = OrgMember(org_id=org.id, user_id=owner_id, role=Role.OWNER)
    db.add(member)
    await db.commit()
    await db.refresh(org)
    return org


async def get_org(db: AsyncSession, org_id: uuid.UUID) -> Organization | None:
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    return result.scalar_one_or_none()


async def get_member(db: AsyncSession, org_id: uuid.UUID, user_id: uuid.UUID) -> OrgMember | None:
    result = await db.execute(
        select(OrgMember).where(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def add_member(db: AsyncSession, org_id: uuid.UUID, user_id: uuid.UUID, role: Role) -> OrgMember:
    member = OrgMember(org_id=org_id, user_id=user_id, role=role)
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


async def list_orgs_for_user(db: AsyncSession, user_id: uuid.UUID) -> list[Organization]:
    result = await db.execute(
        select(Organization)
        .join(OrgMember, OrgMember.org_id == Organization.id)
        .where(OrgMember.user_id == user_id)
    )
    return list(result.scalars().all())
