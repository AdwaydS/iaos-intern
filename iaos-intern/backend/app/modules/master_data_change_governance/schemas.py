"""Master Data Change Governance — Pydantic schemas."""
from datetime import datetime
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Change Log
# ---------------------------------------------------------------------------
class ChangeLogCreate(BaseModel):
    master_type: str
    record_id: str
    record_name: str = ""
    field_name: str
    old_value: str = ""
    new_value: str = ""
    change_type: str = "update"
    change_user: str = ""
    approval_status: str = "auto_approved"
    notes: str = ""


class ChangeLogOut(BaseModel):
    id: int
    master_type: str
    record_id: str
    record_name: str
    field_name: str
    old_value: str
    new_value: str
    change_type: str
    change_user: str
    change_timestamp: datetime
    approval_status: str
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 2. Maker-Checker Workflow
# ---------------------------------------------------------------------------
class WorkflowCreate(BaseModel):
    master_type: str
    field_name: str = "*"
    required_approvers: int = Field(1, ge=1, le=10)
    is_active: bool = True
    description: str = ""


class WorkflowOut(BaseModel):
    id: int
    master_type: str
    field_name: str
    required_approvers: int
    is_active: bool
    description: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 3. Bulk Upload
# ---------------------------------------------------------------------------
class BulkUploadCreate(BaseModel):
    filename: str
    master_type: str = ""
    uploaded_by: str = ""
    record_count: int = 0
    success_count: int = 0
    failure_count: int = 0
    status: str = "pending"
    notes: str = ""


class BulkUploadOut(BaseModel):
    id: int
    filename: str
    master_type: str
    uploaded_by: str
    record_count: int
    success_count: int
    failure_count: int
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 4. Field Access
# ---------------------------------------------------------------------------
class FieldAccessCreate(BaseModel):
    master_type: str
    field_name: str
    role: str
    can_edit: bool = False
    can_view: bool = True


class FieldAccessOut(BaseModel):
    id: int
    master_type: str
    field_name: str
    role: str
    can_edit: bool
    can_view: bool
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 5. Data-Quality Score
# ---------------------------------------------------------------------------
class QualityScoreCreate(BaseModel):
    master_type: str
    dimension: str
    score: float = Field(0.0, ge=0.0, le=100.0)
    total_records: int = 0
    passing_records: int = 0
    notes: str = ""


class QualityScoreOut(BaseModel):
    id: int
    master_type: str
    dimension: str
    score: float
    total_records: int
    passing_records: int
    evaluated_at: datetime
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 6. Duplicate Pair
# ---------------------------------------------------------------------------
class DuplicateCreate(BaseModel):
    master_type: str
    record_a_id: str
    record_a_name: str = ""
    record_b_id: str
    record_b_name: str = ""
    match_score: float = Field(0.0, ge=0.0, le=100.0)
    status: str = "open"


class DuplicateOut(BaseModel):
    id: int
    master_type: str
    record_a_id: str
    record_a_name: str
    record_b_id: str
    record_b_name: str
    match_score: float
    status: str
    detected_at: datetime
    model_config = {"from_attributes": True}


class DuplicateUpdate(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# 7. Reference Data
# ---------------------------------------------------------------------------
class ReferenceDataCreate(BaseModel):
    code_system: str
    code_value: str
    code_description: str = ""
    module_a: str
    module_b: str
    is_consistent: bool = True
    notes: str = ""


class ReferenceDataOut(BaseModel):
    id: int
    code_system: str
    code_value: str
    code_description: str
    module_a: str
    module_b: str
    is_consistent: bool
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 8. Reconciliation
# ---------------------------------------------------------------------------
class ReconciliationCreate(BaseModel):
    master_type: str
    record_id: str
    source_system: str
    target_system: str
    source_hash: str = ""
    target_hash: str = ""
    status: str = "pending"
    notes: str = ""


class ReconciliationOut(BaseModel):
    id: int
    master_type: str
    record_id: str
    source_system: str
    target_system: str
    source_hash: str
    target_hash: str
    status: str
    reconciled_at: datetime
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 9. Sensitive-Change Alert
# ---------------------------------------------------------------------------
class AlertCreate(BaseModel):
    alert_type: str = "rule"
    master_type: str
    field_name: str = "*"
    threshold: int = 1
    recipients: str = ""
    is_active: bool = True
    message: str = ""


class AlertOut(BaseModel):
    id: int
    alert_type: str
    master_type: str
    field_name: str
    threshold: int
    recipients: str
    is_active: bool
    message: str
    triggered_at: datetime | None
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 10. Scope
# ---------------------------------------------------------------------------
class ScopeCreate(BaseModel):
    entity_type: str
    entity_name: str
    description: str = ""
    risk_rating: str = "Medium"


class ScopeOut(BaseModel):
    id: int
    entity_type: str
    entity_name: str
    description: str
    risk_rating: str
    last_audited: datetime | None
    next_audit: datetime | None
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 11. RCM
# ---------------------------------------------------------------------------
class RcmCreate(BaseModel):
    risk_id: str
    risk_description: str = ""
    control_id: str
    control_description: str = ""
    assertion: str = ""
    control_type: str = "Preventive"
    control_owner: str = ""
    frequency: str = "Quarterly"


class RcmOut(BaseModel):
    id: int
    risk_id: str
    risk_description: str
    control_id: str
    control_description: str
    assertion: str
    control_type: str
    control_owner: str
    frequency: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 12. Test Rule
# ---------------------------------------------------------------------------
class TestRuleCreate(BaseModel):
    rule_name: str
    rule_type: str = "Red-Flag"
    master_type: str = ""
    threshold: str = ""
    caat_script: str = ""
    is_active: bool = True


class TestRuleOut(BaseModel):
    id: int
    rule_name: str
    rule_type: str
    master_type: str
    threshold: str
    caat_script: str
    is_active: bool
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 13. Data Source
# ---------------------------------------------------------------------------
class DataSourceCreate(BaseModel):
    source_name: str
    source_type: str = "ERP"
    connection_detail: str = ""
    table_mapping: str = ""
    is_active: bool = True


class DataSourceOut(BaseModel):
    id: int
    source_name: str
    source_type: str
    connection_detail: str
    table_mapping: str
    is_active: bool
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 14. Sampling
# ---------------------------------------------------------------------------
class SamplingCreate(BaseModel):
    population_name: str
    population_size: int = 0
    sample_size: int = 0
    sample_method: str = "Random"
    notes: str = ""


class SamplingOut(BaseModel):
    id: int
    population_name: str
    population_size: int
    sample_size: int
    sample_method: str
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 15. Exception
# ---------------------------------------------------------------------------
class ExceptionCreate(BaseModel):
    exception_type: str
    description: str = ""
    severity: str = "Medium"
    status: str = "Open"
    assigned_to: str = ""
    notes: str = ""


class ExceptionOut(BaseModel):
    id: int
    exception_type: str
    description: str
    severity: str
    status: str
    assigned_to: str
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 16. Working Paper
# ---------------------------------------------------------------------------
class WorkingPaperCreate(BaseModel):
    title: str
    description: str = ""
    paper_type: str = "Evidence"
    reference_url: str = ""
    status: str = "Draft"


class WorkingPaperOut(BaseModel):
    id: int
    title: str
    description: str
    paper_type: str
    reference_url: str
    status: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 17. Finding
# ---------------------------------------------------------------------------
class FindingCreate(BaseModel):
    finding_title: str
    description: str = ""
    severity: str = "Medium"
    status: str = "Open"
    assigned_to: str = ""
    notes: str = ""


class FindingOut(BaseModel):
    id: int
    finding_title: str
    description: str
    severity: str
    status: str
    assigned_to: str
    due_date: datetime | None
    notes: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 18. Remediation
# ---------------------------------------------------------------------------
class RemediationCreate(BaseModel):
    action_title: str
    description: str = ""
    owner: str = ""
    status: str = "Planned"
    notes: str = ""


class RemediationOut(BaseModel):
    id: int
    action_title: str
    description: str
    owner: str
    status: str
    due_date: datetime | None
    completed_date: datetime | None
    notes: str
    model_config = {"from_attributes": True}
