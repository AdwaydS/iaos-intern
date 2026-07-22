from pydantic import BaseModel


# ---- Catalog (static, read-only) ------------------------------------------

class CatalogEntry(BaseModel):
    code: str
    seq: int
    title: str
    kind: str  # "signature" | "shell"
    description: str


# ---- Signature test runs (use cases 1-15) ----------------------------------

class RunCreate(BaseModel):
    test_code: str
    scope_note: str = ""
    status: str = "open"
    risk_rating: str = "medium"
    exceptions_found: int = 0
    population_size: int = 0
    sample_size: int = 0
    notes: str = ""


class RunUpdate(BaseModel):
    scope_note: str | None = None
    status: str | None = None
    risk_rating: str | None = None
    exceptions_found: int | None = None
    population_size: int | None = None
    sample_size: int | None = None
    notes: str | None = None


class RunOut(BaseModel):
    id: int
    test_code: str
    scope_note: str
    status: str
    risk_rating: str
    exceptions_found: int
    population_size: int
    sample_size: int
    notes: str

    model_config = {"from_attributes": True}


# ---- RCM (use case 18) ------------------------------------------------------

class RcmCreate(BaseModel):
    risk: str
    control: str = ""
    assertion: str = ""
    control_owner: str = ""
    frequency: str = ""


class RcmOut(RcmCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Data sources (use case 20) --------------------------------------------

class DataSourceCreate(BaseModel):
    name: str
    source_type: str = "upload"
    connection_ref: str = ""
    notes: str = ""


class DataSourceOut(DataSourceCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Samples (use case 21) --------------------------------------------------

class SampleCreate(BaseModel):
    population_desc: str
    population_size: int = 0
    method: str = "judgemental"
    sample_size: int = 0
    notes: str = ""


class SampleOut(SampleCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Exceptions (use case 22) ----------------------------------------------

class ExceptionCreate(BaseModel):
    run_id: int | None = None
    description: str
    amount: float = 0
    disposition: str = "pending"
    reviewer_notes: str = ""


class ExceptionUpdate(BaseModel):
    disposition: str | None = None
    reviewer_notes: str | None = None


class ExceptionOut(ExceptionCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Evidence / working papers (use case 23) -------------------------------

class EvidenceCreate(BaseModel):
    run_id: int | None = None
    label: str
    file_ref: str = ""
    reviewer: str = ""
    signed_off: bool = False


class EvidenceOut(EvidenceCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Findings (use case 24) -------------------------------------------------

class FindingCreate(BaseModel):
    run_id: int | None = None
    title: str
    grade: str = "medium"
    description: str = ""
    owner: str = ""
    status: str = "open"


class FindingUpdate(BaseModel):
    grade: str | None = None
    description: str | None = None
    owner: str | None = None
    status: str | None = None


class FindingOut(FindingCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Actions / remediation (use case 25) -----------------------------------

class ActionCreate(BaseModel):
    finding_id: int | None = None
    action: str
    owner: str = ""
    due_date: str = ""
    retest_status: str = "not_started"


class ActionUpdate(BaseModel):
    owner: str | None = None
    due_date: str | None = None
    retest_status: str | None = None


class ActionOut(ActionCreate):
    id: int
    model_config = {"from_attributes": True}


# ---- Dashboard (use case 16) -------------------------------------------------

class DashboardOut(BaseModel):
    total_runs: int
    open_exceptions: int
    open_findings: int
    high_risk_runs: int
    coverage_pct: float
    signature_tests_covered: int
    signature_tests_total: int
