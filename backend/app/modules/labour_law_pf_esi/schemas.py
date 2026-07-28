from typing import Optional
from pydantic import BaseModel


# --- Labour Compliance Registry ---
class RegistryCreate(BaseModel):
    title: str
    identifier: Optional[str] = ""
    status: Optional[str] = "Pending"
    date_value: Optional[str] = ""
    remarks: Optional[str] = ""


class RegistryUpdate(BaseModel):
    title: Optional[str] = None
    identifier: Optional[str] = None
    status: Optional[str] = None
    date_value: Optional[str] = None
    remarks: Optional[str] = None


class RegistryOut(BaseModel):
    id: int
    registry_type: str
    title: str
    identifier: str
    status: str
    date_value: str
    remarks: str

    model_config = {"from_attributes": True}


# --- Contract Worker ---
class ContractWorkerCreate(BaseModel):
    worker_name: str
    contractor_name: str
    trade: Optional[str] = ""
    date_of_joining: Optional[str] = ""
    wage_rate: Optional[float] = 0.0
    pf_status: Optional[str] = "Pending"
    esi_status: Optional[str] = "Pending"
    compliance_status: Optional[str] = "Compliant"


class ContractWorkerUpdate(BaseModel):
    worker_name: Optional[str] = None
    contractor_name: Optional[str] = None
    trade: Optional[str] = None
    date_of_joining: Optional[str] = None
    wage_rate: Optional[float] = None
    pf_status: Optional[str] = None
    esi_status: Optional[str] = None
    compliance_status: Optional[str] = None


class ContractWorkerOut(BaseModel):
    id: int
    worker_name: str
    contractor_name: str
    trade: str
    date_of_joining: str
    wage_rate: float
    pf_status: str
    esi_status: str
    compliance_status: str

    model_config = {"from_attributes": True}


# --- Compliance Exception ---
class ComplianceExceptionCreate(BaseModel):
    sub_page: str
    rule_violated: str
    severity: Optional[str] = "Medium"
    status: Optional[str] = "Open"
    notes: Optional[str] = ""


class ComplianceExceptionUpdate(BaseModel):
    sub_page: Optional[str] = None
    rule_violated: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ComplianceExceptionOut(BaseModel):
    id: int
    sub_page: str
    rule_violated: str
    severity: str
    status: str
    notes: str

    model_config = {"from_attributes": True}


# --- Dashboard Summary ---
class DashboardSummary(BaseModel):
    risk_index: float
    coverage_pct: float
    open_exceptions: int
    pending_capa: int
