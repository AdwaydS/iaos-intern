from datetime import datetime

from pydantic import BaseModel


# ---- Working papers -------------------------------------------------------

class PaperCreate(BaseModel):
    title: str
    programme_step: str = ""
    engagement_ref: str = ""
    tags: str = ""
    notes: str = ""
    source_type: str = "upload"          # upload | screenshot
    source_system: str = ""
    sample_ref: str = ""
    reused_from_id: int | None = None
    is_confidential: bool = False
    confidential_reason: str = ""
    retention_years: int = 7


class PaperOut(BaseModel):
    id: int
    title: str
    filename: str
    programme_step: str
    engagement_ref: str
    tags: str
    notes: str
    source_type: str
    source_system: str
    sample_ref: str
    reused_from_id: int | None
    is_confidential: bool
    confidential_reason: str
    retention_years: int
    purge_at: datetime | None
    hash_algorithm: str
    hash_value: str
    hash_verified_at: datetime | None
    current_version: int
    uploaded_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---- Versions ---------------------------------------------------------------

class VersionCreate(BaseModel):
    change_summary: str = ""


class VersionOut(BaseModel):
    id: int
    paper_id: int
    version_no: int
    changed_by: str
    change_summary: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---- Tick-marks ---------------------------------------------------------------

class TickMarkCreate(BaseModel):
    symbol: str
    location_ref: str = ""
    comment: str = ""


class TickMarkOut(BaseModel):
    id: int
    paper_id: int
    symbol: str
    location_ref: str
    comment: str
    created_by: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---- Sign-offs ---------------------------------------------------------------

class SignOffCreate(BaseModel):
    stage: str                    # preparer | reviewer | manager | partner
    signature_payload: str = ""


class SignOffOut(BaseModel):
    id: int
    paper_id: int
    stage: str
    signed_by: str
    signature_payload: str
    signed_at: datetime

    model_config = {"from_attributes": True}


# ---- Access grants -------------------------------------------------------------

class AccessGrantCreate(BaseModel):
    role: str = ""
    user_email: str = ""
    permission: str = "view"


class AccessGrantOut(BaseModel):
    id: int
    paper_id: int
    role: str
    user_email: str
    permission: str

    model_config = {"from_attributes": True}


# ---- Misc -----------------------------------------------------------------

class RetentionUpdate(BaseModel):
    retention_years: int


class ConfidentialUpdate(BaseModel):
    is_confidential: bool
    confidential_reason: str = ""


class CompletenessResult(BaseModel):
    programme_step: str
    paper_count: int
    missing_signoff: int
    missing_hash: int


# ============================================================================
# Shell features (#16-#22, #24-#25)
# ============================================================================

# ---- #16 Dashboard ----------------------------------------------------------

class DashboardKPIs(BaseModel):
    total_papers: int
    confidential_papers: int
    open_exceptions: int
    open_findings: int
    overdue_remediation: int
    coverage_pct: float          # scope units with >=1 paper / total scope units
    hash_coverage_pct: float     # papers with a hash / total papers


# ---- #17 Scope & Audit Universe ---------------------------------------------

class ScopeUnitCreate(BaseModel):
    name: str
    unit_type: str = "process"
    description: str = ""
    in_scope: bool = True


class ScopeUnitOut(BaseModel):
    id: int
    name: str
    unit_type: str
    description: str
    in_scope: bool

    model_config = {"from_attributes": True}


# ---- #18 Risk & Control Matrix ----------------------------------------------

class RiskControlCreate(BaseModel):
    scope_unit_id: int | None = None
    risk: str
    control: str = ""
    assertion: str = ""
    control_owner: str = ""


class RiskControlOut(BaseModel):
    id: int
    scope_unit_id: int | None
    risk: str
    control: str
    assertion: str
    control_owner: str

    model_config = {"from_attributes": True}


# ---- #19 Test & Analytics Rule Library ---------------------------------------

class AnalyticsRuleCreate(BaseModel):
    name: str
    rule_type: str = "threshold"
    config: str = ""
    active: bool = True


class AnalyticsRuleOut(BaseModel):
    id: int
    name: str
    rule_type: str
    config: str
    active: bool

    model_config = {"from_attributes": True}


# ---- #20 Data Source & Connector Setup ---------------------------------------

class DataSourceCreate(BaseModel):
    name: str
    source_type: str = "upload"
    connection_info: str = ""


class DataSourceOut(BaseModel):
    id: int
    name: str
    source_type: str
    connection_info: str
    last_synced_at: datetime | None

    model_config = {"from_attributes": True}


# ---- #21 Sampling & Population Builder ---------------------------------------

class PopulationCreate(BaseModel):
    name: str
    size: int = 0
    method: str = "judgemental"
    sample_size: int = 0


class PopulationOut(BaseModel):
    id: int
    name: str
    size: int
    method: str
    sample_size: int

    model_config = {"from_attributes": True}


class SampleItemCreate(BaseModel):
    reference: str
    description: str = ""


class SampleItemOut(BaseModel):
    id: int
    population_id: int
    reference: str
    description: str

    model_config = {"from_attributes": True}


# ---- #22 Exception & Red-Flag Queue -------------------------------------------

class ExceptionCreate(BaseModel):
    rule_id: int | None = None
    description: str


class ExceptionUpdate(BaseModel):
    status: str
    disposition: str = ""


class ExceptionOut(BaseModel):
    id: int
    rule_id: int | None
    description: str
    status: str
    disposition: str
    raised_at: datetime

    model_config = {"from_attributes": True}


# ---- #24 Observation & Finding Log ---------------------------------------------

class FindingCreate(BaseModel):
    title: str
    description: str = ""
    grade: str = "medium"
    paper_id: int | None = None


class FindingOut(BaseModel):
    id: int
    title: str
    description: str
    grade: str
    status: str
    paper_id: int | None
    raised_by: str

    model_config = {"from_attributes": True}


# ---- #25 Remediation / Action Tracker -------------------------------------------

class RemediationCreate(BaseModel):
    action: str
    owner: str = ""
    due_date: datetime | None = None


class RemediationUpdate(BaseModel):
    status: str
    retest_status: str = "not_started"


class RemediationOut(BaseModel):
    id: int
    finding_id: int
    action: str
    owner: str
    due_date: datetime | None
    status: str
    retest_status: str

    model_config = {"from_attributes": True}
