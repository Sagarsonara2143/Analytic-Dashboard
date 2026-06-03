import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.report import ReportFrequency, ReportFormat, ReportStatus


class ReportCreate(BaseModel):
    name: str
    dashboard_id: uuid.UUID
    frequency: ReportFrequency
    format: ReportFormat = ReportFormat.PDF
    recipients: list[str] = []


class ReportOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    name: str
    dashboard_id: uuid.UUID | None
    frequency: ReportFrequency
    format: ReportFormat
    recipients: list[str]
    next_run_at: datetime | None
    created_at: datetime


class ReportRunOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    status: ReportStatus
    file_path: str | None
    error: str | None
    ran_at: datetime | None
