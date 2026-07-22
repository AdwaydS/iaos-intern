"""Application & ERP Access (IAM) — data models.

Tables cover the full IAM audit lifecycle: role design, joiner-mover-leaver,
dormant accounts, SoD, privileged access, recertification, shared IDs,
sensitive transactions, access-role fit, emergency access, segregation
simulation, login analytics, external portal access, access-request workflow,
scope/universe, exception queue, working papers, findings, and remediation.
"""
from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ── Sub-page 1: Role Design & Entitlement Review ──────────────────────────
class RoleDefinition(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_role_defs"

    id: Mapped[int] = mapped_column(primary_key=True)
    role_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    risk_level: Mapped[str] = mapped_column(String(50), default="Medium")
    entitlement_count: Mapped[int] = mapped_column(Integer, default=0)
    owner: Mapped[str] = mapped_column(String(255), default="")
    review_status: Mapped[str] = mapped_column(String(50), default="Pending")
    last_reviewed: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 2 & 4: Joiner-Mover-Leaver / Terminated-User Access ──────────
class AccessLifecycle(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_lifecycle"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[str] = mapped_column(String(100))
    employee_name: Mapped[str] = mapped_column(String(255))
    event_type: Mapped[str] = mapped_column(String(50))
    event_date: Mapped[str] = mapped_column(String(50))
    department: Mapped[str] = mapped_column(String(255), default="")
    role_affected: Mapped[str] = mapped_column(String(255), default="")
    access_granted: Mapped[str] = mapped_column(Text, default="")
    access_revoked: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Open")
    days_pending: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 3: Dormant / Inactive Accounts ────────────────────────────────
class DormantAccount(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_dormant"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255), default="")
    last_login: Mapped[str] = mapped_column(String(50), default="")
    days_inactive: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="Active")
    risk_rating: Mapped[str] = mapped_column(String(50), default="Low")
    action_taken: Mapped[str] = mapped_column(String(100), default="None")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 5 & 12: Transaction-Level SoD / Segregation Simulation ───────
class SodViolation(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_sod"

    id: Mapped[int] = mapped_column(primary_key=True)
    conflict_id: Mapped[str] = mapped_column(String(100))
    transaction_a: Mapped[str] = mapped_column(String(255))
    transaction_b: Mapped[str] = mapped_column(String(255))
    risk_rating: Mapped[str] = mapped_column(String(50), default="High")
    affected_users: Mapped[int] = mapped_column(Integer, default=0)
    affected_roles: Mapped[str] = mapped_column(Text, default="")
    mitigation: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="Open")
    first_detected: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 6 & 11: Privileged / Super-User & Emergency-Access ───────────
class PrivilegedAccess(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_privileged"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(255))
    access_type: Mapped[str] = mapped_column(String(100))
    profile: Mapped[str] = mapped_column(String(255), default="")
    assigned_date: Mapped[str] = mapped_column(String(50), default="")
    last_used: Mapped[str] = mapped_column(String(50), default="")
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    is_firefighter: Mapped[bool] = mapped_column(Boolean, default=False)
    justification: Mapped[str] = mapped_column(Text, default="")
    approved_by: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 7: Access Recertification ─────────────────────────────────────
class RecertificationCampaign(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_recert"

    id: Mapped[int] = mapped_column(primary_key=True)
    campaign_name: Mapped[str] = mapped_column(String(255))
    period: Mapped[str] = mapped_column(String(100))
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    reviewed_count: Mapped[int] = mapped_column(Integer, default=0)
    exceptions_found: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[str] = mapped_column(String(50), default="")
    end_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="Draft")
    completion_pct: Mapped[float] = mapped_column(Float, default=0.0)
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 8: Generic / Shared IDs ───────────────────────────────────────
class SharedAccount(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_shared"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_name: Mapped[str] = mapped_column(String(255))
    purpose: Mapped[str] = mapped_column(Text, default="")
    shared_with: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(255), default="")
    last_activity: Mapped[str] = mapped_column(String(50), default="")
    password_last_changed: Mapped[str] = mapped_column(String(50), default="")
    risk_rating: Mapped[str] = mapped_column(String(50), default="Medium")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 9: Sensitive-Transaction Access ───────────────────────────────
class SensitiveTransaction(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_sensitive_tx"

    id: Mapped[int] = mapped_column(primary_key=True)
    transaction_code: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(255))
    module: Mapped[str] = mapped_column(String(100), default="")
    criticality: Mapped[str] = mapped_column(String(50), default="High")
    users_with_access: Mapped[int] = mapped_column(Integer, default=0)
    authorized_users: Mapped[int] = mapped_column(Integer, default=0)
    excess_count: Mapped[int] = mapped_column(Integer, default=0)
    last_reviewed: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 10: Access vs Job-Role Fit ────────────────────────────────────
class AccessRoleFit(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_role_fit"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[str] = mapped_column(String(100))
    employee_name: Mapped[str] = mapped_column(String(255))
    job_title: Mapped[str] = mapped_column(String(255), default="")
    department: Mapped[str] = mapped_column(String(255), default="")
    assigned_roles: Mapped[str] = mapped_column(Text, default="")
    excess_privileges: Mapped[int] = mapped_column(Integer, default=0)
    unused_roles: Mapped[int] = mapped_column(Integer, default=0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    fit_status: Mapped[str] = mapped_column(String(50), default="Under Review")
    recommendation: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 13: Login & Failed-Attempt Analytics ─────────────────────────
class LoginLog(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_login_log"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(100))
    username: Mapped[str] = mapped_column(String(255))
    login_time: Mapped[str] = mapped_column(String(50))
    ip_address: Mapped[str] = mapped_column(String(100), default="")
    location: Mapped[str] = mapped_column(String(255), default="")
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    failure_reason: Mapped[str] = mapped_column(String(255), default="")
    consecutive_failures: Mapped[int] = mapped_column(Integer, default=0)
    risk_flag: Mapped[str] = mapped_column(String(50), default="None")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 14: External / Portal Access ──────────────────────────────────
class ExternalAccess(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_external"

    id: Mapped[int] = mapped_column(primary_key=True)
    portal_user: Mapped[str] = mapped_column(String(255))
    organization: Mapped[str] = mapped_column(String(255), default="")
    access_type: Mapped[str] = mapped_column(String(100), default="")
    modules_granted: Mapped[str] = mapped_column(Text, default="")
    granted_date: Mapped[str] = mapped_column(String(50), default="")
    expiry_date: Mapped[str] = mapped_column(String(50), default="")
    last_active: Mapped[str] = mapped_column(String(50), default="")
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(50), default="Active")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 15: Access-Request Workflow ────────────────────────────────────
class AccessRequest(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    request_id: Mapped[str] = mapped_column(String(100))
    requester: Mapped[str] = mapped_column(String(255))
    requested_for: Mapped[str] = mapped_column(String(255), default="")
    access_type: Mapped[str] = mapped_column(String(100), default="")
    role_requested: Mapped[str] = mapped_column(String(255), default="")
    business_justification: Mapped[str] = mapped_column(Text, default="")
    submitted_date: Mapped[str] = mapped_column(String(50), default="")
    approver: Mapped[str] = mapped_column(String(255), default="")
    approval_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="Pending")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 17: Scope & Audit Universe ────────────────────────────────────
class AuditScope(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_scope"

    id: Mapped[int] = mapped_column(primary_key=True)
    entity_name: Mapped[str] = mapped_column(String(255))
    entity_type: Mapped[str] = mapped_column(String(100), default="System")
    in_scope: Mapped[bool] = mapped_column(Boolean, default=True)
    owner: Mapped[str] = mapped_column(String(255), default="")
    last_audited: Mapped[str] = mapped_column(String(50), default="")
    risk_rating: Mapped[str] = mapped_column(String(50), default="Medium")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 18: Risk & Control Matrix (RCM) ──────────────────────────────
class ControlMatrix(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_id: Mapped[str] = mapped_column(String(100))
    risk_description: Mapped[str] = mapped_column(Text)
    control_id: Mapped[str] = mapped_column(String(100), default="")
    control_description: Mapped[str] = mapped_column(Text, default="")
    control_type: Mapped[str] = mapped_column(String(100), default="Preventive")
    frequency: Mapped[str] = mapped_column(String(100), default="Quarterly")
    owner: Mapped[str] = mapped_column(String(255), default="")
    assertion: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 19: Test & Analytics Rule Library ─────────────────────────────
class AnalyticsRule(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_code: Mapped[str] = mapped_column(String(100))
    rule_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(100), default="Access Review")
    threshold: Mapped[str] = mapped_column(String(100), default="")
    frequency: Mapped[str] = mapped_column(String(100), default="Monthly")
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_run: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 20: Data Source & Connector Setup ─────────────────────────────
class DataSource(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_datasrc"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(100), default="ERP Table")
    connection_string: Mapped[str] = mapped_column(Text, default="")
    tables_api: Mapped[str] = mapped_column(Text, default="")
    refresh_frequency: Mapped[str] = mapped_column(String(100), default="Daily")
    last_synced: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="Active")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 21: Sampling & Population Builder ─────────────────────────────
class SamplingSet(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_sampling"

    id: Mapped[int] = mapped_column(primary_key=True)
    set_name: Mapped[str] = mapped_column(String(255))
    population: Mapped[str] = mapped_column(String(255), default="")
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(100), default="Random")
    confidence_level: Mapped[str] = mapped_column(String(50), default="95%")
    status: Mapped[str] = mapped_column(String(50), default="Draft")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 22: Exception & Red-Flag Queue ────────────────────────────────
class ExceptionItem(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    exception_id: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100), default="Access Violation")
    severity: Mapped[str] = mapped_column(String(50), default="Medium")
    source_rule: Mapped[str] = mapped_column(String(255), default="")
    affected_user: Mapped[str] = mapped_column(String(255), default="")
    detected_date: Mapped[str] = mapped_column(String(50), default="")
    disposition: Mapped[str] = mapped_column(String(100), default="Open")
    assigned_to: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 23: Working Papers & Evidence ─────────────────────────────────
class WorkingPaper(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    section: Mapped[str] = mapped_column(String(255), default="")
    prepared_by: Mapped[str] = mapped_column(String(255), default="")
    reviewed_by: Mapped[str] = mapped_column(String(255), default="")
    prepared_date: Mapped[str] = mapped_column(String(50), default="")
    review_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="Draft")
    evidence_refs: Mapped[str] = mapped_column(Text, default="")
    conclusion: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 24: Observation & Finding Log ─────────────────────────────────
class ErpAccessFinding(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(100), default="Access Control")
    severity: Mapped[str] = mapped_column(String(50), default="Medium")
    root_cause: Mapped[str] = mapped_column(Text, default="")
    recommendation: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(255), default="")
    raised_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="Open")
    notes: Mapped[str] = mapped_column(Text, default="")


# ── Sub-page 25: Remediation / Action Tracker ──────────────────────────────
class Remediation(Base, TenantMixin):
    __tablename__ = "mod_erp_access_iam_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    action_id: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255))
    linked_finding: Mapped[str] = mapped_column(String(255), default="")
    action_type: Mapped[str] = mapped_column(String(100), default="CAPA")
    owner: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[str] = mapped_column(String(50), default="")
    assigned_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="Open")
    retest_date: Mapped[str] = mapped_column(String(50), default="")
    retest_result: Mapped[str] = mapped_column(String(100), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
