from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class Risk(Base, TenantMixin):
    __tablename__ = "mod_risk_register_risks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(120), default="Operational")
    likelihood: Mapped[int] = mapped_column(Integer, default=3)  # 1..5
    impact: Mapped[int] = mapped_column(Integer, default=3)      # 1..5
    owner: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
