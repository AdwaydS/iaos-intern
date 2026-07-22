from pydantic import BaseModel


class SchemeCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    scheme_type: str = "grant"
    governing_body: str = ""
    max_amount: float = 0
    start_date: str | None = None
    end_date: str | None = None
    status: str = "active"
    notes: str = ""


class SchemeOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    scheme_type: str
    governing_body: str
    max_amount: float
    start_date: str | None
    end_date: str | None
    status: str
    notes: str
    model_config = {"from_attributes": True}


class EligibilityCreate(BaseModel):
    entity_name: str
    scheme_code: str
    scheme_name: str
    eligible: str = "yes"
    validity_from: str | None = None
    validity_to: str | None = None
    notes: str = ""


class EligibilityOut(BaseModel):
    id: int
    entity_name: str
    scheme_code: str
    scheme_name: str
    eligible: str
    validity_from: str | None
    validity_to: str | None
    notes: str
    model_config = {"from_attributes": True}


class ClaimCreate(BaseModel):
    claim_ref: str
    scheme_code: str
    scheme_name: str
    entity_name: str
    claimed_amount: float = 0
    computed_amount: float = 0
    claim_date: str | None = None
    status: str = "pending"
    notes: str = ""


class ClaimOut(BaseModel):
    id: int
    claim_ref: str
    scheme_code: str
    scheme_name: str
    entity_name: str
    claimed_amount: float
    computed_amount: float
    claim_date: str | None
    status: str
    notes: str
    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    claim_id: int
    document_name: str
    document_type: str = "supporting"
    status: str = "pending"
    notes: str = ""


class DocumentOut(BaseModel):
    id: int
    claim_id: int
    document_name: str
    document_type: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


class ReceiptCreate(BaseModel):
    claim_id: int
    claim_ref: str
    scheme_code: str
    amount_received: float = 0
    receipt_date: str | None = None
    ageing_days: int = 0
    status: str = "pending"
    notes: str = ""


class ReceiptOut(BaseModel):
    id: int
    claim_id: int
    claim_ref: str
    scheme_code: str
    amount_received: float
    receipt_date: str | None
    ageing_days: int
    status: str
    notes: str
    model_config = {"from_attributes": True}


class ConditionCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    entity_name: str
    condition_desc: str
    compliance_status: str = "pending"
    due_date: str | None = None
    evidence_ref: str = ""
    notes: str = ""


class ConditionOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    entity_name: str
    condition_desc: str
    compliance_status: str
    due_date: str | None
    evidence_ref: str
    notes: str
    model_config = {"from_attributes": True}


class ExportIncentiveCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    claim_ref: str
    export_value: float = 0
    incentive_amount: float = 0
    status: str = "pending"
    claim_date: str | None = None
    notes: str = ""


class ExportIncentiveOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    claim_ref: str
    export_value: float
    incentive_amount: float
    status: str
    claim_date: str | None
    notes: str
    model_config = {"from_attributes": True}


class CapitalSubsidyCreate(BaseModel):
    entity_name: str
    scheme_code: str
    scheme_name: str
    investment_amount: float = 0
    subsidy_amount: float = 0
    status: str = "pending"
    claim_date: str | None = None
    notes: str = ""


class CapitalSubsidyOut(BaseModel):
    id: int
    entity_name: str
    scheme_code: str
    scheme_name: str
    investment_amount: float
    subsidy_amount: float
    status: str
    claim_date: str | None
    notes: str
    model_config = {"from_attributes": True}


class InterestSubventionCreate(BaseModel):
    entity_name: str
    scheme_code: str
    scheme_name: str
    loan_amount: float = 0
    subvention_pct: str = "0"
    subvention_amount: float = 0
    status: str = "pending"
    claim_date: str | None = None
    notes: str = ""


class InterestSubventionOut(BaseModel):
    id: int
    entity_name: str
    scheme_code: str
    scheme_name: str
    loan_amount: float
    subvention_pct: str
    subvention_amount: float
    status: str
    claim_date: str | None
    notes: str
    model_config = {"from_attributes": True}


class GrantAccountingCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    entity_name: str
    grant_amount: float = 0
    recognition_method: str = "income"
    periods: int = 1
    period_amount: float = 0
    status: str = "pending"
    notes: str = ""


class GrantAccountingOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    entity_name: str
    grant_amount: float
    recognition_method: str
    periods: int
    period_amount: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class ClawbackRiskCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    entity_name: str
    condition_breached: str
    risk_level: str = "medium"
    exposure_amount: float = 0
    mitigation: str = ""
    status: str = "open"
    notes: str = ""


class ClawbackRiskOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    entity_name: str
    condition_breached: str
    risk_level: str
    exposure_amount: float
    mitigation: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


class DeadlineCreate(BaseModel):
    deadline_type: str
    deadline_name: str
    due_date: str
    scheme_code: str = ""
    claim_ref: str = ""
    responsible: str = ""
    status: str = "pending"
    notes: str = ""


class DeadlineOut(BaseModel):
    id: int
    deadline_type: str
    deadline_name: str
    due_date: str
    scheme_code: str
    claim_ref: str
    responsible: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


class SchemeOverlapCreate(BaseModel):
    entity_name: str
    scheme_1_code: str
    scheme_1_name: str
    scheme_2_code: str
    scheme_2_name: str
    overlap_desc: str
    risk_level: str = "medium"
    resolution: str = ""
    status: str = "open"
    notes: str = ""


class SchemeOverlapOut(BaseModel):
    id: int
    entity_name: str
    scheme_1_code: str
    scheme_1_name: str
    scheme_2_code: str
    scheme_2_name: str
    overlap_desc: str
    risk_level: str
    resolution: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


class CorrespondenceCreate(BaseModel):
    scheme_code: str
    authority: str
    subject: str
    date_sent: str | None = None
    response_due: str | None = None
    status: str = "sent"
    notes: str = ""


class CorrespondenceOut(BaseModel):
    id: int
    scheme_code: str
    authority: str
    subject: str
    date_sent: str | None
    response_due: str | None
    status: str
    notes: str
    model_config = {"from_attributes": True}


class UtilisationCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    entity_name: str
    grant_amount: float = 0
    utilised_amount: float = 0
    report_date: str | None = None
    status: str = "pending"
    notes: str = ""


class UtilisationOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    entity_name: str
    grant_amount: float
    utilised_amount: float
    report_date: str | None
    status: str
    notes: str
    model_config = {"from_attributes": True}


class RealisationCreate(BaseModel):
    scheme_code: str
    scheme_name: str
    entity_name: str
    claimed_amount: float = 0
    received_amount: float = 0
    claim_date: str | None = None
    receipt_date: str | None = None
    status: str = "pending"
    notes: str = ""


class RealisationOut(BaseModel):
    id: int
    scheme_code: str
    scheme_name: str
    entity_name: str
    claimed_amount: float
    received_amount: float
    variance: float
    claim_date: str | None
    receipt_date: str | None
    status: str
    notes: str
    model_config = {"from_attributes": True}
