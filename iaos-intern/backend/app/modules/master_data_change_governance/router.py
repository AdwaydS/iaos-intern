"""Master Data Change Governance — API router.

Mounted automatically at /api/modules/master_data_change_governance.
All queries are tenant-isolated via tenant_scoped().
"""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    AuditFinding,
    AuditScopeItem,
    BulkUploadLog,
    DataQualityScore,
    DataSourceConfig,
    DuplicatePair,
    ExceptionItem,
    FieldAccessConfig,
    MakerCheckerWorkflow,
    MasterDataChangeLog,
    ReferenceDataCode,
    MdcgRemediationItem,
    ReconciliationResult,
    RcmEntry,
    SamplingRecord,
    SensitiveChangeAlert,
    TestRule,
    WorkingPaper,
)
from .schemas import (
    AlertCreate,
    AlertOut,
    BulkUploadCreate,
    BulkUploadOut,
    ChangeLogCreate,
    ChangeLogOut,
    DataSourceCreate,
    DataSourceOut,
    DuplicateCreate,
    DuplicateOut,
    DuplicateUpdate,
    ExceptionCreate,
    ExceptionOut,
    FieldAccessCreate,
    FieldAccessOut,
    FindingCreate,
    FindingOut,
    QualityScoreCreate,
    QualityScoreOut,
    ReferenceDataCreate,
    ReferenceDataOut,
    RemediationCreate,
    RemediationOut,
    ReconciliationCreate,
    ReconciliationOut,
    RcmCreate,
    RcmOut,
    SamplingCreate,
    SamplingOut,
    ScopeCreate,
    ScopeOut,
    TestRuleCreate,
    TestRuleOut,
    WorkflowCreate,
    WorkflowOut,
    WorkingPaperCreate,
    WorkingPaperOut,
)

MANIFEST = {
    "name": "master_data_change_governance",
    "title": "Master Data Change Governance",
    "description": "Cross-cutting oversight of critical master data with change control and integrity analytics.",
    "icon": "shield",
    "group": "Controls, Risk & Fraud",
    "industry": "",
    "version": "1.0.0",
    "owner": "intern-mdg",
}

router = APIRouter()


# ===========================================================================
# 1. Critical-Field Change Log
# ===========================================================================
@router.get("/change-logs", response_model=list[ChangeLogOut])
def list_change_logs(
    current_user: CurrentUser,
    db: DbSession,
    master_type: str | None = Query(None),
):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    if master_type:
        q = q.filter(MasterDataChangeLog.master_type == master_type)
    return [ChangeLogOut.model_validate(r) for r in q.order_by(MasterDataChangeLog.id.desc()).all()]


@router.post("/change-logs", response_model=ChangeLogOut, status_code=201)
def create_change_log(body: ChangeLogCreate, current_user: CurrentUser, db: DbSession):
    item = MasterDataChangeLog(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ChangeLogOut.model_validate(item)


@router.delete("/change-logs/{item_id}", status_code=204)
def delete_change_log(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(MasterDataChangeLog).filter(MasterDataChangeLog.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Change log not found")
    db.delete(item)
    db.commit()


# 2. Chart-of-Accounts filtered view
@router.get("/change-logs/chart-of-accounts", response_model=list[ChangeLogOut])
def list_coa_changes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    q = q.filter(MasterDataChangeLog.master_type == "chart_of_accounts")
    return [ChangeLogOut.model_validate(r) for r in q.order_by(MasterDataChangeLog.id.desc()).all()]


# 3. Cost-Centre / Profit-Centre filtered view
@router.get("/change-logs/cost-centres", response_model=list[ChangeLogOut])
def list_cost_centre_changes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    q = q.filter(MasterDataChangeLog.master_type == "cost_centre")
    return [ChangeLogOut.model_validate(r) for r in q.order_by(MasterDataChangeLog.id.desc()).all()]


# 4. Bank-Master filtered view
@router.get("/change-logs/bank-masters", response_model=list[ChangeLogOut])
def list_bank_master_changes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    q = q.filter(MasterDataChangeLog.master_type == "bank_master")
    return [ChangeLogOut.model_validate(r) for r in q.order_by(MasterDataChangeLog.id.desc()).all()]


# ===========================================================================
# 5. Maker-Checker Enforcement
# ===========================================================================
@router.get("/workflows", response_model=list[WorkflowOut])
def list_workflows(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MakerCheckerWorkflow), current_user)
    return [WorkflowOut.model_validate(r) for r in q.all()]


@router.post("/workflows", response_model=WorkflowOut, status_code=201)
def create_workflow(body: WorkflowCreate, current_user: CurrentUser, db: DbSession):
    item = MakerCheckerWorkflow(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return WorkflowOut.model_validate(item)


@router.delete("/workflows/{item_id}", status_code=204)
def delete_workflow(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(MakerCheckerWorkflow).filter(MakerCheckerWorkflow.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Workflow not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 6. After-Hours Master Changes (computed from change log)
# ===========================================================================
@router.get("/after-hours-changes", response_model=list[ChangeLogOut])
def list_after_hours_changes(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    all_changes = q.order_by(MasterDataChangeLog.id.desc()).all()
    result = []
    for c in all_changes:
        if c.change_timestamp and (c.change_timestamp.hour < 8 or c.change_timestamp.hour >= 18):
            result.append(ChangeLogOut.model_validate(c))
    return result


# ===========================================================================
# 7. Orphan / Unmapped Records
# ===========================================================================
@router.get("/orphan-records", response_model=list[ChangeLogOut])
def list_orphan_records(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    all_changes = q.order_by(MasterDataChangeLog.id.desc()).all()
    seen_records = set()
    orphans = []
    for c in all_changes:
        key = (c.master_type, c.record_id)
        if c.change_type == "create":
            seen_records.add(key)
        elif c.change_type == "delete":
            seen_records.discard(key)
    create_records = {}
    for c in all_changes:
        key = (c.master_type, c.record_id)
        if key not in create_records and c.change_type == "create":
            create_records[key] = c
    for key, c in create_records.items():
        has_update = any(
            ch.master_type == key[0] and ch.record_id == key[1] and ch.change_type == "update"
            for ch in all_changes
        )
        if not has_update:
            orphans.append(c)
    return [ChangeLogOut.model_validate(c) for c in orphans[:50]]


# ===========================================================================
# 8. Bulk-Upload Controls
# ===========================================================================
@router.get("/bulk-uploads", response_model=list[BulkUploadOut])
def list_bulk_uploads(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(BulkUploadLog), current_user)
    return [BulkUploadOut.model_validate(r) for r in q.order_by(BulkUploadLog.id.desc()).all()]


@router.post("/bulk-uploads", response_model=BulkUploadOut, status_code=201)
def create_bulk_upload(body: BulkUploadCreate, current_user: CurrentUser, db: DbSession):
    item = BulkUploadLog(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return BulkUploadOut.model_validate(item)


# ===========================================================================
# 9. Field-Level Access Review
# ===========================================================================
@router.get("/field-access", response_model=list[FieldAccessOut])
def list_field_access(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(FieldAccessConfig), current_user)
    return [FieldAccessOut.model_validate(r) for r in q.all()]


@router.post("/field-access", response_model=FieldAccessOut, status_code=201)
def create_field_access(body: FieldAccessCreate, current_user: CurrentUser, db: DbSession):
    item = FieldAccessConfig(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return FieldAccessOut.model_validate(item)


@router.delete("/field-access/{item_id}", status_code=204)
def delete_field_access(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(FieldAccessConfig).filter(FieldAccessConfig.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Field access config not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 10. Data-Quality Scorecard
# ===========================================================================
@router.get("/quality-scores", response_model=list[QualityScoreOut])
def list_quality_scores(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(DataQualityScore), current_user)
    return [QualityScoreOut.model_validate(r) for r in q.order_by(DataQualityScore.id.desc()).all()]


@router.post("/quality-scores", response_model=QualityScoreOut, status_code=201)
def create_quality_score(body: QualityScoreCreate, current_user: CurrentUser, db: DbSession):
    item = DataQualityScore(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return QualityScoreOut.model_validate(item)


# ===========================================================================
# 11. Duplicate Detection Engine
# ===========================================================================
@router.get("/duplicates", response_model=list[DuplicateOut])
def list_duplicates(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(DuplicatePair), current_user)
    return [DuplicateOut.model_validate(r) for r in q.order_by(DuplicatePair.id.desc()).all()]


@router.post("/duplicates", response_model=DuplicateOut, status_code=201)
def create_duplicate(body: DuplicateCreate, current_user: CurrentUser, db: DbSession):
    item = DuplicatePair(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return DuplicateOut.model_validate(item)


@router.patch("/duplicates/{item_id}", response_model=DuplicateOut)
def update_duplicate(item_id: int, body: DuplicateUpdate, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(DuplicatePair).filter(DuplicatePair.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Duplicate pair not found")
    item.status = body.status
    db.commit()
    db.refresh(item)
    return DuplicateOut.model_validate(item)


@router.delete("/duplicates/{item_id}", status_code=204)
def delete_duplicate(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(DuplicatePair).filter(DuplicatePair.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Duplicate pair not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 12. Reference-Data Consistency
# ===========================================================================
@router.get("/reference-data", response_model=list[ReferenceDataOut])
def list_reference_data(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ReferenceDataCode), current_user)
    return [ReferenceDataOut.model_validate(r) for r in q.all()]


@router.post("/reference-data", response_model=ReferenceDataOut, status_code=201)
def create_reference_data(body: ReferenceDataCreate, current_user: CurrentUser, db: DbSession):
    item = ReferenceDataCode(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ReferenceDataOut.model_validate(item)


# ===========================================================================
# 13. Change-Approval Ageing (computed from change log)
# ===========================================================================
@router.get("/approval-ageing", response_model=list[ChangeLogOut])
def list_approval_ageing(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MasterDataChangeLog), current_user)
    q = q.filter(MasterDataChangeLog.approval_status == "pending")
    return [ChangeLogOut.model_validate(r) for r in q.order_by(MasterDataChangeLog.change_timestamp).all()]


# ===========================================================================
# 14. Master Reconciliation
# ===========================================================================
@router.get("/reconciliation", response_model=list[ReconciliationOut])
def list_reconciliation(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ReconciliationResult), current_user)
    return [ReconciliationOut.model_validate(r) for r in q.order_by(ReconciliationResult.id.desc()).all()]


@router.post("/reconciliation", response_model=ReconciliationOut, status_code=201)
def create_reconciliation(body: ReconciliationCreate, current_user: CurrentUser, db: DbSession):
    item = ReconciliationResult(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ReconciliationOut.model_validate(item)


# ===========================================================================
# 15. Sensitive-Change Alerting
# ===========================================================================
@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(SensitiveChangeAlert), current_user)
    return [AlertOut.model_validate(r) for r in q.all()]


@router.post("/alerts", response_model=AlertOut, status_code=201)
def create_alert(body: AlertCreate, current_user: CurrentUser, db: DbSession):
    item = SensitiveChangeAlert(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return AlertOut.model_validate(item)


@router.post("/alerts/{item_id}/trigger", response_model=AlertOut)
def trigger_alert(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(SensitiveChangeAlert).filter(SensitiveChangeAlert.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Alert not found")
    item.triggered_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return AlertOut.model_validate(item)


# ===========================================================================
# 16. Module Dashboard & KPIs
# ===========================================================================
@router.get("/dashboard/kpis")
def dashboard_kpis(current_user: CurrentUser, db: DbSession):
    cl = tenant_scoped(db.query(MasterDataChangeLog), current_user).count()
    wf = tenant_scoped(db.query(MakerCheckerWorkflow).filter(MakerCheckerWorkflow.is_active == True), current_user).count()  # noqa: E712
    exc = tenant_scoped(db.query(ExceptionItem).filter(ExceptionItem.status == "Open"), current_user).count()
    dup = tenant_scoped(db.query(DuplicatePair).filter(DuplicatePair.status == "open"), current_user).count()
    rc = tenant_scoped(db.query(ReconciliationResult), current_user).count()
    rc_match = tenant_scoped(
        db.query(ReconciliationResult).filter(ReconciliationResult.status == "match"), current_user
    ).count()
    find_open = tenant_scoped(db.query(AuditFinding).filter(AuditFinding.status == "Open"), current_user).count()
    rem_open = tenant_scoped(
        db.query(MdcgRemediationItem).filter(MdcgRemediationItem.status.in_(["Planned", "In Progress"])), current_user
    ).count()
    return {
        "total_change_logs": cl,
        "active_workflows": wf,
        "open_exceptions": exc,
        "open_duplicates": dup,
        "reconciliation_match_rate": round(rc_match / rc * 100, 1) if rc else 0,
        "open_findings": find_open,
        "open_remediations": rem_open,
    }


# ===========================================================================
# 17. Scope & Audit Universe
# ===========================================================================
@router.get("/scope", response_model=list[ScopeOut])
def list_scope(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(AuditScopeItem), current_user)
    return [ScopeOut.model_validate(r) for r in q.all()]


@router.post("/scope", response_model=ScopeOut, status_code=201)
def create_scope(body: ScopeCreate, current_user: CurrentUser, db: DbSession):
    item = AuditScopeItem(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ScopeOut.model_validate(item)


@router.delete("/scope/{item_id}", status_code=204)
def delete_scope(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(AuditScopeItem).filter(AuditScopeItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Scope item not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 18. Risk & Control Matrix
# ===========================================================================
@router.get("/rcm", response_model=list[RcmOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(RcmEntry), current_user)
    return [RcmOut.model_validate(r) for r in q.all()]


@router.post("/rcm", response_model=RcmOut, status_code=201)
def create_rcm(body: RcmCreate, current_user: CurrentUser, db: DbSession):
    item = RcmEntry(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return RcmOut.model_validate(item)


@router.delete("/rcm/{item_id}", status_code=204)
def delete_rcm(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(db.query(RcmEntry).filter(RcmEntry.id == item_id), current_user).first()
    if not item:
        raise HTTPException(404, "RCM entry not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 19. Test & Analytics Rule Library
# ===========================================================================
@router.get("/rules", response_model=list[TestRuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(TestRule), current_user)
    return [TestRuleOut.model_validate(r) for r in q.all()]


@router.post("/rules", response_model=TestRuleOut, status_code=201)
def create_rule(body: TestRuleCreate, current_user: CurrentUser, db: DbSession):
    item = TestRule(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return TestRuleOut.model_validate(item)


@router.delete("/rules/{item_id}", status_code=204)
def delete_rule(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(db.query(TestRule).filter(TestRule.id == item_id), current_user).first()
    if not item:
        raise HTTPException(404, "Rule not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 20. Data Source & Connector Setup
# ===========================================================================
@router.get("/data-sources", response_model=list[DataSourceOut])
def list_data_sources(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(DataSourceConfig), current_user)
    return [DataSourceOut.model_validate(r) for r in q.all()]


@router.post("/data-sources", response_model=DataSourceOut, status_code=201)
def create_data_source(body: DataSourceCreate, current_user: CurrentUser, db: DbSession):
    item = DataSourceConfig(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return DataSourceOut.model_validate(item)


@router.delete("/data-sources/{item_id}", status_code=204)
def delete_data_source(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(DataSourceConfig).filter(DataSourceConfig.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Data source not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 21. Sampling & Population Builder
# ===========================================================================
@router.get("/sampling", response_model=list[SamplingOut])
def list_sampling(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(SamplingRecord), current_user)
    return [SamplingOut.model_validate(r) for r in q.all()]


@router.post("/sampling", response_model=SamplingOut, status_code=201)
def create_sampling(body: SamplingCreate, current_user: CurrentUser, db: DbSession):
    item = SamplingRecord(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return SamplingOut.model_validate(item)


@router.delete("/sampling/{item_id}", status_code=204)
def delete_sampling(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(SamplingRecord).filter(SamplingRecord.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Sampling record not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 22. Exception & Red-Flag Queue
# ===========================================================================
@router.get("/exceptions", response_model=list[ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(ExceptionItem), current_user)
    return [ExceptionOut.model_validate(r) for r in q.order_by(ExceptionItem.id.desc()).all()]


@router.post("/exceptions", response_model=ExceptionOut, status_code=201)
def create_exception(body: ExceptionCreate, current_user: CurrentUser, db: DbSession):
    item = ExceptionItem(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ExceptionOut.model_validate(item)


@router.patch("/exceptions/{item_id}", response_model=ExceptionOut)
def update_exception(item_id: int, body: ExceptionCreate, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(ExceptionItem).filter(ExceptionItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Exception not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return ExceptionOut.model_validate(item)


# ===========================================================================
# 23. Working Papers & Evidence
# ===========================================================================
@router.get("/working-papers", response_model=list[WorkingPaperOut])
def list_working_papers(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(WorkingPaper), current_user)
    return [WorkingPaperOut.model_validate(r) for r in q.all()]


@router.post("/working-papers", response_model=WorkingPaperOut, status_code=201)
def create_working_paper(body: WorkingPaperCreate, current_user: CurrentUser, db: DbSession):
    item = WorkingPaper(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return WorkingPaperOut.model_validate(item)


@router.delete("/working-papers/{item_id}", status_code=204)
def delete_working_paper(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(WorkingPaper).filter(WorkingPaper.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Working paper not found")
    db.delete(item)
    db.commit()


# ===========================================================================
# 24. Observation & Finding Log
# ===========================================================================
@router.get("/findings", response_model=list[FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(AuditFinding), current_user)
    return [FindingOut.model_validate(r) for r in q.order_by(AuditFinding.id.desc()).all()]


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(body: FindingCreate, current_user: CurrentUser, db: DbSession):
    item = AuditFinding(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return FindingOut.model_validate(item)


@router.patch("/findings/{item_id}", response_model=FindingOut)
def update_finding(item_id: int, body: FindingCreate, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(AuditFinding).filter(AuditFinding.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Finding not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return FindingOut.model_validate(item)


# ===========================================================================
# 25. Remediation / Action Tracker
# ===========================================================================
@router.get("/remediation", response_model=list[RemediationOut])
def list_remediation(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(MdcgRemediationItem), current_user)
    return [RemediationOut.model_validate(r) for r in q.order_by(MdcgRemediationItem.id.desc()).all()]


@router.post("/remediation", response_model=RemediationOut, status_code=201)
def create_remediation(body: RemediationCreate, current_user: CurrentUser, db: DbSession):
    item = MdcgRemediationItem(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return RemediationOut.model_validate(item)


@router.patch("/remediation/{item_id}", response_model=RemediationOut)
def update_remediation(item_id: int, body: RemediationCreate, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(MdcgRemediationItem).filter(MdcgRemediationItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Remediation item not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return RemediationOut.model_validate(item)
