"""User model with roles. SUPER_ADMIN is tenant-less (platform-wide)."""
import enum

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TimestampMixin


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"   # platform owner (Cap Corp) — sees all tenants
    TENANT_ADMIN = "tenant_admin" # manages users within their own tenant
    AUDITOR = "auditor"           # standard end user


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.AUDITOR
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # NULL for SUPER_ADMIN (platform-wide, belongs to no single tenant)
    tenant_id: Mapped[int | None] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    tenant: Mapped["Tenant | None"] = relationship(  # noqa: F821
        back_populates="users"
    )
