"""Budgeting & Variance Analysis module.

Reviews the budgeting process and variances: pre-approval timing, chronic
overspend heads, re-budget governance and assumption reasonableness.

Mounted automatically at /api/modules/budgeting_variance.

Implements the 25 use cases from the module's use-case catalog:
  - 15 Signature analytics tests (catalog codes below), tracked as
    BudgetingVarianceRun records so each test can be executed, scoped,
    risk-rated and re-run over time.
  - 10 Shell (generic audit-lifecycle) sections: dashboard/KPIs, scope,
    RCM, rule library, data sources, sampling, exceptions, working
    papers, findings and remediation tracking.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    BudgetingVarianceAction,
    BudgetingVarianceDataSource,
    BudgetingVarianceEvidence,
    BudgetingVarianceException,
    BudgetingVarianceFinding,
    BudgetingVarianceRcmEntry,
    BudgetingVarianceRun,
    BudgetingVarianceSample,
)
from .schemas import (
    ActionCreate,
    ActionOut,
    ActionUpdate,
    CatalogEntry,
    DashboardOut,
    DataSourceCreate,
    DataSourceOut,
    EvidenceCreate,
    EvidenceOut,
    ExceptionCreate,
    ExceptionOut,
    ExceptionUpdate,
    FindingCreate,
    FindingOut,
    FindingUpdate,
    RcmCreate,
    RcmOut,
    RunCreate,
    RunOut,
    RunUpdate,
    SampleCreate,
    SampleOut,
)

MANIFEST = {
    "name": "budgeting_variance",
    "title": "Budgeting & Variance Analysis",
    "description": (
        "Reviews the budgeting process and variances: pre-approval timing, "
        "chronic overspend heads, re-budget governance and assumption "
        "reasonableness."
    ),
    "icon": "wallet",
    "group": "Finance & Close",
    "industry": "All industries",
    "version": "0.1.0",
    "owner": "unassigned",
}

router = APIRouter()

# ---------------------------------------------------------------------------
# 1-15: Signature test catalog (fixed metadata, not stored in the DB)
# ---------------------------------------------------------------------------

SIGNATURE_CATALOG: list[CatalogEntry] = [
    CatalogEntry(code="budget_vs_actual", seq=1, title="Budget vs Actual by Head", kind="signature", description="Significant variance analysis"),
    CatalogEntry(code="pre_approval_timing", seq=2, title="Pre-Approval Timing", kind="signature", description="Budgets approved before period start"),
    CatalogEntry(code="chronic_overspend", seq=3, title="Chronic Overspend Heads", kind="signature", description="Consistently exceeded line items"),
    CatalogEntry(code="rebudget_revision_control", seq=4, title="Re-budget / Revision Control", kind="signature", description="Approval of budget revisions"),
    CatalogEntry(code="assumption_reasonableness", seq=5, title="Assumption Reasonableness", kind="signature", description="Test drivers behind budgets"),
    CatalogEntry(code="flash_vs_final_variance", seq=6, title="Flash vs Final Variance", kind="signature", description="In-month forecast accuracy"),
    CatalogEntry(code="rolling_forecast_review", seq=7, title="Rolling Forecast Review", kind="signature", description="Forecast update discipline"),
    CatalogEntry(code="zero_based_budget_support", seq=8, title="Zero-Based Budget Support", kind="signature", description="Justification for ZBB lines"),
    CatalogEntry(code="capex_budget_utilisation", seq=9, title="Capex Budget Utilisation", kind="signature", description="Capex plan vs spend"),
    CatalogEntry(code="departmental_scorecard", seq=10, title="Departmental Scorecard", kind="signature", description="Budget discipline by owner"),
    CatalogEntry(code="unspent_parked_budget", seq=11, title="Unspent / Parked Budget", kind="signature", description="Year-end spend-it-or-lose-it spikes"),
    CatalogEntry(code="cost_driver_trend", seq=12, title="Cost-Driver Trend", kind="signature", description="Volume vs price variance split"),
    CatalogEntry(code="contingency_reserve_use", seq=13, title="Contingency & Reserve Use", kind="signature", description="Approval for contingency draws"),
    CatalogEntry(code="forecast_to_actual_bias", seq=14, title="Forecast-to-Actual Bias", kind="signature", description="Systematic over/under-forecasting"),
    CatalogEntry(code="budget_approval_audit_trail", seq=15, title="Budget Approval Audit Trail", kind="signature", description="Who approved what, when"),
]

SHELL_CATALOG: list[CatalogEntry] = [
    CatalogEntry(code="dashboard", seq=16, title="Module Dashboard & KPIs", kind="shell", description="Live risk score, open exceptions, coverage % and trend for this domain"),
    CatalogEntry(code="scope", seq=17, title="Scope & Audit Universe", kind="shell", description="Define the auditable units/entities/processes in scope for this module"),
    CatalogEntry(code="rcm", seq=18, title="Risk & Control Matrix (RCM)", kind="shell", description="Catalogue risks, controls, assertions and control owners for the domain"),
    CatalogEntry(code="rule_library", seq=19, title="Test & Analytics Rule Library", kind="shell", description="Configure automated red-flag rules, thresholds and CAAT scripts"),
    CatalogEntry(code="data_sources", seq=20, title="Data Source & Connector Setup", kind="shell", description="Map ERP tables/APIs/uploads that feed this module's analytics"),
    CatalogEntry(code="sampling", seq=21, title="Sampling & Population Builder", kind="shell", description="Draw statistical or judgemental samples from the full population"),
    CatalogEntry(code="exceptions", seq=22, title="Exception & Red-Flag Queue", kind="shell", description="Triage system-generated exceptions with disposition and notes"),
    CatalogEntry(code="evidence", seq=23, title="Working Papers & Evidence", kind="shell", description="Attach evidence, tick-marks, screenshots and reviewer sign-off"),
    CatalogEntry(code="findings", seq=24, title="Observation & Finding Log", kind="shell", description="Raise, grade, and route findings specific to this domain"),
    CatalogEntry(code="actions", seq=25, title="Remediation / Action Tracker", kind="shell", description="Track CAPA items, owners, due dates and re-testing status"),
]

FULL_CATALOG = SIGNATURE_CATALOG + SHELL_CATALOG
_VALID_TEST_CODES = {c.code for c in SIGNATURE_CATALOG}


@router.get("/catalog", response_model=list[CatalogEntry])
def get_catalog():
    """The fixed list of 25 use cases (15 Signature tests + 10 Shell sections)."""
    return FULL_CATALOG


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(current_user: CurrentUser, db: DbSession):
    runs = tenant_scoped(db.query(BudgetingVarianceRun), current_user).all()
    exceptions = tenant_scoped(db.query(BudgetingVarianceException), current_user).all()
    findings = tenant_scoped(db.query(BudgetingVarianceFinding), current_user).all()

    tested_codes = {r.test_code for r in runs}
    total = len(SIGNATURE_CATALOG)
    covered = len(tested_codes & _VALID_TEST_CODES)

    return DashboardOut(
        total_runs=len(runs),
        open_exceptions=sum(1 for e in exceptions if e.disposition == "pending"),
        open_findings=sum(1 for f in findings if f.status != "closed"),
        high_risk_runs=sum(1 for r in runs if r.risk_rating == "high"),
        coverage_pct=round((covered / total) * 100, 1) if total else 0.0,
        signature_tests_covered=covered,
        signature_tests_total=total,
    )


@router.get("/runs", response_model=list[RunOut])
def list_runs(current_user: CurrentUser, db: DbSession, test_code: str | None = None):
    q = tenant_scoped(db.query(BudgetingVarianceRun), current_user)
    if test_code:
        q = q.filter(BudgetingVarianceRun.test_code == test_code)
    return [RunOut.model_validate(r) for r in q.order_by(BudgetingVarianceRun.id.desc()).all()]


@router.post("/runs", response_model=RunOut, status_code=201)
def create_run(body: RunCreate, current_user: CurrentUser, db: DbSession):
    if body.test_code not in _VALID_TEST_CODES:
        raise HTTPException(422, f"Unknown test_code '{body.test_code}'")
    run = BudgetingVarianceRun(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(run)
    db.commit()
    db.refresh(run)
    return RunOut.model_validate(run)


@router.patch("/runs/{run_id}", response_model=RunOut)
def update_run(run_id: int, body: RunUpdate, current_user: CurrentUser, db: DbSession):
    run = tenant_scoped(
        db.query(BudgetingVarianceRun).filter(BudgetingVarianceRun.id == run_id), current_user
    ).first()
    if not run:
        raise HTTPException(404, "Run not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(run, k, v)
    db.commit()
    db.refresh(run)
    return RunOut.model_validate(run)


@router.delete("/runs/{run_id}", status_code=204)
def delete_run(run_id: int, current_user: CurrentUser, db: DbSession):
    run = tenant_scoped(
        db.query(BudgetingVarianceRun).filter(BudgetingVarianceRun.id == run_id), current_user
    ).first()
    if not run:
        raise HTTPException(404, "Run not found")
    db.delete(run)
    db.commit()


@router.get("/rcm", response_model=list[RcmOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceRcmEntry), current_user)
    return [RcmOut.model_validate(r) for r in q.order_by(BudgetingVarianceRcmEntry.id.desc()).all()]


@router.post("/rcm", response_model=RcmOut, status_code=201)
def create_rcm(body: RcmCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceRcmEntry(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return RcmOut.model_validate(row)


@router.delete("/rcm/{row_id}", status_code=204)
def delete_rcm(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceRcmEntry).filter(BudgetingVarianceRcmEntry.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "RCM row not found")
    db.delete(row)
    db.commit()


@router.get("/rule-library", response_model=list[CatalogEntry])
def get_rule_library():
    return SIGNATURE_CATALOG


@router.get("/data-sources", response_model=list[DataSourceOut])
def list_data_sources(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceDataSource), current_user)
    return [DataSourceOut.model_validate(d) for d in q.order_by(BudgetingVarianceDataSource.id.desc()).all()]


@router.post("/data-sources", response_model=DataSourceOut, status_code=201)
def create_data_source(body: DataSourceCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceDataSource(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return DataSourceOut.model_validate(row)


@router.delete("/data-sources/{row_id}", status_code=204)
def delete_data_source(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceDataSource).filter(BudgetingVarianceDataSource.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Data source not found")
    db.delete(row)
    db.commit()


@router.get("/samples", response_model=list[SampleOut])
def list_samples(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceSample), current_user)
    return [SampleOut.model_validate(s) for s in q.order_by(BudgetingVarianceSample.id.desc()).all()]


@router.post("/samples", response_model=SampleOut, status_code=201)
def create_sample(body: SampleCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceSample(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return SampleOut.model_validate(row)


@router.delete("/samples/{row_id}", status_code=204)
def delete_sample(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceSample).filter(BudgetingVarianceSample.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Sample not found")
    db.delete(row)
    db.commit()


@router.get("/exceptions", response_model=list[ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceException), current_user)
    return [ExceptionOut.model_validate(e) for e in q.order_by(BudgetingVarianceException.id.desc()).all()]


@router.post("/exceptions", response_model=ExceptionOut, status_code=201)
def create_exception(body: ExceptionCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceException(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ExceptionOut.model_validate(row)


@router.patch("/exceptions/{row_id}", response_model=ExceptionOut)
def update_exception(row_id: int, body: ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceException).filter(BudgetingVarianceException.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Exception not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return ExceptionOut.model_validate(row)


@router.delete("/exceptions/{row_id}", status_code=204)
def delete_exception(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceException).filter(BudgetingVarianceException.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Exception not found")
    db.delete(row)
    db.commit()


@router.get("/evidence", response_model=list[EvidenceOut])
def list_evidence(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceEvidence), current_user)
    return [EvidenceOut.model_validate(e) for e in q.order_by(BudgetingVarianceEvidence.id.desc()).all()]


@router.post("/evidence", response_model=EvidenceOut, status_code=201)
def create_evidence(body: EvidenceCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceEvidence(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return EvidenceOut.model_validate(row)


@router.delete("/evidence/{row_id}", status_code=204)
def delete_evidence(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceEvidence).filter(BudgetingVarianceEvidence.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Evidence not found")
    db.delete(row)
    db.commit()


@router.get("/findings", response_model=list[FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceFinding), current_user)
    return [FindingOut.model_validate(f) for f in q.order_by(BudgetingVarianceFinding.id.desc()).all()]


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(body: FindingCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceFinding(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return FindingOut.model_validate(row)


@router.patch("/findings/{row_id}", response_model=FindingOut)
def update_finding(row_id: int, body: FindingUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceFinding).filter(BudgetingVarianceFinding.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Finding not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return FindingOut.model_validate(row)


@router.delete("/findings/{row_id}", status_code=204)
def delete_finding(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceFinding).filter(BudgetingVarianceFinding.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Finding not found")
    db.delete(row)
    db.commit()


@router.get("/actions", response_model=list[ActionOut])
def list_actions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BudgetingVarianceAction), current_user)
    return [ActionOut.model_validate(a) for a in q.order_by(BudgetingVarianceAction.id.desc()).all()]


@router.post("/actions", response_model=ActionOut, status_code=201)
def create_action(body: ActionCreate, current_user: CurrentUser, db: DbSession):
    row = BudgetingVarianceAction(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ActionOut.model_validate(row)


@router.patch("/actions/{row_id}", response_model=ActionOut)
def update_action(row_id: int, body: ActionUpdate, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceAction).filter(BudgetingVarianceAction.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Action not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return ActionOut.model_validate(row)


@router.delete("/actions/{row_id}", status_code=204)
def delete_action(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(BudgetingVarianceAction).filter(BudgetingVarianceAction.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "Action not found")
    db.delete(row)
    db.commit()
