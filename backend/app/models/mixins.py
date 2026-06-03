from sqlalchemy import DateTime, func
from sqlalchemy.orm import MappedColumn, mapped_column
from datetime import datetime


class TimestampMixin:
    created_at: MappedColumn[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: MappedColumn[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
