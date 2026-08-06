"""Shared audit-framework — Pydantic I/O schemas."""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from .models import FindingSeverity, FindingStatus, RemediationStatus, SamplingMethod

# ---- Scope & Audit Universe ------------------------------------------------


class ScopeUnitCreate(BaseModel):
    name: str
    unit_type: str = ""
    description: str = ""
    in_scope: bool = True


class ScopeUnitOut(ScopeUnitCreate):
    id: int
    module_key: str
    model_config = {"from_attributes": True}


# ---- RCM --------------------------------------------------------------------


class RcmEntryCreate(BaseModel):
    risk_description: str
    control_description: str
    assertion: str = ""
    control_owner: str = ""
    risk_rating: str = ""


class RcmEntryOut(RcmEntryCreate):
    id: int
    module_key: str
    model_config = {"from_attributes": True}


# ---- Rule Library -------------------------------------------------------


class TestRuleCreate(BaseModel):
    rule_key: str
    label: str
    description: str = ""
    parameters: dict = {}
    is_active: bool = True


class TestRuleOut(TestRuleCreate):
    id: int
    module_key: str
    model_config = {"from_attributes": True}


# ---- Data Sources -------------------------------------------------------


class DataSourceCreate(BaseModel):
    name: str
    source_type: str
    connection_config: dict = {}
    is_active: bool = True


class DataSourceOut(DataSourceCreate):
    id: int
    module_key: str
    last_synced_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ---- Sampling -------------------------------------------------------------


class SamplePlanCreate(BaseModel):
    name: str
    method: SamplingMethod
    population_size: int = 0
    sample_size: int = 0
    rationale: str = ""


class SampleItemCreate(BaseModel):
    reference: str
    notes: str = ""


class SampleItemOut(SampleItemCreate):
    id: int
    plan_id: int
    model_config = {"from_attributes": True}


class SamplePlanOut(SamplePlanCreate):
    id: int
    module_key: str
    model_config = {"from_attributes": True}


# ---- Working Papers -------------------------------------------------------


class WorkingPaperCreate(BaseModel):
    title: str
    source_ref: str = ""
    file_url: str = ""
    tick_marks: str = ""
    prepared_by: str = ""


class WorkingPaperReview(BaseModel):
    reviewed_by: str


class WorkingPaperOut(WorkingPaperCreate):
    id: int
    module_key: str
    reviewed_by: str
    reviewed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


# ---- Findings ---------------------------------------------------------------


class FindingCreate(BaseModel):
    title: str
    description: str
    severity: FindingSeverity = FindingSeverity.MEDIUM
    source_ref: str = ""
    raised_by: str = ""


class FindingUpdate(BaseModel):
    status: Optional[FindingStatus] = None
    severity: Optional[FindingSeverity] = None


class FindingOut(FindingCreate):
    id: int
    module_key: str
    status: FindingStatus
    raised_at: datetime
    model_config = {"from_attributes": True}


# ---- Remediation --------------------------------------------------------


class RemediationItemCreate(BaseModel):
    finding_id: int
    action_description: str
    owner: str = ""
    due_date: Optional[date] = None


class RemediationItemUpdate(BaseModel):
    status: Optional[RemediationStatus] = None
    retest_status: Optional[str] = None
    due_date: Optional[date] = None


class RemediationItemOut(BaseModel):
    id: int
    module_key: str
    finding_id: int
    action_description: str
    owner: str
    due_date: Optional[date] = None
    status: RemediationStatus
    retest_status: str
    model_config = {"from_attributes": True}


# ---- Dashboard / Exception Queue (registry-backed) -------------------------


class ModuleSummaryOut(BaseModel):
    module_key: str
    risk_score: Optional[float] = None
    open_exceptions: int = 0
    total_exceptions: int = 0
    coverage_pct: Optional[float] = None
    trend: str = ""


class GenericExceptionOut(BaseModel):
    """Normalized shape so the shared exception queue can render any module's
    exceptions without knowing that module's native schema."""

    id: int
    module_key: str
    check_key: str
    description: str
    status: str
    metric_value: float = 0
    threshold_value: float = 0
