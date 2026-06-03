import uuid
import enum
from sqlalchemy import String, Boolean, ForeignKey, Enum, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base
from app.models.mixins import TimestampMixin


class WidgetType(str, enum.Enum):
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    KPI = "kpi"
    TABLE = "table"


class Dashboard(TimestampMixin, Base):
    __tablename__ = "dashboards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    share_token: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    auto_refresh_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    layout: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    org: Mapped["Organization"] = relationship("Organization", back_populates="dashboards")
    widgets: Mapped[list["Widget"]] = relationship("Widget", back_populates="dashboard", cascade="all, delete-orphan")


class Widget(TimestampMixin, Base):
    __tablename__ = "widgets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dashboard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("dashboards.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    widget_type: Mapped[WidgetType] = mapped_column(Enum(WidgetType), nullable=False)
    query: Mapped[dict] = mapped_column(JSONB, nullable=False)   # saved query config
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)  # chart options
    position: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)  # {x,y,w,h}

    dashboard: Mapped["Dashboard"] = relationship("Dashboard", back_populates="widgets")
