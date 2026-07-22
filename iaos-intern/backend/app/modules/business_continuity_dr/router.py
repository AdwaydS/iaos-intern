"""Business Continuity & DR — tenant-scoped audit module.

Mounted at /api/modules/business_continuity_dr.
Covers BIA, DR testing, RTO/RPO, crisis governance, and standard audit shells.
"""
from typing import Type

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from . import models as m
from .schemas import (
    AltSiteCreate,
    AltSiteOut,
    BackupTestCreate,
    BackupTestOut,
    BcpPlanCreate,
    BcpPlanOut,
    BiaCreate,
    BiaOut,
    CallTreeCreate,
    CallTreeOut,
    CostEstCreate,
    CostEstOut,
    CrisisGovCreate,
    CrisisGovOut,
    DashboardKpiCreate,
    DashboardKpiOut,
    DashboardSummary,
    DataSourceCreate,
    DataSourceOut,
    DcResilienceCreate,
    DcResilienceOut,
    DrTestCreate,
    DrTestOut,
    ExceptionCreate,
    ExceptionOut,
    FindingCreate,
    FindingOut,
    InsuranceCreate,
    InsuranceOut,
    PandemicCreate,
    PandemicOut,
    PostIncidentCreate,
    PostIncidentOut,
    RcmCreate,
    RcmOut,
    RemediationCreate,
    RemediationOut,
    RtoRpoCreate,
    RtoRpoOut,
    RuleCreate,
    RuleOut,
    SamplingCreate,
    SamplingOut,
    ScopeCreate,
    ScopeOut,
    SpofCreate,
    SpofOut,
    VendorContCreate,
    VendorContOut,
    WorkingPaperCreate,
    WorkingPaperOut,
)

MANIFEST = {
    "name": "business_continuity_dr",
    "title": "Business Continuity & DR",
    "description": (
        "Confirms the organisation can survive disruption: BIA currency, DR testing, "
        "RTO/RPO adherence and crisis governance."
    ),
    "icon": "server",
    "group": "IT & Security",
    "industry": "All industries",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()

SIGNATURE_MODELS: list[type] = [
    m.BusinessImpactAnalysis,
    m.BcpPlanCurrency,
    m.DrTestEvidence,
    m.RtoRpoAdherence,
    m.BackupRestorationTesting,
    m.AlternateSiteReadiness,
    m.CrisisManagementGovernance,
    m.SinglePointOfFailureMap,
    m.VendorSupplyContinuity,
    m.CommunicationCallTree,
    m.DataCentreResilience,
    m.PandemicRemoteWorkPlan,
    m.InsuranceBcpAlignment,
    m.RecoveryCostEstimation,
    m.PostIncidentReview,
]


def _register_crud(
    path: str,
    model: type,
    create_schema: Type[BaseModel],
    out_schema: Type[BaseModel],
    *,
    required_field: str | None = None,
) -> None:
    """Register list / create / delete routes for a tenant-scoped model."""

    @router.get(f"/{path}", response_model=list[out_schema])
    def list_items(current_user: CurrentUser, db: DbSession) -> list:
        q = tenant_scoped(db.query(model), current_user).order_by(model.id.desc())
        return [out_schema.model_validate(row) for row in q.all()]

    @router.post(f"/{path}", response_model=out_schema, status_code=201)
    def create_item(body: create_schema, current_user: CurrentUser, db: DbSession):
        data = body.model_dump()
        if required_field and not str(data.get(required_field, "")).strip():
            raise HTTPException(400, f"{required_field} is required")
        row = model(**data, tenant_id=current_user.tenant_id)
        db.add(row)
        db.commit()
        db.refresh(row)
        return out_schema.model_validate(row)

    @router.delete(f"/{path}/{{item_id}}", status_code=204)
    def delete_item(item_id: int, current_user: CurrentUser, db: DbSession) -> None:
        row = tenant_scoped(
            db.query(model).filter(model.id == item_id), current_user
        ).first()
        if not row:
            raise HTTPException(404, "Record not found")
        db.delete(row)
        db.commit()


def _count_by_status(db: Session, model: type, tenant_id: int) -> dict[str, int]:
    counts = {"Open": 0, "Pass": 0, "Fail": 0, "Partial": 0, "NA": 0, "Other": 0}
    rows = db.query(model).filter(model.tenant_id == tenant_id).all()
    for row in rows:
        status = getattr(row, "status", "Open") or "Open"
        counts[status] = counts.get(status, 0) + 1
    return counts


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(current_user: CurrentUser, db: DbSession) -> DashboardSummary:
    totals = {"Open": 0, "Pass": 0, "Fail": 0, "Partial": 0, "NA": 0, "Other": 0}
    for model in SIGNATURE_MODELS:
        for status, count in _count_by_status(db, model, current_user.tenant_id).items():
            totals[status] = totals.get(status, 0) + count

    signature_total = sum(totals.values())
    signature_pass = totals["Pass"] + totals["NA"]
    signature_fail = totals["Fail"]
    signature_open = totals["Open"] + totals["Partial"]

    open_exceptions = tenant_scoped(
        db.query(m.ExceptionRedFlag).filter(m.ExceptionRedFlag.disposition == "Open"),
        current_user,
    ).count()

    coverage_pct = round((signature_pass / signature_total) * 100) if signature_total else 0
    fail_rate = (signature_fail / signature_total) if signature_total else 0
    risk_score = min(100, round(fail_rate * 70 + signature_open * 3 + open_exceptions * 5))

    if signature_fail > signature_pass:
        trend = "Worsening"
    elif signature_pass > signature_fail + signature_open:
        trend = "Improving"
    else:
        trend = "Stable"

    return DashboardSummary(
        risk_score=risk_score,
        open_exceptions=open_exceptions,
        coverage_pct=coverage_pct,
        trend=trend,
        signature_total=signature_total,
        signature_pass=signature_pass,
        signature_fail=signature_fail,
        signature_open=signature_open,
    )


# Signature checkpoints (1–15)
_register_crud("bia", m.BusinessImpactAnalysis, BiaCreate, BiaOut)
_register_crud("bcp-plans", m.BcpPlanCurrency, BcpPlanCreate, BcpPlanOut)
_register_crud("dr-tests", m.DrTestEvidence, DrTestCreate, DrTestOut)
_register_crud("rto-rpo", m.RtoRpoAdherence, RtoRpoCreate, RtoRpoOut, required_field="process")
_register_crud("backup-tests", m.BackupRestorationTesting, BackupTestCreate, BackupTestOut, required_field="system")
_register_crud("alt-sites", m.AlternateSiteReadiness, AltSiteCreate, AltSiteOut, required_field="site_name")
_register_crud("crisis-gov", m.CrisisManagementGovernance, CrisisGovCreate, CrisisGovOut)
_register_crud("spof", m.SinglePointOfFailureMap, SpofCreate, SpofOut, required_field="dependency")
_register_crud("vendor-cont", m.VendorSupplyContinuity, VendorContCreate, VendorContOut, required_field="vendor")
_register_crud("call-trees", m.CommunicationCallTree, CallTreeCreate, CallTreeOut)
_register_crud("dc-resilience", m.DataCentreResilience, DcResilienceCreate, DcResilienceOut, required_field="dc_name")
_register_crud("pandemic", m.PandemicRemoteWorkPlan, PandemicCreate, PandemicOut)
_register_crud("insurance", m.InsuranceBcpAlignment, InsuranceCreate, InsuranceOut)
_register_crud("cost-est", m.RecoveryCostEstimation, CostEstCreate, CostEstOut, required_field="scenario")
_register_crud("post-incident", m.PostIncidentReview, PostIncidentCreate, PostIncidentOut)

# Shell sections (16–25)
_register_crud("dashboard-kpis", m.ModuleDashboardKpi, DashboardKpiCreate, DashboardKpiOut)
_register_crud("scope", m.ScopeAuditUniverse, ScopeCreate, ScopeOut, required_field="entity")
_register_crud("rcm", m.RiskControlMatrix, RcmCreate, RcmOut)
_register_crud("rules", m.TestAnalyticsRule, RuleCreate, RuleOut, required_field="rule_name")
_register_crud("data-sources", m.DataSourceConnector, DataSourceCreate, DataSourceOut, required_field="source_name")
_register_crud("sampling", m.SamplingPopulation, SamplingCreate, SamplingOut, required_field="population_name")
_register_crud("exceptions", m.ExceptionRedFlag, ExceptionCreate, ExceptionOut, required_field="title")
_register_crud("working-papers", m.WorkingPaper, WorkingPaperCreate, WorkingPaperOut, required_field="title")
_register_crud("findings", m.FindingObservation, FindingCreate, FindingOut, required_field="title")
_register_crud("remediation", m.RemediationAction, RemediationCreate, RemediationOut, required_field="action")
