from datetime import date, datetime

from pydantic import BaseModel, Field

STATUS_OPTIONS = ("Open", "Pass", "Fail", "Partial", "NA")


# ── Signature checkpoints (1–15) ────────────────────────────────────────


class BiaCreate(BaseModel):
    status: str = "Open"
    critical_processes: str = ""
    notes: str = ""
    owner: str = ""
    due_date: date | None = None
    evidence_url: str = ""


class BiaOut(BiaCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BcpPlanCreate(BaseModel):
    status: str = "Open"
    plan_version: str = ""
    last_reviewed: date | None = None
    owner: str = ""
    notes: str = ""
    evidence_url: str = ""


class BcpPlanOut(BcpPlanCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DrTestCreate(BaseModel):
    status: str = "Open"
    test_date: date | None = None
    test_type: str = ""
    result: str = ""
    notes: str = ""
    evidence_url: str = ""


class DrTestOut(DrTestCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RtoRpoCreate(BaseModel):
    status: str = "Open"
    process: str = ""
    rto_target: str = ""
    rpo_target: str = ""
    rto_actual: str = ""
    rpo_actual: str = ""
    notes: str = ""


class RtoRpoOut(RtoRpoCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BackupTestCreate(BaseModel):
    status: str = "Open"
    system: str = ""
    last_test_date: date | None = None
    result: str = ""
    notes: str = ""
    evidence_url: str = ""


class BackupTestOut(BackupTestCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AltSiteCreate(BaseModel):
    status: str = "Open"
    site_name: str = ""
    site_type: str = ""
    last_drill: date | None = None
    notes: str = ""


class AltSiteOut(AltSiteCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CrisisGovCreate(BaseModel):
    status: str = "Open"
    cmt_name: str = ""
    last_drill: date | None = None
    escalation_chain: str = ""
    notes: str = ""


class CrisisGovOut(CrisisGovCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SpofCreate(BaseModel):
    status: str = "Open"
    dependency: str = ""
    risk_level: str = "Medium"
    mitigation: str = ""
    notes: str = ""


class SpofOut(SpofCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VendorContCreate(BaseModel):
    status: str = "Open"
    vendor: str = ""
    criticality: str = "Medium"
    bcp_confirmed: bool | None = None
    notes: str = ""


class VendorContOut(VendorContCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CallTreeCreate(BaseModel):
    status: str = "Open"
    last_test_date: date | None = None
    contact_count: int = 0
    notes: str = ""


class CallTreeOut(CallTreeCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DcResilienceCreate(BaseModel):
    status: str = "Open"
    dc_name: str = ""
    has_redundant_power: bool | None = None
    has_redundant_cooling: bool | None = None
    has_redundant_network: bool | None = None
    notes: str = ""


class DcResilienceOut(DcResilienceCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PandemicCreate(BaseModel):
    status: str = "Open"
    plan_version: str = ""
    remote_work_capable: bool | None = None
    notes: str = ""


class PandemicOut(PandemicCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InsuranceCreate(BaseModel):
    status: str = "Open"
    policy_ref: str = ""
    bi_cover_amount: str = ""
    review_date: date | None = None
    notes: str = ""


class InsuranceOut(InsuranceCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CostEstCreate(BaseModel):
    status: str = "Open"
    scenario: str = ""
    estimated_downtime_cost: str = ""
    recovery_budget: str = ""
    notes: str = ""


class CostEstOut(CostEstCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostIncidentCreate(BaseModel):
    status: str = "Open"
    incident_date: date | None = None
    lessons_learned: str = ""
    action_items: str = ""
    notes: str = ""


class PostIncidentOut(PostIncidentCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Shell sections (16–25) ─────────────────────────────────────────────


class DashboardKpiCreate(BaseModel):
    risk_score: int = Field(default=0, ge=0, le=100)
    open_exceptions: int = Field(default=0, ge=0)
    coverage_pct: int = Field(default=0, ge=0, le=100)
    trend: str = "Stable"
    notes: str = ""


class DashboardKpiOut(DashboardKpiCreate):
    id: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScopeCreate(BaseModel):
    entity: str = ""
    process: str = ""
    in_scope: bool = True
    notes: str = ""


class ScopeOut(ScopeCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RcmCreate(BaseModel):
    risk_description: str = ""
    control_description: str = ""
    assertion: str = ""
    control_owner: str = ""
    notes: str = ""


class RcmOut(RcmCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RuleCreate(BaseModel):
    rule_name: str = ""
    threshold: str = ""
    severity: str = "Medium"
    is_active: bool = True
    notes: str = ""


class RuleOut(RuleCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DataSourceCreate(BaseModel):
    source_name: str = ""
    source_type: str = ""
    connection_status: str = "Pending"
    notes: str = ""


class DataSourceOut(DataSourceCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SamplingCreate(BaseModel):
    population_name: str = ""
    total_records: int = 0
    sample_size: int = 0
    method: str = "Statistical"
    notes: str = ""


class SamplingOut(SamplingCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ExceptionCreate(BaseModel):
    title: str = ""
    severity: str = "Medium"
    disposition: str = "Open"
    notes: str = ""


class ExceptionOut(ExceptionCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkingPaperCreate(BaseModel):
    title: str = ""
    evidence_url: str = ""
    reviewer: str = ""
    status: str = "Draft"
    notes: str = ""


class WorkingPaperOut(WorkingPaperCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FindingCreate(BaseModel):
    title: str = ""
    grade: str = "Observation"
    status: str = "Open"
    notes: str = ""


class FindingOut(FindingCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RemediationCreate(BaseModel):
    action: str = ""
    owner: str = ""
    due_date: date | None = None
    status: str = "Open"
    notes: str = ""


class RemediationOut(RemediationCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    """Computed KPIs across signature checkpoints and shell queues."""

    risk_score: int
    open_exceptions: int
    coverage_pct: int
    trend: str
    signature_total: int
    signature_pass: int
    signature_fail: int
    signature_open: int
