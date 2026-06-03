import uuid
from typing import Any
from datetime import datetime
from pydantic import BaseModel
from app.models.dashboard import WidgetType


class WidgetCreate(BaseModel):
    title: str
    widget_type: WidgetType
    query: dict[str, Any]
    config: dict[str, Any] = {}
    position: dict[str, Any] = {}


class WidgetOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    title: str
    widget_type: WidgetType
    query: dict[str, Any]
    config: dict[str, Any]
    position: dict[str, Any]


class DashboardCreate(BaseModel):
    name: str
    description: str | None = None
    auto_refresh_seconds: int | None = None
    layout: dict[str, Any] = {}


class DashboardUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_public: bool | None = None
    auto_refresh_seconds: int | None = None
    layout: dict[str, Any] | None = None


class DashboardOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    name: str
    description: str | None
    is_public: bool
    share_token: str | None
    auto_refresh_seconds: int | None
    layout: dict[str, Any]
    created_at: datetime
    widgets: list[WidgetOut] = []
