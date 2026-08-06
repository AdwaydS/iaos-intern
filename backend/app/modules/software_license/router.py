"""
Software License & SaaS Spend module — API router.
Mounted at /api/modules/software_license
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import models as m
from . import schemas as s

router = APIRouter()

MANIFEST = {
    "name": "software_license",
    "title": "Software License & SaaS Spend",
    "description": "License-vs-usage true-up, shadow IT, renewal governance and audit-exposure risk.",
    "icon": "server",
    "group": "Technology & Resilience",
    "industry": "IT / Services",
    "version": "1.0.0",
    "owner": "intern",
}

DEFAULT_PROCEDURES = [
    (1, "License Inventory & Entitlement", "What is owned vs deployed"),
    (2, "Usage vs License True-Up", "Over/under-licensing"),
    (3, "Shadow-IT / Unsanctioned SaaS", "Ungoverned subscriptions"),
    (4, "Renewal & Auto-Renew Governance", "Renewal-decision control"),
    (5, "Vendor-Audit Exposure", "Compliance-shortfall risk"),
    (6, "Idle / Unused Seats", "Dormant-license waste"),
    (7, "Duplicate / Overlapping Tools", "Redundant-software spend"),
    (8, "Cloud-Consumption (FinOps)", "Cloud-cost optimisation"),
    (9, "Subscription Approval Workflow", "Procurement governance"),
    (10, "Cost-Allocation to Units", "Chargeback accuracy"),
    (11, "Contract-Term Compliance", "Usage within license terms"),
    (12, "Price-Escalation Review", "Renewal-uplift reasonableness"),
    (13, "Open-Source Compliance", "OSS-license obligations"),
    (14, "Access-Deprovisioning Link", "Leaver-license reclaim"),
    (15, "SaaS-Spend Dashboard", "Portfolio-level software cost"),
]


def _ensure_seeded(db: DbSession, current_user: CurrentUser) -> None:
    existing = tenant_scoped(db.query(m.SoftwareLicenseProcedure), current_user).count()
    if existing:
        return
    for step_no, title, desc in DEFAULT_PROCEDURES:
        db.add(
            m.SoftwareLicenseProcedure(
                tenant_id=current_user.tenant_id,
                step_no=step_no,
                title=title,
                description=desc,
            )
        )
    db.commit()


def _get_or_404(db: DbSession, current_user: CurrentUser, model_cls, obj_id: int):
    obj = tenant_scoped(db.query(model_cls), current_user).filter(model_cls.id == obj_id).first()
    if not obj:
        raise HTTPException(404, f"{model_cls.__name__} {obj_id} not found")
    return obj


# ===========================================================================
# 1. Procedures (Signature steps)
# ===========================================================================
@router.get("/procedures", response_model=list[s.ProcedureOut])
def list_procedures(current_user: CurrentUser, db: DbSession):
    _ensure_seeded(db, current_user)
    q = tenant_scoped(db.query(m.SoftwareLicenseProcedure), current_user).order_by(m.SoftwareLicenseProcedure.step_no)
    return [s.ProcedureOut.model_validate(p) for p in q.all()]


@router.patch("/procedures/{proc_id}", response_model=s.ProcedureOut)
def update_procedure(proc_id: int, payload: s.ProcedureUpdate, current_user: CurrentUser, db: DbSession):
    proc = _get_or_404(db, current_user, m.SoftwareLicenseProcedure, proc_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proc, field, value)
    db.commit()
    db.refresh(proc)
    return s.ProcedureOut.model_validate(proc)


@router.post("/procedures/{proc_id}/sign", response_model=s.ProcedureOut)
def sign_procedure(proc_id: int, payload: s.ProcedureSign, current_user: CurrentUser, db: DbSession):
    proc = _get_or_404(db, current_user, m.SoftwareLicenseProcedure, proc_id)
    proc.signed_by = payload.signed_by
    proc.signed_at = datetime.utcnow()
    proc.status = "completed"
    db.commit()
    db.refresh(proc)
    return s.ProcedureOut.model_validate(proc)


# ===========================================================================
# 2. Scope & Audit Universe
# ===========================================================================
@router.get("/scope", response_model=list[s.ScopeOut])
def list_scope(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseScope), current_user)
    return [s.ScopeOut.model_validate(i) for i in q.all()]


@router.post("/scope", response_model=s.ScopeOut)
def create_scope(payload: s.ScopeIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseScope(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ScopeOut.model_validate(item)


@router.delete("/scope/{item_id}")
def delete_scope(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseScope, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 3. Risk & Control Matrix
# ===========================================================================
@router.get("/rcm", response_model=list[s.RiskControlOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseRCM), current_user)
    return [s.RiskControlOut.model_validate(i) for i in q.all()]


@router.post("/rcm", response_model=s.RiskControlOut)
def create_rcm(payload: s.RiskControlIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseRCM(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.RiskControlOut.model_validate(item)


@router.delete("/rcm/{item_id}")
def delete_rcm(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseRCM, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 4. Test & Analytics Rule Library
# ===========================================================================
@router.get("/rules", response_model=list[s.TestRuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseTestRule), current_user)
    return [s.TestRuleOut.model_validate(i) for i in q.all()]


@router.post("/rules", response_model=s.TestRuleOut)
def create_rule(payload: s.TestRuleIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseTestRule(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.TestRuleOut.model_validate(item)


@router.delete("/rules/{item_id}")
def delete_rule(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseTestRule, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 5. Data Source & Connector Setup
# ===========================================================================
@router.get("/datasources", response_model=list[s.DataSourceOut])
def list_datasources(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseDataSource), current_user)
    return [s.DataSourceOut.model_validate(i) for i in q.all()]


@router.post("/datasources", response_model=s.DataSourceOut)
def create_datasource(payload: s.DataSourceIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseDataSource(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.DataSourceOut.model_validate(item)


@router.delete("/datasources/{item_id}")
def delete_datasource(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseDataSource, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 6. Sampling & Population Builder
# ===========================================================================
@router.get("/samples", response_model=list[s.SampleOut])
def list_samples(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseSample), current_user)
    return [s.SampleOut.model_validate(i) for i in q.all()]


@router.post("/samples", response_model=s.SampleOut)
def create_sample(payload: s.SampleIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseSample(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.SampleOut.model_validate(item)


@router.delete("/samples/{item_id}")
def delete_sample(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseSample, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 7. Exception & Red-Flag Queue
# ===========================================================================
@router.get("/exceptions", response_model=list[s.ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseException), current_user).order_by(m.SoftwareLicenseException.created_at.desc())
    return [s.ExceptionOut.model_validate(i) for i in q.all()]


@router.post("/exceptions", response_model=s.ExceptionOut)
def create_exception(payload: s.ExceptionIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseException(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ExceptionOut.model_validate(item)


@router.patch("/exceptions/{item_id}", response_model=s.ExceptionOut)
def update_exception(item_id: int, payload: s.ExceptionIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseException, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.ExceptionOut.model_validate(item)


@router.delete("/exceptions/{item_id}")
def delete_exception(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseException, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 8. Working Papers & Evidence
# ===========================================================================
@router.get("/evidence", response_model=list[s.EvidenceOut])
def list_evidence(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseEvidence), current_user).order_by(m.SoftwareLicenseEvidence.created_at.desc())
    return [s.EvidenceOut.model_validate(i) for i in q.all()]


@router.post("/evidence", response_model=s.EvidenceOut)
def create_evidence(payload: s.EvidenceIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseEvidence(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.EvidenceOut.model_validate(item)


@router.delete("/evidence/{item_id}")
def delete_evidence(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseEvidence, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 9. Observation & Finding Log
# ===========================================================================
@router.get("/findings", response_model=list[s.FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseFinding), current_user).order_by(m.SoftwareLicenseFinding.created_at.desc())
    return [s.FindingOut.model_validate(i) for i in q.all()]


@router.post("/findings", response_model=s.FindingOut)
def create_finding(payload: s.FindingIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseFinding(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.FindingOut.model_validate(item)


@router.patch("/findings/{item_id}", response_model=s.FindingOut)
def update_finding(item_id: int, payload: s.FindingIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseFinding, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.FindingOut.model_validate(item)


@router.delete("/findings/{item_id}")
def delete_finding(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseFinding, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 10. Remediation / Action Tracker
# ===========================================================================
@router.get("/actions", response_model=list[s.ActionOut])
def list_actions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.SoftwareLicenseAction), current_user).order_by(m.SoftwareLicenseAction.created_at.desc())
    return [s.ActionOut.model_validate(i) for i in q.all()]


@router.post("/actions", response_model=s.ActionOut)
def create_action(payload: s.ActionIn, current_user: CurrentUser, db: DbSession):
    item = m.SoftwareLicenseAction(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ActionOut.model_validate(item)


@router.patch("/actions/{item_id}", response_model=s.ActionOut)
def update_action(item_id: int, payload: s.ActionIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseAction, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.ActionOut.model_validate(item)


@router.delete("/actions/{item_id}")
def delete_action(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.SoftwareLicenseAction, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# Dashboard & KPIs
# ===========================================================================
@router.get("/dashboard", response_model=s.DashboardOut)
def dashboard(current_user: CurrentUser, db: DbSession):
    _ensure_seeded(db, current_user)

    procedures = tenant_scoped(db.query(m.SoftwareLicenseProcedure), current_user).all()
    total = len(procedures)
    completed = sum(1 for p in procedures if p.status == "completed")
    coverage = round((completed / total) * 100, 1) if total else 0.0

    open_exceptions = tenant_scoped(db.query(m.SoftwareLicenseException), current_user).filter(
        m.SoftwareLicenseException.status != "closed"
    ).count()
    open_findings = tenant_scoped(db.query(m.SoftwareLicenseFinding), current_user).filter(
        m.SoftwareLicenseFinding.status != "closed"
    ).count()
    open_actions = tenant_scoped(db.query(m.SoftwareLicenseAction), current_user).filter(
        m.SoftwareLicenseAction.status != "done"
    ).count()

    high_findings = tenant_scoped(db.query(m.SoftwareLicenseFinding), current_user).filter(
        m.SoftwareLicenseFinding.status != "closed",
        m.SoftwareLicenseFinding.severity.in_(["high", "critical"]),
    ).count()
    if high_findings > 0 or open_exceptions > 5:
        risk_score = "high"
    elif open_exceptions > 0 or open_findings > 0:
        risk_score = "medium"
    else:
        risk_score = "low"

    return s.DashboardOut(
        total_procedures=total,
        completed_procedures=completed,
        coverage_pct=coverage,
        open_exceptions=open_exceptions,
        open_findings=open_findings,
        open_actions=open_actions,
        risk_score=risk_score,
    )
