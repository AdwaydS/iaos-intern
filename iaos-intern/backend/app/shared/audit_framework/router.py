"""Shared audit-framework API.

NOT auto-mounted like a module — this is platform infrastructure, so it
needs an explicit `app.include_router(...)` in main.py. Suggested mount
point: /api/framework (see note at bottom of this file).

Every endpoint takes `module_key` as a query parameter so any module
(utilities_energy, or whatever comes next) can read/write its own slice
of scope units, RCM entries, rules, data sources, samples, working
papers, findings, and remediation items — all still isolated by tenant.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession

from .models import (
    DataSourceConnector,
    Finding,
    RcmEntry,
    RemediationItem,
    SampleItem,
    SamplePlan,
    ScopeUnit,
    TestRule,
    WorkingPaper,
    module_scoped,
)
from .registry import get_providers, registered_module_keys
from .schemas import (
    DataSourceCreate,
    DataSourceOut,
    FindingCreate,
    FindingOut,
    FindingUpdate,
    GenericExceptionOut,
    ModuleSummaryOut,
    RcmEntryCreate,
    RcmEntryOut,
    RemediationItemCreate,
    RemediationItemOut,
    RemediationItemUpdate,
    SampleItemCreate,
    SampleItemOut,
    SamplePlanCreate,
    SamplePlanOut,
    ScopeUnitCreate,
    ScopeUnitOut,
    TestRuleCreate,
    TestRuleOut,
    WorkingPaperCreate,
    WorkingPaperOut,
    WorkingPaperReview,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# 17. Scope & Audit Universe
# ---------------------------------------------------------------------------


@router.get("/scope", response_model=list[ScopeUnitOut])
def list_scope_units(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(ScopeUnit), current_user, module_key)
    return [ScopeUnitOut.model_validate(u) for u in q.all()]


@router.post("/scope", response_model=ScopeUnitOut, status_code=201)
def create_scope_unit(module_key: str, body: ScopeUnitCreate, current_user: CurrentUser, db: DbSession):
    unit = ScopeUnit(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return ScopeUnitOut.model_validate(unit)


@router.delete("/scope/{unit_id}", status_code=204)
def delete_scope_unit(unit_id: int, module_key: str, current_user: CurrentUser, db: DbSession):
    unit = module_scoped(db.query(ScopeUnit).filter(ScopeUnit.id == unit_id), current_user, module_key).first()
    if not unit:
        raise HTTPException(404, "Scope unit not found")
    db.delete(unit)
    db.commit()


# ---------------------------------------------------------------------------
# 18. Risk & Control Matrix
# ---------------------------------------------------------------------------


@router.get("/rcm", response_model=list[RcmEntryOut])
def list_rcm_entries(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(RcmEntry), current_user, module_key)
    return [RcmEntryOut.model_validate(e) for e in q.all()]


@router.post("/rcm", response_model=RcmEntryOut, status_code=201)
def create_rcm_entry(module_key: str, body: RcmEntryCreate, current_user: CurrentUser, db: DbSession):
    entry = RcmEntry(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return RcmEntryOut.model_validate(entry)


@router.delete("/rcm/{entry_id}", status_code=204)
def delete_rcm_entry(entry_id: int, module_key: str, current_user: CurrentUser, db: DbSession):
    entry = module_scoped(db.query(RcmEntry).filter(RcmEntry.id == entry_id), current_user, module_key).first()
    if not entry:
        raise HTTPException(404, "RCM entry not found")
    db.delete(entry)
    db.commit()


# ---------------------------------------------------------------------------
# 19. Test & Analytics Rule Library
# ---------------------------------------------------------------------------


@router.get("/rules", response_model=list[TestRuleOut])
def list_rules(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(TestRule), current_user, module_key)
    return [TestRuleOut.model_validate(r) for r in q.all()]


@router.post("/rules", response_model=TestRuleOut, status_code=201)
def create_rule(module_key: str, body: TestRuleCreate, current_user: CurrentUser, db: DbSession):
    rule = TestRule(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return TestRuleOut.model_validate(rule)


@router.patch("/rules/{rule_id}", response_model=TestRuleOut)
def update_rule(rule_id: int, module_key: str, body: TestRuleCreate, current_user: CurrentUser, db: DbSession):
    rule = module_scoped(db.query(TestRule).filter(TestRule.id == rule_id), current_user, module_key).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    for field, value in body.model_dump().items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return TestRuleOut.model_validate(rule)


@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, module_key: str, current_user: CurrentUser, db: DbSession):
    rule = module_scoped(db.query(TestRule).filter(TestRule.id == rule_id), current_user, module_key).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    db.delete(rule)
    db.commit()


# ---------------------------------------------------------------------------
# 20. Data Source & Connector Setup
# ---------------------------------------------------------------------------


@router.get("/data-sources", response_model=list[DataSourceOut])
def list_data_sources(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(DataSourceConnector), current_user, module_key)
    return [DataSourceOut.model_validate(d) for d in q.all()]


@router.post("/data-sources", response_model=DataSourceOut, status_code=201)
def create_data_source(module_key: str, body: DataSourceCreate, current_user: CurrentUser, db: DbSession):
    ds = DataSourceConnector(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return DataSourceOut.model_validate(ds)


@router.delete("/data-sources/{source_id}", status_code=204)
def delete_data_source(source_id: int, module_key: str, current_user: CurrentUser, db: DbSession):
    ds = module_scoped(
        db.query(DataSourceConnector).filter(DataSourceConnector.id == source_id), current_user, module_key
    ).first()
    if not ds:
        raise HTTPException(404, "Data source not found")
    db.delete(ds)
    db.commit()


# ---------------------------------------------------------------------------
# 21. Sampling & Population Builder
# ---------------------------------------------------------------------------


@router.get("/sampling/plans", response_model=list[SamplePlanOut])
def list_sample_plans(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(SamplePlan), current_user, module_key)
    return [SamplePlanOut.model_validate(p) for p in q.all()]


@router.post("/sampling/plans", response_model=SamplePlanOut, status_code=201)
def create_sample_plan(module_key: str, body: SamplePlanCreate, current_user: CurrentUser, db: DbSession):
    plan = SamplePlan(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return SamplePlanOut.model_validate(plan)


@router.get("/sampling/plans/{plan_id}/items", response_model=list[SampleItemOut])
def list_sample_items(plan_id: int, module_key: str, current_user: CurrentUser, db: DbSession):
    plan = module_scoped(db.query(SamplePlan).filter(SamplePlan.id == plan_id), current_user, module_key).first()
    if not plan:
        raise HTTPException(404, "Sample plan not found")
    q = module_scoped(db.query(SampleItem).filter(SampleItem.plan_id == plan_id), current_user, module_key)
    return [SampleItemOut.model_validate(i) for i in q.all()]


@router.post("/sampling/plans/{plan_id}/items", response_model=SampleItemOut, status_code=201)
def add_sample_item(plan_id: int, module_key: str, body: SampleItemCreate, current_user: CurrentUser, db: DbSession):
    plan = module_scoped(db.query(SamplePlan).filter(SamplePlan.id == plan_id), current_user, module_key).first()
    if not plan:
        raise HTTPException(404, "Sample plan not found")
    item = SampleItem(
        **body.model_dump(), plan_id=plan_id, module_key=module_key, tenant_id=current_user.tenant_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return SampleItemOut.model_validate(item)


# ---------------------------------------------------------------------------
# 23. Working Papers & Evidence
# ---------------------------------------------------------------------------


@router.get("/working-papers", response_model=list[WorkingPaperOut])
def list_working_papers(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(WorkingPaper), current_user, module_key)
    return [WorkingPaperOut.model_validate(w) for w in q.all()]


@router.post("/working-papers", response_model=WorkingPaperOut, status_code=201)
def create_working_paper(module_key: str, body: WorkingPaperCreate, current_user: CurrentUser, db: DbSession):
    wp = WorkingPaper(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(wp)
    db.commit()
    db.refresh(wp)
    return WorkingPaperOut.model_validate(wp)


@router.post("/working-papers/{paper_id}/review", response_model=WorkingPaperOut)
def review_working_paper(paper_id: int, module_key: str, body: WorkingPaperReview, current_user: CurrentUser, db: DbSession):
    from datetime import datetime

    wp = module_scoped(
        db.query(WorkingPaper).filter(WorkingPaper.id == paper_id), current_user, module_key
    ).first()
    if not wp:
        raise HTTPException(404, "Working paper not found")
    wp.reviewed_by = body.reviewed_by
    wp.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(wp)
    return WorkingPaperOut.model_validate(wp)


# ---------------------------------------------------------------------------
# 24. Observation & Finding Log
# ---------------------------------------------------------------------------


@router.get("/findings", response_model=list[FindingOut])
def list_findings(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(Finding), current_user, module_key)
    return [FindingOut.model_validate(f) for f in q.order_by(Finding.raised_at.desc()).all()]


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(module_key: str, body: FindingCreate, current_user: CurrentUser, db: DbSession):
    finding = Finding(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return FindingOut.model_validate(finding)


@router.patch("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: int, module_key: str, body: FindingUpdate, current_user: CurrentUser, db: DbSession):
    finding = module_scoped(
        db.query(Finding).filter(Finding.id == finding_id), current_user, module_key
    ).first()
    if not finding:
        raise HTTPException(404, "Finding not found")
    if body.status is not None:
        finding.status = body.status
    if body.severity is not None:
        finding.severity = body.severity
    db.commit()
    db.refresh(finding)
    return FindingOut.model_validate(finding)


# ---------------------------------------------------------------------------
# 25. Remediation / Action Tracker
# ---------------------------------------------------------------------------


@router.get("/remediation", response_model=list[RemediationItemOut])
def list_remediation_items(module_key: str, current_user: CurrentUser, db: DbSession):
    q = module_scoped(db.query(RemediationItem), current_user, module_key)
    return [RemediationItemOut.model_validate(r) for r in q.all()]


@router.post("/remediation", response_model=RemediationItemOut, status_code=201)
def create_remediation_item(module_key: str, body: RemediationItemCreate, current_user: CurrentUser, db: DbSession):
    finding = module_scoped(
        db.query(Finding).filter(Finding.id == body.finding_id), current_user, module_key
    ).first()
    if not finding:
        raise HTTPException(404, "Finding not found for this remediation item")
    item = RemediationItem(**body.model_dump(), module_key=module_key, tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return RemediationItemOut.model_validate(item)


@router.patch("/remediation/{item_id}", response_model=RemediationItemOut)
def update_remediation_item(item_id: int, module_key: str, body: RemediationItemUpdate, current_user: CurrentUser, db: DbSession):
    item = module_scoped(
        db.query(RemediationItem).filter(RemediationItem.id == item_id), current_user, module_key
    ).first()
    if not item:
        raise HTTPException(404, "Remediation item not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return RemediationItemOut.model_validate(item)


# ---------------------------------------------------------------------------
# 16. Module Dashboard & KPIs  /  22. Exception & Red-Flag Queue
# (registry-backed — see registry.py; no dedicated tables)
# ---------------------------------------------------------------------------


@router.get("/dashboard/{module_key}", response_model=ModuleSummaryOut)
def get_module_dashboard(module_key: str, current_user: CurrentUser, db: DbSession):
    providers = get_providers(module_key)
    if not providers:
        raise HTTPException(
            404,
            f"No dashboard provider registered for module '{module_key}'. "
            f"Registered modules: {registered_module_keys()}",
        )
    return providers.get_summary(current_user.tenant_id, db)


@router.get("/exceptions/{module_key}", response_model=list[GenericExceptionOut])
def get_module_exceptions(module_key: str, current_user: CurrentUser, db: DbSession):
    providers = get_providers(module_key)
    if not providers:
        raise HTTPException(
            404,
            f"No exception provider registered for module '{module_key}'. "
            f"Registered modules: {registered_module_keys()}",
        )
    return providers.get_exceptions(current_user.tenant_id, db)


# ---------------------------------------------------------------------------
# Mounting note (not code — read before wiring up):
#
# This router is platform infra, not an auto-discovered module, so it
# needs an explicit line in main.py, e.g.:
#
#     from app.shared.audit_framework.router import router as framework_router
#     app.include_router(framework_router, prefix="/api/framework", tags=["framework"])
#
# Paste your main.py (or wherever modules currently get included) and
# I'll give you the exact line/placement instead of this guess.
# ---------------------------------------------------------------------------
