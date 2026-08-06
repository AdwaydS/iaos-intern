from pydantic import BaseModel
from typing import Any, Optional


# ── Budget Exception ─────────────────────────────────────────────────────────

class ExceptionOut(BaseModel):
    id: int
    cost_center: str
    budget_owner: str
    source_procedure: str
    variance_amount: float
    risk_grade: str
    status: str
    disposition_notes: str

    model_config = {"from_attributes": True}


class ExceptionUpdate(BaseModel):
    status: Optional[str] = None
    disposition_notes: Optional[str] = None


# ── Budget RCM ───────────────────────────────────────────────────────────────

class RCMOut(BaseModel):
    id: int
    risk_id: str
    financial_assertion: str
    control_description: str
    control_owner: str
    control_type: str

    model_config = {"from_attributes": True}


# ── Working Paper ────────────────────────────────────────────────────────────

class WorkingPaperOut(BaseModel):
    id: int
    attachment_name: str
    associated_procedure_id: int
    upload_date: str
    uploaded_by: str
    review_status: str
    audit_tickmarks: list[str]

    model_config = {"from_attributes": True}


class UploadEvidencePayload(BaseModel):
    attachment_name: str
    associated_procedure_id: int = 0
    uploaded_by: str = ""
    review_status: str = "Pending"
    audit_tickmarks: list[str] = []


# ── Generic page payload (analysis & framework sub-pages) ─────────────────────

class KpiItem(BaseModel):
    label: str
    value: str | int | float
    tone: str = "navy"
    icon: str = "activity"
    sublabel: str = ""


class ChartBarItem(BaseModel):
    label: str
    budget: float
    actual: float
    negative: bool = False


class ChartSparkItem(BaseModel):
    label: str
    value: float
    direction: str = "over"


class PageDataOut(BaseModel):
    kpis: list[KpiItem]
    rows: list[dict[str, Any]]
    chart_bars: list[ChartBarItem] = []
    chart_spark: list[ChartSparkItem] = []
    audit_comment: str = ""


class KPISummaryOut(BaseModel):
    live_risk_score: float
    open_exceptions_count: int
    testing_coverage_pct: float
    action_tracker_rate: float
