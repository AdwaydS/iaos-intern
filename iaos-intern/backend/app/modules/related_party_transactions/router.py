"""
Related-Party Transactions module — API router.
Mounted at /api/modules/related_party_transactions
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import models as m
from . import schemas as s

router = APIRouter()

# The 15 "Signature" audit steps, seeded once per tenant on first access.
DEFAULT_PROCEDURES = [
    (1, "RPT Mapping & Register", "Identify and log all related parties"),
    (2, "Board / ACM Approval", "Confirm required approvals obtained"),
    (3, "Arm's-Length Pricing", "Compare to market/comparable rates"),
    (4, "Disclosure & AOC-2 Check", "Financial statement disclosure"),
    (5, "Inter-Corporate Loan Tracing", "Loans/guarantees to related parties"),
    (6, "Common Director/Relative Scan", "Hidden links across vendors"),
    (7, "Ordinary-Course Assessment", "Test the 'ordinary course' claim"),
    (8, "Threshold & Materiality", "Sec 188 threshold compliance"),
    (9, "Transfer-Pricing Alignment", "Consistency with TP documentation"),
    (10, "Round-Tripping via RPTs", "Circular transactions detection"),
    (11, "Rent / Royalty / Fee Review", "Related-party service charges"),
    (12, "Guarantee & Security to RP", "Unsecured support to related parties"),
    (13, "RP Master Governance", "Maintain the related-party master"),
    (14, "Omnibus Approval Tracking", "Monitor omnibus approval usage"),
    (15, "Undisclosed-RPT Detection", "Analytics to surface hidden RPTs"),
]


def _ensure_seeded(db: DbSession, current_user: CurrentUser) -> None:
    existing = tenant_scoped(db.query(m.RPTProcedure), current_user).count()
    if existing:
        return
    for step_no, title, desc in DEFAULT_PROCEDURES:
        db.add(
            m.RPTProcedure(
                tenant_id=current_user.tenant_id,
                step_no=step_no,
                title=title,
                description=desc,
            )
        )
    db.commit()


def _get_or_404(db: DbSession, current_user: CurrentUser, model, obj_id: int):
    obj = tenant_scoped(db.query(model), current_user).filter(model.id == obj_id).first()
    if not obj:
        raise HTTPException(404, f"{model.__name__} {obj_id} not found")
    return obj


# ===========================================================================
# 1. Procedures (Signature steps)
# ===========================================================================
@router.get("/procedures", response_model=list[s.ProcedureOut])
def list_procedures(current_user: CurrentUser, db: DbSession):
    _ensure_seeded(db, current_user)
    q = tenant_scoped(db.query(m.RPTProcedure), current_user).order_by(m.RPTProcedure.step_no)
    return [s.ProcedureOut.model_validate(p) for p in q.all()]


@router.patch("/procedures/{proc_id}", response_model=s.ProcedureOut)
def update_procedure(proc_id: int, payload: s.ProcedureUpdate, current_user: CurrentUser, db: DbSession):
    proc = _get_or_404(db, current_user, m.RPTProcedure, proc_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(proc, field, value)
    db.commit()
    db.refresh(proc)
    return s.ProcedureOut.model_validate(proc)


@router.post("/procedures/{proc_id}/sign", response_model=s.ProcedureOut)
def sign_procedure(proc_id: int, payload: s.ProcedureSign, current_user: CurrentUser, db: DbSession):
    proc = _get_or_404(db, current_user, m.RPTProcedure, proc_id)
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
    q = tenant_scoped(db.query(m.RPTScopeItem), current_user)
    return [s.ScopeOut.model_validate(i) for i in q.all()]


@router.post("/scope", response_model=s.ScopeOut)
def create_scope(payload: s.ScopeIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTScopeItem(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ScopeOut.model_validate(item)


@router.delete("/scope/{item_id}")
def delete_scope(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTScopeItem, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 3. Risk & Control Matrix
# ===========================================================================
@router.get("/rcm", response_model=list[s.ControlOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTControl), current_user)
    return [s.ControlOut.model_validate(i) for i in q.all()]


@router.post("/rcm", response_model=s.ControlOut)
def create_rcm(payload: s.ControlIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTControl(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ControlOut.model_validate(item)


@router.delete("/rcm/{item_id}")
def delete_rcm(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTControl, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 4. Test & Analytics Rule Library
# ===========================================================================
@router.get("/rules", response_model=list[s.RuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTRule), current_user)
    return [s.RuleOut.model_validate(i) for i in q.all()]


@router.post("/rules", response_model=s.RuleOut)
def create_rule(payload: s.RuleIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTRule(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.RuleOut.model_validate(item)


@router.delete("/rules/{item_id}")
def delete_rule(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTRule, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 5. Data Source & Connector Setup
# ===========================================================================
@router.get("/datasources", response_model=list[s.DataSourceOut])
def list_datasources(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTDataSource), current_user)
    return [s.DataSourceOut.model_validate(i) for i in q.all()]


@router.post("/datasources", response_model=s.DataSourceOut)
def create_datasource(payload: s.DataSourceIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTDataSource(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.DataSourceOut.model_validate(item)


@router.delete("/datasources/{item_id}")
def delete_datasource(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTDataSource, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 6. Sampling & Population Builder
# ===========================================================================
@router.get("/samples", response_model=list[s.SampleOut])
def list_samples(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTSample), current_user)
    return [s.SampleOut.model_validate(i) for i in q.all()]


@router.post("/samples", response_model=s.SampleOut)
def create_sample(payload: s.SampleIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTSample(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.SampleOut.model_validate(item)


@router.delete("/samples/{item_id}")
def delete_sample(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTSample, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 7. Exception & Red-Flag Queue
# ===========================================================================
@router.get("/exceptions", response_model=list[s.ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTException), current_user).order_by(m.RPTException.created_at.desc())
    return [s.ExceptionOut.model_validate(i) for i in q.all()]


@router.post("/exceptions", response_model=s.ExceptionOut)
def create_exception(payload: s.ExceptionIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTException(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ExceptionOut.model_validate(item)


@router.patch("/exceptions/{item_id}", response_model=s.ExceptionOut)
def update_exception(item_id: int, payload: s.ExceptionIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTException, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.ExceptionOut.model_validate(item)


# ===========================================================================
# 8. Working Papers & Evidence
# ===========================================================================
@router.get("/evidence", response_model=list[s.EvidenceOut])
def list_evidence(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTEvidence), current_user).order_by(m.RPTEvidence.created_at.desc())
    return [s.EvidenceOut.model_validate(i) for i in q.all()]


@router.post("/evidence", response_model=s.EvidenceOut)
def create_evidence(payload: s.EvidenceIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTEvidence(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.EvidenceOut.model_validate(item)


@router.delete("/evidence/{item_id}")
def delete_evidence(item_id: int, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTEvidence, item_id)
    db.delete(item)
    db.commit()
    return {"ok": True}


# ===========================================================================
# 9. Observation & Finding Log
# ===========================================================================
@router.get("/findings", response_model=list[s.FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTFinding), current_user).order_by(m.RPTFinding.created_at.desc())
    return [s.FindingOut.model_validate(i) for i in q.all()]


@router.post("/findings", response_model=s.FindingOut)
def create_finding(payload: s.FindingIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTFinding(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.FindingOut.model_validate(item)


@router.patch("/findings/{item_id}", response_model=s.FindingOut)
def update_finding(item_id: int, payload: s.FindingIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTFinding, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.FindingOut.model_validate(item)


# ===========================================================================
# 10. Remediation / Action Tracker
# ===========================================================================
@router.get("/actions", response_model=list[s.ActionOut])
def list_actions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(m.RPTAction), current_user).order_by(m.RPTAction.created_at.desc())
    return [s.ActionOut.model_validate(i) for i in q.all()]


@router.post("/actions", response_model=s.ActionOut)
def create_action(payload: s.ActionIn, current_user: CurrentUser, db: DbSession):
    item = m.RPTAction(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return s.ActionOut.model_validate(item)


@router.patch("/actions/{item_id}", response_model=s.ActionOut)
def update_action(item_id: int, payload: s.ActionIn, current_user: CurrentUser, db: DbSession):
    item = _get_or_404(db, current_user, m.RPTAction, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return s.ActionOut.model_validate(item)


# ===========================================================================
# Dashboard & KPIs
# ===========================================================================
@router.get("/dashboard", response_model=s.DashboardOut)
def dashboard(current_user: CurrentUser, db: DbSession):
    _ensure_seeded(db, current_user)

    procedures = tenant_scoped(db.query(m.RPTProcedure), current_user).all()
    total = len(procedures)
    completed = sum(1 for p in procedures if p.status == "completed")
    coverage = round((completed / total) * 100, 1) if total else 0.0

    open_exceptions = tenant_scoped(db.query(m.RPTException), current_user).filter(
        m.RPTException.status != "closed"
    ).count()
    open_findings = tenant_scoped(db.query(m.RPTFinding), current_user).filter(
        m.RPTFinding.status != "closed"
    ).count()
    open_actions = tenant_scoped(db.query(m.RPTAction), current_user).filter(
        m.RPTAction.status != "done"
    ).count()

    high_findings = tenant_scoped(db.query(m.RPTFinding), current_user).filter(
        m.RPTFinding.status != "closed",
        m.RPTFinding.grade.in_(["high", "critical"]),
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
