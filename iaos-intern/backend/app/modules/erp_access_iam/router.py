"""Application & ERP Access (IAM) — API router.

Mounted automatically at /api/modules/erp_access_iam.
25 sub-pages covering role design, joiner-mover-leaver, dormant accounts,
SoD, privileged access, recertification, shared IDs, sensitive transactions,
access-role fit, emergency access, segregation simulation, login analytics,
external portal access, access-request workflow, scope, RCM, analytics rules,
data sources, sampling, exception queue, working papers, findings, and
remediation tracking.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    AccessLifecycle,
    AccessRequest,
    AccessRoleFit,
    AnalyticsRule,
    AuditScope,
    ControlMatrix,
    DataSource,
    DormantAccount,
    ExternalAccess,
    ExceptionItem,
    ErpAccessFinding,
    LoginLog,
    PrivilegedAccess,
    RecertificationCampaign,
    Remediation,
    RoleDefinition,
    SamplingSet,
    SensitiveTransaction,
    SharedAccount,
    SodViolation,
    WorkingPaper,
)
from .schemas import (
    AccessLifecycleCreate,
    AccessLifecycleOut,
    AccessRequestCreate,
    AccessRequestOut,
    AccessRoleFitCreate,
    AccessRoleFitOut,
    AnalyticsRuleCreate,
    AnalyticsRuleOut,
    AuditScopeCreate,
    AuditScopeOut,
    ControlMatrixCreate,
    ControlMatrixOut,
    DataSourceCreate,
    DataSourceOut,
    DormantAccountCreate,
    DormantAccountOut,
    ExceptionItemCreate,
    ExceptionItemOut,
    ExternalAccessCreate,
    ExternalAccessOut,
    FindingCreate,
    FindingOut,
    LoginLogCreate,
    LoginLogOut,
    PrivilegedAccessCreate,
    PrivilegedAccessOut,
    RecertificationCampaignCreate,
    RecertificationCampaignOut,
    RemediationCreate,
    RemediationOut,
    RoleDefinitionCreate,
    RoleDefinitionOut,
    SamplingSetCreate,
    SamplingSetOut,
    SensitiveTransactionCreate,
    SensitiveTransactionOut,
    SharedAccountCreate,
    SharedAccountOut,
    SodViolationCreate,
    SodViolationOut,
    WorkingPaperCreate,
    WorkingPaperOut,
)

MANIFEST = {
    "name": "erp_access_iam",
    "title": "Application & ERP Access (IAM)",
    "description": "Governs who can do what inside the ERP: role design, joiner-mover-leaver, dormant accounts, SoD, and access recertification.",
    "icon": "lock",
    "group": "Technology & Resilience",
    "industry": "",
    "version": "1.0.0",
    "owner": "intern-54",
}

router = APIRouter()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Generic CRUD helper — reduces repetition across 21 entity endpoints.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def _crud(
    prefix: str,
    model,              # SQLAlchemy model class
    create_schema,      # Pydantic create schema
    out_schema,         # Pydantic output schema
    label: str,         # human label for 404
    *,
    list_attr: str = "id",
):
    """Register GET /list, POST create, DELETE on *router*."""
    endpoint = prefix.strip("/")

    @router.get(f"/{endpoint}", response_model=list[out_schema])
    def _list(current_user: CurrentUser, db: DbSession):
        q = tenant_scoped(db.query(model), current_user)
        return [out_schema.model_validate(r) for r in q.order_by(getattr(model, list_attr).desc()).all()]

    @router.post(f"/{endpoint}", response_model=out_schema, status_code=201)
    def _create(body: create_schema, current_user: CurrentUser, db: DbSession):
        row = model(**body.model_dump(), tenant_id=current_user.tenant_id)
        db.add(row)
        db.commit()
        db.refresh(row)
        return out_schema.model_validate(row)

    @router.delete(f"/{endpoint}/{{item_id}}", status_code=204)
    def _delete(item_id: int, current_user: CurrentUser, db: DbSession):
        row = tenant_scoped(
            db.query(model).filter(model.id == item_id), current_user
        ).first()
        if not row:
            raise HTTPException(404, f"{label} not found")
        db.delete(row)
        db.commit()


# ── 1. Role Design & Entitlement Review ────────────────────────────────────
_crud("/roles", RoleDefinition, RoleDefinitionCreate, RoleDefinitionOut, "Role")

# ── 2 & 4. Joiner-Mover-Leaver / Terminated-User Access ───────────────────
_crud("/lifecycle", AccessLifecycle, AccessLifecycleCreate, AccessLifecycleOut, "Lifecycle event")

# ── 3. Dormant / Inactive Accounts ─────────────────────────────────────────
_crud("/dormant", DormantAccount, DormantAccountCreate, DormantAccountOut, "Dormant account")

# ── 5 & 12. Transaction-Level SoD / Segregation Simulation ────────────────
_crud("/sod", SodViolation, SodViolationCreate, SodViolationOut, "SoD violation")

# ── 6 & 11. Privileged / Super-User & Emergency-Access ────────────────────
_crud("/privileged", PrivilegedAccess, PrivilegedAccessCreate, PrivilegedAccessOut, "Privileged access")

# ── 7. Access Recertification ─────────────────────────────────────────────
_crud("/recert", RecertificationCampaign, RecertificationCampaignCreate, RecertificationCampaignOut, "Campaign")

# ── 8. Generic / Shared IDs ────────────────────────────────────────────────
_crud("/shared", SharedAccount, SharedAccountCreate, SharedAccountOut, "Shared account")

# ── 9. Sensitive-Transaction Access ────────────────────────────────────────
_crud("/sensitive", SensitiveTransaction, SensitiveTransactionCreate, SensitiveTransactionOut, "Sensitive transaction")

# ── 10. Access vs Job-Role Fit ─────────────────────────────────────────────
_crud("/role-fit", AccessRoleFit, AccessRoleFitCreate, AccessRoleFitOut, "Role-fit record")

# ── 13. Login & Failed-Attempt Analytics ──────────────────────────────────
_crud("/logins", LoginLog, LoginLogCreate, LoginLogOut, "Login log")

# ── 14. External / Portal Access ──────────────────────────────────────────
_crud("/external", ExternalAccess, ExternalAccessCreate, ExternalAccessOut, "External access")

# ── 15. Access-Request Workflow ────────────────────────────────────────────
_crud("/requests", AccessRequest, AccessRequestCreate, AccessRequestOut, "Access request")

# ── 17. Scope & Audit Universe ────────────────────────────────────────────
_crud("/scope", AuditScope, AuditScopeCreate, AuditScopeOut, "Scope entry")

# ── 18. Risk & Control Matrix (RCM) ───────────────────────────────────────
_crud("/rcm", ControlMatrix, ControlMatrixCreate, ControlMatrixOut, "RCM entry")

# ── 19. Test & Analytics Rule Library ──────────────────────────────────────
_crud("/rules", AnalyticsRule, AnalyticsRuleCreate, AnalyticsRuleOut, "Rule")

# ── 20. Data Source & Connector Setup ──────────────────────────────────────
_crud("/datasrc", DataSource, DataSourceCreate, DataSourceOut, "Data source")

# ── 21. Sampling & Population Builder ──────────────────────────────────────
_crud("/sampling", SamplingSet, SamplingSetCreate, SamplingSetOut, "Sampling set")

# ── 22. Exception & Red-Flag Queue ────────────────────────────────────────
_crud("/exceptions", ExceptionItem, ExceptionItemCreate, ExceptionItemOut, "Exception")

# ── 23. Working Papers & Evidence ──────────────────────────────────────────
_crud("/papers", WorkingPaper, WorkingPaperCreate, WorkingPaperOut, "Working paper")

# ── 24. Observation & Finding Log ──────────────────────────────────────────
_crud("/findings", ErpAccessFinding, FindingCreate, FindingOut, "Finding")

# ── 25. Remediation / Action Tracker ───────────────────────────────────────
_crud("/remediation", Remediation, RemediationCreate, RemediationOut, "Remediation item")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Sub-page 16: Dashboard & KPIs (aggregated from the other entities)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@router.get("/dashboard")
def dashboard(current_user: CurrentUser, db: DbSession):
    """Return aggregate counts for the module dashboard / KPI tiles."""
    def count(model):
        return tenant_scoped(db.query(model), current_user).count()

    return {
        "roles": count(RoleDefinition),
        "lifecycle_events": count(AccessLifecycle),
        "dormant_accounts": count(DormantAccount),
        "sod_violations": count(SodViolation),
        "privileged_accounts": count(PrivilegedAccess),
        "recert_campaigns": count(RecertificationCampaign),
        "shared_accounts": count(SharedAccount),
        "sensitive_txns": count(SensitiveTransaction),
        "role_fit_records": count(AccessRoleFit),
        "login_logs": count(LoginLog),
        "external_users": count(ExternalAccess),
        "access_requests": count(AccessRequest),
        "scope_entries": count(AuditScope),
        "rcm_entries": count(ControlMatrix),
        "analytics_rules": count(AnalyticsRule),
        "data_sources": count(DataSource),
        "sampling_sets": count(SamplingSet),
        "exceptions": count(ExceptionItem),
        "working_papers": count(WorkingPaper),
        "findings": count(ErpAccessFinding),
        "remediation_items": count(Remediation),
    }
