"""Multi-tenancy building blocks.

The platform uses a SHARED database with a `tenant_id` discriminator column
(row-level multi-tenancy). Every tenant-scoped table inherits `TenantMixin`,
and every module query MUST filter by the current tenant.

Use `tenant_scoped(query, current_user)` in module code to enforce isolation
consistently instead of hand-writing `.filter(Model.tenant_id == ...)`.
"""
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_utcnow, onupdate=_utcnow
    )


class TenantMixin(TimestampMixin):
    """Add this to any module model to make it tenant-isolated.

    Example:
        class Finding(Base, TenantMixin):
            __tablename__ = "mod_risk_findings"
            id: Mapped[int] = mapped_column(primary_key=True)
            title: Mapped[str] = mapped_column(String(255))
    """

    tenant_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )


def tenant_scoped(query, current_user):
    """Restrict a SQLAlchemy query to the current user's tenant.

    The query's primary entity must inherit TenantMixin.
    """
    entity = query.column_descriptions[0]["entity"]
    return query.filter(entity.tenant_id == current_user.tenant_id)
