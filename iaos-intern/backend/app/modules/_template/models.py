"""Module data models.

RULES for zero-conflict, tenant-safe modules:
  1. Prefix every table with `mod_<modulename>_` so no two interns collide
     on a table name in the shared MySQL database.
  2. Inherit `TenantMixin` on anything tenant-owned — it adds `tenant_id`,
     `created_at`, `updated_at` and lets `tenant_scoped()` isolate your rows.
"""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class TemplateItem(Base, TenantMixin):
    __tablename__ = "mod_template_items"  # rename: mod_<yourmodule>_items

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")
