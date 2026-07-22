from datetime import datetime, date
from pydantic import BaseModel, ConfigDict


# ---------- Procedures (Signature steps) ----------
class ProcedureUpdate(BaseModel):
    status: str | None = None
    performed_by: str | None = None
    notes: str | None = None


class ProcedureSign(BaseModel):
    signed_by: str


class ProcedureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    step_no: int
    title: str
    description: str
    status: str
    performed_by: str
    signed_by: str
    signed_at: datetime | None
    notes: str


# ---------- Scope ----------
class ScopeIn(BaseModel):
    entity_name: str
    process_area: str = ""
    in_scope: bool = True
    rationale: str = ""


class ScopeOut(ScopeIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- RCM ----------
class ControlIn(BaseModel):
    risk_description: str
    control_description: str = ""
    assertion: str = ""
    control_owner: str = ""
    risk_rating: str = "medium"


class ControlOut(ControlIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Rules ----------
class RuleIn(BaseModel):
    rule_name: str
    description: str = ""
    threshold: str = ""
    logic: str = ""
    active: bool = True


class RuleOut(RuleIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Data sources ----------
class DataSourceIn(BaseModel):
    name: str
    source_type: str = "upload"
    connection_details: str = ""
    status: str = "not_connected"


class DataSourceOut(DataSourceIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Samples ----------
class SampleIn(BaseModel):
    population_desc: str
    sample_method: str = "judgemental"
    population_size: int = 0
    sample_size: int = 0
    notes: str = ""


class SampleOut(SampleIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Exceptions ----------
class ExceptionIn(BaseModel):
    rule_id: int | None = None
    description: str
    severity: str = "medium"
    status: str = "open"
    disposition: str = ""


class ExceptionOut(ExceptionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Evidence ----------
class EvidenceIn(BaseModel):
    procedure_id: int | None = None
    title: str
    file_ref: str = ""
    reviewer: str = ""
    reviewed: bool = False
    notes: str = ""


class EvidenceOut(EvidenceIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Findings ----------
class FindingIn(BaseModel):
    title: str
    description: str = ""
    grade: str = "medium"
    status: str = "open"
    procedure_id: int | None = None


class FindingOut(FindingIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Actions ----------
class ActionIn(BaseModel):
    finding_id: int | None = None
    action_desc: str
    owner: str = ""
    due_date: date | None = None
    status: str = "open"
    retest_status: str = "not_started"


class ActionOut(ActionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Dashboard ----------
class DashboardOut(BaseModel):
    total_procedures: int
    completed_procedures: int
    coverage_pct: float
    open_exceptions: int
    open_findings: int
    open_actions: int
    risk_score: str  # low|medium|high
