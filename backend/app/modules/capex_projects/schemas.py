from pydantic import BaseModel


class AfeCreate(BaseModel):
    afe_no: str
    project_name: str
    project_type: str = ""
    approved_afe: float = 0
    actual_spend: float = 0
    status: str = "open"
    approved_date: str | None = None
    notes: str = ""


class AfeOut(BaseModel):
    id: int
    afe_no: str
    project_name: str
    project_type: str
    approved_afe: float
    actual_spend: float
    budget_pct: float
    status: str
    approved_date: str | None
    notes: str
    model_config = {"from_attributes": True}


class CostOverrunCreate(BaseModel):
    project_name: str
    afe_no: str = ""
    sanctioned_cost: float = 0
    actual_cost: float = 0
    status: str = "open"
    notes: str = ""


class CostOverrunOut(BaseModel):
    id: int
    project_name: str
    afe_no: str
    sanctioned_cost: float
    actual_cost: float
    overrun_amount: float
    overrun_pct: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class ScheduleOverrunCreate(BaseModel):
    project_name: str
    milestone: str = ""
    planned_date: str | None = None
    actual_date: str | None = None
    status: str = "open"
    notes: str = ""


class ScheduleOverrunOut(BaseModel):
    id: int
    project_name: str
    milestone: str
    planned_date: str | None
    actual_date: str | None
    delay_days: int
    status: str
    notes: str
    model_config = {"from_attributes": True}


class CapitalisationTimingCreate(BaseModel):
    project_name: str
    commissioning_date: str | None = None
    capitalised_date: str | None = None
    status: str = "open"
    notes: str = ""


class CapitalisationTimingOut(BaseModel):
    id: int
    project_name: str
    commissioning_date: str | None
    capitalised_date: str | None
    delay_days: int
    status: str
    notes: str
    model_config = {"from_attributes": True}


class QuoteCreate(BaseModel):
    project_name: str
    item_desc: str = ""
    quote_count: int = 0
    best_quote: float = 0
    chosen_quote: float = 0
    compliant: str = "yes"
    notes: str = ""


class QuoteOut(BaseModel):
    id: int
    project_name: str
    item_desc: str
    quote_count: int
    best_quote: float
    chosen_quote: float
    gap_pct: float
    compliant: str
    notes: str
    model_config = {"from_attributes": True}


class CwipTraceCreate(BaseModel):
    project_name: str
    capex_spend: float = 0
    cwip_balance: float = 0
    fa_transfer: float = 0
    traced: str = "no"
    status: str = "pending"
    notes: str = ""


class CwipTraceOut(BaseModel):
    id: int
    project_name: str
    capex_spend: float
    cwip_balance: float
    fa_transfer: float
    traced: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


class MilestonePaymentCreate(BaseModel):
    project_name: str
    milestone: str
    scheduled_amount: float = 0
    paid_amount: float = 0
    progress_pct: float = 0
    status: str = "pending"
    notes: str = ""


class MilestonePaymentOut(BaseModel):
    id: int
    project_name: str
    milestone: str
    scheduled_amount: float
    paid_amount: float
    progress_pct: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class ChangeOrderCreate(BaseModel):
    project_name: str
    change_desc: str
    scope_impact: str = ""
    cost_impact: float = 0
    approved: str = "no"
    status: str = "open"
    notes: str = ""


class ChangeOrderOut(BaseModel):
    id: int
    project_name: str
    change_desc: str
    scope_impact: str
    cost_impact: float
    approved: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


class ContractorAdvanceCreate(BaseModel):
    project_name: str
    contractor: str
    advance_amount: float = 0
    recovered_amount: float = 0
    status: str = "open"
    notes: str = ""


class ContractorAdvanceOut(BaseModel):
    id: int
    project_name: str
    contractor: str
    advance_amount: float
    recovered_amount: float
    balance_amount: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class RetentionLdCreate(BaseModel):
    project_name: str
    contractor: str
    retention_amount: float = 0
    retention_release_date: str | None = None
    ld_amount: float = 0
    status: str = "held"
    notes: str = ""


class RetentionLdOut(BaseModel):
    id: int
    project_name: str
    contractor: str
    retention_amount: float
    retention_release_date: str | None
    ld_amount: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class IdleCapexCreate(BaseModel):
    project_name: str
    capex_amount: float = 0
    status: str = "idle"
    last_activity_date: str | None = None
    notes: str = ""


class IdleCapexOut(BaseModel):
    id: int
    project_name: str
    capex_amount: float
    status: str
    last_activity_date: str | None
    idle_days: int
    notes: str
    model_config = {"from_attributes": True}


class CapexRoiCreate(BaseModel):
    project_name: str
    capex_amount: float = 0
    benefits_realised: float = 0
    status: str = "pending"
    notes: str = ""


class CapexRoiOut(BaseModel):
    id: int
    project_name: str
    capex_amount: float
    benefits_realised: float
    roi_pct: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class PoSplittingCreate(BaseModel):
    project_name: str
    vendor: str = ""
    po_count: int = 0
    po_total: float = 0
    approval_threshold: float = 0
    flagged: str = "no"
    notes: str = ""


class PoSplittingOut(BaseModel):
    id: int
    project_name: str
    vendor: str
    po_count: int
    po_total: float
    approval_threshold: float
    flagged: str
    notes: str
    model_config = {"from_attributes": True}


class CashflowCreate(BaseModel):
    project_name: str
    period: str = ""
    planned_amount: float = 0
    actual_amount: float = 0
    status: str = "on_track"
    notes: str = ""


class CashflowOut(BaseModel):
    id: int
    project_name: str
    period: str
    planned_amount: float
    actual_amount: float
    variance: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class VendorPerfCreate(BaseModel):
    vendor_name: str
    project_name: str
    on_time_delivery: str = "yes"
    quality_rating: str = "good"
    issues_count: int = 0
    status: str = "active"
    notes: str = ""


class VendorPerfOut(BaseModel):
    id: int
    vendor_name: str
    project_name: str
    on_time_delivery: str
    quality_rating: str
    issues_count: int
    status: str
    notes: str
    model_config = {"from_attributes": True}
