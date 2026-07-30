from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ItemCreate(BaseModel):
    title: str
    notes: str = ""


class ItemOut(BaseModel):
    id: int
    title: str
    notes: str

    model_config = {"from_attributes": True}


class SalesDistributionKpis(BaseModel):
    total_sales_audited: float
    scheme_leakage_identified: float
    primary_secondary_mismatch_val: float
    high_risk_red_flags: int
    open_remediation_actions: int
    active_distributors: int
    claim_leakage_recovery_rate: float
    audit_coverage_pct: float


class SubPageDataRequest(BaseModel):
    page_key: str
    filters: Optional[Dict[str, Any]] = None


class SubPageDataResponse(BaseModel):
    page_key: str
    title: str
    category: str
    total_records: int
    summary_metrics: Dict[str, Any]
    items: List[Dict[str, Any]]


class AnalyticsExecuteRequest(BaseModel):
    threshold_amount: float = 50000.0


class AnalyticsExecuteResponse(BaseModel):
    status: str
    new_red_flags_count: int
    total_exposure_identified: float
    executed_rules_count: int
    message: str


class FindingEscalateRequest(BaseModel):
    title: str
    risk_category: str
    severity: str = "High"
    financial_impact: float = 0.0
    recommendation: str
    action_owner: str
    target_date: Optional[date] = None


class FindingEscalateResponse(BaseModel):
    finding_no: str
    action_id: str
    status: str
    message: str


class GenericRecordCreate(BaseModel):
    data: Dict[str, Any]
