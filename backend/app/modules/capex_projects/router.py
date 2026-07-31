"""Capex & Project Monitoring (Mod #51) — Finance Cycles.

Assurance over capital projects: AFE/budget control, cost-and-time overrun
tracking, capitalisation timing, competitive-quote governance and the
project-lifecycle controls (milestones, change orders, advances, retention,
CWIP tracing, PO splitting, cashflow and vendor performance).

Mounted at /api/modules/capex_projects. All rows are tenant-scoped.
"""
from datetime import date

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    CapexAFE, CostOverrun, ScheduleOverrun, CapitalisationTiming,
    QuoteGovernance, CwipTrace, MilestonePayment, ChangeOrder,
    ContractorAdvance, RetentionLd, IdleAbandonedCapex, CapexRoi,
    PoSplitting, ProjectCashflow, VendorPerformance,
)
from .schemas import (
    AfeCreate, AfeOut,
    CostOverrunCreate, CostOverrunOut,
    ScheduleOverrunCreate, ScheduleOverrunOut,
    CapitalisationTimingCreate, CapitalisationTimingOut,
    QuoteCreate, QuoteOut,
    CwipTraceCreate, CwipTraceOut,
    MilestonePaymentCreate, MilestonePaymentOut,
    ChangeOrderCreate, ChangeOrderOut,
    ContractorAdvanceCreate, ContractorAdvanceOut,
    RetentionLdCreate, RetentionLdOut,
    IdleCapexCreate, IdleCapexOut,
    CapexRoiCreate, CapexRoiOut,
    PoSplittingCreate, PoSplittingOut,
    CashflowCreate, CashflowOut,
    VendorPerfCreate, VendorPerfOut,
)

MANIFEST = {
    "name": "capex_projects",
    "title": "Capex & Project Monitoring",
    "description": "Assurance over capital projects: AFE/budget control, cost-and-time overrun tracking, capitalisation timing and competitive-quote governance.",
    "icon": "building",
    "group": "Treasury, Assets & Capital",
    "industry": "Manufacturing, Infra, Real Estate",
    "version": "1.0.0",
    "owner": "intern-51",
}

router = APIRouter()


def _days(planned: str | None, actual: str | None) -> int:
    if not planned or not actual:
        return 0
    try:
        return (date.fromisoformat(actual) - date.fromisoformat(planned)).days
    except ValueError:
        return 0


def _pct(a, b) -> float:
    try:
        fa, fb = float(a), float(b)
    except (TypeError, ValueError):
        return 0
    return round(fa / fb * 100, 2) if fb else 0


def _num(v) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0


# ─── 1. AFE / Budget Compliance ────────────────────────────────────

@router.get("/afes", response_model=list[AfeOut])
def list_afes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CapexAFE), current_user)
    return [AfeOut.model_validate(a) for a in q.order_by(CapexAFE.id.desc()).all()]


@router.post("/afes", response_model=AfeOut, status_code=201)
def create_afe(body: AfeCreate, current_user: CurrentUser, db: DbSession):
    obj = CapexAFE(
        **body.model_dump(),
        budget_pct=_pct(body.actual_spend, body.approved_afe),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return AfeOut.model_validate(obj)


@router.delete("/afes/{item_id}", status_code=204)
def delete_afe(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(CapexAFE).filter(CapexAFE.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "AFE not found")
    db.delete(obj)
    db.commit()


# ─── 2. Cost-Overrun Tracking ──────────────────────────────────────

@router.get("/cost-overruns", response_model=list[CostOverrunOut])
def list_cost_overruns(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CostOverrun), current_user)
    return [CostOverrunOut.model_validate(o) for o in q.order_by(CostOverrun.id.desc()).all()]


@router.post("/cost-overruns", response_model=CostOverrunOut, status_code=201)
def create_cost_overrun(body: CostOverrunCreate, current_user: CurrentUser, db: DbSession):
    overrun = round(_num(body.actual_cost) - _num(body.sanctioned_cost), 2)
    obj = CostOverrun(
        **body.model_dump(),
        overrun_amount=overrun,
        overrun_pct=_pct(overrun, body.sanctioned_cost),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CostOverrunOut.model_validate(obj)


@router.delete("/cost-overruns/{item_id}", status_code=204)
def delete_cost_overrun(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(CostOverrun).filter(CostOverrun.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Cost-overrun record not found")
    db.delete(obj)
    db.commit()


# ─── 3. Schedule / Time-Overrun ────────────────────────────────────

@router.get("/schedule-overruns", response_model=list[ScheduleOverrunOut])
def list_schedule_overruns(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ScheduleOverrun), current_user)
    return [ScheduleOverrunOut.model_validate(s) for s in q.order_by(ScheduleOverrun.id.desc()).all()]


@router.post("/schedule-overruns", response_model=ScheduleOverrunOut, status_code=201)
def create_schedule_overrun(body: ScheduleOverrunCreate, current_user: CurrentUser, db: DbSession):
    obj = ScheduleOverrun(
        **body.model_dump(),
        delay_days=_days(body.planned_date, body.actual_date),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ScheduleOverrunOut.model_validate(obj)


@router.delete("/schedule-overruns/{item_id}", status_code=204)
def delete_schedule_overrun(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(
        db.query(ScheduleOverrun).filter(ScheduleOverrun.id == item_id), current_user
    ).first()
    if not obj:
        raise HTTPException(404, "Schedule-overrun record not found")
    db.delete(obj)
    db.commit()


# ─── 4. Capitalisation Timing ──────────────────────────────────────

@router.get("/cap-timing", response_model=list[CapitalisationTimingOut])
def list_cap_timing(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CapitalisationTiming), current_user)
    return [CapitalisationTimingOut.model_validate(t) for t in q.order_by(CapitalisationTiming.id.desc()).all()]


@router.post("/cap-timing", response_model=CapitalisationTimingOut, status_code=201)
def create_cap_timing(body: CapitalisationTimingCreate, current_user: CurrentUser, db: DbSession):
    obj = CapitalisationTiming(
        **body.model_dump(),
        delay_days=_days(body.commissioning_date, body.capitalised_date),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CapitalisationTimingOut.model_validate(obj)


@router.delete("/cap-timing/{item_id}", status_code=204)
def delete_cap_timing(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(
        db.query(CapitalisationTiming).filter(CapitalisationTiming.id == item_id), current_user
    ).first()
    if not obj:
        raise HTTPException(404, "Capitalisation-timing record not found")
    db.delete(obj)
    db.commit()


# ─── 5. Competitive-Quote Governance ───────────────────────────────

@router.get("/quotes", response_model=list[QuoteOut])
def list_quotes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(QuoteGovernance), current_user)
    return [QuoteOut.model_validate(x) for x in q.order_by(QuoteGovernance.id.desc()).all()]


@router.post("/quotes", response_model=QuoteOut, status_code=201)
def create_quote(body: QuoteCreate, current_user: CurrentUser, db: DbSession):
    obj = QuoteGovernance(
        **body.model_dump(),
        gap_pct=_pct(_num(body.chosen_quote) - _num(body.best_quote), body.best_quote),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return QuoteOut.model_validate(obj)


@router.delete("/quotes/{item_id}", status_code=204)
def delete_quote(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(QuoteGovernance).filter(QuoteGovernance.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Quote record not found")
    db.delete(obj)
    db.commit()


# ─── 6. Capex-to-CWIP-to-FA Trace ──────────────────────────────────

@router.get("/cwip-trace", response_model=list[CwipTraceOut])
def list_cwip_trace(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CwipTrace), current_user)
    return [CwipTraceOut.model_validate(x) for x in q.order_by(CwipTrace.id.desc()).all()]


@router.post("/cwip-trace", response_model=CwipTraceOut, status_code=201)
def create_cwip_trace(body: CwipTraceCreate, current_user: CurrentUser, db: DbSession):
    obj = CwipTrace(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CwipTraceOut.model_validate(obj)


@router.delete("/cwip-trace/{item_id}", status_code=204)
def delete_cwip_trace(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(CwipTrace).filter(CwipTrace.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "CWIP trace record not found")
    db.delete(obj)
    db.commit()


# ─── 7. Milestone-Based Payment ────────────────────────────────────

@router.get("/milestones", response_model=list[MilestonePaymentOut])
def list_milestones(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MilestonePayment), current_user)
    return [MilestonePaymentOut.model_validate(m) for m in q.order_by(MilestonePayment.id.desc()).all()]


@router.post("/milestones", response_model=MilestonePaymentOut, status_code=201)
def create_milestone(body: MilestonePaymentCreate, current_user: CurrentUser, db: DbSession):
    obj = MilestonePayment(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return MilestonePaymentOut.model_validate(obj)


@router.delete("/milestones/{item_id}", status_code=204)
def delete_milestone(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(MilestonePayment).filter(MilestonePayment.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Milestone record not found")
    db.delete(obj)
    db.commit()


# ─── 8. Change-Order Control ───────────────────────────────────────

@router.get("/change-orders", response_model=list[ChangeOrderOut])
def list_change_orders(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ChangeOrder), current_user)
    return [ChangeOrderOut.model_validate(c) for c in q.order_by(ChangeOrder.id.desc()).all()]


@router.post("/change-orders", response_model=ChangeOrderOut, status_code=201)
def create_change_order(body: ChangeOrderCreate, current_user: CurrentUser, db: DbSession):
    obj = ChangeOrder(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ChangeOrderOut.model_validate(obj)


@router.delete("/change-orders/{item_id}", status_code=204)
def delete_change_order(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(ChangeOrder).filter(ChangeOrder.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Change-order record not found")
    db.delete(obj)
    db.commit()


# ─── 9. Contractor Advance Recovery ────────────────────────────────

@router.get("/advances", response_model=list[ContractorAdvanceOut])
def list_advances(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ContractorAdvance), current_user)
    return [ContractorAdvanceOut.model_validate(a) for a in q.order_by(ContractorAdvance.id.desc()).all()]


@router.post("/advances", response_model=ContractorAdvanceOut, status_code=201)
def create_advance(body: ContractorAdvanceCreate, current_user: CurrentUser, db: DbSession):
    obj = ContractorAdvance(
        **body.model_dump(),
        balance_amount=round(_num(body.advance_amount) - _num(body.recovered_amount), 2),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return ContractorAdvanceOut.model_validate(obj)


@router.delete("/advances/{item_id}", status_code=204)
def delete_advance(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(ContractorAdvance).filter(ContractorAdvance.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Advance record not found")
    db.delete(obj)
    db.commit()


# ─── 10. Retention & LD Management ─────────────────────────────────

@router.get("/retention-ld", response_model=list[RetentionLdOut])
def list_retention_ld(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RetentionLd), current_user)
    return [RetentionLdOut.model_validate(r) for r in q.order_by(RetentionLd.id.desc()).all()]


@router.post("/retention-ld", response_model=RetentionLdOut, status_code=201)
def create_retention_ld(body: RetentionLdCreate, current_user: CurrentUser, db: DbSession):
    obj = RetentionLd(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return RetentionLdOut.model_validate(obj)


@router.delete("/retention-ld/{item_id}", status_code=204)
def delete_retention_ld(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(RetentionLd).filter(RetentionLd.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Retention/LD record not found")
    db.delete(obj)
    db.commit()


# ─── 11. Idle / Abandoned Capex ────────────────────────────────────

@router.get("/idle-capex", response_model=list[IdleCapexOut])
def list_idle_capex(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(IdleAbandonedCapex), current_user)
    return [IdleCapexOut.model_validate(x) for x in q.order_by(IdleAbandonedCapex.id.desc()).all()]


@router.post("/idle-capex", response_model=IdleCapexOut, status_code=201)
def create_idle_capex(body: IdleCapexCreate, current_user: CurrentUser, db: DbSession):
    obj = IdleAbandonedCapex(
        **body.model_dump(),
        idle_days=_days(body.last_activity_date, date.today().isoformat()),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return IdleCapexOut.model_validate(obj)


@router.delete("/idle-capex/{item_id}", status_code=204)
def delete_idle_capex(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(
        db.query(IdleAbandonedCapex).filter(IdleAbandonedCapex.id == item_id), current_user
    ).first()
    if not obj:
        raise HTTPException(404, "Idle-capex record not found")
    db.delete(obj)
    db.commit()


# ─── 12. Capex ROI / Post-Completion ───────────────────────────────

@router.get("/roi", response_model=list[CapexRoiOut])
def list_roi(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(CapexRoi), current_user)
    return [CapexRoiOut.model_validate(r) for r in q.order_by(CapexRoi.id.desc()).all()]


@router.post("/roi", response_model=CapexRoiOut, status_code=201)
def create_roi(body: CapexRoiCreate, current_user: CurrentUser, db: DbSession):
    obj = CapexRoi(
        **body.model_dump(),
        roi_pct=_pct(_num(body.benefits_realised) - _num(body.capex_amount), body.capex_amount),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CapexRoiOut.model_validate(obj)


@router.delete("/roi/{item_id}", status_code=204)
def delete_roi(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(CapexRoi).filter(CapexRoi.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "ROI record not found")
    db.delete(obj)
    db.commit()


# ─── 13. Multiple-PO Splitting ─────────────────────────────────────

@router.get("/po-splitting", response_model=list[PoSplittingOut])
def list_po_splitting(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(PoSplitting), current_user)
    return [PoSplittingOut.model_validate(p) for p in q.order_by(PoSplitting.id.desc()).all()]


@router.post("/po-splitting", response_model=PoSplittingOut, status_code=201)
def create_po_splitting(body: PoSplittingCreate, current_user: CurrentUser, db: DbSession):
    obj = PoSplitting(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return PoSplittingOut.model_validate(obj)


@router.delete("/po-splitting/{item_id}", status_code=204)
def delete_po_splitting(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(PoSplitting).filter(PoSplitting.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "PO-splitting record not found")
    db.delete(obj)
    db.commit()


# ─── 14. Project Cash-Flow Monitoring ──────────────────────────────

@router.get("/cashflow", response_model=list[CashflowOut])
def list_cashflow(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ProjectCashflow), current_user)
    return [CashflowOut.model_validate(c) for c in q.order_by(ProjectCashflow.id.desc()).all()]


@router.post("/cashflow", response_model=CashflowOut, status_code=201)
def create_cashflow(body: CashflowCreate, current_user: CurrentUser, db: DbSession):
    obj = ProjectCashflow(
        **body.model_dump(),
        variance=round(_num(body.actual_amount) - _num(body.planned_amount), 2),
        tenant_id=current_user.tenant_id,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return CashflowOut.model_validate(obj)


@router.delete("/cashflow/{item_id}", status_code=204)
def delete_cashflow(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(db.query(ProjectCashflow).filter(ProjectCashflow.id == item_id), current_user).first()
    if not obj:
        raise HTTPException(404, "Cash-flow record not found")
    db.delete(obj)
    db.commit()


# ─── 15. Vendor Performance on Projects ────────────────────────────

@router.get("/vendor-perf", response_model=list[VendorPerfOut])
def list_vendor_perf(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(VendorPerformance), current_user)
    return [VendorPerfOut.model_validate(v) for v in q.order_by(VendorPerformance.id.desc()).all()]


@router.post("/vendor-perf", response_model=VendorPerfOut, status_code=201)
def create_vendor_perf(body: VendorPerfCreate, current_user: CurrentUser, db: DbSession):
    obj = VendorPerformance(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return VendorPerfOut.model_validate(obj)


@router.delete("/vendor-perf/{item_id}", status_code=204)
def delete_vendor_perf(item_id: int, current_user: CurrentUser, db: DbSession):
    obj = tenant_scoped(
        db.query(VendorPerformance).filter(VendorPerformance.id == item_id), current_user
    ).first()
    if not obj:
        raise HTTPException(404, "Vendor-performance record not found")
    db.delete(obj)
    db.commit()


# ─── 16. Module Dashboard & KPIs ───────────────────────────────────

@router.get("/dashboard")
def module_dashboard(current_user: CurrentUser, db: DbSession):
    afes = tenant_scoped(db.query(CapexAFE), current_user).all()
    cost_overruns = tenant_scoped(db.query(CostOverrun), current_user).all()
    schedule_overruns = tenant_scoped(db.query(ScheduleOverrun), current_user).all()
    cap_timing = tenant_scoped(db.query(CapitalisationTiming), current_user).all()
    idle = tenant_scoped(db.query(IdleAbandonedCapex), current_user).all()
    splits = tenant_scoped(db.query(PoSplitting), current_user).all()
    advances = tenant_scoped(db.query(ContractorAdvance), current_user).all()

    projects = {a.project_name for a in afes}
    for c in cost_overruns + schedule_overruns + cap_timing + idle + splits:
        projects.add(c.project_name)

    total_capex = sum(_num(a.approved_afe) for a in afes)
    actual_spend = sum(_num(a.actual_spend) for a in afes)
    open_advances = sum(_num(a.balance_amount) for a in advances if a.status == "open")

    return {
        "total_projects": len(projects),
        "open_afes": sum(1 for a in afes if a.status in ("open", "in_progress")),
        "total_capex": round(total_capex, 2),
        "actual_spend": round(actual_spend, 2),
        "budget_pct": _pct(actual_spend, total_capex),
        "cost_overruns": sum(1 for o in cost_overruns if o.status == "open"),
        "schedule_delays": sum(1 for s in schedule_overruns if _num(s.delay_days) > 0),
        "capitalisation_delays": sum(1 for t in cap_timing if _num(t.delay_days) > 0),
        "idle_abandoned": len(idle),
        "flagged_splits": sum(1 for p in splits if p.flagged == "yes"),
        "open_advances": round(open_advances, 2),
    }


# ─── 17. Scope & Audit Universe ────────────────────────────────────

@router.get("/scope")
def scope_audit_universe(current_user: CurrentUser, db: DbSession):
    tables = [
        ("AFE Register", CapexAFE, "afe_no"),
        ("Cost Overruns", CostOverrun, "project_name"),
        ("Schedule Overruns", ScheduleOverrun, "project_name"),
        ("Capitalisation Timing", CapitalisationTiming, "project_name"),
        ("Quote Governance", QuoteGovernance, "project_name"),
        ("CWIP Trace", CwipTrace, "project_name"),
        ("Milestone Payments", MilestonePayment, "project_name"),
        ("Change Orders", ChangeOrder, "project_name"),
        ("Contractor Advances", ContractorAdvance, "project_name"),
        ("Retention & LD", RetentionLd, "project_name"),
        ("Idle / Abandoned Capex", IdleAbandonedCapex, "project_name"),
        ("Capex ROI", CapexRoi, "project_name"),
        ("PO Splitting", PoSplitting, "project_name"),
        ("Project Cash-flow", ProjectCashflow, "project_name"),
        ("Vendor Performance", VendorPerformance, "project_name"),
    ]
    projects: set[str] = set()
    units = []
    for name, model, ref in tables:
        rows = tenant_scoped(db.query(model), current_user).all()
        projects.update(getattr(r, "project_name") for r in rows if getattr(r, "project_name", ""))
        units.append({"name": name, "records": len(rows)})
    return {
        "module_name": "Capex & Project Monitoring",
        "projects": sorted(p for p in projects if p),
        "units": sorted(units, key=lambda u: -u["records"]),
    }


# ─── 18. Risk & Control Matrix (RCM) ───────────────────────────────

@router.get("/rcm")
def risk_control_matrix(current_user: CurrentUser, db: DbSession):
    return {
        "risks": [
            {"id": "R1", "risk": "Actual spend exceeds approved AFE without re-authorisation", "assertion": "Completeness / Accuracy", "control": "Budget-vs-actual variance report + AFE approval gating"},
            {"id": "R2", "risk": "Cost overruns materialise undetected", "assertion": "Accuracy / Valuation", "control": "Cost-overrun tracker vs sanctioned cost"},
            {"id": "R3", "risk": "Project delays cause liquidated-damage exposure and idle funds", "assertion": "Timeliness", "control": "Schedule-overrun dashboard + LD clause monitoring"},
            {"id": "R4", "risk": "Capitalisation delayed, CWIP parked, asset base misstated", "assertion": "Valuation / Classification", "control": "Commissioning-vs-capitalisation date reconciliation"},
            {"id": "R5", "risk": "AFE / PO splitting to evade approval threshold", "assertion": "Completeness", "control": "PO-split detection analytics rule"},
            {"id": "R6", "risk": "Mobilisation advances not recovered from contractors", "assertion": "Valuation", "control": "Advance-recovery schedule vs RA bills"},
            {"id": "R7", "risk": "Payments released ahead of certified progress", "assertion": "Valuation", "control": "Milestone payment vs progress % matching"},
            {"id": "R8", "risk": "Change orders executed without scope-change approval", "assertion": "Existence / Occurrence", "control": "Change-order approval workflow"},
        ],
        "controls": 8,
    }


# ─── 19. Test & Analytics Rule Library ─────────────────────────────

@router.get("/analytics-rules")
def analytics_rules(current_user: CurrentUser, db: DbSession):
    return {
        "rules": [
            {"id": "AR1", "rule": "AFE actual spend > approved AFE (budget breach)", "threshold": "budget_pct > 100", "action": "Flag AFE for over-budget review"},
            {"id": "AR2", "rule": "Cost overrun beyond tolerance", "threshold": "overrun_pct > 10", "action": "Escalate to capital committee"},
            {"id": "AR3", "rule": "Schedule slippage vs plan", "threshold": "delay_days > 60", "action": "Flag delay and LD exposure"},
            {"id": "AR4", "rule": "Capitalisation delayed post-commissioning", "threshold": "delay_days > 90", "action": "Review CWIP classification"},
            {"id": "AR5", "rule": "PO splitting to evade approval", "threshold": "po_total > threshold AND po_count > 3", "action": "Flag as approval-evasion risk"},
            {"id": "AR6", "rule": "Idle / abandoned capex", "threshold": "idle_days > 180", "action": "Trigger impairment review"},
            {"id": "AR7", "rule": "Milestone payment vs progress mismatch", "threshold": "paid/scheduled > progress + 10%", "action": "Hold payment pending certification"},
            {"id": "AR8", "rule": "Chosen quote above best quote", "threshold": "gap_pct > 15", "action": "Re-test competitive-quote governance"},
        ],
        "total_rules": 8,
    }


# ─── 20. Data Source & Connector Setup ─────────────────────────────

@router.get("/data-sources")
def data_sources(current_user: CurrentUser, db: DbSession):
    return {
        "sources": [
            {"name": "ERP — AFE / Project Master", "type": "table", "entity": "afes, projects", "purpose": "Approved capex budgets"},
            {"name": "ERP — Budget & Actuals (WBS)", "type": "table", "entity": "cost_overruns", "purpose": "Cost variance vs sanction"},
            {"name": "ERP — PO / GRN Register", "type": "table", "entity": "po_splitting", "purpose": "PO-splitting detection"},
            {"name": "ERP — Fixed Asset Register / CWIP", "type": "table", "entity": "cwip_trace, cap_timing", "purpose": "Capitalisation timing trace"},
            {"name": "Project Plans & RA Certificates", "type": "upload", "entity": "schedule_overruns, milestones", "purpose": "Milestone progress evidence"},
            {"name": "Contractor Bills / Bank Statements", "type": "upload", "entity": "advances, retention_ld", "purpose": "Advance recovery & LD verification"},
        ],
        "total_sources": 6,
    }


# ─── 21. Sampling & Population Builder ─────────────────────────────

@router.get("/sampling")
def sampling(current_user: CurrentUser, db: DbSession):
    afes = tenant_scoped(db.query(CapexAFE), current_user).all()
    population = [
        {"afe_no": a.afe_no, "project_name": a.project_name, "amount": float(a.approved_afe)}
        for a in afes
    ]
    return {
        "population_size": len(population),
        "sample_method": "judgemental",
        "sample_size": min(len(population), 25),
        "population": population,
    }


# ─── 22. Exception & Red-Flag Queue ────────────────────────────────

@router.get("/exceptions")
def exceptions_queue(current_user: CurrentUser, db: DbSession):
    afes = tenant_scoped(db.query(CapexAFE), current_user).all()
    cost_overruns = tenant_scoped(db.query(CostOverrun), current_user).all()
    schedule_overruns = tenant_scoped(db.query(ScheduleOverrun), current_user).all()
    cap_timing = tenant_scoped(db.query(CapitalisationTiming), current_user).all()
    idle = tenant_scoped(db.query(IdleAbandonedCapex), current_user).all()
    splits = tenant_scoped(db.query(PoSplitting), current_user).all()

    exc = []
    for a in afes:
        if _num(a.budget_pct) > 100:
            exc.append({"type": "budget_breach", "ref": a.afe_no, "detail": f"Actual is {a.budget_pct}% of approved AFE"})
    for o in cost_overruns:
        if _num(o.overrun_amount) > 0:
            exc.append({"type": "cost_overrun", "ref": o.project_name, "detail": f"Overrun {o.overrun_amount} ({o.overrun_pct}%)"})
    for s in schedule_overruns:
        if _num(s.delay_days) > 0:
            exc.append({"type": "schedule_delay", "ref": s.project_name, "detail": f"Delay {s.delay_days} days vs plan"})
    for t in cap_timing:
        if _num(t.delay_days) > 0:
            exc.append({"type": "cap_timing", "ref": t.project_name, "detail": f"Capitalisation delayed {t.delay_days} days"})
    for x in idle:
        exc.append({"type": "idle_capex", "ref": x.project_name, "detail": f"{x.status} — {x.idle_days} days idle"})
    for p in splits:
        if p.flagged == "yes":
            exc.append({"type": "po_splitting", "ref": p.project_name, "detail": f"{p.po_count} POs totalling {p.po_total} vs threshold {p.approval_threshold}"})

    return {"exceptions": exc, "total": len(exc)}


# ─── 23. Working Papers & Evidence ─────────────────────────────────

@router.get("/working-papers")
def working_papers(current_user: CurrentUser, db: DbSession):
    sources = [
        ("AFE", CapexAFE, "afe_no"),
        ("Cost Overrun", CostOverrun, "project_name"),
        ("Schedule Overrun", ScheduleOverrun, "project_name"),
        ("Capitalisation", CapitalisationTiming, "project_name"),
        ("Quote", QuoteGovernance, "project_name"),
        ("Milestone", MilestonePayment, "project_name"),
        ("Change Order", ChangeOrder, "project_name"),
        ("Advance", ContractorAdvance, "project_name"),
        ("Idle Capex", IdleAbandonedCapex, "project_name"),
        ("ROI", CapexRoi, "project_name"),
        ("PO Split", PoSplitting, "project_name"),
    ]
    papers = []
    for name, model, ref in sources:
        for r in tenant_scoped(db.query(model), current_user).all():
            papers.append({"id": r.id, "table": name, "ref": getattr(r, ref), "status": r.status})
    return {"papers": papers, "total": len(papers)}


# ─── 24. Observation & Finding Log ─────────────────────────────────

@router.get("/findings")
def findings_log(current_user: CurrentUser, db: DbSession):
    cost_overruns = tenant_scoped(db.query(CostOverrun), current_user).all()
    schedule_overruns = tenant_scoped(db.query(ScheduleOverrun), current_user).all()
    cap_timing = tenant_scoped(db.query(CapitalisationTiming), current_user).all()
    idle = tenant_scoped(db.query(IdleAbandonedCapex), current_user).all()
    splits = tenant_scoped(db.query(PoSplitting), current_user).all()
    change_orders = tenant_scoped(db.query(ChangeOrder), current_user).all()

    findings = []
    for o in cost_overruns:
        if _num(o.overrun_amount) > 0:
            findings.append({"type": "cost_overrun", "ref": o.project_name, "severity": "high" if _num(o.overrun_pct) > 10 else "medium", "detail": f"Actual {o.actual_cost} vs sanctioned {o.sanctioned_cost}"})
    for s in schedule_overruns:
        if _num(s.delay_days) > 0:
            findings.append({"type": "schedule_delay", "ref": s.project_name, "severity": "high" if _num(s.delay_days) > 60 else "medium", "detail": f"{s.delay_days} days delay on {s.milestone or 'milestone'}"})
    for t in cap_timing:
        if _num(t.delay_days) > 0:
            findings.append({"type": "cap_timing", "ref": t.project_name, "severity": "medium", "detail": f"Capitalised {t.delay_days} days after commissioning"})
    for x in idle:
        findings.append({"type": "idle_abandoned", "ref": x.project_name, "severity": "high", "detail": f"{x.status} capex {x.capex_amount} for {x.idle_days} days"})
    for p in splits:
        if p.flagged == "yes":
            findings.append({"type": "po_splitting", "ref": p.project_name, "severity": "high", "detail": f"{p.po_count} POs split to stay under {p.approval_threshold}"})
    for c in change_orders:
        if c.approved != "yes":
            findings.append({"type": "unapproved_change", "ref": c.project_name, "severity": "medium", "detail": c.change_desc})

    return {"findings": findings, "total": len(findings)}


# ─── 25. Remediation / Action Tracker ──────────────────────────────

@router.get("/remediation")
def remediation_tracker(current_user: CurrentUser, db: DbSession):
    cost_overruns = tenant_scoped(db.query(CostOverrun), current_user).all()
    schedule_overruns = tenant_scoped(db.query(ScheduleOverrun), current_user).all()
    cap_timing = tenant_scoped(db.query(CapitalisationTiming), current_user).all()
    idle = tenant_scoped(db.query(IdleAbandonedCapex), current_user).all()
    splits = tenant_scoped(db.query(PoSplitting), current_user).all()
    change_orders = tenant_scoped(db.query(ChangeOrder), current_user).all()
    advances = tenant_scoped(db.query(ContractorAdvance), current_user).all()

    items = []
    for o in cost_overruns:
        if _num(o.overrun_amount) > 0:
            items.append({"ref": o.project_name, "action": "Re-sanction over-budget amount or cut scope", "owner": "Project Finance", "status": "open"})
    for s in schedule_overruns:
        if _num(s.delay_days) > 0:
            items.append({"ref": s.project_name, "action": "Recover LD and update recovery plan", "owner": "Projects Head", "status": "open"})
    for t in cap_timing:
        if _num(t.delay_days) > 0:
            items.append({"ref": t.project_name, "action": "Capitalise assets and reclassify CWIP", "owner": "Fixed Assets", "status": "open"})
    for x in idle:
        items.append({"ref": x.project_name, "action": "Impairment review or restart decision", "owner": "Finance Controller", "status": "open"})
    for p in splits:
        if p.flagged == "yes":
            items.append({"ref": p.project_name, "action": "Investigate PO-splitting and strengthen approval controls", "owner": "Procurement", "status": "open"})
    for c in change_orders:
        if c.approved != "yes":
            items.append({"ref": c.project_name, "action": "Obtain change-order approval or stop work", "owner": "Project Manager", "status": "open"})
    for a in advances:
        if _num(a.balance_amount) > 0:
            items.append({"ref": a.contractor, "action": "Recover mobilisation advance from running bills", "owner": "Contracts", "status": "open"})

    return {"items": items, "total": len(items)}
