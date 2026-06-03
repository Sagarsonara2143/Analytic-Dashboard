import uuid
import enum
from sqlalchemy import String, ForeignKey, Enum, JSON, BigInteger, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base
from app.models.mixins import TimestampMixin


class SourceType(str, enum.Enum):
    REST = "rest"
    CSV = "csv"
    WEBHOOK = "webhook"


class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), nullable=False)
    schema_definition: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    org: Mapped["Organization"] = relationship("Organization", back_populates="data_sources")
    events: Mapped[list["Event"]] = relationship("Event", back_populates="source", lazy="select")


class Event(Base):
    __tablename__ = "events"
    __table_args__ = (
        Index("ix_events_org_source_ts", "org_id", "source_id", "timestamp"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="CASCADE"), index=True)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    timestamp: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)  # unix ms

    source: Mapped["DataSource"] = relationship("DataSource", back_populates="events")
