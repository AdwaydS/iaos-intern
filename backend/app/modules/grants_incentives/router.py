from fastapi import APIRouter, HTTPException
from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped
from .models import (
    Scheme, SchemeEligibility, Claim, Document, Receipt,
    ConditionCompliance, ExportIncentive, CapitalSubsidy,
    InterestSubvention, GrantAccounting, ClawbackRisk, Deadline,
    SchemeOverlap, AuthorityCorrespondence, UtilisationReport,
    IncentiveRealisation,
)
from .schemas import (
    SchemeCreate, SchemeOut,
    EligibilityCreate, EligibilityOut,
    ClaimCreate, ClaimOut,
    DocumentCreate, DocumentOut,
    ReceiptCreate, ReceiptOut,
    ConditionCreate, ConditionOut,
    ExportIncentiveCreate, ExportIncentiveOut,
    CapitalSubsidyCreate, CapitalSubsidyOut,
    InterestSubventionCreate, InterestSubventionOut,
    GrantAccountingCreate, GrantAccountingOut,
    ClawbackRiskCreate, ClawbackRiskOut,
    DeadlineCreate, DeadlineOut,
    SchemeOverlapCreate, SchemeOverlapOut,
    CorrespondenceCreate, CorrespondenceOut,
    UtilisationCreate, UtilisationOut,
    RealisationCreate, RealisationOut,
)

MANIFEST = {
    "name": "grants_incentives",
    "title": "Grants, Subsidies & Incentives",
    "description": "Tracks government grants, subsidies and incentive schemes for eligibility, claims, compliance and clawback risk.",
    "icon": "💰",
    "version": "1.0.0",
    "owner": "intern-61",
}

router = APIRouter()


# ─── 1. Scheme Eligibility Register ─────────────────────────────────

@router.get("/schemes", response_model=list[SchemeOut])
def list_schemes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Scheme), current_user)
    return [SchemeOut.model_validate(s) for s in q.order_by(Scheme.id.desc()).all()]


@router.post("/schemes", response_model=SchemeOut, status_code=201)
def create_scheme(body: SchemeCreate, current_user: CurrentUser, db: DbSession):
    obj = Scheme(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return SchemeOut.model_validate(obj)


@router.delete("/schemes/{item_id}", status_code=204)
def delete_scheme(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(Scheme).filter(Scheme.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Scheme not found")
    db.delete(obj)
    db.commit()


# ─── 2. Claim Computation Accuracy ─────────────────────────────────

@router.get("/claims", response_model=list[ClaimOut])
def list_claims(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Claim), current_user)
    return [ClaimOut.model_validate(c) for c in q.order_by(Claim.id.desc()).all()]


@router.post("/claims", response_model=ClaimOut, status_code=201)
def create_claim(body: ClaimCreate, current_user: CurrentUser, db: DbSession):
    obj = Claim(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ClaimOut.model_validate(obj)


@router.delete("/claims/{item_id}", status_code=204)
def delete_claim(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(Claim).filter(Claim.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Claim not found")
    db.delete(obj)
    db.commit()


@router.get("/claims/accuracy")
def claim_accuracy(current_user: CurrentUser, db: DbSession):
    claims = tenant_scoped(db.query(Claim), current_user).all()
    total = len(claims)
    matched = sum(1 for c in claims if float(c.claimed_amount) == float(c.computed_amount))
    variance_items = [
        {"claim_ref": c.claim_ref, "claimed": float(c.claimed_amount),
         "computed": float(c.computed_amount), "variance": float(c.claimed_amount) - float(c.computed_amount)}
        for c in claims if float(c.claimed_amount) != float(c.computed_amount)
    ]
    return {"total_claims": total, "matched": matched, "variances": variance_items}


# ─── 3. Documentation Completeness ──────────────────────────────────

@router.get("/documents", response_model=list[DocumentOut])
def list_documents(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Document), current_user)
    return [DocumentOut.model_validate(d) for d in q.order_by(Document.id.desc()).all()]


@router.post("/documents", response_model=DocumentOut, status_code=201)
def create_document(body: DocumentCreate, current_user: CurrentUser, db: DbSession):
    obj = Document(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return DocumentOut.model_validate(obj)


@router.delete("/documents/{item_id}", status_code=204)
def delete_document(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(Document).filter(Document.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Document not found")
    db.delete(obj)
    db.commit()


# ─── 4. Receipt & Ageing Tracker ────────────────────────────────────

@router.get("/receipts", response_model=list[ReceiptOut])
def list_receipts(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Receipt), current_user)
    return [ReceiptOut.model_validate(r) for r in q.order_by(Receipt.id.desc()).all()]


@router.post("/receipts", response_model=ReceiptOut, status_code=201)
def create_receipt(body: ReceiptCreate, current_user: CurrentUser, db: DbSession):
    obj = Receipt(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ReceiptOut.model_validate(obj)


@router.delete("/receipts/{item_id}", status_code=204)
def delete_receipt(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(Receipt).filter(Receipt.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Receipt not found")
    db.delete(obj)
    db.commit()


# ─── 5. End-Use / Condition Compliance ──────────────────────────────

@router.get("/conditions", response_model=list[ConditionOut])
def list_conditions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ConditionCompliance), current_user)
    return [ConditionOut.model_validate(c) for c in q.order_by(ConditionCompliance.id.desc()).all()]


@router.post("/conditions", response_model=ConditionOut, status_code=201)
def create_condition(body: ConditionCreate, current_user: CurrentUser, db: DbSession):
    obj = ConditionCompliance(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ConditionOut.model_validate(obj)


@router.delete("/conditions/{item_id}", status_code=204)
def delete_condition(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(
        db.query(ConditionCompliance).filter(ConditionCompliance.id == item_id), current_user
    ).first()
    if not obj:
        raise HTTPException(404, "Condition not found")
    db.delete(obj)
    db.commit()


# ─── 6. Export-Incentive (RoDTEP / Duty Drawback) ──────────────────

@router.get("/export", response_model=list[ExportIncentiveOut])
def list_export(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ExportIncentive), current_user)
    return [ExportIncentiveOut.model_validate(e) for e in q.order_by(ExportIncentive.id.desc()).all()]


@router.post("/export", response_model=ExportIncentiveOut, status_code=201)
def create_export(body: ExportIncentiveCreate, current_user: CurrentUser, db: DbSession):
    obj = ExportIncentive(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ExportIncentiveOut.model_validate(obj)


@router.delete("/export/{item_id}", status_code=204)
def delete_export(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(ExportIncentive).filter(ExportIncentive.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Export incentive not found")
    db.delete(obj)
    db.commit()


# ─── 7. Capital-Subsidy Tracking ───────────────────────────────────

@router.get("/capital", response_model=list[CapitalSubsidyOut])
def list_capital(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CapitalSubsidy), current_user)
    return [CapitalSubsidyOut.model_validate(c) for c in q.order_by(CapitalSubsidy.id.desc()).all()]


@router.post("/capital", response_model=CapitalSubsidyOut, status_code=201)
def create_capital(body: CapitalSubsidyCreate, current_user: CurrentUser, db: DbSession):
    obj = CapitalSubsidy(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CapitalSubsidyOut.model_validate(obj)


@router.delete("/capital/{item_id}", status_code=204)
def delete_capital(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(CapitalSubsidy).filter(CapitalSubsidy.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Capital subsidy not found")
    db.delete(obj)
    db.commit()


# ─── 8. Interest-Subvention Claims ─────────────────────────────────

@router.get("/interest", response_model=list[InterestSubventionOut])
def list_interest(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(InterestSubvention), current_user)
    return [InterestSubventionOut.model_validate(i) for i in q.order_by(InterestSubvention.id.desc()).all()]


@router.post("/interest", response_model=InterestSubventionOut, status_code=201)
def create_interest(body: InterestSubventionCreate, current_user: CurrentUser, db: DbSession):
    obj = InterestSubvention(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return InterestSubventionOut.model_validate(obj)


@router.delete("/interest/{item_id}", status_code=204)
def delete_interest(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(InterestSubvention).filter(InterestSubvention.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Interest subvention not found")
    db.delete(obj)
    db.commit()


# ─── 9. Accounting & Recognition (Ind AS 20) ───────────────────────

@router.get("/accounting", response_model=list[GrantAccountingOut])
def list_accounting(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(GrantAccounting), current_user)
    return [GrantAccountingOut.model_validate(a) for a in q.order_by(GrantAccounting.id.desc()).all()]


@router.post("/accounting", response_model=GrantAccountingOut, status_code=201)
def create_accounting(body: GrantAccountingCreate, current_user: CurrentUser, db: DbSession):
    obj = GrantAccounting(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return GrantAccountingOut.model_validate(obj)


@router.delete("/accounting/{item_id}", status_code=204)
def delete_accounting(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(GrantAccounting).filter(GrantAccounting.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Accounting record not found")
    db.delete(obj)
    db.commit()


# ─── 10. Clawback / Repayment Risk ─────────────────────────────────

@router.get("/clawback", response_model=list[ClawbackRiskOut])
def list_clawback(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ClawbackRisk), current_user)
    return [ClawbackRiskOut.model_validate(c) for c in q.order_by(ClawbackRisk.id.desc()).all()]


@router.post("/clawback", response_model=ClawbackRiskOut, status_code=201)
def create_clawback(body: ClawbackRiskCreate, current_user: CurrentUser, db: DbSession):
    obj = ClawbackRisk(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ClawbackRiskOut.model_validate(obj)


@router.delete("/clawback/{item_id}", status_code=204)
def delete_clawback(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(ClawbackRisk).filter(ClawbackRisk.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Clawback risk not found")
    db.delete(obj)
    db.commit()


# ─── 11. Deadline & Filing Calendar ────────────────────────────────

@router.get("/deadlines", response_model=list[DeadlineOut])
def list_deadlines(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Deadline), current_user)
    return [DeadlineOut.model_validate(d) for d in q.order_by(Deadline.id.desc()).all()]


@router.post("/deadlines", response_model=DeadlineOut, status_code=201)
def create_deadline(body: DeadlineCreate, current_user: CurrentUser, db: DbSession):
    obj = Deadline(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return DeadlineOut.model_validate(obj)


@router.delete("/deadlines/{item_id}", status_code=204)
def delete_deadline(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(Deadline).filter(Deadline.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Deadline not found")
    db.delete(obj)
    db.commit()


# ─── 12. Multiple-Scheme Overlap ───────────────────────────────────

@router.get("/overlaps", response_model=list[SchemeOverlapOut])
def list_overlaps(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(SchemeOverlap), current_user)
    return [SchemeOverlapOut.model_validate(o) for o in q.order_by(SchemeOverlap.id.desc()).all()]


@router.post("/overlaps", response_model=SchemeOverlapOut, status_code=201)
def create_overlap(body: SchemeOverlapCreate, current_user: CurrentUser, db: DbSession):
    obj = SchemeOverlap(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return SchemeOverlapOut.model_validate(obj)


@router.delete("/overlaps/{item_id}", status_code=204)
def delete_overlap(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(SchemeOverlap).filter(SchemeOverlap.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Overlap record not found")
    db.delete(obj)
    db.commit()


# ─── 13. Authority Correspondence ──────────────────────────────────

@router.get("/correspondence", response_model=list[CorrespondenceOut])
def list_correspondence(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(AuthorityCorrespondence), current_user)
    return [CorrespondenceOut.model_validate(c) for c in q.order_by(AuthorityCorrespondence.id.desc()).all()]


@router.post("/correspondence", response_model=CorrespondenceOut, status_code=201)
def create_correspondence(body: CorrespondenceCreate, current_user: CurrentUser, db: DbSession):
    obj = AuthorityCorrespondence(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CorrespondenceOut.model_validate(obj)


@router.delete("/correspondence/{item_id}", status_code=204)
def delete_correspondence(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(
        db.query(AuthorityCorrespondence).filter(AuthorityCorrespondence.id == item_id), current_user
    ).first()
    if not obj:
        raise HTTPException(404, "Correspondence not found")
    db.delete(obj)
    db.commit()


# ─── 14. Utilisation Reporting ─────────────────────────────────────

@router.get("/utilisation", response_model=list[UtilisationOut])
def list_utilisation(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(UtilisationReport), current_user)
    return [UtilisationOut.model_validate(u) for u in q.order_by(UtilisationReport.id.desc()).all()]


@router.post("/utilisation", response_model=UtilisationOut, status_code=201)
def create_utilisation(body: UtilisationCreate, current_user: CurrentUser, db: DbSession):
    obj = UtilisationReport(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return UtilisationOut.model_validate(obj)


@router.delete("/utilisation/{item_id}", status_code=204)
def delete_utilisation(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(UtilisationReport).filter(UtilisationReport.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Utilisation record not found")
    db.delete(obj)
    db.commit()


# ─── 15. Incentive-Realisation Dashboard ───────────────────────────

@router.get("/realisation", response_model=list[RealisationOut])
def list_realisation(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(IncentiveRealisation), current_user)
    return [RealisationOut.model_validate(r) for r in q.order_by(IncentiveRealisation.id.desc()).all()]


@router.post("/realisation", response_model=RealisationOut, status_code=201)
def create_realisation(body: RealisationCreate, current_user: CurrentUser, db: DbSession):
    obj = IncentiveRealisation(
        **body.model_dump(),
        variance=float(body.claimed_amount) - float(body.received_amount),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return RealisationOut.model_validate(obj)


@router.delete("/realisation/{item_id}", status_code=204)
def delete_realisation(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(IncentiveRealisation).filter(IncentiveRealisation.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Realisation record not found")
    db.delete(obj)
    db.commit()


# ─── 16. Module Dashboard & KPIs ───────────────────────────────────

@router.get("/dashboard")
def module_dashboard(current_user: CurrentUser, db: DbSession):
    schemes = tenant_scoped(db.query(Scheme), current_user).all()
    claims = tenant_scoped(db.query(Claim), current_user).all()
    receipts = tenant_scoped(db.query(Receipt), current_user).all()
    clawbacks = tenant_scoped(db.query(ClawbackRisk), current_user).all()
    deadlines = tenant_scoped(db.query(Deadline), current_user).all()

    total_claimed = sum(float(c.claimed_amount) for c in claims)
    total_computed = sum(float(c.computed_amount) for c in claims)
    total_received = sum(float(r.amount_received) for r in receipts)
    open_clawbacks = sum(1 for c in clawbacks if c.status == "open")
    overdue_deadlines = sum(1 for d in deadlines if d.status == "pending")

    return {
        "total_schemes": len(schemes),
        "total_claims": len(claims),
        "total_claimed": total_claimed,
        "total_computed": total_computed,
        "variance": total_claimed - total_computed,
        "total_received": total_received,
        "open_clawbacks": open_clawbacks,
        "overdue_deadlines": overdue_deadlines,
        "realisation_pct": round((total_received / total_claimed * 100), 1) if total_claimed else 0,
    }


# ─── Shell-page endpoints (framework data) ──────────────────────────

@router.get("/scope")
def scope_audit_universe(current_user: CurrentUser, db: DbSession):
    schemes = tenant_scoped(db.query(Scheme), current_user).all()
    return {
        "auditable_entities": list({e.entity_name for e in tenant_scoped(db.query(SchemeEligibility), current_user).all()}),
        "active_schemes": [s.scheme_code for s in schemes if s.status == "active"],
        "module_name": "Grants, Subsidies & Incentives",
    }


@router.get("/rcm")
def risk_control_matrix(current_user: CurrentUser, db: DbSession):
    return {
        "risks": [
            {"id": "R1", "risk": "Double-benefit across overlapping schemes", "assertion": "Completeness", "control": "Overlap detection report"},
            {"id": "R2", "risk": "Claim amount exceeds scheme formula", "assertion": "Accuracy", "control": "Auto-computation check"},
            {"id": "R3", "risk": "Clawback due to condition breach", "assertion": "Valuation", "control": "End-use compliance monitor"},
            {"id": "R4", "risk": "Missed filing deadline", "assertion": "Timeliness", "control": "Deadline calendar alerts"},
            {"id": "R5", "risk": "Incorrect grant accounting (Ind AS 20)", "assertion": "Classification", "control": "Recognition review"},
        ],
        "controls": 5,
    }


@router.get("/analytics-rules")
def analytics_rules(current_user: CurrentUser, db: DbSession):
    return {
        "rules": [
            {"id": "AR1", "rule": "Claimed vs Computed variance > 0", "action": "Flag for review"},
            {"id": "AR2", "rule": "Ageing > 90 days without receipt", "action": "Escalate to management"},
            {"id": "AR3", "rule": "Clawback exposure > threshold", "action": "Trigger mitigation workflow"},
            {"id": "AR4", "rule": "Deadline due within 7 days", "action": "Send reminder"},
            {"id": "AR5", "rule": "Utilisation < 50% of grant", "action": "Generate utilisation alert"},
        ],
        "total_rules": 5,
    }


@router.get("/data-sources")
def data_sources(current_user: CurrentUser, db: DbSession):
    return {
        "sources": [
            {"name": "ERP - Grant Master", "type": "table", "entity": "schemes"},
            {"name": "ERP - Claim Register", "type": "table", "entity": "claims"},
            {"name": "Bank Statements", "type": "upload", "entity": "receipts"},
            {"name": "Compliance Docs", "type": "upload", "entity": "documents"},
            {"name": "Authority Letters", "type": "upload", "entity": "correspondence"},
        ],
        "total_sources": 5,
    }


@router.get("/sampling")
def sampling(current_user: CurrentUser, db: DbSession):
    claims = tenant_scoped(db.query(Claim), current_user).all()
    return {
        "population_size": len(claims),
        "sample_method": "judgemental",
        "sample_size": min(len(claims), 25),
        "population": [{"claim_ref": c.claim_ref, "amount": float(c.claimed_amount)} for c in claims],
    }


@router.get("/exceptions")
def exceptions_queue(current_user: CurrentUser, db: DbSession):
    claims = tenant_scoped(db.query(Claim), current_user).all()
    receipts = tenant_scoped(db.query(Receipt), current_user).all()
    clawbacks = tenant_scoped(db.query(ClawbackRisk), current_user).all()

    exc = []
    for c in claims:
        if float(c.claimed_amount) != float(c.computed_amount):
            exc.append({"type": "variance", "ref": c.claim_ref, "detail": f"Variance: {float(c.claimed_amount) - float(c.computed_amount)}"})
    for r in receipts:
        if r.ageing_days > 90:
            exc.append({"type": "ageing", "ref": r.claim_ref, "detail": f"Ageing {r.ageing_days} days"})
    for cl in clawbacks:
        if cl.status == "open":
            exc.append({"type": "clawback", "ref": cl.scheme_code, "detail": cl.condition_breached})

    return {"exceptions": exc, "total": len(exc)}


@router.get("/working-papers")
def working_papers(current_user: CurrentUser, db: DbSession):
    docs = tenant_scoped(db.query(Document), current_user).all()
    return {
        "papers": [{"id": d.id, "name": d.document_name, "status": d.status} for d in docs],
        "total": len(docs),
    }


@router.get("/findings")
def findings_log(current_user: CurrentUser, db: DbSession):
    clawbacks = tenant_scoped(db.query(ClawbackRisk), current_user).all()
    overlaps = tenant_scoped(db.query(SchemeOverlap), current_user).all()
    findings = []
    for c in clawbacks:
        findings.append({"type": "clawback_risk", "ref": c.scheme_code, "severity": c.risk_level, "detail": c.condition_breached})
    for o in overlaps:
        findings.append({"type": "scheme_overlap", "ref": f"{o.scheme_1_code}+{o.scheme_2_code}", "severity": o.risk_level, "detail": o.overlap_desc})
    return {"findings": findings, "total": len(findings)}


@router.get("/remediation")
def remediation_tracker(current_user: CurrentUser, db: DbSession):
    clawbacks = tenant_scoped(db.query(ClawbackRisk), current_user).all()
    overlaps = tenant_scoped(db.query(SchemeOverlap), current_user).all()
    items = []
    for c in clawbacks:
        items.append({"ref": c.scheme_code, "action": "Mitigate clawback", "status": c.status, "owner": c.entity_name})
    for o in overlaps:
        items.append({"ref": f"{o.scheme_1_code}+{o.scheme_2_code}", "action": "Resolve overlap", "status": o.status, "owner": o.entity_name})
    return {"items": items, "total": len(items)}
