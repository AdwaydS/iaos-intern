from datetime import date, datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ── Signature checkpoints (1–15) ────────────────────────────────────────


class BusinessImpactAnalysis(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_bia"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")  # Open/Pass/Fail/Partial/NA
    critical_processes: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[date | None] = mapped_column(nullable=True)
    evidence_url: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class BcpPlanCurrency(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_bcp_plan"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    plan_version: Mapped[str] = mapped_column(String(50), default="")
    last_reviewed: Mapped[date | None] = mapped_column(nullable=True)
    owner: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    evidence_url: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class DrTestEvidence(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_dr_test"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    test_date: Mapped[date | None] = mapped_column(nullable=True)
    test_type: Mapped[str] = mapped_column(String(100), default="")
    result: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    evidence_url: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class RtoRpoAdherence(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_rto_rpo"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    process: Mapped[str] = mapped_column(String(255), default="")
    rto_target: Mapped[str] = mapped_column(String(50), default="")
    rpo_target: Mapped[str] = mapped_column(String(50), default="")
    rto_actual: Mapped[str] = mapped_column(String(50), default="")
    rpo_actual: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class BackupRestorationTesting(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_backup_test"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    system: Mapped[str] = mapped_column(String(255), default="")
    last_test_date: Mapped[date | None] = mapped_column(nullable=True)
    result: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    evidence_url: Mapped[str] = mapped_column(String(512), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class AlternateSiteReadiness(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_alt_site"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    site_name: Mapped[str] = mapped_column(String(255), default="")
    site_type: Mapped[str] = mapped_column(String(50), default="")  # hot/warm/cold
    last_drill: Mapped[date | None] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class CrisisManagementGovernance(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_crisis_gov"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    cmt_name: Mapped[str] = mapped_column(String(255), default="")
    last_drill: Mapped[date | None] = mapped_column(nullable=True)
    escalation_chain: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class SinglePointOfFailureMap(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_spof"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    dependency: Mapped[str] = mapped_column(String(255), default="")
    risk_level: Mapped[str] = mapped_column(String(20), default="Medium")
    mitigation: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class VendorSupplyContinuity(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_vendor_cont"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    vendor: Mapped[str] = mapped_column(String(255), default="")
    criticality: Mapped[str] = mapped_column(String(20), default="Medium")
    bcp_confirmed: Mapped[bool | None] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class CommunicationCallTree(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_call_tree"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    last_test_date: Mapped[date | None] = mapped_column(nullable=True)
    contact_count: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class DataCentreResilience(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_dc_resilience"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    dc_name: Mapped[str] = mapped_column(String(255), default="")
    has_redundant_power: Mapped[bool | None] = mapped_column(nullable=True)
    has_redundant_cooling: Mapped[bool | None] = mapped_column(nullable=True)
    has_redundant_network: Mapped[bool | None] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class PandemicRemoteWorkPlan(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_pandemic"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    plan_version: Mapped[str] = mapped_column(String(50), default="")
    remote_work_capable: Mapped[bool | None] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class InsuranceBcpAlignment(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_insurance"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    policy_ref: Mapped[str] = mapped_column(String(255), default="")
    bi_cover_amount: Mapped[str] = mapped_column(String(100), default="")
    review_date: Mapped[date | None] = mapped_column(nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class RecoveryCostEstimation(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_cost_est"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    scenario: Mapped[str] = mapped_column(String(255), default="")
    estimated_downtime_cost: Mapped[str] = mapped_column(String(100), default="")
    recovery_budget: Mapped[str] = mapped_column(String(100), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class PostIncidentReview(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_post_incident"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    incident_date: Mapped[date | None] = mapped_column(nullable=True)
    lessons_learned: Mapped[str] = mapped_column(Text, default="")
    action_items: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


# ── Shell sections (16–25) ─────────────────────────────────────────────


class ModuleDashboardKpi(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_dashboard"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_score: Mapped[int] = mapped_column(Integer, default=0)
    open_exceptions: Mapped[int] = mapped_column(Integer, default=0)
    coverage_pct: Mapped[int] = mapped_column(Integer, default=0)
    trend: Mapped[str] = mapped_column(String(20), default="Stable")
    notes: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class ScopeAuditUniverse(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_scope"

    id: Mapped[int] = mapped_column(primary_key=True)
    entity: Mapped[str] = mapped_column(String(255), default="")
    process: Mapped[str] = mapped_column(String(255), default="")
    in_scope: Mapped[bool] = mapped_column(default=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class RiskControlMatrix(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_description: Mapped[str] = mapped_column(Text, default="")
    control_description: Mapped[str] = mapped_column(Text, default="")
    assertion: Mapped[str] = mapped_column(String(100), default="")
    control_owner: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class TestAnalyticsRule(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(255), default="")
    threshold: Mapped[str] = mapped_column(String(100), default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium")
    is_active: Mapped[bool] = mapped_column(default=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class DataSourceConnector(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_data_src"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_name: Mapped[str] = mapped_column(String(255), default="")
    source_type: Mapped[str] = mapped_column(String(50), default="")
    connection_status: Mapped[str] = mapped_column(String(20), default="Pending")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class SamplingPopulation(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_sampling"

    id: Mapped[int] = mapped_column(primary_key=True)
    population_name: Mapped[str] = mapped_column(String(255), default="")
    total_records: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(50), default="Statistical")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ExceptionRedFlag(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium")
    disposition: Mapped[str] = mapped_column(String(50), default="Open")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class WorkingPaper(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_wp"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), default="")
    evidence_url: Mapped[str] = mapped_column(String(512), default="")
    reviewer: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(20), default="Draft")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class FindingObservation(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255), default="")
    grade: Mapped[str] = mapped_column(String(20), default="Observation")
    status: Mapped[str] = mapped_column(String(20), default="Open")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class RemediationAction(Base, TenantMixin):
    __tablename__ = "mod_business_continuity_dr_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    action: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[date | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
