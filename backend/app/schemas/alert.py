import uuid
from typing import Any
from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertStatus


class AlertCreate(BaseModel):
    name: str
    query: dict[str, Any]
    threshold: dict[str, Any]   # {"operator": "gt", "value": 100}
    channels: list[str] = ["in_app"]
    check_interval_minutes: int = 5


class AlertUpdate(BaseModel):
    name: str | None = None
    threshold: dict[str, Any] | None = None
    channels: list[str] | None = None
    check_interval_minutes: int | None = None


class AlertOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    name: str
    query: dict[str, Any]
    threshold: dict[str, Any]
    channels: list[str]
    status: AlertStatus
    check_interval_minutes: int
    created_at: datetime


class MuteRequest(BaseModel):
    minutes: int
