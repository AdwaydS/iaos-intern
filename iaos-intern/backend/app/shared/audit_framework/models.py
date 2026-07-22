"""Shared audit-framework models.

These tables back the 8 "Shell" use cases that are genuinely separate
entities and are common to every audit module on the platform (Scope &
Audit Universe, RCM, Test & Rule Library, Data Source Setup, Sampling,
Working Papers, Findings, Remediation).

Every table is both:
  - tenant-isolated via TenantMixin (tenant_id), AND
  - module-scoped via `module_key` (e.g. "utilities_energy"),

so the same tables serve all modules instead of each module rebuilding
its own copy. Query helpers should always filter by BOTH tenant_id and
module_key — see `module_scoped()` below.

The remaining 2 Shell use cases (Module Dashboard & KPIs, Exception &
Red-Flag Queue) are NOT modeled here on purpose — they're views over
data that already lives inside each module (e.g. utilities_energy's own
SignatureCheckRun/SignatureCheckException tables). See registry.py.
"""
from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


class ModuleScopedMixin(TenantMixin):
    """Tenant isolation (inherited) + module isolation, for shared tables."""

    module_key: Mapped[str] = mapped_column(String(60), index=True)


def module_scoped(query, current_user, module_key: str):
    """Restrict a query to the current tenant AND a specific module.

    Use this instead of tenant_scoped() directly for any table using
    ModuleScopedMixin, since two modules must never see each other's rows
    even within the same tenant.
    """
    from app.core.tenancy import tenant_scoped

    entity = query.column_descriptions[0]["entity"]
    return tenant_scoped(query, current_user).filter(entity.module_key == module_key)


# ---------------------------------------------------------------------------
# 17. Scope & Audit Universe
# ---------------------------------------------------------------------------
class ScopeUnit(Base, ModuleScopedMixin):
    """An auditable unit/entity/process in scope for a module."""

    __tablename__ = "framework_scope_units"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    unit_type: Mapped[str] = mapped_column(String(60), default="")  # e.g. "site", "process", "entity"
    description: Mapped[str] = mapped_column(Text, default="")
    in_scope: Mapped[bool] = mapped_column(default=True)


# ---------------------------------------------------------------------------
# 18. Risk & Control Matrix (RCM)
# ---------------------------------------------------------------------------
class RcmEntry(Base, ModuleScopedMixin):
    """One risk/control/assertion row for a module."""

    __tablename__ = "framework_rcm_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_description: Mapped[str] = mapped_column(Text)
    control_description: Mapped[str] = mapped_column(Text)
    assertion: Mapped[str] = mapped_column(String(120), default="")  # e.g. "completeness", "accuracy"
    control_owner: Mapped[str] = mapped_column(String(120), default="")
    risk_rating: Mapped[str] = mapped_column(String(20), default="")  # e.g. "high", "medium", "low"


# ---------------------------------------------------------------------------
# 19. Test & Analytics Rule Library
# ---------------------------------------------------------------------------
class TestRule(Base, ModuleScopedMixin):
    """A configurable automated red-flag rule/threshold/CAAT script.

    This is where the hardcoded thresholds in each module's signature
    checks (e.g. utilities_energy's PF < 0.90) should eventually move to,
    so reviewers can tune them per tenant without a code change.
    """

    __tablename__ = "framework_test_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_key: Mapped[str] = mapped_column(String(60), index=True)  # matches a module's check key
    label: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    parameters: Mapped[dict] = mapped_column(JSON, default=dict)  # e.g. {"threshold": 0.9}
    is_active: Mapped[bool] = mapped_column(default=True)


# ---------------------------------------------------------------------------
# 20. Data Source & Connector Setup
# ---------------------------------------------------------------------------
class DataSourceConnector(Base, ModuleScopedMixin):
    """An ERP table / API / upload feed that populates a module's analytics."""

    __tablename__ = "framework_data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(60))  # "erp_table", "api", "upload"
    connection_config: Mapped[dict] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(default=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(nullable=True)


# ---------------------------------------------------------------------------
# 21. Sampling & Population Builder
# ---------------------------------------------------------------------------
class SamplingMethod(str, enum.Enum):
    STATISTICAL = "statistical"
    JUDGMENTAL = "judgmental"


class SamplePlan(Base, ModuleScopedMixin):
    """A sample drawn from a full population for a module."""

    __tablename__ = "framework_sample_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    method: Mapped[SamplingMethod] = mapped_column(SAEnum(SamplingMethod))
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    rationale: Mapped[str] = mapped_column(Text, default="")

    items: Mapped[list["SampleItem"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class SampleItem(Base, ModuleScopedMixin):
    """One item selected into a sample plan."""

    __tablename__ = "framework_sample_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("framework_sample_plans.id", ondelete="CASCADE"))
    reference: Mapped[str] = mapped_column(String(255))  # free-text pointer to the source record
    notes: Mapped[str] = mapped_column(Text, default="")

    plan: Mapped["SamplePlan"] = relationship(back_populates="items")


# ---------------------------------------------------------------------------
# 23. Working Papers & Evidence
# ---------------------------------------------------------------------------
class WorkingPaper(Base, ModuleScopedMixin):
    """Evidence, tick-marks, screenshots, and reviewer sign-off for a module."""

    __tablename__ = "framework_working_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    source_ref: Mapped[str] = mapped_column(String(255), default="")  # e.g. "utilities_energy:exception:123"
    file_url: Mapped[str] = mapped_column(String(500), default="")
    tick_marks: Mapped[str] = mapped_column(Text, default="")
    prepared_by: Mapped[str] = mapped_column(String(120), default="")
    reviewed_by: Mapped[str] = mapped_column(String(120), default="")
    reviewed_at: Mapped[datetime | None] = mapped_column(nullable=True)


# ---------------------------------------------------------------------------
# 24. Observation & Finding Log
# ---------------------------------------------------------------------------
class FindingSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FindingStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    AGREED = "agreed"
    CLOSED = "closed"


class Finding(Base, ModuleScopedMixin):
    """A raised, graded observation/finding for a module."""

    __tablename__ = "framework_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[FindingSeverity] = mapped_column(SAEnum(FindingSeverity), default=FindingSeverity.MEDIUM)
    status: Mapped[FindingStatus] = mapped_column(SAEnum(FindingStatus), default=FindingStatus.OPEN)
    source_ref: Mapped[str] = mapped_column(String(255), default="")  # e.g. "utilities_energy:exception:123"
    raised_by: Mapped[str] = mapped_column(String(120), default="")
    raised_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    remediation_items: Mapped[list["RemediationItem"]] = relationship(
        back_populates="finding", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# 25. Remediation / Action Tracker
# ---------------------------------------------------------------------------
class RemediationStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    OVERDUE = "overdue"
    RETESTED = "retested"


class RemediationItem(Base, ModuleScopedMixin):
    """A CAPA item tracking remediation of a finding."""

    __tablename__ = "framework_remediation_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("framework_findings.id", ondelete="CASCADE"))
    action_description: Mapped[str] = mapped_column(Text)
    owner: Mapped[str] = mapped_column(String(120), default="")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[RemediationStatus] = mapped_column(SAEnum(RemediationStatus), default=RemediationStatus.OPEN)
    retest_status: Mapped[str] = mapped_column(String(60), default="")

    finding: Mapped["Finding"] = relationship(back_populates="remediation_items")
