from pydantic import BaseModel


class RcmEntryCreate(BaseModel):
    process: str
    risk: str
    control_description: str
    control_type: str = "Preventive"
    frequency: str = "Monthly"
    nature: str = "Manual"
    is_key_control: bool = False
    assertions: str = ""
    regulatory_refs: str = ""
    owner: str = ""
    reviewer: str = ""
    test_procedure: str = ""
    design_effectiveness: str = "Not Tested"
    operating_effectiveness: str = "Not Tested"
    rationalization_status: str = "Active"
    status: str = "Draft"
    notes: str = ""


class RcmEntryUpdate(BaseModel):
    process: str | None = None
    risk: str | None = None
    control_description: str | None = None
    control_type: str | None = None
    frequency: str | None = None
    nature: str | None = None
    is_key_control: bool | None = None
    assertions: str | None = None
    regulatory_refs: str | None = None
    owner: str | None = None
    reviewer: str | None = None
    test_procedure: str | None = None
    design_effectiveness: str | None = None
    operating_effectiveness: str | None = None
    rationalization_status: str | None = None
    status: str | None = None
    notes: str | None = None


class RcmEntryOut(BaseModel):
    id: int
    process: str
    risk: str
    control_description: str
    control_type: str
    frequency: str
    nature: str
    is_key_control: bool
    assertions: str
    regulatory_refs: str
    owner: str
    reviewer: str
    test_procedure: str
    design_effectiveness: str
    operating_effectiveness: str
    rationalization_status: str
    version: int
    status: str
    notes: str

    model_config = {"from_attributes": True}


class VersionLogOut(BaseModel):
    id: int
    entry_id: int
    entry_process: str
    field_changed: str
    old_value: str
    new_value: str
    changed_by: str

    model_config = {"from_attributes": True}


class OwnerCreate(BaseModel):
    name: str
    email: str = ""
    department: str = ""
    role: str = "Owner"


class OwnerOut(OwnerCreate):
    id: int
    model_config = {"from_attributes": True}


class TemplateCreate(BaseModel):
    name: str
    cycle: str = ""
    industry: str = "All industries"
    description: str = ""
    default_process: str = ""
    default_risk: str = ""
    default_control: str = ""
    is_active: bool = True


class TemplateOut(TemplateCreate):
    id: int
    model_config = {"from_attributes": True}


class ApprovalCreate(BaseModel):
    entry_id: int
    requested_by: str = ""
    approver: str = ""
    comments: str = ""


class ApprovalDecide(BaseModel):
    status: str  # Approved, Rejected
    comments: str = ""


class ApprovalOut(BaseModel):
    id: int
    entry_id: int
    entry_process: str
    requested_by: str
    approver: str
    status: str
    comments: str

    model_config = {"from_attributes": True}


class ScopeCreate(BaseModel):
    unit_name: str
    unit_type: str = "Process"
    description: str = ""
    in_scope: bool = True


class ScopeOut(ScopeCreate):
    id: int
    model_config = {"from_attributes": True}


class TestRuleCreate(BaseModel):
    name: str
    description: str = ""
    data_source: str = ""
    threshold: str = ""
    is_active: bool = True


class TestRuleOut(TestRuleCreate):
    id: int
    model_config = {"from_attributes": True}


class ConnectorCreate(BaseModel):
    name: str
    source_type: str = "ERP"
    connection_details: str = ""
    status: str = "Pending"


class ConnectorOut(ConnectorCreate):
    id: int
    model_config = {"from_attributes": True}


class SampleCreate(BaseModel):
    population_description: str
    sampling_method: str = "Random"
    population_size: int = 0
    sample_size: int = 0
    notes: str = ""


class SampleOut(SampleCreate):
    id: int
    model_config = {"from_attributes": True}


class ExceptionCreate(BaseModel):
    description: str
    source_rule: str = ""
    severity: str = "Medium"
    status: str = "Open"
    disposition_notes: str = ""


class ExceptionOut(ExceptionCreate):
    id: int
    model_config = {"from_attributes": True}


class WorkingPaperCreate(BaseModel):
    title: str
    related_entry_id: int | None = None
    content: str = ""
    reviewer: str = ""
    sign_off_status: str = "Pending"


class WorkingPaperOut(WorkingPaperCreate):
    id: int
    model_config = {"from_attributes": True}


class FindingCreate(BaseModel):
    title: str
    description: str = ""
    severity: str = "Medium"
    related_entry_id: int | None = None
    status: str = "Open"


class FindingOut(FindingCreate):
    id: int
    model_config = {"from_attributes": True}


class RemediationCreate(BaseModel):
    finding_id: int | None = None
    action: str
    owner: str = ""
    due_date: str = ""
    status: str = "Not Started"
    retest_status: str = "Pending"


class RemediationOut(RemediationCreate):
    id: int
    model_config = {"from_attributes": True}


class GenericUpdate(BaseModel):
    """Loose partial-update payload used for the simpler CRUD entities."""
    class Config:
        extra = "allow"
