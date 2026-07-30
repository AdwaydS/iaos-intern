from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# --- InspectionRecord ---
class InspectionRecordCreate(BaseModel):
    lot_number: str
    inspector: str
    percentage_inspected: float = 100.0
    passed_qty: float = 0.0
    rejected_qty: float = 0.0
    stage: str  # incoming, in-process, final
    status: str = "Pending"  # Passed, Rejected, Pending


class InspectionRecordOut(BaseModel):
    id: int
    lot_number: str
    inspector: str
    percentage_inspected: float
    passed_qty: float
    rejected_qty: float
    stage: str
    status: str

    model_config = {"from_attributes": True}


# --- RejectionLog ---
class RejectionLogCreate(BaseModel):
    item_code: str
    vendor_name: str
    production_line: str
    defect_category: str
    quantity: float = 0.0
    cost: float = 0.0
    disposition: str  # rework, scrap


class RejectionLogOut(BaseModel):
    id: int
    item_code: str
    vendor_name: str
    production_line: str
    defect_category: str
    quantity: float
    cost: float
    disposition: str

    model_config = {"from_attributes": True}


# --- COARecord ---
class COARecordCreate(BaseModel):
    vendor: str
    raw_material: str
    coa_present: bool = True
    valid_until: Optional[date] = None
    matching_specs: bool = True


class COARecordOut(BaseModel):
    id: int
    vendor: str
    raw_material: str
    coa_present: bool
    valid_until: Optional[date]
    matching_specs: bool

    model_config = {"from_attributes": True}


# --- CustomerComplaintLink ---
class CustomerComplaintLinkCreate(BaseModel):
    complaint_id: str
    customer_name: str
    defect_description: str
    linked_qc_lot_id: Optional[int] = None


class CustomerComplaintLinkOut(BaseModel):
    id: int
    complaint_id: str
    customer_name: str
    defect_description: str
    linked_qc_lot_id: Optional[int]

    model_config = {"from_attributes": True}


# --- NonConformanceReport ---
class NonConformanceReportCreate(BaseModel):
    ncr_number: str
    description: str
    severity: str  # Minor, Major, Critical
    status: str = "Open"  # Open, Under Investigation, Closed
    corrective_action: str = ""
    closed_at: Optional[datetime] = None


class NonConformanceReportOut(BaseModel):
    id: int
    ncr_number: str
    description: str
    severity: str
    status: str
    corrective_action: str
    closed_at: Optional[datetime]

    model_config = {"from_attributes": True}
