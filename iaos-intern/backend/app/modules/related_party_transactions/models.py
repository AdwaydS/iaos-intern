"""
Related-Party Transactions module — DB models.
All tables prefixed mod_rpt_ (Related-Party Transactions) and tenant-scoped.
"""
from datetime import datetime, date
from sqlalchemy import String, Text, Integer, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ---------------------------------------------------------------------------
# 1. Procedures — the 15 "Signature" audit steps (sign-off checklist)
# ---------------------------------------------------------------------------
class RPTProcedure(Base, TenantMixin):
    __tablename__ = "mod_rpt_procedures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    step_no: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending|in_progress|completed|na
    performed_by: Mapped[str] = mapped_column(String(150), default="")
    signed_by: Mapped[str] = mapped_column(String(150), default="")
    signed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---------------------------------------------------------------------------
# 2. Scope & Audit Universe
# ---------------------------------------------------------------------------
class RPTScopeItem(Base, TenantMixin):
    __tablename__ = "mod_rpt_scope"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity_name: Mapped[str] = mapped_column(String(200), nullable=False)
    process_area: Mapped[str] = mapped_column(String(150), default="")
    in_scope: Mapped[bool] = mapped_column(Boolean, default=True)
    rationale: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 3. Risk & Control Matrix
# ---------------------------------------------------------------------------
class RPTControl(Base, TenantMixin):
    __tablename__ = "mod_rpt_rcm"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    risk_description: Mapped[str] = mapped_column(Text, nullable=False)
    control_description: Mapped[str] = mapped_column(Text, default="")
    assertion: Mapped[str] = mapped_column(String(100), default="")
    control_owner: Mapped[str] = mapped_column(String(150), default="")
    risk_rating: Mapped[str] = mapped_column(String(20), default="medium")  # low|medium|high
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 4. Test & Analytics Rule Library
# ---------------------------------------------------------------------------
class RPTRule(Base, TenantMixin):
    __tablename__ = "mod_rpt_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    threshold: Mapped[str] = mapped_column(String(150), default="")
    logic: Mapped[str] = mapped_column(Text, default="")  # CAAT script / rule expression
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 5. Data Source & Connector Setup
# ---------------------------------------------------------------------------
class RPTDataSource(Base, TenantMixin):
    __tablename__ = "mod_rpt_datasources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), default="upload")  # erp_table|api|upload
    connection_details: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="not_connected")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 6. Sampling & Population Builder
# ---------------------------------------------------------------------------
class RPTSample(Base, TenantMixin):
    __tablename__ = "mod_rpt_samples"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    population_desc: Mapped[str] = mapped_column(String(250), nullable=False)
    sample_method: Mapped[str] = mapped_column(String(50), default="judgemental")  # statistical|judgemental
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 7. Exception & Red-Flag Queue
# ---------------------------------------------------------------------------
class RPTException(Base, TenantMixin):
    __tablename__ = "mod_rpt_exceptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int | None] = mapped_column(ForeignKey("mod_rpt_rules.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="medium")  # low|medium|high
    status: Mapped[str] = mapped_column(String(20), default="open")  # open|investigating|closed
    disposition: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 8. Working Papers & Evidence
# ---------------------------------------------------------------------------
class RPTEvidence(Base, TenantMixin):
    __tablename__ = "mod_rpt_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    procedure_id: Mapped[int | None] = mapped_column(ForeignKey("mod_rpt_procedures.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_ref: Mapped[str] = mapped_column(String(500), default="")  # filename / URL
    reviewer: Mapped[str] = mapped_column(String(150), default="")
    reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 9. Observation & Finding Log
# ---------------------------------------------------------------------------
class RPTFinding(Base, TenantMixin):
    __tablename__ = "mod_rpt_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    grade: Mapped[str] = mapped_column(String(20), default="medium")  # low|medium|high|critical
    status: Mapped[str] = mapped_column(String(20), default="open")  # open|in_review|closed
    procedure_id: Mapped[int | None] = mapped_column(ForeignKey("mod_rpt_procedures.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# 10. Remediation / Action Tracker
# ---------------------------------------------------------------------------
class RPTAction(Base, TenantMixin):
    __tablename__ = "mod_rpt_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("mod_rpt_findings.id"), nullable=True)
    action_desc: Mapped[str] = mapped_column(Text, nullable=False)
    owner: Mapped[str] = mapped_column(String(150), default="")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")  # open|in_progress|done|overdue
    retest_status: Mapped[str] = mapped_column(String(20), default="not_started")  # not_started|passed|failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
