"""Working Papers & Evidence Vault — API.

Mounted automatically at /api/modules/working_papers_evidence.
Tenant-isolated via `tenant_scoped()` + `CurrentUser` on every route.

Endpoint groups (feature numbers refer to the module's 25-item spec):

Signature (#1-#15):
  /papers                     #1 index/cross-ref, #2 upload+tagging, #9 screenshots,
                               #10 sampling link, #11 cross-engagement reuse, #12 confidential flag
  /papers/{id}/versions        #4 version history
  /papers/{id}/tickmarks        #3 tick-marks
  /papers/{id}/signoffs          #5 sign-off chain, #13 e-signature store
  /papers/{id}/access              #7 access & permission matrix
  /papers/{id}/retention             #6 retention & purge policy
  /papers/{id}/verify-hash             #8 evidence integrity / hashing
  /export-pack                           #14 bulk export / regulator pack
  /completeness-scan                       #15 working paper completeness scan

Shell (#16-#25):
  /dashboard                    #16 module dashboard & KPIs
  /scope-units                   #17 scope & audit universe
  /rcm                            #18 risk & control matrix
  /rules                            #19 test & analytics rule library
  /data-sources                      #20 data source & connector setup
  /populations, /populations/{id}/items  #21 sampling & population builder
  /exceptions                          #22 exception & red-flag queue
  (#23 Working Papers & Evidence is this module itself — /papers above)
  /findings                              #24 observation & finding log
  /findings/{id}/remediation               #25 remediation / action tracker
"""
import hashlib
import io
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    AccessGrant,
    AnalyticsRule,
    DataSourceConnector,
    ExceptionItem,
    Finding,
    RemediationAction,
    RiskControl,
    SampleItem,
    SamplePopulation,
    ScopeUnit,
    SignOff,
    TickMark,
    WorkingPaper,
    WorkingPaperVersion,
)
from .schemas import (
    AccessGrantCreate,
    AccessGrantOut,
    AnalyticsRuleCreate,
    AnalyticsRuleOut,
    CompletenessResult,
    ConfidentialUpdate,
    DashboardKPIs,
    DataSourceCreate,
    DataSourceOut,
    ExceptionCreate,
    ExceptionOut,
    ExceptionUpdate,
    FindingCreate,
    FindingOut,
    PaperCreate,
    PaperOut,
    PopulationCreate,
    PopulationOut,
    RemediationCreate,
    RemediationOut,
    RemediationUpdate,
    RetentionUpdate,
    RiskControlCreate,
    RiskControlOut,
    SampleItemCreate,
    SampleItemOut,
    ScopeUnitCreate,
    ScopeUnitOut,
    SignOffCreate,
    SignOffOut,
    TickMarkCreate,
    TickMarkOut,
    VersionCreate,
    VersionOut,
)

MANIFEST = {
    "name": "working_papers_evidence",
    "title": "Working Papers & Evidence Vault",
    "description": "Index, tag, tick-mark, hash and sign off audit evidence.",
    "icon": "file-check",
    "group": "Audit Command Center",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()

# Local evidence storage — one folder per tenant. Swap for S3/blob storage later
# without touching any route signature.
STORAGE_ROOT = Path(__file__).resolve().parent / "_storage"


def _tenant_dir(tenant_id: int) -> Path:
    d = STORAGE_ROOT / str(tenant_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def _get_paper(paper_id: int, current_user, db) -> WorkingPaper:
    paper = tenant_scoped(
        db.query(WorkingPaper).filter(WorkingPaper.id == paper_id), current_user
    ).first()
    if not paper:
        raise HTTPException(404, "Working paper not found")
    return paper


# ============================= Papers (#1 #2 #9 #10 #11 #12) ================

@router.get("/papers", response_model=list[PaperOut])
def list_papers(current_user: CurrentUser, db: DbSession, programme_step: str | None = None):
    q = tenant_scoped(db.query(WorkingPaper), current_user)
    if programme_step:
        q = q.filter(WorkingPaper.programme_step == programme_step)
    return [PaperOut.model_validate(p) for p in q.order_by(WorkingPaper.id.desc()).all()]


@router.post("/papers", response_model=PaperOut, status_code=201)
def create_paper(body: PaperCreate, current_user: CurrentUser, db: DbSession):
    """Create the working-paper record (metadata only — plain JSON, works with
    the shared `post()` helper in lib/api.ts). Attach the actual file
    afterwards with POST /papers/{id}/file (multipart, see below)."""
    paper = WorkingPaper(
        tenant_id=current_user.tenant_id,
        title=body.title,
        programme_step=body.programme_step,
        engagement_ref=body.engagement_ref,
        tags=body.tags,
        notes=body.notes,
        source_type=body.source_type,
        source_system=body.source_system,
        sample_ref=body.sample_ref,
        reused_from_id=body.reused_from_id,
        is_confidential=body.is_confidential,
        confidential_reason=body.confidential_reason,
        retention_years=body.retention_years,
        purge_at=datetime.now(timezone.utc) + timedelta(days=365 * body.retention_years),
        uploaded_by=current_user.full_name or current_user.email,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return PaperOut.model_validate(paper)


@router.post("/papers/{paper_id}/file", response_model=PaperOut)
async def attach_file(paper_id: int, current_user: CurrentUser, db: DbSession, file: UploadFile):
    """Multipart upload — attach/replace the evidence file on a paper, hash it
    (#8) and record version 1 (#4). Call this as a raw `fetch` with
    FormData on the frontend, NOT through the JSON `post()` helper — see
    module notes in WorkingPapersEvidencePage.tsx."""
    paper = _get_paper(paper_id, current_user, db)
    raw = await file.read()
    dest = _tenant_dir(current_user.tenant_id) / f"{paper.id}_{file.filename}"
    dest.write_bytes(raw)

    paper.filename = file.filename
    paper.storage_path = str(dest)
    paper.hash_algorithm = "sha256"
    paper.hash_value = hashlib.sha256(raw).hexdigest()
    paper.hash_verified_at = datetime.now(timezone.utc)

    db.add(WorkingPaperVersion(
        tenant_id=current_user.tenant_id,
        paper_id=paper.id,
        version_no=1,
        changed_by=paper.uploaded_by,
        change_summary="Initial upload",
        storage_path=paper.storage_path,
    ))
    db.commit()
    db.refresh(paper)
    return PaperOut.model_validate(paper)


@router.delete("/papers/{paper_id}", status_code=204)
def delete_paper(paper_id: int, current_user: CurrentUser, db: DbSession):
    paper = _get_paper(paper_id, current_user, db)
    db.delete(paper)
    db.commit()


# ============================= Versions (#4) =================================

@router.post("/papers/{paper_id}/versions", response_model=VersionOut, status_code=201)
async def add_version(
    paper_id: int,
    current_user: CurrentUser,
    db: DbSession,
    file: UploadFile,
    change_summary: str = Form(""),
):
    paper = _get_paper(paper_id, current_user, db)
    paper.current_version += 1

    storage_path = ""
    if file is not None:
        raw = await file.read()
        dest = _tenant_dir(current_user.tenant_id) / f"{paper.id}_v{paper.current_version}_{file.filename}"
        dest.write_bytes(raw)
        storage_path = str(dest)
        paper.filename = file.filename
        paper.storage_path = storage_path
        paper.hash_value = hashlib.sha256(raw).hexdigest()
        paper.hash_verified_at = datetime.now(timezone.utc)

    version = WorkingPaperVersion(
        tenant_id=current_user.tenant_id,
        paper_id=paper.id,
        version_no=paper.current_version,
        changed_by=current_user.full_name or current_user.email,
        change_summary=change_summary,
        storage_path=storage_path,
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return VersionOut.model_validate(version)


@router.get("/papers/{paper_id}/versions", response_model=list[VersionOut])
def list_versions(paper_id: int, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)  # 404s + confirms tenant ownership
    rows = (
        db.query(WorkingPaperVersion)
        .filter(WorkingPaperVersion.paper_id == paper_id)
        .order_by(WorkingPaperVersion.version_no.desc())
        .all()
    )
    return [VersionOut.model_validate(v) for v in rows]


# ============================= Tick-marks (#3) ================================

@router.post("/papers/{paper_id}/tickmarks", response_model=TickMarkOut, status_code=201)
def add_tickmark(paper_id: int, body: TickMarkCreate, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)
    tm = TickMark(
        tenant_id=current_user.tenant_id,
        paper_id=paper_id,
        symbol=body.symbol,
        location_ref=body.location_ref,
        comment=body.comment,
        created_by=current_user.full_name or current_user.email,
    )
    db.add(tm)
    db.commit()
    db.refresh(tm)
    return TickMarkOut.model_validate(tm)


@router.get("/papers/{paper_id}/tickmarks", response_model=list[TickMarkOut])
def list_tickmarks(paper_id: int, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)
    rows = db.query(TickMark).filter(TickMark.paper_id == paper_id).all()
    return [TickMarkOut.model_validate(t) for t in rows]


# ============================= Sign-offs (#5 #13) ==============================

SIGNOFF_STAGES = ["preparer", "reviewer", "manager", "partner"]


@router.post("/papers/{paper_id}/signoffs", response_model=SignOffOut, status_code=201)
def add_signoff(paper_id: int, body: SignOffCreate, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)
    if body.stage not in SIGNOFF_STAGES:
        raise HTTPException(400, f"stage must be one of {SIGNOFF_STAGES}")
    so = SignOff(
        tenant_id=current_user.tenant_id,
        paper_id=paper_id,
        stage=body.stage,
        signed_by=current_user.full_name or current_user.email,
        signature_payload=body.signature_payload or (current_user.full_name or current_user.email),
    )
    db.add(so)
    db.commit()
    db.refresh(so)
    return SignOffOut.model_validate(so)


@router.get("/papers/{paper_id}/signoffs", response_model=list[SignOffOut])
def list_signoffs(paper_id: int, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)
    rows = db.query(SignOff).filter(SignOff.paper_id == paper_id).order_by(SignOff.signed_at).all()
    return [SignOffOut.model_validate(s) for s in rows]


# ============================= Access matrix (#7) ==============================

@router.post("/papers/{paper_id}/access", response_model=AccessGrantOut, status_code=201)
def grant_access(paper_id: int, body: AccessGrantCreate, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)
    grant = AccessGrant(
        tenant_id=current_user.tenant_id,
        paper_id=paper_id,
        role=body.role,
        user_email=body.user_email,
        permission=body.permission,
    )
    db.add(grant)
    db.commit()
    db.refresh(grant)
    return AccessGrantOut.model_validate(grant)


@router.get("/papers/{paper_id}/access", response_model=list[AccessGrantOut])
def list_access(paper_id: int, current_user: CurrentUser, db: DbSession):
    _get_paper(paper_id, current_user, db)
    rows = db.query(AccessGrant).filter(AccessGrant.paper_id == paper_id).all()
    return [AccessGrantOut.model_validate(a) for a in rows]


# ============================= Retention (#6) & Confidentiality (#12) ==========

@router.patch("/papers/{paper_id}/retention", response_model=PaperOut)
def update_retention(paper_id: int, body: RetentionUpdate, current_user: CurrentUser, db: DbSession):
    paper = _get_paper(paper_id, current_user, db)
    paper.retention_years = body.retention_years
    paper.purge_at = paper.created_at + timedelta(days=365 * body.retention_years)
    db.commit()
    db.refresh(paper)
    return PaperOut.model_validate(paper)


@router.patch("/papers/{paper_id}/confidential", response_model=PaperOut)
def update_confidential(paper_id: int, body: ConfidentialUpdate, current_user: CurrentUser, db: DbSession):
    paper = _get_paper(paper_id, current_user, db)
    paper.is_confidential = body.is_confidential
    paper.confidential_reason = body.confidential_reason
    db.commit()
    db.refresh(paper)
    return PaperOut.model_validate(paper)


# ============================= Integrity hashing (#8) ===========================

@router.post("/papers/{paper_id}/verify-hash")
def verify_hash(paper_id: int, current_user: CurrentUser, db: DbSession):
    """Re-hash the stored file and confirm it matches the recorded hash —
    proves the evidence hasn't been tampered with since upload."""
    paper = _get_paper(paper_id, current_user, db)
    if not paper.storage_path or not Path(paper.storage_path).exists():
        raise HTTPException(404, "No stored file to verify")
    current_hash = hashlib.sha256(Path(paper.storage_path).read_bytes()).hexdigest()
    matches = current_hash == paper.hash_value
    if matches:
        paper.hash_verified_at = datetime.now(timezone.utc)
        db.commit()
    return {"matches": matches, "recorded_hash": paper.hash_value, "current_hash": current_hash}


# ============================= Bulk export / regulator pack (#14) ===============

@router.get("/export-pack")
def export_pack(current_user: CurrentUser, db: DbSession, engagement_ref: str | None = None):
    """Zip every working paper (+ a manifest.csv of sign-offs/hashes) for handoff
    to a regulator or external reviewer."""
    q = tenant_scoped(db.query(WorkingPaper), current_user)
    if engagement_ref:
        q = q.filter(WorkingPaper.engagement_ref == engagement_ref)
    papers = q.all()

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        manifest_lines = ["id,title,programme_step,hash_algorithm,hash_value,confidential"]
        for p in papers:
            manifest_lines.append(
                f"{p.id},{p.title},{p.programme_step},{p.hash_algorithm},{p.hash_value},{p.is_confidential}"
            )
            if p.storage_path and Path(p.storage_path).exists() and not p.is_confidential:
                zf.write(p.storage_path, arcname=f"{p.id}_{p.filename}")
        zf.writestr("manifest.csv", "\n".join(manifest_lines))
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=evidence_export.zip"},
    )


# ============================= Completeness scan (#15) ==========================

@router.get("/completeness-scan", response_model=list[CompletenessResult])
def completeness_scan(current_user: CurrentUser, db: DbSession):
    """Group papers by programme step and flag steps missing a sign-off or hash —
    the gap list a reviewer works through before closing the file."""
    papers = tenant_scoped(db.query(WorkingPaper), current_user).all()
    by_step: dict[str, list[WorkingPaper]] = {}
    for p in papers:
        by_step.setdefault(p.programme_step or "(unassigned)", []).append(p)

    results = []
    for step, items in by_step.items():
        ids = [p.id for p in items]
        signed_off_ids = {
            s.paper_id
            for s in db.query(SignOff).filter(SignOff.paper_id.in_(ids)).all()
        } if ids else set()
        results.append(CompletenessResult(
            programme_step=step,
            paper_count=len(items),
            missing_signoff=sum(1 for p in items if p.id not in signed_off_ids),
            missing_hash=sum(1 for p in items if not p.hash_value),
        ))
    return results


# ============================================================================
# Shell features (#16-#22, #24-#25)
# ============================================================================

# ---- #16 Module Dashboard & KPIs -------------------------------------------

@router.get("/dashboard", response_model=DashboardKPIs)
def dashboard(current_user: CurrentUser, db: DbSession):
    papers = tenant_scoped(db.query(WorkingPaper), current_user).all()
    scope_units = tenant_scoped(db.query(ScopeUnit), current_user).all()
    exceptions = tenant_scoped(db.query(ExceptionItem), current_user).all()
    findings = tenant_scoped(db.query(Finding), current_user).all()
    remediation = tenant_scoped(db.query(RemediationAction), current_user).all()

    covered_steps = {p.programme_step for p in papers if p.programme_step}
    now = datetime.now(timezone.utc)

    return DashboardKPIs(
        total_papers=len(papers),
        confidential_papers=sum(1 for p in papers if p.is_confidential),
        open_exceptions=sum(1 for e in exceptions if e.status == "open"),
        open_findings=sum(1 for f in findings if f.status != "closed"),
        overdue_remediation=sum(
            1 for r in remediation
            if r.status != "done" and r.due_date and r.due_date.replace(tzinfo=timezone.utc) < now
        ),
        coverage_pct=(
            round(100 * len({s.name for s in scope_units if s.name in covered_steps}) / len(scope_units), 1)
            if scope_units else 0.0
        ),
        hash_coverage_pct=(
            round(100 * sum(1 for p in papers if p.hash_value) / len(papers), 1) if papers else 0.0
        ),
    )


# ---- #17 Scope & Audit Universe --------------------------------------------

@router.get("/scope-units", response_model=list[ScopeUnitOut])
def list_scope_units(current_user: CurrentUser, db: DbSession):
    rows = tenant_scoped(db.query(ScopeUnit), current_user).all()
    return [ScopeUnitOut.model_validate(s) for s in rows]


@router.post("/scope-units", response_model=ScopeUnitOut, status_code=201)
def create_scope_unit(body: ScopeUnitCreate, current_user: CurrentUser, db: DbSession):
    unit = ScopeUnit(tenant_id=current_user.tenant_id, **body.model_dump())
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return ScopeUnitOut.model_validate(unit)


@router.delete("/scope-units/{unit_id}", status_code=204)
def delete_scope_unit(unit_id: int, current_user: CurrentUser, db: DbSession):
    unit = tenant_scoped(
        db.query(ScopeUnit).filter(ScopeUnit.id == unit_id), current_user
    ).first()
    if not unit:
        raise HTTPException(404, "Scope unit not found")
    db.delete(unit)
    db.commit()


# ---- #18 Risk & Control Matrix ----------------------------------------------

@router.get("/rcm", response_model=list[RiskControlOut])
def list_rcm(current_user: CurrentUser, db: DbSession):
    rows = tenant_scoped(db.query(RiskControl), current_user).all()
    return [RiskControlOut.model_validate(r) for r in rows]


@router.post("/rcm", response_model=RiskControlOut, status_code=201)
def create_rcm(body: RiskControlCreate, current_user: CurrentUser, db: DbSession):
    row = RiskControl(tenant_id=current_user.tenant_id, **body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return RiskControlOut.model_validate(row)


@router.delete("/rcm/{row_id}", status_code=204)
def delete_rcm(row_id: int, current_user: CurrentUser, db: DbSession):
    row = tenant_scoped(
        db.query(RiskControl).filter(RiskControl.id == row_id), current_user
    ).first()
    if not row:
        raise HTTPException(404, "RCM row not found")
    db.delete(row)
    db.commit()


# ---- #19 Test & Analytics Rule Library ---------------------------------------

@router.get("/rules", response_model=list[AnalyticsRuleOut])
def list_rules(current_user: CurrentUser, db: DbSession):
    rows = tenant_scoped(db.query(AnalyticsRule), current_user).all()
    return [AnalyticsRuleOut.model_validate(r) for r in rows]


@router.post("/rules", response_model=AnalyticsRuleOut, status_code=201)
def create_rule(body: AnalyticsRuleCreate, current_user: CurrentUser, db: DbSession):
    rule = AnalyticsRule(tenant_id=current_user.tenant_id, **body.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return AnalyticsRuleOut.model_validate(rule)


@router.delete("/rules/{rule_id}", status_code=204)
def delete_rule(rule_id: int, current_user: CurrentUser, db: DbSession):
    rule = tenant_scoped(
        db.query(AnalyticsRule).filter(AnalyticsRule.id == rule_id), current_user
    ).first()
    if not rule:
        raise HTTPException(404, "Rule not found")
    db.delete(rule)
    db.commit()


# ---- #20 Data Source & Connector Setup ---------------------------------------

@router.get("/data-sources", response_model=list[DataSourceOut])
def list_data_sources(current_user: CurrentUser, db: DbSession):
    rows = tenant_scoped(db.query(DataSourceConnector), current_user).all()
    return [DataSourceOut.model_validate(d) for d in rows]


@router.post("/data-sources", response_model=DataSourceOut, status_code=201)
def create_data_source(body: DataSourceCreate, current_user: CurrentUser, db: DbSession):
    ds = DataSourceConnector(tenant_id=current_user.tenant_id, **body.model_dump())
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return DataSourceOut.model_validate(ds)


@router.delete("/data-sources/{ds_id}", status_code=204)
def delete_data_source(ds_id: int, current_user: CurrentUser, db: DbSession):
    ds = tenant_scoped(
        db.query(DataSourceConnector).filter(DataSourceConnector.id == ds_id), current_user
    ).first()
    if not ds:
        raise HTTPException(404, "Data source not found")
    db.delete(ds)
    db.commit()


# ---- #21 Sampling & Population Builder ---------------------------------------

@router.get("/populations", response_model=list[PopulationOut])
def list_populations(current_user: CurrentUser, db: DbSession):
    rows = tenant_scoped(db.query(SamplePopulation), current_user).all()
    return [PopulationOut.model_validate(p) for p in rows]


@router.post("/populations", response_model=PopulationOut, status_code=201)
def create_population(body: PopulationCreate, current_user: CurrentUser, db: DbSession):
    pop = SamplePopulation(tenant_id=current_user.tenant_id, **body.model_dump())
    db.add(pop)
    db.commit()
    db.refresh(pop)
    return PopulationOut.model_validate(pop)


def _get_population(population_id: int, current_user, db) -> SamplePopulation:
    pop = tenant_scoped(
        db.query(SamplePopulation).filter(SamplePopulation.id == population_id), current_user
    ).first()
    if not pop:
        raise HTTPException(404, "Population not found")
    return pop


@router.post("/populations/{population_id}/items", response_model=SampleItemOut, status_code=201)
def add_sample_item(population_id: int, body: SampleItemCreate, current_user: CurrentUser, db: DbSession):
    _get_population(population_id, current_user, db)
    item = SampleItem(tenant_id=current_user.tenant_id, population_id=population_id, **body.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return SampleItemOut.model_validate(item)


@router.get("/populations/{population_id}/items", response_model=list[SampleItemOut])
def list_sample_items(population_id: int, current_user: CurrentUser, db: DbSession):
    _get_population(population_id, current_user, db)
    rows = db.query(SampleItem).filter(SampleItem.population_id == population_id).all()
    return [SampleItemOut.model_validate(i) for i in rows]


# ---- #22 Exception & Red-Flag Queue -------------------------------------------

@router.get("/exceptions", response_model=list[ExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession, status: str | None = None):
    q = tenant_scoped(db.query(ExceptionItem), current_user)
    if status:
        q = q.filter(ExceptionItem.status == status)
    return [ExceptionOut.model_validate(e) for e in q.order_by(ExceptionItem.raised_at.desc()).all()]


@router.post("/exceptions", response_model=ExceptionOut, status_code=201)
def create_exception(body: ExceptionCreate, current_user: CurrentUser, db: DbSession):
    exc = ExceptionItem(tenant_id=current_user.tenant_id, **body.model_dump())
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return ExceptionOut.model_validate(exc)


@router.patch("/exceptions/{exception_id}", response_model=ExceptionOut)
def update_exception(exception_id: int, body: ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(
        db.query(ExceptionItem).filter(ExceptionItem.id == exception_id), current_user
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")
    exc.status = body.status
    exc.disposition = body.disposition
    db.commit()
    db.refresh(exc)
    return ExceptionOut.model_validate(exc)


# ---- #24 Observation & Finding Log ---------------------------------------------

@router.get("/findings", response_model=list[FindingOut])
def list_findings(current_user: CurrentUser, db: DbSession):
    rows = tenant_scoped(db.query(Finding), current_user).all()
    return [FindingOut.model_validate(f) for f in rows]


@router.post("/findings", response_model=FindingOut, status_code=201)
def create_finding(body: FindingCreate, current_user: CurrentUser, db: DbSession):
    finding = Finding(
        tenant_id=current_user.tenant_id,
        raised_by=current_user.full_name or current_user.email,
        **body.model_dump(),
    )
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return FindingOut.model_validate(finding)


def _get_finding(finding_id: int, current_user, db) -> Finding:
    finding = tenant_scoped(
        db.query(Finding).filter(Finding.id == finding_id), current_user
    ).first()
    if not finding:
        raise HTTPException(404, "Finding not found")
    return finding


# ---- #25 Remediation / Action Tracker -------------------------------------------

@router.post("/findings/{finding_id}/remediation", response_model=RemediationOut, status_code=201)
def add_remediation(finding_id: int, body: RemediationCreate, current_user: CurrentUser, db: DbSession):
    _get_finding(finding_id, current_user, db)
    action = RemediationAction(tenant_id=current_user.tenant_id, finding_id=finding_id, **body.model_dump())
    db.add(action)
    db.commit()
    db.refresh(action)
    return RemediationOut.model_validate(action)


@router.get("/findings/{finding_id}/remediation", response_model=list[RemediationOut])
def list_remediation(finding_id: int, current_user: CurrentUser, db: DbSession):
    _get_finding(finding_id, current_user, db)
    rows = db.query(RemediationAction).filter(RemediationAction.finding_id == finding_id).all()
    return [RemediationOut.model_validate(a) for a in rows]


@router.patch("/remediation/{action_id}", response_model=RemediationOut)
def update_remediation(action_id: int, body: RemediationUpdate, current_user: CurrentUser, db: DbSession):
    action = tenant_scoped(
        db.query(RemediationAction).filter(RemediationAction.id == action_id), current_user
    ).first()
    if not action:
        raise HTTPException(404, "Remediation action not found")
    action.status = body.status
    action.retest_status = body.retest_status
    db.commit()
    db.refresh(action)
    return RemediationOut.model_validate(action)
