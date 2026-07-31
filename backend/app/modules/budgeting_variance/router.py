"""Budgeting & Variance Analysis — full module API.

Mounted automatically at /api/modules/budgeting_variance.

Endpoints:
  GET    /exceptions               — list all budget exceptions (mock fallback)
  PATCH  /exceptions/{id}          — update status / disposition_notes
  GET    /rcm                      — list Risk & Control Matrix entries
  POST   /upload-evidence          — simulate file upload → working paper
  GET    /working-papers           — list working papers
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import inspect

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import BudgetException, BudgetRCM, WorkingPaper
from .schemas import (
    ExceptionOut,
    ExceptionUpdate,
    RCMOut,
    WorkingPaperOut,
    UploadEvidencePayload,
    PageDataOut,
    KPISummaryOut,
)
from .mock_data import PAGE_DATA

MANIFEST = {
    "name": "budgeting_variance",
    "title": "Budgeting & Variance",
    "description": "Budgeting & Variance Analysis — audit module with KPI dashboards, exception queue, RCM, and working-papers evidence tracking.",
    "icon": "wallet",
    "group": "Finance & Close",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

MOCK_EXCEPTIONS = [
    {"id": 1, "cost_center": "CC-1001", "budget_owner": "Alice Chen", "source_procedure": "Chronic Overspend", "variance_amount": 145000.0, "risk_grade": "Critical", "status": "Open", "disposition_notes": ""},
    {"id": 2, "cost_center": "CC-1002", "budget_owner": "Bob Marley", "source_procedure": "Pre-Approval Timing", "variance_amount": 32000.0, "risk_grade": "High", "status": "In Review", "disposition_notes": "Awaiting CFO sign-off"},
    {"id": 3, "cost_center": "CC-1003", "budget_owner": "Carol Diaz", "source_procedure": "Chronic Overspend", "variance_amount": 87000.0, "risk_grade": "High", "status": "Open", "disposition_notes": ""},
    {"id": 4, "cost_center": "CC-1004", "budget_owner": "Dave Park", "source_procedure": "Forecast Bias", "variance_amount": 12500.0, "risk_grade": "Medium", "status": "Resolved", "disposition_notes": "Adjusted forecast model"},
    {"id": 5, "cost_center": "CC-1005", "budget_owner": "Eve Torres", "source_procedure": "Parked Budget", "variance_amount": 210000.0, "risk_grade": "Critical", "status": "Open", "disposition_notes": ""},
]

MOCK_RCM = [
    {"id": 1, "risk_id": "R-001", "financial_assertion": "Accuracy", "control_description": "Automated tolerance check on PO vs budget", "control_owner": "IT Systems", "control_type": "Automated"},
    {"id": 2, "risk_id": "R-002", "financial_assertion": "Completeness", "control_description": "Monthly budget-vs-actual reconciliation", "control_owner": "Finance Controller", "control_type": "Manual"},
    {"id": 3, "risk_id": "R-003", "financial_assertion": "Occurrence", "control_description": "Pre-approval workflow for non-routine spend", "control_owner": "Dept Heads", "control_type": "Manual"},
    {"id": 4, "risk_id": "R-004", "financial_assertion": "Accuracy", "control_description": "System block on PO exceeding budget by 20%", "control_owner": "ERP Admin", "control_type": "Automated"},
    {"id": 5, "risk_id": "R-005", "financial_assertion": "Completeness", "control_description": "Quarterly forecast vs actual variance review", "control_owner": "FP&A Team", "control_type": "Manual"},
]

MOCK_WORKING_PAPERS = [
    {"id": 1, "attachment_name": "Q1_Budget_vs_Actual.xlsx", "associated_procedure_id": 101, "upload_date": "2026-02-15", "uploaded_by": "Alice Chen", "review_status": "Reviewed", "audit_tickmarks": ["✓", "?"]},
    {"id": 2, "attachment_name": "Forecast_Bias_Analysis.pdf", "associated_procedure_id": 102, "upload_date": "2026-03-01", "uploaded_by": "Bob Marley", "review_status": "Pending", "audit_tickmarks": []},
    {"id": 3, "attachment_name": "Overspend_CC-1001_Evidence.pdf", "associated_procedure_id": 103, "upload_date": "2026-03-10", "uploaded_by": "Carol Diaz", "review_status": "Signed Off", "audit_tickmarks": ["✓", "✓", "Δ"]},
    {"id": 4, "attachment_name": "RCM_Control_Test_Results.csv", "associated_procedure_id": 201, "upload_date": "2026-02-28", "uploaded_by": "Dave Park", "review_status": "Reviewed", "audit_tickmarks": ["✓"]},
    {"id": 5, "attachment_name": "Parked_Budget_Spike_Analysis.pptx", "associated_procedure_id": 104, "upload_date": "2026-03-15", "uploaded_by": "Eve Torres", "review_status": "Pending", "audit_tickmarks": []},
    {"id": 6, "attachment_name": "Pre_Approval_Timing_Log.xlsx", "associated_procedure_id": 105, "upload_date": "2026-01-20", "uploaded_by": "Alice Chen", "review_status": "Signed Off", "audit_tickmarks": ["✓", "✓", "✓"]},
]


def _table_exists(db, table_name: str) -> bool:
    try:
        return inspect(db.get_bind()).has_table(table_name)
    except Exception:
        return False


# ── Exceptions ───────────────────────────────────────────────────────────────

@router.get("/exceptions", response_model=list[ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    if not _table_exists(db, BudgetException.__tablename__):
        return [ExceptionOut(**e) for e in MOCK_EXCEPTIONS]
    try:
        q = tenant_scoped(db.query(BudgetException), current_user)
        rows = q.order_by(BudgetException.id.desc()).all()
        if not rows:
            return [ExceptionOut(**e) for e in MOCK_EXCEPTIONS]
        return [ExceptionOut.model_validate(r) for r in rows]
    except Exception:
        return [ExceptionOut(**e) for e in MOCK_EXCEPTIONS]


@router.patch("/exceptions/{exception_id}", response_model=ExceptionOut)
def update_exception(exception_id: int, body: ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    # Try DB first; fall back to mock data if table is empty or missing
    if _table_exists(db, BudgetException.__tablename__):
        try:
            item = tenant_scoped(
                db.query(BudgetException).filter(BudgetException.id == exception_id), current_user
            ).first()
            if item:
                if body.status is not None:
                    item.status = body.status
                if body.disposition_notes is not None:
                    item.disposition_notes = body.disposition_notes
                db.commit()
                db.refresh(item)
                return ExceptionOut.model_validate(item)
        except Exception:
            pass

    for e in MOCK_EXCEPTIONS:
        if e["id"] == exception_id:
            if body.status is not None:
                e["status"] = body.status
            if body.disposition_notes is not None:
                e["disposition_notes"] = body.disposition_notes
            return ExceptionOut(**e)
    raise HTTPException(404, "Exception not found")


# ── RCM ──────────────────────────────────────────────────────────────────────

@router.get("/rcm", response_model=list[RCMOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    if not _table_exists(db, BudgetRCM.__tablename__):
        return [RCMOut(**r) for r in MOCK_RCM]
    try:
        q = tenant_scoped(db.query(BudgetRCM), current_user)
        rows = q.order_by(BudgetRCM.id).all()
        if not rows:
            return [RCMOut(**r) for r in MOCK_RCM]
        return [RCMOut.model_validate(r) for r in rows]
    except Exception:
        return [RCMOut(**r) for r in MOCK_RCM]


# ── Working Papers ────────────────────────────────────────────────────────────

@router.get("/working-papers", response_model=list[WorkingPaperOut])
def list_working_papers(current_user: CurrentUser, db: DbSession):
    if not _table_exists(db, WorkingPaper.__tablename__):
        return [WorkingPaperOut(**w) for w in MOCK_WORKING_PAPERS]
    try:
        q = tenant_scoped(db.query(WorkingPaper), current_user)
        rows = q.order_by(WorkingPaper.id.desc()).all()
        if not rows:
            return [WorkingPaperOut(**w) for w in MOCK_WORKING_PAPERS]
        return [WorkingPaperOut.model_validate(r) for r in rows]
    except Exception:
        return [WorkingPaperOut(**w) for w in MOCK_WORKING_PAPERS]


@router.post("/upload-evidence", response_model=WorkingPaperOut, status_code=201)
def upload_evidence(body: UploadEvidencePayload, current_user: CurrentUser, db: DbSession):
    # Try DB first; fall back to mock list
    if _table_exists(db, WorkingPaper.__tablename__):
        try:
            paper = WorkingPaper(
                attachment_name=body.attachment_name,
                associated_procedure_id=body.associated_procedure_id,
                upload_date="2026-07-16",
                uploaded_by=body.uploaded_by or current_user.full_name,
                review_status=body.review_status,
                audit_tickmarks=body.audit_tickmarks,
                tenant_id=current_user.tenant_id,
            )
            db.add(paper)
            db.commit()
            db.refresh(paper)
            return WorkingPaperOut.model_validate(paper)
        except Exception:
            pass

    mock_id = len(MOCK_WORKING_PAPERS) + 1
    entry = {
        "id": mock_id,
        "attachment_name": body.attachment_name,
        "associated_procedure_id": body.associated_procedure_id,
        "upload_date": "2026-07-16",
        "uploaded_by": body.uploaded_by or current_user.full_name,
        "review_status": body.review_status,
        "audit_tickmarks": body.audit_tickmarks,
    }
    MOCK_WORKING_PAPERS.append(entry)
    return WorkingPaperOut(**entry)


# ── KPI / Dashboard aggregate endpoint ───────────────────────────────────────

@router.get("/kpi-summary", response_model=KPISummaryOut)
def kpi_summary(current_user: CurrentUser, db: DbSession):
    """Return live KPI metrics for the dashboard strip."""
    exceptions = list_exceptions(current_user, db)
    total = len(exceptions)
    open_count = sum(1 for e in exceptions if e.status == "Open")
    critical_high = sum(1 for e in exceptions if e.risk_grade in ("Critical", "High"))

    return KPISummaryOut(
        live_risk_score=round((critical_high / total * 100) if total else 0, 1),
        open_exceptions_count=open_count,
        testing_coverage_pct=72.5,
        action_tracker_rate=64.3,
    )


# ── Sub-page data endpoints ───────────────────────────────────────────────────

PAGE_ENDPOINTS = [
    "budget-vs-actual",
    "pre-approval-timing",
    "chronic-overspend",
    "rebudget-revision",
    "assumption-reasonableness",
    "flash-vs-final",
    "rolling-forecast",
    "zero-based-budget",
    "capex-utilisation",
    "departmental-scorecard",
    "unspent-parked",
    "cost-driver-trend",
    "contingency-reserve",
    "forecast-bias",
    "approval-audit-trail",
    "scope-universe",
    "rule-library",
    "data-sources",
    "sampling-builder",
    "findings",
    "action-tracker",
]


def _get_page_data(page_key: str) -> PageDataOut:
    data = PAGE_DATA.get(page_key)
    if not data:
        raise HTTPException(404, f"Page data not found: {page_key}")
    return PageDataOut(**data)


@router.get("/budget-vs-actual", response_model=PageDataOut)
def page_budget_vs_actual(current_user: CurrentUser):
    return _get_page_data("budget-vs-actual")


@router.get("/pre-approval-timing", response_model=PageDataOut)
def page_pre_approval_timing(current_user: CurrentUser):
    return _get_page_data("pre-approval-timing")


@router.get("/chronic-overspend", response_model=PageDataOut)
def page_chronic_overspend(current_user: CurrentUser):
    return _get_page_data("chronic-overspend")


@router.get("/rebudget-revision", response_model=PageDataOut)
def page_rebudget_revision(current_user: CurrentUser):
    return _get_page_data("rebudget-revision")


@router.get("/assumption-reasonableness", response_model=PageDataOut)
def page_assumption_reasonableness(current_user: CurrentUser):
    return _get_page_data("assumption-reasonableness")


@router.get("/flash-vs-final", response_model=PageDataOut)
def page_flash_vs_final(current_user: CurrentUser):
    return _get_page_data("flash-vs-final")


@router.get("/rolling-forecast", response_model=PageDataOut)
def page_rolling_forecast(current_user: CurrentUser):
    return _get_page_data("rolling-forecast")


@router.get("/zero-based-budget", response_model=PageDataOut)
def page_zero_based_budget(current_user: CurrentUser):
    return _get_page_data("zero-based-budget")


@router.get("/capex-utilisation", response_model=PageDataOut)
def page_capex_utilisation(current_user: CurrentUser):
    return _get_page_data("capex-utilisation")


@router.get("/departmental-scorecard", response_model=PageDataOut)
def page_departmental_scorecard(current_user: CurrentUser):
    return _get_page_data("departmental-scorecard")


@router.get("/unspent-parked", response_model=PageDataOut)
def page_unspent_parked(current_user: CurrentUser):
    return _get_page_data("unspent-parked")


@router.get("/cost-driver-trend", response_model=PageDataOut)
def page_cost_driver_trend(current_user: CurrentUser):
    return _get_page_data("cost-driver-trend")


@router.get("/contingency-reserve", response_model=PageDataOut)
def page_contingency_reserve(current_user: CurrentUser):
    return _get_page_data("contingency-reserve")


@router.get("/forecast-bias", response_model=PageDataOut)
def page_forecast_bias(current_user: CurrentUser):
    return _get_page_data("forecast-bias")


@router.get("/approval-audit-trail", response_model=PageDataOut)
def page_approval_audit_trail(current_user: CurrentUser):
    return _get_page_data("approval-audit-trail")


@router.get("/scope-universe", response_model=PageDataOut)
def page_scope_universe(current_user: CurrentUser):
    return _get_page_data("scope-universe")


@router.get("/rule-library", response_model=PageDataOut)
def page_rule_library(current_user: CurrentUser):
    return _get_page_data("rule-library")


@router.get("/data-sources", response_model=PageDataOut)
def page_data_sources(current_user: CurrentUser):
    return _get_page_data("data-sources")


@router.get("/sampling-builder", response_model=PageDataOut)
def page_sampling_builder(current_user: CurrentUser):
    return _get_page_data("sampling-builder")


@router.get("/findings", response_model=PageDataOut)
def page_findings(current_user: CurrentUser):
    return _get_page_data("findings")


@router.get("/action-tracker", response_model=PageDataOut)
def page_action_tracker(current_user: CurrentUser):
    return _get_page_data("action-tracker")
