"""Risk & Control Matrix (RCM) Library — Module #10.

Covers all 25 catalogue sub-pages:
  Signature: 1 Process-Risk-Control Mapping, 2 Control Attribute Register,
    3 Assertion Mapping, 4 Regulatory Cross-Reference, 5 Control Owner
    Directory, 6 Test Procedure Linkage, 7 Design vs Operating
    Effectiveness, 8 Control Rationalisation, 9 Change & Version Control,
    10 Key-Control Designation, 11 Control Gap Analysis, 12 Framework
    Templates, 13 Heat-of-Control Dashboard, 14 Bulk Import/Export,
    15 RCM Approval Workflow.
  Shell: 16 Module Dashboard & KPIs, 17 Scope & Audit Universe, 18 Risk &
    Control Matrix, 19 Test & Analytics Rule Library, 20 Data Source &
    Connector Setup, 21 Sampling & Population Builder, 22 Exception &
    Red-Flag Queue, 23 Working Papers & Evidence, 24 Observation & Finding
    Log, 25 Remediation / Action Tracker.

Mounted at /api/modules/rcm_library.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import schemas as s
from .models import (
    RcmLibraryApproval,
    RcmLibraryScope,
    RcmLibraryOwner,
    RcmLibraryConnector,
    RcmLibraryException,
    RcmLibraryFinding,
    RcmLibraryTemplate,
    RcmLibraryEntry,
    RcmLibraryVersionLog,
    RcmLibraryRemediation,
    RcmLibrarySample,
    RcmLibraryTestRule,
    RcmLibraryWorkingPaper,
)

MANIFEST = {
    "name": "rcm_library",
    "title": "RCM Library",
    "description": "Risk & Control Matrix Library — centrally governed process risks and controls, mapped to assertions, regulations and tests.",
    "icon": "shield",
    "group": "Controls, Risk & Fraud",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()


# ---------------------------------------------------------------------------
# 1. Process-Risk-Control Mapping / 2 Control Attribute Register / 3 Assertion
# Mapping / 4 Regulatory Cross-Reference / 6 Test Procedure Linkage /
# 7 Design vs Operating Effectiveness / 8 Control Rationalisation /
# 10 Key-Control Designation / 18 (Shell) Risk & Control Matrix
# ---------------------------------------------------------------------------
@router.get("/entries", response_model=list[s.RcmEntryOut])
def list_entries(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryEntry), current_user)
    return [s.RcmEntryOut.model_validate(e) for e in q.order_by(RcmLibraryEntry.id.desc()).all()]


@router.post("/entries", response_model=s.RcmEntryOut, status_code=201)
def create_entry(body: s.RcmEntryCreate, current_user: CurrentUser, db: DbSession):
    entry = RcmLibraryEntry(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return s.RcmEntryOut.model_validate(entry)


@router.patch("/entries/{entry_id}", response_model=s.RcmEntryOut)
def update_entry(entry_id: int, body: s.RcmEntryUpdate, current_user: CurrentUser, db: DbSession):
    entry = tenant_scoped(db.query(RcmLibraryEntry).filter(RcmLibraryEntry.id == entry_id), current_user).first()
    if not entry:
        raise HTTPException(404, "Entry not found")

    changes = body.model_dump(exclude_unset=True)
    changed_any = False
    for field, new_value in changes.items():
        old_value = getattr(entry, field)
        if str(old_value) != str(new_value):
            db.add(
                RcmLibraryVersionLog(
                    tenant_id=current_user.tenant_id,
                    entry_id=entry.id,
                    entry_process=entry.process,
                    field_changed=field,
                    old_value=str(old_value),
                    new_value=str(new_value),
                    changed_by=current_user.email,
                )
            )
            setattr(entry, field, new_value)
            changed_any = True

    if changed_any:
        entry.version += 1
    db.commit()
    db.refresh(entry)
    return s.RcmEntryOut.model_validate(entry)


@router.delete("/entries/{entry_id}", status_code=204)
def delete_entry(entry_id: int, current_user: CurrentUser, db: DbSession):
    entry = tenant_scoped(db.query(RcmLibraryEntry).filter(RcmLibraryEntry.id == entry_id), current_user).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    db.delete(entry)
    db.commit()


# ---------------------------------------------------------------------------
# 5. Control Owner Directory
# ---------------------------------------------------------------------------
@router.get("/owners", response_model=list[s.OwnerOut])
def list_owners(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryOwner), current_user)
    return [s.OwnerOut.model_validate(o) for o in q.order_by(RcmLibraryOwner.name).all()]


@router.post("/owners", response_model=s.OwnerOut, status_code=201)
def create_owner(body: s.OwnerCreate, current_user: CurrentUser, db: DbSession):
    owner = RcmLibraryOwner(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return s.OwnerOut.model_validate(owner)


@router.delete("/owners/{owner_id}", status_code=204)
def delete_owner(owner_id: int, current_user: CurrentUser, db: DbSession):
    owner = tenant_scoped(db.query(RcmLibraryOwner).filter(RcmLibraryOwner.id == owner_id), current_user).first()
    if not owner:
        raise HTTPException(404, "Owner not found")
    db.delete(owner)
    db.commit()


# ---------------------------------------------------------------------------
# 9. Change & Version Control (read-only audit trail)
# ---------------------------------------------------------------------------
@router.get("/version-log", response_model=list[s.VersionLogOut])
def list_version_log(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryVersionLog), current_user)
    return [s.VersionLogOut.model_validate(v) for v in q.order_by(RcmLibraryVersionLog.id.desc()).limit(300).all()]


# ---------------------------------------------------------------------------
# 11. Control Gap Analysis — scope units with no matching control entry
# ---------------------------------------------------------------------------
@router.get("/gap-analysis")
def gap_analysis(current_user: CurrentUser, db: DbSession):
    scope_items = tenant_scoped(db.query(RcmLibraryScope), current_user).filter(
        RcmLibraryScope.in_scope == True  # noqa: E712
    ).all()
    entries = tenant_scoped(db.query(RcmLibraryEntry), current_user).all()
    covered = {e.process.strip().lower() for e in entries}
    gaps = [
        {"id": u.id, "unit_name": u.unit_name, "unit_type": u.unit_type, "description": u.description}
        for u in scope_items
        if u.unit_name.strip().lower() not in covered
    ]
    return {"total_scope": len(scope_items), "covered": len(scope_items) - len(gaps), "gaps": gaps}


# ---------------------------------------------------------------------------
# 12. Framework Templates
# ---------------------------------------------------------------------------
@router.get("/templates", response_model=list[s.TemplateOut])
def list_templates(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryTemplate), current_user)
    return [s.TemplateOut.model_validate(t) for t in q.order_by(RcmLibraryTemplate.id.desc()).all()]


@router.post("/templates", response_model=s.TemplateOut, status_code=201)
def create_template(body: s.TemplateCreate, current_user: CurrentUser, db: DbSession):
    tpl = RcmLibraryTemplate(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return s.TemplateOut.model_validate(tpl)


@router.delete("/templates/{template_id}", status_code=204)
def delete_template(template_id: int, current_user: CurrentUser, db: DbSession):
    tpl = tenant_scoped(db.query(RcmLibraryTemplate).filter(RcmLibraryTemplate.id == template_id), current_user).first()
    if not tpl:
        raise HTTPException(404, "Template not found")
    db.delete(tpl)
    db.commit()


@router.post("/templates/{template_id}/apply", response_model=s.RcmEntryOut, status_code=201)
def apply_template(template_id: int, current_user: CurrentUser, db: DbSession):
    tpl = tenant_scoped(db.query(RcmLibraryTemplate).filter(RcmLibraryTemplate.id == template_id), current_user).first()
    if not tpl:
        raise HTTPException(404, "Template not found")
    entry = RcmLibraryEntry(
        tenant_id=current_user.tenant_id,
        process=tpl.default_process or tpl.name,
        risk=tpl.default_risk or "Derived from template — refine as needed.",
        control_description=tpl.default_control or "Derived from template — refine as needed.",
        notes=f"Created from template '{tpl.name}'",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return s.RcmEntryOut.model_validate(entry)


# ---------------------------------------------------------------------------
# 13. (Signature) Heat-of-Control Dashboard & 16. (Shell) Module Dashboard & KPIs
# ---------------------------------------------------------------------------
@router.get("/dashboard")
def dashboard(current_user: CurrentUser, db: DbSession):
    entries = tenant_scoped(db.query(RcmLibraryEntry), current_user).all()
    exceptions_open = tenant_scoped(db.query(RcmLibraryException), current_user).filter(
        RcmLibraryException.status == "Open"
    ).count()
    scope_total = tenant_scoped(db.query(RcmLibraryScope), current_user).filter(
        RcmLibraryScope.in_scope == True  # noqa: E712
    ).count()
    findings_open = tenant_scoped(db.query(RcmLibraryFinding), current_user).filter(RcmLibraryFinding.status != "Closed").count()

    total = len(entries)
    key_controls = sum(1 for e in entries if e.is_key_control)
    effective_oe = sum(1 for e in entries if e.operating_effectiveness == "Effective")
    covered_processes = {e.process.strip().lower() for e in entries}
    coverage_pct = round(100 * len(covered_processes) / scope_total, 1) if scope_total else 0.0

    def bucket(field):
        counts: dict[str, int] = {}
        for e in entries:
            v = getattr(e, field) or "Unspecified"
            counts[v] = counts.get(v, 0) + 1
        return counts

    return {
        "total_controls": total,
        "key_controls": key_controls,
        "effective_operating_controls": effective_oe,
        "open_exceptions": exceptions_open,
        "open_findings": findings_open,
        "coverage_pct": coverage_pct,
        "by_control_type": bucket("control_type"),
        "by_nature": bucket("nature"),
        "by_rationalization_status": bucket("rationalization_status"),
        "by_design_effectiveness": bucket("design_effectiveness"),
        "by_operating_effectiveness": bucket("operating_effectiveness"),
    }


# ---------------------------------------------------------------------------
# 14. Bulk Import / Export
# ---------------------------------------------------------------------------
@router.post("/entries/bulk-import", response_model=list[s.RcmEntryOut], status_code=201)
def bulk_import(rows: list[s.RcmEntryCreate], current_user: CurrentUser, db: DbSession):
    created = []
    for row in rows:
        entry = RcmLibraryEntry(**row.model_dump(), tenant_id=current_user.tenant_id)
        db.add(entry)
        created.append(entry)
    db.commit()
    for e in created:
        db.refresh(e)
    return [s.RcmEntryOut.model_validate(e) for e in created]


# ---------------------------------------------------------------------------
# 15. RCM Approval Workflow
# ---------------------------------------------------------------------------
@router.get("/approvals", response_model=list[s.ApprovalOut])
def list_approvals(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryApproval), current_user)
    return [s.ApprovalOut.model_validate(a) for a in q.order_by(RcmLibraryApproval.id.desc()).all()]


@router.post("/approvals", response_model=s.ApprovalOut, status_code=201)
def create_approval(body: s.ApprovalCreate, current_user: CurrentUser, db: DbSession):
    entry = tenant_scoped(db.query(RcmLibraryEntry).filter(RcmLibraryEntry.id == body.entry_id), current_user).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    req = RcmLibraryApproval(**body.model_dump(), entry_process=entry.process, tenant_id=current_user.tenant_id)
    db.add(req)
    db.commit()
    db.refresh(req)
    return s.ApprovalOut.model_validate(req)


@router.patch("/approvals/{approval_id}", response_model=s.ApprovalOut)
def decide_approval(approval_id: int, body: s.ApprovalDecide, current_user: CurrentUser, db: DbSession):
    req = tenant_scoped(db.query(RcmLibraryApproval).filter(RcmLibraryApproval.id == approval_id), current_user).first()
    if not req:
        raise HTTPException(404, "Approval not found")
    req.status = body.status
    req.comments = body.comments
    if body.status == "Approved":
        entry = tenant_scoped(db.query(RcmLibraryEntry).filter(RcmLibraryEntry.id == req.entry_id), current_user).first()
        if entry:
            entry.status = "Approved"
    db.commit()
    db.refresh(req)
    return s.ApprovalOut.model_validate(req)


# ---------------------------------------------------------------------------
# 17. (Shell) Scope & Audit Universe
# ---------------------------------------------------------------------------
@router.get("/scope", response_model=list[s.ScopeOut])
def list_scope(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryScope), current_user)
    return [s.ScopeOut.model_validate(x) for x in q.order_by(RcmLibraryScope.id.desc()).all()]


@router.post("/scope", response_model=s.ScopeOut, status_code=201)
def create_scope(body: s.ScopeCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryScope(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ScopeOut.model_validate(row)


@router.delete("/scope/{scope_id}", status_code=204)
def delete_scope(scope_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryScope).filter(RcmLibraryScope.id == scope_id), current_user).first()
    if not row:
        raise HTTPException(404, "Scope item not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 19. (Shell) Test & Analytics Rule Library
# ---------------------------------------------------------------------------
@router.get("/test-rules", response_model=list[s.TestRuleOut])
def list_test_rules(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryTestRule), current_user)
    return [s.TestRuleOut.model_validate(x) for x in q.order_by(RcmLibraryTestRule.id.desc()).all()]


@router.post("/test-rules", response_model=s.TestRuleOut, status_code=201)
def create_test_rule(body: s.TestRuleCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryTestRule(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.TestRuleOut.model_validate(row)


@router.delete("/test-rules/{rule_id}", status_code=204)
def delete_test_rule(rule_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryTestRule).filter(RcmLibraryTestRule.id == rule_id), current_user).first()
    if not row:
        raise HTTPException(404, "Rule not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 20. (Shell) Data Source & Connector Setup
# ---------------------------------------------------------------------------
@router.get("/connectors", response_model=list[s.ConnectorOut])
def list_connectors(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryConnector), current_user)
    return [s.ConnectorOut.model_validate(x) for x in q.order_by(RcmLibraryConnector.id.desc()).all()]


@router.post("/connectors", response_model=s.ConnectorOut, status_code=201)
def create_connector(body: s.ConnectorCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryConnector(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ConnectorOut.model_validate(row)


@router.delete("/connectors/{connector_id}", status_code=204)
def delete_connector(connector_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryConnector).filter(RcmLibraryConnector.id == connector_id), current_user).first()
    if not row:
        raise HTTPException(404, "Connector not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 21. (Shell) Sampling & Population Builder
# ---------------------------------------------------------------------------
@router.get("/samples", response_model=list[s.SampleOut])
def list_samples(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibrarySample), current_user)
    return [s.SampleOut.model_validate(x) for x in q.order_by(RcmLibrarySample.id.desc()).all()]


@router.post("/samples", response_model=s.SampleOut, status_code=201)
def create_sample(body: s.SampleCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibrarySample(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.SampleOut.model_validate(row)


@router.delete("/samples/{sample_id}", status_code=204)
def delete_sample(sample_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibrarySample).filter(RcmLibrarySample.id == sample_id), current_user).first()
    if not row:
        raise HTTPException(404, "Sample plan not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 22. (Shell) Exception & Red-Flag Queue
# ---------------------------------------------------------------------------
@router.get("/exceptions", response_model=list[s.ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryException), current_user)
    return [s.ExceptionOut.model_validate(x) for x in q.order_by(RcmLibraryException.id.desc()).all()]


@router.post("/exceptions", response_model=s.ExceptionOut, status_code=201)
def create_exception(body: s.ExceptionCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryException(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.ExceptionOut.model_validate(row)


@router.patch("/exceptions/{exception_id}", response_model=s.ExceptionOut)
def update_exception(exception_id: int, body: s.ExceptionCreate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryException).filter(RcmLibraryException.id == exception_id), current_user).first()
    if not row:
        raise HTTPException(404, "Exception not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.ExceptionOut.model_validate(row)


@router.delete("/exceptions/{exception_id}", status_code=204)
def delete_exception(exception_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryException).filter(RcmLibraryException.id == exception_id), current_user).first()
    if not row:
        raise HTTPException(404, "Exception not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 23. (Shell) Working Papers & Evidence
# ---------------------------------------------------------------------------
@router.get("/working-papers", response_model=list[s.WorkingPaperOut])
def list_working_papers(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryWorkingPaper), current_user)
    return [s.WorkingPaperOut.model_validate(x) for x in q.order_by(RcmLibraryWorkingPaper.id.desc()).all()]


@router.post("/working-papers", response_model=s.WorkingPaperOut, status_code=201)
def create_working_paper(body: s.WorkingPaperCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryWorkingPaper(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.WorkingPaperOut.model_validate(row)


@router.patch("/working-papers/{paper_id}", response_model=s.WorkingPaperOut)
def update_working_paper(paper_id: int, body: s.WorkingPaperCreate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryWorkingPaper).filter(RcmLibraryWorkingPaper.id == paper_id), current_user).first()
    if not row:
        raise HTTPException(404, "Working paper not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.WorkingPaperOut.model_validate(row)


@router.delete("/working-papers/{paper_id}", status_code=204)
def delete_working_paper(paper_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryWorkingPaper).filter(RcmLibraryWorkingPaper.id == paper_id), current_user).first()
    if not row:
        raise HTTPException(404, "Working paper not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 24. (Shell) Observation & Finding Log
# ---------------------------------------------------------------------------
@router.get("/findings", response_model=list[s.FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryFinding), current_user)
    return [s.FindingOut.model_validate(x) for x in q.order_by(RcmLibraryFinding.id.desc()).all()]


@router.post("/findings", response_model=s.FindingOut, status_code=201)
def create_finding(body: s.FindingCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryFinding(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.FindingOut.model_validate(row)


@router.patch("/findings/{finding_id}", response_model=s.FindingOut)
def update_finding(finding_id: int, body: s.FindingCreate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryFinding).filter(RcmLibraryFinding.id == finding_id), current_user).first()
    if not row:
        raise HTTPException(404, "Finding not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.FindingOut.model_validate(row)


@router.delete("/findings/{finding_id}", status_code=204)
def delete_finding(finding_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryFinding).filter(RcmLibraryFinding.id == finding_id), current_user).first()
    if not row:
        raise HTTPException(404, "Finding not found")
    db.delete(row)
    db.commit()


# ---------------------------------------------------------------------------
# 25. (Shell) Remediation / Action Tracker
# ---------------------------------------------------------------------------
@router.get("/remediation", response_model=list[s.RemediationOut])
def list_remediation(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmLibraryRemediation), current_user)
    return [s.RemediationOut.model_validate(x) for x in q.order_by(RcmLibraryRemediation.id.desc()).all()]


@router.post("/remediation", response_model=s.RemediationOut, status_code=201)
def create_remediation(body: s.RemediationCreate, current_user: CurrentUser, db: DbSession):
    row = RcmLibraryRemediation(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return s.RemediationOut.model_validate(row)


@router.patch("/remediation/{action_id}", response_model=s.RemediationOut)
def update_remediation(action_id: int, body: s.RemediationCreate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryRemediation).filter(RcmLibraryRemediation.id == action_id), current_user).first()
    if not row:
        raise HTTPException(404, "Remediation action not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return s.RemediationOut.model_validate(row)


@router.delete("/remediation/{action_id}", status_code=204)
def delete_remediation(action_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(db.query(RcmLibraryRemediation).filter(RcmLibraryRemediation.id == action_id), current_user).first()
    if not row:
        raise HTTPException(404, "Remediation action not found")
    db.delete(row)
    db.commit()
