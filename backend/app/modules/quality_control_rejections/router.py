from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    InspectionRecord,
    RejectionLog,
    COARecord,
    CustomerComplaintLink,
    NonConformanceReport,
)
from .schemas import (
    InspectionRecordCreate,
    InspectionRecordOut,
    RejectionLogCreate,
    RejectionLogOut,
    COARecordCreate,
    COARecordOut,
    CustomerComplaintLinkCreate,
    CustomerComplaintLinkOut,
    NonConformanceReportCreate,
    NonConformanceReportOut,
)

# MANIFEST powers the dashboard tile + navigation on the frontend.
MANIFEST = {
    "name": "quality_control_rejections",
    "title": "Quality Control & Rejections",
    "description": "Assurance over quality processes: inward/in-process/final inspection coverage, rejection trends, CoA compliance and customer-complaint linkage.",
    "icon": "truck",
    "group": "Supply Chain & Operations",
    "industry": "",
    "version": "1.0.0",
    "owner": "intern-47",
}

router = APIRouter()


# --- InspectionRecord Endpoints ---
@router.get("/inspections", response_model=list[InspectionRecordOut])
def list_inspections(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(InspectionRecord), current_user)
    return [InspectionRecordOut.model_validate(i) for i in q.order_by(InspectionRecord.id).all()]


@router.post("/inspections", response_model=InspectionRecordOut, status_code=201)
def create_inspection(body: InspectionRecordCreate, current_user: CurrentUser, db: DbSession):
    record = InspectionRecord(
        lot_number=body.lot_number,
        inspector=body.inspector,
        percentage_inspected=body.percentage_inspected,
        passed_qty=body.passed_qty,
        rejected_qty=body.rejected_qty,
        stage=body.stage,
        status=body.status,
        tenant_id=current_user.tenant_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return InspectionRecordOut.model_validate(record)


@router.delete("/inspections/{record_id}", status_code=204)
def delete_inspection(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(InspectionRecord).filter(InspectionRecord.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Inspection record not found")
    db.delete(record)
    db.commit()


# --- RejectionLog Endpoints ---
@router.get("/rejections", response_model=list[RejectionLogOut])
def list_rejections(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RejectionLog), current_user)
    return [RejectionLogOut.model_validate(r) for r in q.order_by(RejectionLog.id).all()]


@router.post("/rejections", response_model=RejectionLogOut, status_code=201)
def create_rejection(body: RejectionLogCreate, current_user: CurrentUser, db: DbSession):
    record = RejectionLog(
        item_code=body.item_code,
        vendor_name=body.vendor_name,
        production_line=body.production_line,
        defect_category=body.defect_category,
        quantity=body.quantity,
        cost=body.cost,
        disposition=body.disposition,
        tenant_id=current_user.tenant_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return RejectionLogOut.model_validate(record)


@router.delete("/rejections/{record_id}", status_code=204)
def delete_rejection(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(RejectionLog).filter(RejectionLog.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Rejection log not found")
    db.delete(record)
    db.commit()


# --- COARecord Endpoints ---
@router.get("/coa", response_model=list[COARecordOut])
def list_coa(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(COARecord), current_user)
    return [COARecordOut.model_validate(c) for c in q.order_by(COARecord.id).all()]


@router.post("/coa", response_model=COARecordOut, status_code=201)
def create_coa(body: COARecordCreate, current_user: CurrentUser, db: DbSession):
    record = COARecord(
        vendor=body.vendor,
        raw_material=body.raw_material,
        coa_present=body.coa_present,
        valid_until=body.valid_until,
        matching_specs=body.matching_specs,
        tenant_id=current_user.tenant_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return COARecordOut.model_validate(record)


@router.delete("/coa/{record_id}", status_code=204)
def delete_coa(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(COARecord).filter(COARecord.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "CoA record not found")
    db.delete(record)
    db.commit()


# --- CustomerComplaintLink Endpoints ---
@router.get("/complaints", response_model=list[CustomerComplaintLinkOut])
def list_complaints(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CustomerComplaintLink), current_user)
    return [CustomerComplaintLinkOut.model_validate(c) for c in q.order_by(CustomerComplaintLink.id).all()]


@router.post("/complaints", response_model=CustomerComplaintLinkOut, status_code=201)
def create_complaint(body: CustomerComplaintLinkCreate, current_user: CurrentUser, db: DbSession):
    record = CustomerComplaintLink(
        complaint_id=body.complaint_id,
        customer_name=body.customer_name,
        defect_description=body.defect_description,
        linked_qc_lot_id=body.linked_qc_lot_id,
        tenant_id=current_user.tenant_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return CustomerComplaintLinkOut.model_validate(record)


@router.delete("/complaints/{record_id}", status_code=204)
def delete_complaint(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(CustomerComplaintLink).filter(CustomerComplaintLink.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Customer complaint link not found")
    db.delete(record)
    db.commit()


# --- NonConformanceReport Endpoints ---
@router.get("/ncr", response_model=list[NonConformanceReportOut])
def list_ncr(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(NonConformanceReport), current_user)
    return [NonConformanceReportOut.model_validate(n) for n in q.order_by(NonConformanceReport.id).all()]


@router.post("/ncr", response_model=NonConformanceReportOut, status_code=201)
def create_ncr(body: NonConformanceReportCreate, current_user: CurrentUser, db: DbSession):
    record = NonConformanceReport(
        ncr_number=body.ncr_number,
        description=body.description,
        severity=body.severity,
        status=body.status,
        corrective_action=body.corrective_action,
        closed_at=body.closed_at,
        tenant_id=current_user.tenant_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return NonConformanceReportOut.model_validate(record)


@router.delete("/ncr/{record_id}", status_code=204)
def delete_ncr(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(NonConformanceReport).filter(NonConformanceReport.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "NCR record not found")
    db.delete(record)
    db.commit()
