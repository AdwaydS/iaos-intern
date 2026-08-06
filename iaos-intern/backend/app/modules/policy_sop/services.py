"""Policy & SOP module — service / business-logic layer.

All helper functions that drive CRUD, approval workflows, attestations,
gap analyses, notifications, dashboards, and audit logging live here.
Each function receives a SQLAlchemy ``Session`` (``db``) and a ``tenant_id``
so queries are always tenant-scoped.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func, extract, case, and_, or_
from sqlalchemy.orm import Session

from app.modules.policy_sop.models import (
    ApprovalWorkflow,
    Attestation,
    AuditLog,
    Department,
    GapAnalysis,
    Notification,
    Policy,
    PolicyException,
    PolicyVersion,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def paginate_query(query, page: int = 1, per_page: int = 20) -> tuple[list, int, int]:
    """Execute a paginated query and return ``(items, total, pages)``."""
    total = query.count()
    pages = (total + per_page - 1) // per_page if per_page else 0
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return items, total, pages


# ---------------------------------------------------------------------------
# Policy services
# ---------------------------------------------------------------------------

def generate_policy_number(db: Session, tenant_id: int) -> str:
    """Return the next available policy number for *tenant_id*.

    Format: ``POL-YYYY-NNNN`` where *YYYY* is the current year and *NNNN*
    is a zero-padded sequential counter. The counter is global because the
    unique index on ``policy_number`` is not scoped to a tenant.
    """
    year = datetime.now(timezone.utc).year
    prefix = f"POL-{year}-"
    last = (
        db.query(Policy)
        .filter(Policy.policy_number.like(f"{prefix}%"))
        .order_by(Policy.id.desc())
        .first()
    )
    if last:
        seq = int(last.policy_number.split("-")[-1]) + 1
    else:
        seq = 1
    return f"{prefix}{seq:04d}"


def create_policy(db: Session, policy_data: dict, user_id: int, tenant_id: int) -> Policy:
    """Create and persist a new policy."""
    if "policy_number" not in policy_data or not policy_data["policy_number"]:
        policy_data["policy_number"] = generate_policy_number(db, tenant_id)

    policy_data.setdefault("created_by", user_id)
    policy_data.setdefault("owner_id", user_id)

    policy = Policy(**policy_data, tenant_id=tenant_id)
    db.add(policy)
    db.flush()
    log_action(db, user_id, "create", "policy", tenant_id, entity_id=policy.id,
               details={"title": policy.title, "policy_number": policy.policy_number})
    return policy


def get_policies(
    db: Session,
    tenant_id: int,
    page: int = 1,
    per_page: int = 20,
    category: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    owner_id: Optional[int] = None,
    search: Optional[str] = None,
) -> tuple[list, int, int]:
    """Return a paginated, filtered list of policies."""
    query = db.query(Policy).filter(Policy.tenant_id == tenant_id)

    if category:
        query = query.filter(Policy.category == category)
    if department:
        query = query.filter(Policy.department == department)
    if status:
        query = query.filter(Policy.status == status)
    if owner_id:
        query = query.filter(Policy.owner_id == owner_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Policy.title.ilike(term),
                Policy.description.ilike(term),
                Policy.policy_number.ilike(term),
            )
        )

    query = query.order_by(Policy.id.desc())
    return paginate_query(query, page, per_page)


def get_policy(db: Session, policy_id: int, tenant_id: int) -> Optional[Policy]:
    """Return a single policy by id or ``None``."""
    return (
        db.query(Policy)
        .filter(Policy.id == policy_id, Policy.tenant_id == tenant_id)
        .first()
    )


def update_policy(db: Session, policy_id: int, tenant_id: int, **kwargs) -> Optional[Policy]:
    """Update an existing policy with the supplied keyword arguments."""
    policy = get_policy(db, policy_id, tenant_id)
    if policy is None:
        return None

    for key, value in kwargs.items():
        if hasattr(policy, key):
            setattr(policy, key, value)

    db.flush()
    log_action(db, kwargs.get("updated_by"), "update", "policy", tenant_id,
               entity_id=policy_id, details={"updated_fields": list(kwargs.keys())})
    return policy


def delete_policy(db: Session, policy_id: int, tenant_id: int) -> bool:
    """Delete a policy. Returns ``True`` on success."""
    policy = get_policy(db, policy_id, tenant_id)
    if policy is None:
        return False
    db.delete(policy)
    db.flush()
    return True


def get_policy_stats(db: Session, tenant_id: int) -> dict:
    """Return aggregate statistics for the tenant's policies."""
    base = db.query(Policy).filter(Policy.tenant_id == tenant_id)

    total = base.count()
    by_status = {}
    for status, count in (
        base.with_entities(Policy.status, func.count(Policy.id))
        .group_by(Policy.status)
        .all()
    ):
        by_status[status] = count

    by_category = {}
    for cat, count in (
        base.with_entities(Policy.category, func.count(Policy.id))
        .group_by(Policy.category)
        .all()
    ):
        by_category[cat or "Uncategorized"] = count

    today = date.today()
    expiring_soon = (
        base.filter(
            Policy.expiry_date.isnot(None),
            Policy.expiry_date <= today + timedelta(days=30),
            Policy.expiry_date >= today,
            Policy.status == "approved",
        ).count()
    )

    overdue = (
        base.filter(
            Policy.next_review_date.isnot(None),
            Policy.next_review_date < today,
        ).count()
    )

    mandatory_count = base.filter(Policy.is_mandatory == True).count()  # noqa: E712

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "expiring_soon": expiring_soon,
        "overdue_review": overdue,
        "mandatory_count": mandatory_count,
    }


# ---------------------------------------------------------------------------
# Approval services
# ---------------------------------------------------------------------------

def submit_for_review(db: Session, policy_id: int, user_id: int, tenant_id: int) -> ApprovalWorkflow:
    """Submit a policy for review and create an approval workflow entry."""
    policy = get_policy(db, policy_id, tenant_id)
    if policy is None:
        raise ValueError("Policy not found")

    now = datetime.now(timezone.utc)
    workflow = ApprovalWorkflow(
        policy_id=policy_id,
        submitted_by=user_id,
        status="submitted",
        submitted_at=now,
        tenant_id=tenant_id,
    )
    db.add(workflow)

    policy.status = "submitted"
    db.flush()
    log_action(db, user_id, "submit_for_review", "policy", tenant_id, entity_id=policy_id)
    return workflow


def review_approval(
    db: Session,
    workflow_id: int,
    reviewer_id: int,
    status: str,
    comments: Optional[str],
    tenant_id: int,
) -> Optional[ApprovalWorkflow]:
    """Approve or reject an approval workflow entry."""
    workflow = (
        db.query(ApprovalWorkflow)
        .filter(
            ApprovalWorkflow.id == workflow_id,
            ApprovalWorkflow.tenant_id == tenant_id,
        )
        .first()
    )
    if workflow is None:
        return None

    now = datetime.now(timezone.utc)
    workflow.reviewer_id = reviewer_id
    workflow.status = status
    workflow.comments = comments
    workflow.reviewed_at = now

    policy = get_policy(db, workflow.policy_id, tenant_id)
    if policy:
        policy.status = status if status in ("approved", "rejected") else policy.status

    db.flush()
    log_action(db, reviewer_id, "review_approval", "approval_workflow", tenant_id,
               entity_id=workflow_id, details={"status": status})
    return workflow


def get_pending_approvals(db: Session, tenant_id: int) -> list[ApprovalWorkflow]:
    """Return all approval workflows with status *submitted*."""
    return (
        db.query(ApprovalWorkflow)
        .filter(
            ApprovalWorkflow.tenant_id == tenant_id,
            ApprovalWorkflow.status == "submitted",
        )
        .order_by(ApprovalWorkflow.submitted_at.desc())
        .all()
    )


def get_approval_history(db: Session, policy_id: int, tenant_id: int) -> list[ApprovalWorkflow]:
    """Return the approval history for a specific policy."""
    return (
        db.query(ApprovalWorkflow)
        .filter(
            ApprovalWorkflow.policy_id == policy_id,
            ApprovalWorkflow.tenant_id == tenant_id,
        )
        .order_by(ApprovalWorkflow.submitted_at.desc())
        .all()
    )


# ---------------------------------------------------------------------------
# Attestation services
# ---------------------------------------------------------------------------

def create_attestation(
    db: Session,
    policy_id: int,
    user_id: int,
    tenant_id: int,
    expires_at: Optional[datetime] = None,
) -> Attestation:
    """Create a new pending attestation for a user on a given policy."""
    attestation = Attestation(
        policy_id=policy_id,
        user_id=user_id,
        status="pending",
        tenant_id=tenant_id,
        expires_at=expires_at,
    )
    db.add(attestation)
    db.flush()
    log_action(db, user_id, "create_attestation", "attestation", tenant_id,
               entity_id=attestation.id)
    return attestation


def acknowledge_attestation(
    db: Session,
    attestation_id: int,
    user_id: int,
    tenant_id: Optional[int],
) -> Optional[Attestation]:
    """Mark an attestation as acknowledged."""
    from sqlalchemy import or_ as _or
    q = db.query(Attestation).filter(
        Attestation.id == attestation_id,
        Attestation.user_id == user_id,
    )
    if tenant_id is None:
        q = q.filter(Attestation.tenant_id.is_(None))
    else:
        q = q.filter(Attestation.tenant_id == tenant_id)
    attestation = q.first()
    if attestation is None:
        return None

    attestation.status = "acknowledged"
    attestation.acknowledged_at = datetime.now(timezone.utc)
    db.flush()
    log_action(db, user_id, "acknowledge_attestation", "attestation", tenant_id,
               entity_id=attestation_id)
    return attestation


def get_pending_attestations(db: Session, user_id: int, tenant_id: Optional[int]) -> list[Attestation]:
    """Return all pending attestations for a specific user."""
    q = db.query(Attestation).filter(
        Attestation.user_id == user_id,
        Attestation.status == "pending",
    )
    if tenant_id is None:
        q = q.filter(Attestation.tenant_id.is_(None))
    else:
        q = q.filter(Attestation.tenant_id == tenant_id)
    return q.order_by(Attestation.id.desc()).all()


def get_attestation_stats(db: Session, tenant_id: int) -> dict:
    """Return aggregate attestation statistics for the tenant."""
    base = db.query(Attestation).filter(Attestation.tenant_id == tenant_id)
    total = base.count()
    pending = base.filter(Attestation.status == "pending").count()
    acknowledged = base.filter(Attestation.status == "acknowledged").count()

    today = datetime.now(timezone.utc)
    expired = (
        base.filter(
            Attestation.expires_at.isnot(None),
            Attestation.expires_at < today,
            Attestation.status == "pending",
        ).count()
    )

    return {
        "total": total,
        "pending": pending,
        "acknowledged": acknowledged,
        "expired": expired,
    }


# ---------------------------------------------------------------------------
# Exception services
# ---------------------------------------------------------------------------

def create_exception(
    db: Session,
    policy_id: int,
    title: str,
    description: Optional[str],
    requested_by: int,
    tenant_id: int,
    risk_rating: str = "medium",
    justification: Optional[str] = None,
    expiry_date: Optional[date] = None,
) -> PolicyException:
    """Create a new policy exception request."""
    exc = PolicyException(
        policy_id=policy_id,
        title=title,
        description=description,
        requested_by=requested_by,
        risk_rating=risk_rating,
        justification=justification,
        expiry_date=expiry_date,
        tenant_id=tenant_id,
    )
    db.add(exc)
    db.flush()
    log_action(db, requested_by, "create_exception", "policy_exception", tenant_id,
               entity_id=exc.id, details={"title": title})
    return exc


def get_exceptions(
    db: Session,
    tenant_id: int,
    policy_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list, int, int]:
    """Return a paginated, filtered list of policy exceptions."""
    query = db.query(PolicyException).filter(PolicyException.tenant_id == tenant_id)

    if policy_id:
        query = query.filter(PolicyException.policy_id == policy_id)
    if status:
        query = query.filter(PolicyException.status == status)

    query = query.order_by(PolicyException.id.desc())
    return paginate_query(query, page, per_page)


def approve_exception(
    db: Session, exception_id: int, approved_by: int, tenant_id: int
) -> Optional[PolicyException]:
    """Approve a pending policy exception."""
    exc = (
        db.query(PolicyException)
        .filter(
            PolicyException.id == exception_id,
            PolicyException.tenant_id == tenant_id,
        )
        .first()
    )
    if exc is None or exc.status != "pending":
        return None

    exc.status = "approved"
    exc.approved_by = approved_by
    db.flush()
    log_action(db, approved_by, "approve_exception", "policy_exception", tenant_id,
               entity_id=exception_id)
    return exc


def reject_exception(
    db: Session, exception_id: int, approved_by: int, tenant_id: int
) -> Optional[PolicyException]:
    """Reject a pending policy exception."""
    exc = (
        db.query(PolicyException)
        .filter(
            PolicyException.id == exception_id,
            PolicyException.tenant_id == tenant_id,
        )
        .first()
    )
    if exc is None or exc.status != "pending":
        return None

    exc.status = "rejected"
    exc.approved_by = approved_by
    db.flush()
    log_action(db, approved_by, "reject_exception", "policy_exception", tenant_id,
               entity_id=exception_id)
    return exc


# ---------------------------------------------------------------------------
# Gap Analysis services
# ---------------------------------------------------------------------------

def create_gap_analysis(
    db: Session,
    regulation_name: str,
    requirement_description: Optional[str],
    assessed_by: int,
    tenant_id: int,
    regulation_section: Optional[str] = None,
    mapped_policy_id: Optional[int] = None,
    gap_status: str = "non_compliant",
    risk_level: str = "medium",
    recommendation: Optional[str] = None,
) -> GapAnalysis:
    """Create a new gap analysis entry."""
    gap = GapAnalysis(
        regulation_name=regulation_name,
        regulation_section=regulation_section,
        requirement_description=requirement_description,
        mapped_policy_id=mapped_policy_id,
        gap_status=gap_status,
        risk_level=risk_level,
        recommendation=recommendation,
        assessed_by=assessed_by,
        assessed_at=datetime.now(timezone.utc),
        tenant_id=tenant_id,
    )
    db.add(gap)
    db.flush()
    log_action(db, assessed_by, "create_gap_analysis", "gap_analysis", tenant_id,
               entity_id=gap.id, details={"regulation_name": regulation_name})
    return gap


def get_gap_analyses(
    db: Session,
    tenant_id: int,
    gap_status: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list, int, int]:
    """Return a paginated, filtered list of gap analyses."""
    query = db.query(GapAnalysis).filter(GapAnalysis.tenant_id == tenant_id)

    if gap_status:
        query = query.filter(GapAnalysis.gap_status == gap_status)
    if risk_level:
        query = query.filter(GapAnalysis.risk_level == risk_level)

    query = query.order_by(GapAnalysis.id.desc())
    return paginate_query(query, page, per_page)


def get_analysis_report(db: Session, tenant_id: int) -> dict:
    """Generate a summary report across all gap analyses for the tenant."""
    base = db.query(GapAnalysis).filter(GapAnalysis.tenant_id == tenant_id)
    total = base.count()

    by_status = {}
    for status, count in (
        base.with_entities(GapAnalysis.gap_status, func.count(GapAnalysis.id))
        .group_by(GapAnalysis.gap_status)
        .all()
    ):
        by_status[status] = count

    by_risk = {}
    for risk, count in (
        base.with_entities(GapAnalysis.risk_level, func.count(GapAnalysis.id))
        .group_by(GapAnalysis.risk_level)
        .all()
    ):
        by_risk[risk] = count

    mapped = base.filter(GapAnalysis.mapped_policy_id.isnot(None)).count()
    unmapped = total - mapped

    return {
        "total": total,
        "by_status": by_status,
        "by_risk_level": by_risk,
        "mapped_to_policy": mapped,
        "unmapped": unmapped,
    }


# ---------------------------------------------------------------------------
# Notification services
# ---------------------------------------------------------------------------

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: Optional[str],
    tenant_id: int,
    type: Optional[str] = None,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
) -> Notification:
    """Create an in-app notification for a user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        reference_type=reference_type,
        reference_id=reference_id,
        tenant_id=tenant_id,
    )
    db.add(notif)
    db.flush()
    return notif


def get_user_notifications(
    db: Session,
    user_id: int,
    tenant_id: int,
    unread_only: bool = False,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list, int, int]:
    """Return paginated notifications for a user."""
    query = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.tenant_id == tenant_id)
    )
    if unread_only:
        query = query.filter(Notification.is_read == False)  # noqa: E712

    query = query.order_by(Notification.id.desc())
    return paginate_query(query, page, per_page)


def mark_as_read(
    db: Session, notification_id: int, user_id: int, tenant_id: int
) -> Optional[Notification]:
    """Mark a single notification as read."""
    notif = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
            Notification.tenant_id == tenant_id,
        )
        .first()
    )
    if notif is None:
        return None

    notif.is_read = True
    db.flush()
    return notif


def mark_all_read(db: Session, user_id: int, tenant_id: int) -> int:
    """Mark all unread notifications for a user as read. Returns the count updated."""
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.is_read == False,  # noqa: E712
        )
        .update({Notification.is_read: True})
    )
    db.flush()
    return count


def get_unread_count(db: Session, user_id: int, tenant_id: int) -> int:
    """Return the number of unread notifications for a user."""
    return (
        db.query(func.count(Notification.id))
        .filter(
            Notification.user_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.is_read == False,  # noqa: E712
        )
        .scalar()
        or 0
    )


# ---------------------------------------------------------------------------
# Dashboard services
# ---------------------------------------------------------------------------

def get_dashboard_stats(db: Session, tenant_id: int) -> dict:
    """Return a high-level dashboard summary for the Policy & SOP module."""
    total_policies = (
        db.query(func.count(Policy.id))
        .filter(Policy.tenant_id == tenant_id)
        .scalar()
        or 0
    )
    active_policies = (
        db.query(func.count(Policy.id))
        .filter(Policy.tenant_id == tenant_id, Policy.status == "approved")
        .scalar()
        or 0
    )
    pending_approvals = (
        db.query(func.count(ApprovalWorkflow.id))
        .filter(
            ApprovalWorkflow.tenant_id == tenant_id,
            ApprovalWorkflow.status == "submitted",
        )
        .scalar()
        or 0
    )
    pending_attestations = (
        db.query(func.count(Attestation.id))
        .filter(
            Attestation.tenant_id == tenant_id,
            Attestation.status == "pending",
        )
        .scalar()
        or 0
    )
    open_exceptions = (
        db.query(func.count(PolicyException.id))
        .filter(
            PolicyException.tenant_id == tenant_id,
            PolicyException.status == "pending",
        )
        .scalar()
        or 0
    )
    compliance_gaps = (
        db.query(func.count(GapAnalysis.id))
        .filter(
            GapAnalysis.tenant_id == tenant_id,
            GapAnalysis.gap_status == "non_compliant",
        )
        .scalar()
        or 0
    )

    today = date.today()
    expiring_soon = (
        db.query(func.count(Policy.id))
        .filter(
            Policy.tenant_id == tenant_id,
            Policy.expiry_date.isnot(None),
            Policy.expiry_date <= today + timedelta(days=30),
            Policy.expiry_date >= today,
        )
        .scalar()
        or 0
    )

    return {
        "total_policies": total_policies,
        "active_policies": active_policies,
        "pending_approvals": pending_approvals,
        "pending_attestations": pending_attestations,
        "open_exceptions": open_exceptions,
        "compliance_gaps": compliance_gaps,
        "expiring_soon": expiring_soon,
    }


def get_trend_data(db: Session, tenant_id: int) -> dict:
    """Return monthly policy creation and approval counts for the last 12 months."""
    now = datetime.now(timezone.utc)
    twelve_months_ago = now - timedelta(days=365)

    created_rows = (
        db.query(
            extract("year", Policy.created_at).label("year"),
            extract("month", Policy.created_at).label("month"),
            func.count(Policy.id).label("count"),
        )
        .filter(Policy.tenant_id == tenant_id, Policy.created_at >= twelve_months_ago)
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    approved_rows = (
        db.query(
            extract("year", Policy.updated_at).label("year"),
            extract("month", Policy.updated_at).label("month"),
            func.count(Policy.id).label("count"),
        )
        .filter(
            Policy.tenant_id == tenant_id,
            Policy.status == "approved",
            Policy.updated_at >= twelve_months_ago,
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )

    created_trend = [
        {"year": int(r.year), "month": int(r.month), "count": r.count}
        for r in created_rows
    ]
    approved_trend = [
        {"year": int(r.year), "month": int(r.month), "count": r.count}
        for r in approved_rows
    ]

    return {
        "created": created_trend,
        "approved": approved_trend,
    }


# ---------------------------------------------------------------------------
# Audit log service
# ---------------------------------------------------------------------------

def log_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    entity_type: str,
    tenant_id: int,
    entity_id: Optional[int] = None,
    details: Optional[dict] = None,
) -> AuditLog:
    """Record an audit log entry."""
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        tenant_id=tenant_id,
    )
    db.add(entry)
    db.flush()
    return entry
