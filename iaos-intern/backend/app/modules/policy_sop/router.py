"""Policy & SOP module — unified API router.

Merged from 25 standalone API routers into a single FastAPI router that
fits the iaos-intern module architecture.  Mounted at ``/api/modules/policy_sop``
by the module loader.
"""
from __future__ import annotations

import math
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from pydantic import BaseModel

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    Announcement,
    ApprovalWorkflow,
    Attestation,
    AuditLog,
    BreachReport,
    DataSource,
    Department,
    GapAnalysis,
    Notification,
    Observation,
    OwnershipDirectory,
    Policy,
    PolicyException,
    PolicyTemplate,
    PolicyVersion,
    Regulation,
    Remediation,
    RiskControl,
    Sampling,
    WorkingPaper,
)
from .schemas import (
    AnnouncementCreate,
    AnnouncementResponse,
    AnnouncementUpdate,
    ApprovalWorkflowCreate,
    ApprovalWorkflowResponse,
    AttestationCreate,
    AttestationResponse,
    AuditLogResponse,
    BreachReportCreate,
    BreachReportResponse,
    BreachReportUpdate,
    DataSourceCreate,
    DataSourceResponse,
    DataSourceUpdate,
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
    PolicyExceptionCreate,
    PolicyExceptionResponse,
    PolicyExceptionUpdate,
    GapAnalysisCreate,
    GapAnalysisResponse,
    GapAnalysisUpdate,
    NotificationResponse,
    ObservationCreate,
    ObservationResponse,
    ObservationUpdate,
    OwnershipDirectoryCreate,
    OwnershipDirectoryResponse,
    OwnershipDirectoryUpdate,
    PolicyCreate,
    PolicyResponse,
    PolicyUpdate,
    PolicyVersionCreate,
    PolicyVersionResponse,
    RegulationCreate,
    RegulationResponse,
    RegulationUpdate,
    RemediationCreate,
    RemediationResponse,
    RemediationUpdate,
    RiskControlCreate,
    RiskControlResponse,
    RiskControlUpdate,
    SamplingCreate,
    SamplingResponse,
    SamplingUpdate,
    PolicyTemplateCreate,
    PolicyTemplateResponse,
    PolicyTemplateUpdate,
    WorkingPaperCreate,
    WorkingPaperResponse,
    WorkingPaperUpdate,
)
from .services import (
    acknowledge_attestation,
    approve_exception,
    create_attestation,
    create_exception,
    create_gap_analysis,
    create_notification,
    create_policy,
    delete_policy,
    get_analysis_report,
    get_approval_history,
    get_attestation_stats,
    get_exceptions,
    get_gap_analyses,
    get_pending_approvals,
    get_pending_attestations,
    get_policy,
    get_policy_stats,
    get_policies,
    get_trend_data,
    get_unread_count,
    get_user_notifications,
    get_dashboard_stats,
    log_action,
    mark_all_read,
    mark_as_read,
    paginate_query,
    reject_exception,
    review_approval,
    submit_for_review,
    update_policy,
)

MANIFEST = {
    "name": "policy_sop",
    "title": "Policy & SOP",
    "description": "Enterprise Policy and Standard Operating Procedure Management System",
    "icon": "shield",
    "group": "Controls, Risk & Fraud",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()


# ──────────────────────────────────────────────
# Policies
# ──────────────────────────────────────────────


@router.get("/policies/stats")
def policy_stats(current_user: CurrentUser, db: DbSession):
    return get_policy_stats(db, current_user.tenant_id)


@router.get("/policies")
def list_policies(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    owner_id: Optional[int] = None,
    search: Optional[str] = None,
):
    items, total, pages = get_policies(
        db, current_user.tenant_id, page, per_page,
        category, department, status, owner_id, search,
    )
    return {
        "items": [PolicyResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/policies", response_model=PolicyResponse, status_code=201)
def create_new_policy(
    body: PolicyCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    data = body.model_dump()
    policy = create_policy(db, data, current_user.id, current_user.tenant_id)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/policies/{policy_id}", response_model=PolicyResponse)
def get_single_policy(
    policy_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    policy = get_policy(db, policy_id, current_user.tenant_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    return policy


@router.put("/policies/{policy_id}", response_model=PolicyResponse)
def update_existing_policy(
    policy_id: int,
    body: PolicyUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    update_data = body.model_dump(exclude_unset=True)
    policy = update_policy(db, policy_id, current_user.tenant_id, **update_data)
    if not policy:
        raise HTTPException(404, "Policy not found")
    db.commit()
    db.refresh(policy)
    return policy


@router.delete("/policies/{policy_id}")
def delete_existing_policy(
    policy_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    ok = delete_policy(db, policy_id, current_user.tenant_id)
    if not ok:
        raise HTTPException(404, "Policy not found")
    db.commit()
    return {"message": "Policy deleted"}


@router.get("/policies/{policy_id}/versions")
def list_policy_versions(
    policy_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    versions = tenant_scoped(
        db.query(PolicyVersion).filter(PolicyVersion.policy_id == policy_id),
        current_user,
    ).order_by(PolicyVersion.id.desc()).all()
    return [PolicyVersionResponse.model_validate(v) for v in versions]


@router.post("/policies/{policy_id}/versions", response_model=PolicyVersionResponse, status_code=201)
def create_new_policy_version(
    policy_id: int,
    body: PolicyVersionCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    policy = get_policy(db, policy_id, current_user.tenant_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    version = PolicyVersion(
        policy_id=policy_id,
        version_number=body.version_number,
        change_summary=body.change_summary,
        effective_date=body.effective_date,
        file_path=body.file_path,
        created_by=current_user.id,
        tenant_id=current_user.tenant_id,
        status="pending",
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version


# ──────────────────────────────────────────────
# Approvals
# ──────────────────────────────────────────────


@router.post("/approvals/submit/{policy_id}", response_model=ApprovalWorkflowResponse)
def submit_policy_for_review(
    policy_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    workflow = submit_for_review(db, policy_id, current_user.id, current_user.tenant_id)
    db.commit()
    db.refresh(workflow)
    return workflow


class ReviewRequest(BaseModel):
    status: str
    comments: Optional[str] = None


@router.put("/approvals/review/{workflow_id}", response_model=ApprovalWorkflowResponse)
def review_workflow(
    workflow_id: int,
    body: ReviewRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    workflow = review_approval(
        db, workflow_id, current_user.id, body.status, body.comments, current_user.tenant_id,
    )
    if not workflow:
        raise HTTPException(404, "Workflow not found")
    db.commit()
    db.refresh(workflow)
    return workflow


@router.get("/approvals/pending")
def list_pending_approvals(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    approvals = get_pending_approvals(db, current_user.tenant_id)
    total = len(approvals)
    start = (page - 1) * per_page
    items = approvals[start:start + per_page]
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    return {
        "items": [ApprovalWorkflowResponse.model_validate(a) for a in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.get("/approvals/history/{policy_id}")
def get_workflow_history(
    policy_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    history = get_approval_history(db, policy_id, current_user.tenant_id)
    return [ApprovalWorkflowResponse.model_validate(h) for h in history]


# ──────────────────────────────────────────────
# Attestations
# ──────────────────────────────────────────────


@router.post("/attestations", response_model=AttestationResponse)
def create_new_attestation(
    body: AttestationCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    attestation = create_attestation(
        db, body.policy_id, body.user_id, current_user.tenant_id,
        expires_at=body.expires_at,
    )
    db.commit()
    db.refresh(attestation)
    return attestation


@router.get("/attestations/pending")
def list_pending_attestations(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    attestations = get_pending_attestations(db, current_user.id, current_user.tenant_id)
    total = len(attestations)
    start = (page - 1) * per_page
    items = attestations[start:start + per_page]
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    return {
        "items": [AttestationResponse.model_validate(a) for a in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/attestations/{attestation_id}/acknowledge")
def acknowledge(
    attestation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    attestation = acknowledge_attestation(db, attestation_id, current_user.id, current_user.tenant_id)
    if not attestation:
        raise HTTPException(404, "Attestation not found")
    db.commit()
    return {"message": "Attestation acknowledged"}


@router.get("/attestations/stats")
def attestation_stats(
    current_user: CurrentUser,
    db: DbSession,
):
    return get_attestation_stats(db, current_user.tenant_id)


# ──────────────────────────────────────────────
# Exceptions
# ──────────────────────────────────────────────


@router.get("/exceptions")
def list_exceptions(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    policy_id: Optional[int] = None,
    status: Optional[str] = None,
):
    items, total, pages = get_exceptions(
        db, current_user.tenant_id, policy_id, status, page, per_page,
    )
    return {
        "items": [PolicyExceptionResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/exceptions", response_model=PolicyExceptionResponse, status_code=201)
def create_new_exception(
    body: PolicyExceptionCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    exc = create_exception(
        db, body.policy_id, body.title, body.description,
        current_user.id, current_user.tenant_id,
        risk_rating=body.risk_rating,
        justification=body.justification,
        expiry_date=body.expiry_date,
    )
    db.commit()
    db.refresh(exc)
    return exc


@router.get("/exceptions/{exception_id}", response_model=PolicyExceptionResponse)
def get_single_exception(
    exception_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    exc = db.query(PolicyException).filter(
        PolicyException.id == exception_id,
        PolicyException.tenant_id == current_user.tenant_id,
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")
    return exc


@router.put("/exceptions/{exception_id}", response_model=PolicyExceptionResponse)
def update_existing_exception(
    exception_id: int,
    body: PolicyExceptionUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    exc = db.query(PolicyException).filter(
        PolicyException.id == exception_id,
        PolicyException.tenant_id == current_user.tenant_id,
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(exc, key, value)
    db.commit()
    db.refresh(exc)
    return exc


@router.post("/exceptions/{exception_id}/approve")
def approve_exc(
    exception_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    exc = approve_exception(db, exception_id, current_user.id, current_user.tenant_id)
    if not exc:
        raise HTTPException(404, "Exception not found")
    db.commit()
    return {"message": "Exception approved"}


@router.post("/exceptions/{exception_id}/reject")
def reject_exc(
    exception_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    exc = reject_exception(db, exception_id, current_user.id, current_user.tenant_id)
    if not exc:
        raise HTTPException(404, "Exception not found")
    db.commit()
    return {"message": "Exception rejected"}


@router.delete("/exceptions/{exception_id}")
def delete_existing_exception(
    exception_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    exc = db.query(PolicyException).filter(
        PolicyException.id == exception_id,
        PolicyException.tenant_id == current_user.tenant_id,
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")
    db.delete(exc)
    db.commit()
    return {"message": "Exception deleted"}


# ──────────────────────────────────────────────
# Gap Analysis
# ──────────────────────────────────────────────


@router.get("/gap-analysis/report")
def analysis_report(
    current_user: CurrentUser,
    db: DbSession,
):
    return get_analysis_report(db, current_user.tenant_id)


@router.get("/gap-analysis")
def list_gap_analyses(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    gap_status: Optional[str] = None,
    risk_level: Optional[str] = None,
):
    items, total, pages = get_gap_analyses(
        db, current_user.tenant_id, gap_status, risk_level, page, per_page,
    )
    return {
        "items": [GapAnalysisResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/gap-analysis", response_model=GapAnalysisResponse, status_code=201)
def create_new_gap_analysis(
    body: GapAnalysisCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    gap = create_gap_analysis(
        db, body.regulation_name, body.requirement_description,
        current_user.id, current_user.tenant_id,
        regulation_section=body.regulation_section,
        mapped_policy_id=body.mapped_policy_id,
        gap_status=body.gap_status,
        risk_level=body.risk_level,
        recommendation=body.recommendation,
    )
    db.commit()
    db.refresh(gap)
    return gap


@router.get("/gap-analysis/{gap_id}", response_model=GapAnalysisResponse)
def get_single_gap_analysis(
    gap_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    gap = db.query(GapAnalysis).filter(
        GapAnalysis.id == gap_id,
        GapAnalysis.tenant_id == current_user.tenant_id,
    ).first()
    if not gap:
        raise HTTPException(404, "Gap analysis not found")
    return gap


@router.put("/gap-analysis/{gap_id}", response_model=GapAnalysisResponse)
def update_existing_gap_analysis(
    gap_id: int,
    body: GapAnalysisUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    gap = db.query(GapAnalysis).filter(
        GapAnalysis.id == gap_id,
        GapAnalysis.tenant_id == current_user.tenant_id,
    ).first()
    if not gap:
        raise HTTPException(404, "Gap analysis not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(gap, key, value)
    db.commit()
    db.refresh(gap)
    return gap


@router.delete("/gap-analysis/{gap_id}")
def delete_existing_gap_analysis(
    gap_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    gap = db.query(GapAnalysis).filter(
        GapAnalysis.id == gap_id,
        GapAnalysis.tenant_id == current_user.tenant_id,
    ).first()
    if not gap:
        raise HTTPException(404, "Gap analysis not found")
    db.delete(gap)
    db.commit()
    return {"message": "Gap analysis deleted"}


# ──────────────────────────────────────────────
# Breach Reports
# ──────────────────────────────────────────────


@router.get("/breach-reports")
def list_breach_reports(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    department: Optional[str] = None,
):
    query = tenant_scoped(db.query(BreachReport), current_user)
    if status:
        query = query.filter(BreachReport.status == status)
    if severity:
        query = query.filter(BreachReport.severity == severity)
    if department:
        query = query.filter(BreachReport.department == department)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(BreachReport.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [BreachReportResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/breach-reports", response_model=BreachReportResponse, status_code=201)
def create_breach_report(
    body: BreachReportCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    report = BreachReport(
        title=body.title,
        description=body.description,
        policy_id=body.policy_id,
        reported_by=current_user.id,
        department=body.department,
        severity=body.severity,
        evidence_notes=body.evidence_notes,
        status="open",
        tenant_id=current_user.tenant_id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/breach-reports/{report_id}", response_model=BreachReportResponse)
def get_breach_report(
    report_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    report = db.query(BreachReport).filter(
        BreachReport.id == report_id,
        BreachReport.tenant_id == current_user.tenant_id,
    ).first()
    if not report:
        raise HTTPException(404, "Breach report not found")
    return report


@router.put("/breach-reports/{report_id}", response_model=BreachReportResponse)
def update_breach_report(
    report_id: int,
    body: BreachReportUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    report = db.query(BreachReport).filter(
        BreachReport.id == report_id,
        BreachReport.tenant_id == current_user.tenant_id,
    ).first()
    if not report:
        raise HTTPException(404, "Breach report not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(report, key, value)
    if body.model_dump().get("status") in ("resolved", "closed"):
        report.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(report)
    return report


@router.delete("/breach-reports/{report_id}")
def delete_breach_report(
    report_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    report = db.query(BreachReport).filter(
        BreachReport.id == report_id,
        BreachReport.tenant_id == current_user.tenant_id,
    ).first()
    if not report:
        raise HTTPException(404, "Breach report not found")
    db.delete(report)
    db.commit()
    return {"message": "Breach report deleted"}


# ──────────────────────────────────────────────
# Notifications
# ──────────────────────────────────────────────


@router.get("/notifications")
def list_notifications(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
):
    items, total, pages = get_user_notifications(
        db, current_user.id, current_user.tenant_id, page, per_page, unread_only,
    )
    return {
        "items": [NotificationResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.get("/notifications/unread-count")
def unread_count(
    current_user: CurrentUser,
    db: DbSession,
):
    return {"count": get_unread_count(db, current_user.id, current_user.tenant_id)}


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    result = mark_as_read(db, notification_id, current_user.id, current_user.tenant_id)
    if not result:
        raise HTTPException(404, "Notification not found")
    db.commit()
    return {"message": "Marked as read"}


@router.put("/notifications/read-all")
def mark_all_notifications_read(
    current_user: CurrentUser,
    db: DbSession,
):
    count = mark_all_read(db, current_user.id, current_user.tenant_id)
    db.commit()
    return {"message": f"Marked {count} notifications as read"}


# ──────────────────────────────────────────────
# Dashboard
# ──────────────────────────────────────────────


@router.get("/dashboard/stats")
def dashboard_stats(
    current_user: CurrentUser,
    db: DbSession,
):
    return get_dashboard_stats(db, current_user.tenant_id)


@router.get("/dashboard/trends")
def dashboard_trends(
    current_user: CurrentUser,
    db: DbSession,
):
    return get_trend_data(db, current_user.tenant_id)


# ──────────────────────────────────────────────
# Audit Logs
# ──────────────────────────────────────────────


@router.get("/audit-logs")
def list_audit_logs(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
):
    query = tenant_scoped(db.query(AuditLog), current_user)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(AuditLog.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [AuditLogResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


# ──────────────────────────────────────────────
# Remediations
# ──────────────────────────────────────────────


@router.get("/remediations")
def list_remediations(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    action_type: Optional[str] = None,
):
    query = tenant_scoped(db.query(Remediation), current_user)
    if status:
        query = query.filter(Remediation.status == status)
    if action_type:
        query = query.filter(Remediation.action_type == action_type)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(Remediation.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [RemediationResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/remediations", response_model=RemediationResponse, status_code=201)
def create_remediation(
    body: RemediationCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    remediation = Remediation(
        title=body.title,
        description=body.description,
        action_type=body.action_type,
        due_date=body.due_date,
        finding_id=body.finding_id,
        assigned_to=body.assigned_to,
        status="open",
        tenant_id=current_user.tenant_id,
    )
    db.add(remediation)
    db.commit()
    db.refresh(remediation)
    return remediation


@router.get("/remediations/{remediation_id}", response_model=RemediationResponse)
def get_remediation(
    remediation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    remediation = db.query(Remediation).filter(
        Remediation.id == remediation_id,
        Remediation.tenant_id == current_user.tenant_id,
    ).first()
    if not remediation:
        raise HTTPException(404, "Remediation not found")
    return remediation


@router.put("/remediations/{remediation_id}", response_model=RemediationResponse)
def update_remediation(
    remediation_id: int,
    body: RemediationUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    remediation = db.query(Remediation).filter(
        Remediation.id == remediation_id,
        Remediation.tenant_id == current_user.tenant_id,
    ).first()
    if not remediation:
        raise HTTPException(404, "Remediation not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(remediation, key, value)
    if body.model_dump().get("status") == "completed":
        remediation.completion_date = datetime.utcnow()
    db.commit()
    db.refresh(remediation)
    return remediation


@router.delete("/remediations/{remediation_id}")
def delete_remediation(
    remediation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    remediation = db.query(Remediation).filter(
        Remediation.id == remediation_id,
        Remediation.tenant_id == current_user.tenant_id,
    ).first()
    if not remediation:
        raise HTTPException(404, "Remediation not found")
    db.delete(remediation)
    db.commit()
    return {"message": "Remediation deleted"}


# ──────────────────────────────────────────────
# Observations
# ──────────────────────────────────────────────


@router.get("/observations")
def list_observations(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    finding_type: Optional[str] = None,
):
    query = tenant_scoped(db.query(Observation), current_user)
    if status:
        query = query.filter(Observation.status == status)
    if severity:
        query = query.filter(Observation.severity == severity)
    if finding_type:
        query = query.filter(Observation.finding_type == finding_type)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(Observation.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [ObservationResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/observations", response_model=ObservationResponse, status_code=201)
def create_observation(
    body: ObservationCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    observation = Observation(
        title=body.title,
        description=body.description,
        finding_type=body.finding_type,
        severity=body.severity,
        recommendation=body.recommendation,
        evidence_path=body.evidence_path,
        assigned_to=body.assigned_to,
        status="open",
        tenant_id=current_user.tenant_id,
    )
    db.add(observation)
    db.commit()
    db.refresh(observation)
    return observation


@router.get("/observations/{observation_id}", response_model=ObservationResponse)
def get_observation(
    observation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    observation = db.query(Observation).filter(
        Observation.id == observation_id,
        Observation.tenant_id == current_user.tenant_id,
    ).first()
    if not observation:
        raise HTTPException(404, "Observation not found")
    return observation


@router.put("/observations/{observation_id}", response_model=ObservationResponse)
def update_observation(
    observation_id: int,
    body: ObservationUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    observation = db.query(Observation).filter(
        Observation.id == observation_id,
        Observation.tenant_id == current_user.tenant_id,
    ).first()
    if not observation:
        raise HTTPException(404, "Observation not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(observation, key, value)
    db.commit()
    db.refresh(observation)
    return observation


@router.delete("/observations/{observation_id}")
def delete_observation(
    observation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    observation = db.query(Observation).filter(
        Observation.id == observation_id,
        Observation.tenant_id == current_user.tenant_id,
    ).first()
    if not observation:
        raise HTTPException(404, "Observation not found")
    db.delete(observation)
    db.commit()
    return {"message": "Observation deleted"}


# ──────────────────────────────────────────────
# Regulations
# ──────────────────────────────────────────────


@router.get("/regulations")
def list_regulations(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    query = tenant_scoped(db.query(Regulation), current_user)
    if category:
        query = query.filter(Regulation.category == category)
    if search:
        term = f"%{search}%"
        from sqlalchemy import or_
        query = query.filter(or_(Regulation.name.ilike(term), Regulation.code.ilike(term)))
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(Regulation.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [RegulationResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/regulations", response_model=RegulationResponse, status_code=201)
def create_regulation(
    body: RegulationCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    existing = tenant_scoped(db.query(Regulation), current_user).filter(
        Regulation.code == body.code
    ).first()
    if existing:
        raise HTTPException(400, "Regulation code already exists")
    regulation = Regulation(
        name=body.name,
        code=body.code,
        description=body.description,
        version=body.version,
        source=body.source,
        category=body.category,
        effective_date=body.effective_date,
        expiry_date=body.expiry_date,
        tenant_id=current_user.tenant_id,
    )
    db.add(regulation)
    db.commit()
    db.refresh(regulation)
    return regulation


@router.get("/regulations/{regulation_id}", response_model=RegulationResponse)
def get_regulation(
    regulation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    regulation = db.query(Regulation).filter(
        Regulation.id == regulation_id,
        Regulation.tenant_id == current_user.tenant_id,
    ).first()
    if not regulation:
        raise HTTPException(404, "Regulation not found")
    return regulation


@router.put("/regulations/{regulation_id}", response_model=RegulationResponse)
def update_regulation(
    regulation_id: int,
    body: RegulationUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    regulation = db.query(Regulation).filter(
        Regulation.id == regulation_id,
        Regulation.tenant_id == current_user.tenant_id,
    ).first()
    if not regulation:
        raise HTTPException(404, "Regulation not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(regulation, key, value)
    db.commit()
    db.refresh(regulation)
    return regulation


@router.delete("/regulations/{regulation_id}")
def delete_regulation(
    regulation_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    regulation = db.query(Regulation).filter(
        Regulation.id == regulation_id,
        Regulation.tenant_id == current_user.tenant_id,
    ).first()
    if not regulation:
        raise HTTPException(404, "Regulation not found")
    db.delete(regulation)
    db.commit()
    return {"message": "Regulation deleted"}


# ──────────────────────────────────────────────
# Risk Controls
# ──────────────────────────────────────────────


@router.get("/risk-controls")
def list_risk_controls(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    risk_rating: Optional[str] = None,
    control_type: Optional[str] = None,
    department: Optional[str] = None,
):
    query = tenant_scoped(db.query(RiskControl), current_user)
    if risk_rating:
        query = query.filter(RiskControl.risk_rating == risk_rating)
    if control_type:
        query = query.filter(RiskControl.control_type == control_type)
    if department:
        query = query.filter(RiskControl.department == department)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(RiskControl.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [RiskControlResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/risk-controls", response_model=RiskControlResponse, status_code=201)
def create_risk_control(
    body: RiskControlCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    rc = RiskControl(
        risk_name=body.risk_name,
        risk_description=body.risk_description,
        control_name=body.control_name,
        control_description=body.control_description,
        risk_rating=body.risk_rating,
        control_type=body.control_type,
        department=body.department,
        control_owner=body.control_owner,
        linked_policy_id=body.linked_policy_id,
        assertions=body.assertions,
        tenant_id=current_user.tenant_id,
    )
    db.add(rc)
    db.commit()
    db.refresh(rc)
    return rc


@router.get("/risk-controls/{rc_id}", response_model=RiskControlResponse)
def get_risk_control(
    rc_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    rc = db.query(RiskControl).filter(
        RiskControl.id == rc_id,
        RiskControl.tenant_id == current_user.tenant_id,
    ).first()
    if not rc:
        raise HTTPException(404, "Risk control not found")
    return rc


@router.put("/risk-controls/{rc_id}", response_model=RiskControlResponse)
def update_risk_control(
    rc_id: int,
    body: RiskControlUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    rc = db.query(RiskControl).filter(
        RiskControl.id == rc_id,
        RiskControl.tenant_id == current_user.tenant_id,
    ).first()
    if not rc:
        raise HTTPException(404, "Risk control not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(rc, key, value)
    db.commit()
    db.refresh(rc)
    return rc


@router.delete("/risk-controls/{rc_id}")
def delete_risk_control(
    rc_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    rc = db.query(RiskControl).filter(
        RiskControl.id == rc_id,
        RiskControl.tenant_id == current_user.tenant_id,
    ).first()
    if not rc:
        raise HTTPException(404, "Risk control not found")
    db.delete(rc)
    db.commit()
    return {"message": "Risk control deleted"}


# ──────────────────────────────────────────────
# Templates
# ──────────────────────────────────────────────


@router.get("/templates")
def list_templates(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
):
    query = tenant_scoped(db.query(PolicyTemplate), current_user)
    if category:
        query = query.filter(PolicyTemplate.category == category)
    if is_active is not None:
        query = query.filter(PolicyTemplate.is_active == is_active)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(PolicyTemplate.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [PolicyTemplateResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/templates", response_model=PolicyTemplateResponse, status_code=201)
def create_template(
    body: PolicyTemplateCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    template = PolicyTemplate(
        name=body.name,
        description=body.description,
        category=body.category,
        content=body.content,
        sections=body.sections,
        created_by=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.get("/templates/{template_id}", response_model=PolicyTemplateResponse)
def get_template(
    template_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    template = db.query(PolicyTemplate).filter(
        PolicyTemplate.id == template_id,
        PolicyTemplate.tenant_id == current_user.tenant_id,
    ).first()
    if not template:
        raise HTTPException(404, "Template not found")
    return template


@router.put("/templates/{template_id}", response_model=PolicyTemplateResponse)
def update_template(
    template_id: int,
    body: PolicyTemplateUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    template = db.query(PolicyTemplate).filter(
        PolicyTemplate.id == template_id,
        PolicyTemplate.tenant_id == current_user.tenant_id,
    ).first()
    if not template:
        raise HTTPException(404, "Template not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(template, key, value)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    template = db.query(PolicyTemplate).filter(
        PolicyTemplate.id == template_id,
        PolicyTemplate.tenant_id == current_user.tenant_id,
    ).first()
    if not template:
        raise HTTPException(404, "Template not found")
    db.delete(template)
    db.commit()
    return {"message": "Template deleted"}


# ──────────────────────────────────────────────
# Working Papers
# ──────────────────────────────────────────────


@router.get("/working-papers")
def list_working_papers(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    review_status: Optional[str] = None,
    audit_id: Optional[int] = None,
):
    query = tenant_scoped(db.query(WorkingPaper), current_user)
    if review_status:
        query = query.filter(WorkingPaper.review_status == review_status)
    if audit_id:
        query = query.filter(WorkingPaper.audit_id == audit_id)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(WorkingPaper.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [WorkingPaperResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/working-papers", response_model=WorkingPaperResponse, status_code=201)
def create_working_paper(
    body: WorkingPaperCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    wp = WorkingPaper(
        title=body.title,
        description=body.description,
        evidence_notes=body.evidence_notes,
        audit_id=body.audit_id,
        file_path=body.file_path,
        file_type=body.file_type,
        created_by=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(wp)
    db.commit()
    db.refresh(wp)
    return wp


@router.get("/working-papers/{wp_id}", response_model=WorkingPaperResponse)
def get_working_paper(
    wp_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    wp = db.query(WorkingPaper).filter(
        WorkingPaper.id == wp_id,
        WorkingPaper.tenant_id == current_user.tenant_id,
    ).first()
    if not wp:
        raise HTTPException(404, "Working paper not found")
    return wp


@router.put("/working-papers/{wp_id}", response_model=WorkingPaperResponse)
def update_working_paper(
    wp_id: int,
    body: WorkingPaperUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    q = db.query(WorkingPaper).filter(WorkingPaper.id == wp_id)
    if current_user.tenant_id is None:
        q = q.filter(WorkingPaper.tenant_id.is_(None))
    else:
        q = q.filter(WorkingPaper.tenant_id == current_user.tenant_id)
    wp = q.first()
    if not wp:
        raise HTTPException(404, "Working paper not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(wp, key, value)
    db.commit()
    db.refresh(wp)
    return wp


@router.delete("/working-papers/{wp_id}")
def delete_working_paper(
    wp_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    wp = db.query(WorkingPaper).filter(
        WorkingPaper.id == wp_id,
        WorkingPaper.tenant_id == current_user.tenant_id,
    ).first()
    if not wp:
        raise HTTPException(404, "Working paper not found")
    db.delete(wp)
    db.commit()
    return {"message": "Working paper deleted"}


# ──────────────────────────────────────────────
# Data Sources
# ──────────────────────────────────────────────


@router.get("/data-sources")
def list_data_sources(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    source_type: Optional[str] = None,
    is_active: Optional[bool] = None,
):
    query = tenant_scoped(db.query(DataSource), current_user)
    if source_type:
        query = query.filter(DataSource.source_type == source_type)
    if is_active is not None:
        query = query.filter(DataSource.is_active == is_active)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(DataSource.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [DataSourceResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/data-sources", response_model=DataSourceResponse, status_code=201)
def create_data_source(
    body: DataSourceCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    ds = DataSource(
        name=body.name,
        source_type=body.source_type,
        description=body.description,
        connection_config=body.connection_config,
        created_by=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return ds


@router.get("/data-sources/{ds_id}", response_model=DataSourceResponse)
def get_data_source(
    ds_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    ds = db.query(DataSource).filter(
        DataSource.id == ds_id,
        DataSource.tenant_id == current_user.tenant_id,
    ).first()
    if not ds:
        raise HTTPException(404, "Data source not found")
    return ds


@router.put("/data-sources/{ds_id}", response_model=DataSourceResponse)
def update_data_source(
    ds_id: int,
    body: DataSourceUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    ds = db.query(DataSource).filter(
        DataSource.id == ds_id,
        DataSource.tenant_id == current_user.tenant_id,
    ).first()
    if not ds:
        raise HTTPException(404, "Data source not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(ds, key, value)
    db.commit()
    db.refresh(ds)
    return ds


@router.delete("/data-sources/{ds_id}")
def delete_data_source(
    ds_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    ds = db.query(DataSource).filter(
        DataSource.id == ds_id,
        DataSource.tenant_id == current_user.tenant_id,
    ).first()
    if not ds:
        raise HTTPException(404, "Data source not found")
    db.delete(ds)
    db.commit()
    return {"message": "Data source deleted"}


# ──────────────────────────────────────────────
# Sampling
# ──────────────────────────────────────────────


@router.get("/sampling")
def list_samplings(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sample_type: Optional[str] = None,
):
    query = tenant_scoped(db.query(Sampling), current_user)
    if sample_type:
        query = query.filter(Sampling.sample_type == sample_type)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(Sampling.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [SamplingResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/sampling", response_model=SamplingResponse, status_code=201)
def create_sampling(
    body: SamplingCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    sampling = Sampling(
        name=body.name,
        description=body.description,
        sample_type=body.sample_type,
        population_size=body.population_size,
        sample_size=body.sample_size,
        criteria=body.criteria,
        created_by=current_user.id,
        tenant_id=current_user.tenant_id,
    )
    db.add(sampling)
    db.commit()
    db.refresh(sampling)
    return sampling


@router.get("/sampling/{sampling_id}", response_model=SamplingResponse)
def get_sampling(
    sampling_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    sampling = db.query(Sampling).filter(
        Sampling.id == sampling_id,
        Sampling.tenant_id == current_user.tenant_id,
    ).first()
    if not sampling:
        raise HTTPException(404, "Sampling not found")
    return sampling


@router.put("/sampling/{sampling_id}", response_model=SamplingResponse)
def update_sampling(
    sampling_id: int,
    body: SamplingUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    sampling = db.query(Sampling).filter(
        Sampling.id == sampling_id,
        Sampling.tenant_id == current_user.tenant_id,
    ).first()
    if not sampling:
        raise HTTPException(404, "Sampling not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(sampling, key, value)
    db.commit()
    db.refresh(sampling)
    return sampling


@router.delete("/sampling/{sampling_id}")
def delete_sampling(
    sampling_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    sampling = db.query(Sampling).filter(
        Sampling.id == sampling_id,
        Sampling.tenant_id == current_user.tenant_id,
    ).first()
    if not sampling:
        raise HTTPException(404, "Sampling not found")
    db.delete(sampling)
    db.commit()
    return {"message": "Sampling deleted"}


# ──────────────────────────────────────────────
# Ownership
# ──────────────────────────────────────────────


@router.get("/ownership")
def list_ownership(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    query = tenant_scoped(db.query(OwnershipDirectory), current_user)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(OwnershipDirectory.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [OwnershipDirectoryResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/ownership", response_model=OwnershipDirectoryResponse, status_code=201)
def create_ownership(
    body: OwnershipDirectoryCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    ownership = OwnershipDirectory(
        user_id=body.user_id,
        role_type=body.role_type,
        department=body.department,
        responsibilities=body.responsibilities,
        tenant_id=current_user.tenant_id,
    )
    db.add(ownership)
    db.commit()
    db.refresh(ownership)
    return ownership


@router.get("/ownership/{ownership_id}", response_model=OwnershipDirectoryResponse)
def get_ownership(
    ownership_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    ownership = db.query(OwnershipDirectory).filter(
        OwnershipDirectory.id == ownership_id,
        OwnershipDirectory.tenant_id == current_user.tenant_id,
    ).first()
    if not ownership:
        raise HTTPException(404, "Ownership entry not found")
    return ownership


@router.put("/ownership/{ownership_id}", response_model=OwnershipDirectoryResponse)
def update_ownership(
    ownership_id: int,
    body: OwnershipDirectoryUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    ownership = db.query(OwnershipDirectory).filter(
        OwnershipDirectory.id == ownership_id,
        OwnershipDirectory.tenant_id == current_user.tenant_id,
    ).first()
    if not ownership:
        raise HTTPException(404, "Ownership entry not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(ownership, key, value)
    db.commit()
    db.refresh(ownership)
    return ownership


@router.delete("/ownership/{ownership_id}")
def delete_ownership(
    ownership_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    ownership = db.query(OwnershipDirectory).filter(
        OwnershipDirectory.id == ownership_id,
        OwnershipDirectory.tenant_id == current_user.tenant_id,
    ).first()
    if not ownership:
        raise HTTPException(404, "Ownership entry not found")
    db.delete(ownership)
    db.commit()
    return {"message": "Ownership entry deleted"}


# ──────────────────────────────────────────────
# Departments
# ──────────────────────────────────────────────


@router.get("/departments")
def list_departments(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    query = tenant_scoped(db.query(Department), current_user)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(Department.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [DepartmentResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/departments", response_model=DepartmentResponse, status_code=201)
def create_department(
    body: DepartmentCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    dept = Department(
        name=body.name,
        code=body.code,
        head_id=body.head_id,
        parent_id=body.parent_id,
        tenant_id=current_user.tenant_id,
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/departments/{dept_id}", response_model=DepartmentResponse)
def get_department(
    dept_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    dept = db.query(Department).filter(
        Department.id == dept_id,
        Department.tenant_id == current_user.tenant_id,
    ).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    return dept


@router.put("/departments/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: int,
    body: DepartmentUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    dept = db.query(Department).filter(
        Department.id == dept_id,
        Department.tenant_id == current_user.tenant_id,
    ).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(dept, key, value)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/departments/{dept_id}")
def delete_department(
    dept_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    dept = db.query(Department).filter(
        Department.id == dept_id,
        Department.tenant_id == current_user.tenant_id,
    ).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted"}


# ──────────────────────────────────────────────
# Announcements
# ──────────────────────────────────────────────


@router.get("/announcements")
def list_announcements(
    current_user: CurrentUser,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_published: Optional[bool] = None,
):
    query = tenant_scoped(db.query(Announcement), current_user)
    if is_published is not None:
        query = query.filter(Announcement.is_published == is_published)
    total = query.count()
    pages = math.ceil(total / per_page) if per_page > 0 else 0
    items = query.order_by(Announcement.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [AnnouncementResponse.model_validate(i) for i in items],
        "total": total,
        "page": page,
        "pages": pages,
    }


@router.post("/announcements", response_model=AnnouncementResponse, status_code=201)
def create_announcement(
    body: AnnouncementCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    announcement = Announcement(
        title=body.title,
        content=body.content,
        priority=body.priority,
        published_by=current_user.id,
        is_published=body.is_published or False,
        expires_at=body.expires_at,
        tenant_id=current_user.tenant_id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.get("/announcements/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(
    announcement_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id,
        Announcement.tenant_id == current_user.tenant_id,
    ).first()
    if not announcement:
        raise HTTPException(404, "Announcement not found")
    return announcement


@router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    body: AnnouncementUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id,
        Announcement.tenant_id == current_user.tenant_id,
    ).first()
    if not announcement:
        raise HTTPException(404, "Announcement not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(announcement, key, value)
    db.commit()
    db.refresh(announcement)
    return announcement


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    current_user: CurrentUser,
    db: DbSession,
):
    announcement = db.query(Announcement).filter(
        Announcement.id == announcement_id,
        Announcement.tenant_id == current_user.tenant_id,
    ).first()
    if not announcement:
        raise HTTPException(404, "Announcement not found")
    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted"}
