import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
from app.models.mixins import TimestampMixin


class Organization(TimestampMixin, Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)

    members: Mapped[list["OrgMember"]] = relationship("OrgMember", back_populates="org", lazy="select")
    api_keys: Mapped[list["ApiKey"]] = relationship("ApiKey", back_populates="org", lazy="select")
    dashboards: Mapped[list["Dashboard"]] = relationship("Dashboard", back_populates="org", lazy="select")
    data_sources: Mapped[list["DataSource"]] = relationship("DataSource", back_populates="org", lazy="select")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="org", lazy="select")
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="org", lazy="select")
