import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.org_member import Role


class UserOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime


class OrgCreate(BaseModel):
    name: str
    slug: str


class OrgOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    name: str
    slug: str
    created_at: datetime


class InviteRequest(BaseModel):
    email: EmailStr
    role: Role = Role.VIEWER


class MemberOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    user_id: uuid.UUID
    role: Role
    created_at: datetime
