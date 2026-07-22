from datetime import datetime, date
from pydantic import BaseModel, ConfigDict


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


class ScopeIn(BaseModel):
    unit_name: str
    description: str = ""
    process_owner: str = ""
    status: str = "in_scope"


class ScopeOut(ScopeIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class RiskControlIn(BaseModel):
    risk_id: str
    control_desc: str = ""
    assertion: str = ""
    control_owner: str = ""
    status: str = "effective"


class RiskControlOut(RiskControlIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TestRuleIn(BaseModel):
    rule_name: str
    rule_type: str = "threshold"
    threshold: str = ""
    description: str = ""
    active: bool = True


class TestRuleOut(TestRuleIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DataSourceIn(BaseModel):
    source_name: str
    connector_type: str = "upload"
    connection_string: str = ""
    status: str = "not_connected"


class DataSourceOut(DataSourceIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SampleIn(BaseModel):
    population_desc: str
    sample_size: int = 0
    method: str = "judgemental"
    notes: str = ""


class SampleOut(SampleIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ExceptionIn(BaseModel):
    title: str
    description: str = ""
    severity: str = "medium"
    status: str = "open"
    disposition: str = ""


class ExceptionOut(ExceptionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class EvidenceIn(BaseModel):
    procedure_id: int | None = None
    title: str
    file_ref: str = ""
    description: str = ""


class EvidenceOut(EvidenceIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class FindingIn(BaseModel):
    title: str
    description: str = ""
    severity: str = "medium"
    status: str = "open"
    control_owner: str = ""


class FindingOut(FindingIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class ActionIn(BaseModel):
    finding_id: int | None = None
    title: str
    description: str = ""
    owner: str = ""
    due_date: date | None = None
    status: str = "open"
    retest_status: str = "not_started"


class ActionOut(ActionIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class DashboardOut(BaseModel):
    total_procedures: int
    completed_procedures: int
    coverage_pct: float
    open_exceptions: int
    open_findings: int
    open_actions: int
    risk_score: str
