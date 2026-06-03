import uuid
from typing import Any
from datetime import datetime
from pydantic import BaseModel, model_validator


class EventIngest(BaseModel):
    source_id: uuid.UUID
    payload: dict[str, Any]
    timestamp: int | None = None  # unix ms; defaults to now if omitted

    @model_validator(mode="after")
    def set_default_timestamp(self):
        if self.timestamp is None:
            import time
            self.timestamp = int(time.time() * 1000)
        return self


class EventOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    source_id: uuid.UUID
    payload: dict[str, Any]
    timestamp: int


class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    schema_definition: dict[str, Any] = {}


class DataSourceOut(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    name: str
    source_type: str
    schema_definition: dict[str, Any]
    created_at: datetime
