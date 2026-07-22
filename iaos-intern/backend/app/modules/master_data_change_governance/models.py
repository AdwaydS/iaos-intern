"""Master Data Change Governance — data models.

18 tenant-scoped models covering change tracking, governance controls,
analytics/quality, and audit framework scaffolding.
"""
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# 1. Critical-Field Change Log
# ---------------------------------------------------------------------------
class MasterDataChangeLog(Base, TenantMixin):
    __tablename__ = "mod_mdcg_change_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    master_type: Mapped[str] = mapped_column(String(80))
    record_id: Mapped[str] = mapped_column(String(120))
    record_name: Mapped[str] = mapped_column(String(255), default="")
    field_name: Mapped[str] = mapped_column(String(120))
    old_value: Mapped[str] = mapped_column(Text, default="")
    new_value: Mapped[str] = mapped_column(Text, default="")
    change_type: Mapped[str] = mapped_column(String(30), default="update")
    change_user: Mapped[str] = mapped_column(String(255), default="")
    change_timestamp: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    approval_status: Mapped[str] = mapped_column(String(30), default="auto_approved")
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 2. Maker-Checker Workflow Rules
# ---------------------------------------------------------------------------
class MakerCheckerWorkflow(Base, TenantMixin):
    __tablename__ = "mod_mdcg_workflows"

    id: Mapped[int] = mapped_column(primary_key=True)
    master_type: Mapped[str] = mapped_column(String(80))
    field_name: Mapped[str] = mapped_column(String(120), default="*")
    required_approvers: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 3. Bulk-Upload Controls
# ---------------------------------------------------------------------------
class BulkUploadLog(Base, TenantMixin):
    __tablename__ = "mod_mdcg_bulk_uploads"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    master_type: Mapped[str] = mapped_column(String(80), default="")
    uploaded_by: Mapped[str] = mapped_column(String(255), default="")
    record_count: Mapped[int] = mapped_column(Integer, default=0)
    success_count: Mapped[int] = mapped_column(Integer, default=0)
    failure_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 4. Field-Level Access Review
# ---------------------------------------------------------------------------
class FieldAccessConfig(Base, TenantMixin):
    __tablename__ = "mod_mdcg_field_access"

    id: Mapped[int] = mapped_column(primary_key=True)
    master_type: Mapped[str] = mapped_column(String(80))
    field_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(80))
    can_edit: Mapped[bool] = mapped_column(Boolean, default=False)
    can_view: Mapped[bool] = mapped_column(Boolean, default=True)


# ---------------------------------------------------------------------------
# 5. Data-Quality Scorecard
# ---------------------------------------------------------------------------
class DataQualityScore(Base, TenantMixin):
    __tablename__ = "mod_mdcg_quality_scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    master_type: Mapped[str] = mapped_column(String(80))
    dimension: Mapped[str] = mapped_column(String(60))
    score: Mapped[float] = mapped_column(Float, default=0.0)
    total_records: Mapped[int] = mapped_column(Integer, default=0)
    passing_records: Mapped[int] = mapped_column(Integer, default=0)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 6. Duplicate Detection Engine
# ---------------------------------------------------------------------------
class DuplicatePair(Base, TenantMixin):
    __tablename__ = "mod_mdcg_duplicates"

    id: Mapped[int] = mapped_column(primary_key=True)
    master_type: Mapped[str] = mapped_column(String(80))
    record_a_id: Mapped[str] = mapped_column(String(120))
    record_a_name: Mapped[str] = mapped_column(String(255), default="")
    record_b_id: Mapped[str] = mapped_column(String(120))
    record_b_name: Mapped[str] = mapped_column(String(255), default="")
    match_score: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(30), default="open")
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ---------------------------------------------------------------------------
# 7. Reference-Data Consistency
# ---------------------------------------------------------------------------
class ReferenceDataCode(Base, TenantMixin):
    __tablename__ = "mod_mdcg_ref_data"

    id: Mapped[int] = mapped_column(primary_key=True)
    code_system: Mapped[str] = mapped_column(String(120))
    code_value: Mapped[str] = mapped_column(String(120))
    code_description: Mapped[str] = mapped_column(String(255), default="")
    module_a: Mapped[str] = mapped_column(String(120))
    module_b: Mapped[str] = mapped_column(String(120))
    is_consistent: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 8. Master Reconciliation
# ---------------------------------------------------------------------------
class ReconciliationResult(Base, TenantMixin):
    __tablename__ = "mod_mdcg_reconciliation"

    id: Mapped[int] = mapped_column(primary_key=True)
    master_type: Mapped[str] = mapped_column(String(80))
    record_id: Mapped[str] = mapped_column(String(120))
    source_system: Mapped[str] = mapped_column(String(120))
    target_system: Mapped[str] = mapped_column(String(120))
    source_hash: Mapped[str] = mapped_column(String(255), default="")
    target_hash: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(30), default="pending")
    reconciled_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 9. Sensitive-Change Alerting
# ---------------------------------------------------------------------------
class SensitiveChangeAlert(Base, TenantMixin):
    __tablename__ = "mod_mdcg_alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    alert_type: Mapped[str] = mapped_column(String(30), default="rule")
    master_type: Mapped[str] = mapped_column(String(80))
    field_name: Mapped[str] = mapped_column(String(120), default="*")
    threshold: Mapped[int] = mapped_column(Integer, default=1)
    recipients: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    message: Mapped[str] = mapped_column(Text, default="")
    triggered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ---------------------------------------------------------------------------
# 10. Scope & Audit Universe (Shell)
# ---------------------------------------------------------------------------
class AuditScopeItem(Base, TenantMixin):
    __tablename__ = "mod_mdcg_scope"

    id: Mapped[int] = mapped_column(primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    risk_rating: Mapped[str] = mapped_column(String(30), default="Medium")
    last_audited: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_audit: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ---------------------------------------------------------------------------
# 11. Risk & Control Matrix — RCM (Shell)
# ---------------------------------------------------------------------------
class RcmEntry(Base, TenantMixin):
    __tablename__ = "mod_mdcg_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_id: Mapped[str] = mapped_column(String(80))
    risk_description: Mapped[str] = mapped_column(Text, default="")
    control_id: Mapped[str] = mapped_column(String(80))
    control_description: Mapped[str] = mapped_column(Text, default="")
    assertion: Mapped[str] = mapped_column(String(80), default="")
    control_type: Mapped[str] = mapped_column(String(60), default="Preventive")
    control_owner: Mapped[str] = mapped_column(String(255), default="")
    frequency: Mapped[str] = mapped_column(String(60), default="Quarterly")


# ---------------------------------------------------------------------------
# 12. Test & Analytics Rule Library (Shell)
# ---------------------------------------------------------------------------
class TestRule(Base, TenantMixin):
    __tablename__ = "mod_mdcg_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(255))
    rule_type: Mapped[str] = mapped_column(String(60), default="Red-Flag")
    master_type: Mapped[str] = mapped_column(String(80), default="")
    threshold: Mapped[str] = mapped_column(String(120), default="")
    caat_script: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


# ---------------------------------------------------------------------------
# 13. Data Source & Connector Setup (Shell)
# ---------------------------------------------------------------------------
class DataSourceConfig(Base, TenantMixin):
    __tablename__ = "mod_mdcg_data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(60), default="ERP")
    connection_detail: Mapped[str] = mapped_column(Text, default="")
    table_mapping: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


# ---------------------------------------------------------------------------
# 14. Sampling & Population Builder (Shell)
# ---------------------------------------------------------------------------
class SamplingRecord(Base, TenantMixin):
    __tablename__ = "mod_mdcg_sampling"

    id: Mapped[int] = mapped_column(primary_key=True)
    population_name: Mapped[str] = mapped_column(String(255))
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_method: Mapped[str] = mapped_column(String(80), default="Random")
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 15. Exception & Red-Flag Queue (Shell)
# ---------------------------------------------------------------------------
class ExceptionItem(Base, TenantMixin):
    __tablename__ = "mod_mdcg_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    exception_type: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(30), default="Medium")
    status: Mapped[str] = mapped_column(String(30), default="Open")
    assigned_to: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 16. Working Papers & Evidence (Shell)
# ---------------------------------------------------------------------------
class WorkingPaper(Base, TenantMixin):
    __tablename__ = "mod_mdcg_working_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    paper_type: Mapped[str] = mapped_column(String(80), default="Evidence")
    reference_url: Mapped[str] = mapped_column(String(512), default="")
    status: Mapped[str] = mapped_column(String(30), default="Draft")


# ---------------------------------------------------------------------------
# 17. Observation & Finding Log (Shell)
# ---------------------------------------------------------------------------
class AuditFinding(Base, TenantMixin):
    __tablename__ = "mod_mdcg_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(30), default="Medium")
    status: Mapped[str] = mapped_column(String(30), default="Open")
    assigned_to: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


# ---------------------------------------------------------------------------
# 18. Remediation / Action Tracker (Shell)
# ---------------------------------------------------------------------------
class MdcgRemediationItem(Base, TenantMixin):
    __tablename__ = "mod_mdcg_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    action_title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(30), default="Planned")
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
