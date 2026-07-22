import uuid
from sqlalchemy import String, Text, Float, Integer, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class InvestmentsException(Base, TenantMixin):
    __tablename__ = "mod_investments_audit_exceptions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )
    module: Mapped[str] = mapped_column(String(255), default="Investments Audit")
    security: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[str] = mapped_column(String(255), nullable=False)
    exception: Mapped[str] = mapped_column(Text, nullable=False)
    date: Mapped[str] = mapped_column(Date, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="Medium")  # "High" or "Medium"
    status: Mapped[str] = mapped_column(String(50), default="Unresolved")  # "Unresolved", "In Review", "Resolved"


class SectorGuardrail(Base, TenantMixin):
    __tablename__ = "mod_investments_audit_sector_guardrails"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sector: Mapped[str] = mapped_column(String(255), nullable=False)
    limit_pct: Mapped[float] = mapped_column(Float, nullable=False)
    current_pct: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Compliant")


class ComplianceTrendPoint(Base, TenantMixin):
    __tablename__ = "mod_investments_audit_compliance_trend_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    month: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    exceptions_count: Mapped[int] = mapped_column(Integer, nullable=False)
