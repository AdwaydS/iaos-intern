"""Module data models.

Budgeting & Variance Analysis — three core tables:
  - BudgetException   (anomaly / red-flag queue)
  - BudgetRCM         (Risk & Control Matrix)
  - WorkingPaper      (evidence / document registry)
"""
from sqlalchemy import String, Text, Float, Enum as SAEnum
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin

import enum


class RiskGrade(str, enum.Enum):
    Critical = "Critical"
    High = "High"
    Medium = "Medium"


class ExceptionStatus(str, enum.Enum):
    Open = "Open"
    In_Review = "In Review"
    Resolved = "Resolved"


class FinancialAssertion(str, enum.Enum):
    Accuracy = "Accuracy"
    Occurrence = "Occurrence"
    Completeness = "Completeness"


class ControlType(str, enum.Enum):
    Automated = "Automated"
    Manual = "Manual"


class ReviewStatus(str, enum.Enum):
    Pending = "Pending"
    Reviewed = "Reviewed"
    Signed_Off = "Signed Off"


class BudgetException(Base, TenantMixin):
    __tablename__ = "mod_budgeting_variance_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    cost_center: Mapped[str] = mapped_column(String(255), default="")
    budget_owner: Mapped[str] = mapped_column(String(255), default="")
    source_procedure: Mapped[str] = mapped_column(
        String(255), default="",
        comment="e.g. 'Chronic Overspend', 'Pre-Approval Timing'"
    )
    variance_amount: Mapped[float] = mapped_column(Float, default=0.0)
    risk_grade: Mapped[str] = mapped_column(
        String(20), default=RiskGrade.Medium.value
    )
    status: Mapped[str] = mapped_column(
        String(20), default=ExceptionStatus.Open.value
    )
    disposition_notes: Mapped[str] = mapped_column(Text, default="")


class BudgetRCM(Base, TenantMixin):
    __tablename__ = "mod_budgeting_variance_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_id: Mapped[str] = mapped_column(String(50), default="")
    financial_assertion: Mapped[str] = mapped_column(
        String(20), default=FinancialAssertion.Accuracy.value
    )
    control_description: Mapped[str] = mapped_column(Text, default="")
    control_owner: Mapped[str] = mapped_column(String(255), default="")
    control_type: Mapped[str] = mapped_column(
        String(20), default=ControlType.Manual.value
    )


class WorkingPaper(Base, TenantMixin):
    __tablename__ = "mod_budgeting_variance_working_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    attachment_name: Mapped[str] = mapped_column(String(255), default="")
    associated_procedure_id: Mapped[int] = mapped_column(default=0)
    upload_date: Mapped[str] = mapped_column(String(30), default="")
    uploaded_by: Mapped[str] = mapped_column(String(255), default="")
    review_status: Mapped[str] = mapped_column(
        String(20), default=ReviewStatus.Pending.value
    )
    audit_tickmarks: Mapped[list] = mapped_column(JSON, default=list)
