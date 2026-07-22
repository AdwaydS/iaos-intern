from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.core.database import Base
from app.core.tenancy import TenantMixin


class DataSource(Base, TenantMixin):
    __tablename__ = "mod_data_analytics_data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)

    source_name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(100))
    host: Mapped[str] = mapped_column(String(255))
    database_name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="Active")

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )