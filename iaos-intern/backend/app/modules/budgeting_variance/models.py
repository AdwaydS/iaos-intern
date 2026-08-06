from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class BudgetingVarianceRun(Base, TenantMixin):
    """One execution record against a Signature test (use cases 1-15).

    `test_code` is the fixed code from the catalog (e.g. 'budget_vs_actual').
    """

    __tablename__ = "mod_budgeting_variance_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    test_code: Mapped[str] = mapped_column(String(64), index=True)
    scope_note: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="open")  # open | in_review | cleared | escalated
    risk_rating: Mapped[str] = mapped_column(String(16), default="medium")  # low | medium | high
    exceptions_found: Mapped[int] = mapped_column(Integer, default=0)
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")


class BudgetingVarianceRcmEntry(Base, TenantMixin):
    """Risk & Control Matrix row (use case 18)."""

    __tablename__ = "mod_budgeting_variance_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk: Mapped[str] = mapped_column(String(255))
    control: Mapped[str] = mapped_column(Text, default="")
    assertion: Mapped[str] = mapped_column(String(128), default="")
    control_owner: Mapped[str] = mapped_column(String(128), default="")
    frequency: Mapped[str] = mapped_column(String(64), default="")


class BudgetingVarianceDataSource(Base, TenantMixin):
    """ERP table / API / upload feeding the analytics (use case 20)."""

    __tablename__ = "mod_budgeting_variance_data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(32), default="upload")  # erp_table | api | upload
    connection_ref: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class BudgetingVarianceSample(Base, TenantMixin):
    """Sampling & population builder record (use case 21)."""

    __tablename__ = "mod_budgeting_variance_samples"

    id: Mapped[int] = mapped_column(primary_key=True)
    population_desc: Mapped[str] = mapped_column(String(255))
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(32), default="judgemental")  # statistical | judgemental
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")


class BudgetingVarianceException(Base, TenantMixin):
    """Exception & red-flag queue row (use case 22)."""

    __tablename__ = "mod_budgeting_variance_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_budgeting_variance_runs.id", ondelete="SET NULL"), nullable=True
    )
    description: Mapped[str] = mapped_column(Text)
    amount: Mapped[float] = mapped_column(Float, default=0)
    disposition: Mapped[str] = mapped_column(String(32), default="pending")  # pending | valid | false_positive | waived
    reviewer_notes: Mapped[str] = mapped_column(Text, default="")


class BudgetingVarianceEvidence(Base, TenantMixin):
    """Working paper / evidence attachment metadata (use case 23)."""

    __tablename__ = "mod_budgeting_variance_evidence"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_budgeting_variance_runs.id", ondelete="SET NULL"), nullable=True
    )
    label: Mapped[str] = mapped_column(String(255))
    file_ref: Mapped[str] = mapped_column(String(512), default="")
    reviewer: Mapped[str] = mapped_column(String(128), default="")
    signed_off: Mapped[bool] = mapped_column(default=False)


class BudgetingVarianceFinding(Base, TenantMixin):
    """Observation / finding log row (use case 24)."""

    __tablename__ = "mod_budgeting_variance_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_budgeting_variance_runs.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255))
    grade: Mapped[str] = mapped_column(String(16), default="medium")  # low | medium | high | critical
    description: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(128), default="")
    status: Mapped[str] = mapped_column(String(32), default="open")  # open | in_progress | closed


class BudgetingVarianceAction(Base, TenantMixin):
    """Remediation / CAPA tracker row (use case 25)."""

    __tablename__ = "mod_budgeting_variance_actions"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_budgeting_variance_findings.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(Text)
    owner: Mapped[str] = mapped_column(String(128), default="")
    due_date: Mapped[str] = mapped_column(String(32), default="")  # ISO date string, kept simple
    retest_status: Mapped[str] = mapped_column(String(32), default="not_started")  # not_started | in_progress | passed | failed
