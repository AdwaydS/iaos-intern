"""Pydantic request / response schemas for the ERP Access (IAM) module."""
from pydantic import BaseModel


# ── Role Design & Entitlement Review (Sub-page 1) ─────────────────────────
class RoleDefinitionCreate(BaseModel):
    role_name: str
    description: str = ""
    risk_level: str = "Medium"
    entitlement_count: int = 0
    owner: str = ""
    review_status: str = "Pending"
    last_reviewed: str = ""
    notes: str = ""


class RoleDefinitionOut(BaseModel):
    id: int
    role_name: str
    description: str
    risk_level: str
    entitlement_count: int
    owner: str
    review_status: str
    last_reviewed: str
    notes: str
    model_config = {"from_attributes": True}


# ── Access Lifecycle (Sub-pages 2, 4) ─────────────────────────────────────
class AccessLifecycleCreate(BaseModel):
    employee_id: str
    employee_name: str
    event_type: str
    event_date: str
    department: str = ""
    role_affected: str = ""
    access_granted: str = ""
    access_revoked: str = ""
    status: str = "Open"
    days_pending: int = 0
    notes: str = ""


class AccessLifecycleOut(BaseModel):
    id: int
    employee_id: str
    employee_name: str
    event_type: str
    event_date: str
    department: str
    role_affected: str
    access_granted: str
    access_revoked: str
    status: str
    days_pending: int
    notes: str
    model_config = {"from_attributes": True}


# ── Dormant Accounts (Sub-page 3) ─────────────────────────────────────────
class DormantAccountCreate(BaseModel):
    user_id: str
    username: str
    full_name: str = ""
    last_login: str = ""
    days_inactive: int = 0
    status: str = "Active"
    risk_rating: str = "Low"
    action_taken: str = "None"
    notes: str = ""


class DormantAccountOut(BaseModel):
    id: int
    user_id: str
    username: str
    full_name: str
    last_login: str
    days_inactive: int
    status: str
    risk_rating: str
    action_taken: str
    notes: str
    model_config = {"from_attributes": True}


# ── SoD Violations (Sub-pages 5, 12) ──────────────────────────────────────
class SodViolationCreate(BaseModel):
    conflict_id: str
    transaction_a: str
    transaction_b: str
    risk_rating: str = "High"
    affected_users: int = 0
    affected_roles: str = ""
    mitigation: str = ""
    status: str = "Open"
    first_detected: str = ""
    notes: str = ""


class SodViolationOut(BaseModel):
    id: int
    conflict_id: str
    transaction_a: str
    transaction_b: str
    risk_rating: str
    affected_users: int
    affected_roles: str
    mitigation: str
    status: str
    first_detected: str
    notes: str
    model_config = {"from_attributes": True}


# ── Privileged Access (Sub-pages 6, 11) ───────────────────────────────────
class PrivilegedAccessCreate(BaseModel):
    user_id: str
    username: str
    access_type: str
    profile: str = ""
    assigned_date: str = ""
    last_used: str = ""
    usage_count: int = 0
    is_firefighter: bool = False
    justification: str = ""
    approved_by: str = ""
    status: str = "Active"
    notes: str = ""


class PrivilegedAccessOut(BaseModel):
    id: int
    user_id: str
    username: str
    access_type: str
    profile: str
    assigned_date: str
    last_used: str
    usage_count: int
    is_firefighter: bool
    justification: str
    approved_by: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Recertification Campaigns (Sub-page 7) ────────────────────────────────
class RecertificationCampaignCreate(BaseModel):
    campaign_name: str
    period: str
    total_users: int = 0
    reviewed_count: int = 0
    exceptions_found: int = 0
    start_date: str = ""
    end_date: str = ""
    status: str = "Draft"
    completion_pct: float = 0.0
    notes: str = ""


class RecertificationCampaignOut(BaseModel):
    id: int
    campaign_name: str
    period: str
    total_users: int
    reviewed_count: int
    exceptions_found: int
    start_date: str
    end_date: str
    status: str
    completion_pct: float
    notes: str
    model_config = {"from_attributes": True}


# ── Shared Accounts (Sub-page 8) ──────────────────────────────────────────
class SharedAccountCreate(BaseModel):
    account_name: str
    purpose: str = ""
    shared_with: str = ""
    owner: str = ""
    last_activity: str = ""
    password_last_changed: str = ""
    risk_rating: str = "Medium"
    status: str = "Active"
    notes: str = ""


class SharedAccountOut(BaseModel):
    id: int
    account_name: str
    purpose: str
    shared_with: str
    owner: str
    last_activity: str
    password_last_changed: str
    risk_rating: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Sensitive Transactions (Sub-page 9) ───────────────────────────────────
class SensitiveTransactionCreate(BaseModel):
    transaction_code: str
    description: str
    module: str = ""
    criticality: str = "High"
    users_with_access: int = 0
    authorized_users: int = 0
    excess_count: int = 0
    last_reviewed: str = ""
    notes: str = ""


class SensitiveTransactionOut(BaseModel):
    id: int
    transaction_code: str
    description: str
    module: str
    criticality: str
    users_with_access: int
    authorized_users: int
    excess_count: int
    last_reviewed: str
    notes: str
    model_config = {"from_attributes": True}


# ── Access vs Job-Role Fit (Sub-page 10) ──────────────────────────────────
class AccessRoleFitCreate(BaseModel):
    employee_id: str
    employee_name: str
    job_title: str = ""
    department: str = ""
    assigned_roles: str = ""
    excess_privileges: int = 0
    unused_roles: int = 0
    risk_score: float = 0.0
    fit_status: str = "Under Review"
    recommendation: str = ""
    notes: str = ""


class AccessRoleFitOut(BaseModel):
    id: int
    employee_id: str
    employee_name: str
    job_title: str
    department: str
    assigned_roles: str
    excess_privileges: int
    unused_roles: int
    risk_score: float
    fit_status: str
    recommendation: str
    notes: str
    model_config = {"from_attributes": True}


# ── Login Logs (Sub-page 13) ──────────────────────────────────────────────
class LoginLogCreate(BaseModel):
    user_id: str
    username: str
    login_time: str
    ip_address: str = ""
    location: str = ""
    success: bool = True
    failure_reason: str = ""
    consecutive_failures: int = 0
    risk_flag: str = "None"
    notes: str = ""


class LoginLogOut(BaseModel):
    id: int
    user_id: str
    username: str
    login_time: str
    ip_address: str
    location: str
    success: bool
    failure_reason: str
    consecutive_failures: int
    risk_flag: str
    notes: str
    model_config = {"from_attributes": True}


# ── External Access (Sub-page 14) ─────────────────────────────────────────
class ExternalAccessCreate(BaseModel):
    portal_user: str
    organization: str = ""
    access_type: str = ""
    modules_granted: str = ""
    granted_date: str = ""
    expiry_date: str = ""
    last_active: str = ""
    mfa_enabled: bool = False
    status: str = "Active"
    notes: str = ""


class ExternalAccessOut(BaseModel):
    id: int
    portal_user: str
    organization: str
    access_type: str
    modules_granted: str
    granted_date: str
    expiry_date: str
    last_active: str
    mfa_enabled: bool
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Access Requests (Sub-page 15) ─────────────────────────────────────────
class AccessRequestCreate(BaseModel):
    request_id: str
    requester: str
    requested_for: str = ""
    access_type: str = ""
    role_requested: str = ""
    business_justification: str = ""
    submitted_date: str = ""
    approver: str = ""
    approval_date: str = ""
    status: str = "Pending"
    notes: str = ""


class AccessRequestOut(BaseModel):
    id: int
    request_id: str
    requester: str
    requested_for: str
    access_type: str
    role_requested: str
    business_justification: str
    submitted_date: str
    approver: str
    approval_date: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Audit Scope (Sub-page 17) ─────────────────────────────────────────────
class AuditScopeCreate(BaseModel):
    entity_name: str
    entity_type: str = "System"
    in_scope: bool = True
    owner: str = ""
    last_audited: str = ""
    risk_rating: str = "Medium"
    notes: str = ""


class AuditScopeOut(BaseModel):
    id: int
    entity_name: str
    entity_type: str
    in_scope: bool
    owner: str
    last_audited: str
    risk_rating: str
    notes: str
    model_config = {"from_attributes": True}


# ── Control Matrix / RCM (Sub-page 18) ────────────────────────────────────
class ControlMatrixCreate(BaseModel):
    risk_id: str
    risk_description: str
    control_id: str = ""
    control_description: str = ""
    control_type: str = "Preventive"
    frequency: str = "Quarterly"
    owner: str = ""
    assertion: str = ""
    status: str = "Active"
    notes: str = ""


class ControlMatrixOut(BaseModel):
    id: int
    risk_id: str
    risk_description: str
    control_id: str
    control_description: str
    control_type: str
    frequency: str
    owner: str
    assertion: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Analytics Rules (Sub-page 19) ─────────────────────────────────────────
class AnalyticsRuleCreate(BaseModel):
    rule_code: str
    rule_name: str
    description: str = ""
    category: str = "Access Review"
    threshold: str = ""
    frequency: str = "Monthly"
    enabled: bool = True
    last_run: str = ""
    notes: str = ""


class AnalyticsRuleOut(BaseModel):
    id: int
    rule_code: str
    rule_name: str
    description: str
    category: str
    threshold: str
    frequency: str
    enabled: bool
    last_run: str
    notes: str
    model_config = {"from_attributes": True}


# ── Data Sources (Sub-page 20) ────────────────────────────────────────────
class DataSourceCreate(BaseModel):
    source_name: str
    source_type: str = "ERP Table"
    connection_string: str = ""
    tables_api: str = ""
    refresh_frequency: str = "Daily"
    last_synced: str = ""
    status: str = "Active"
    notes: str = ""


class DataSourceOut(BaseModel):
    id: int
    source_name: str
    source_type: str
    connection_string: str
    tables_api: str
    refresh_frequency: str
    last_synced: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Sampling Sets (Sub-page 21) ───────────────────────────────────────────
class SamplingSetCreate(BaseModel):
    set_name: str
    population: str = ""
    population_size: int = 0
    sample_size: int = 0
    method: str = "Random"
    confidence_level: str = "95%"
    status: str = "Draft"
    notes: str = ""


class SamplingSetOut(BaseModel):
    id: int
    set_name: str
    population: str
    population_size: int
    sample_size: int
    method: str
    confidence_level: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Exception Queue (Sub-page 22) ─────────────────────────────────────────
class ExceptionItemCreate(BaseModel):
    exception_id: str
    title: str
    category: str = "Access Violation"
    severity: str = "Medium"
    source_rule: str = ""
    affected_user: str = ""
    detected_date: str = ""
    disposition: str = "Open"
    assigned_to: str = ""
    notes: str = ""


class ExceptionItemOut(BaseModel):
    id: int
    exception_id: str
    title: str
    category: str
    severity: str
    source_rule: str
    affected_user: str
    detected_date: str
    disposition: str
    assigned_to: str
    notes: str
    model_config = {"from_attributes": True}


# ── Working Papers (Sub-page 23) ──────────────────────────────────────────
class WorkingPaperCreate(BaseModel):
    paper_id: str
    title: str
    section: str = ""
    prepared_by: str = ""
    reviewed_by: str = ""
    prepared_date: str = ""
    review_date: str = ""
    status: str = "Draft"
    evidence_refs: str = ""
    conclusion: str = ""
    notes: str = ""


class WorkingPaperOut(BaseModel):
    id: int
    paper_id: str
    title: str
    section: str
    prepared_by: str
    reviewed_by: str
    prepared_date: str
    review_date: str
    status: str
    evidence_refs: str
    conclusion: str
    notes: str
    model_config = {"from_attributes": True}


# ── Findings (Sub-page 24) ────────────────────────────────────────────────
class FindingCreate(BaseModel):
    finding_id: str
    title: str
    description: str = ""
    category: str = "Access Control"
    severity: str = "Medium"
    root_cause: str = ""
    recommendation: str = ""
    owner: str = ""
    raised_date: str = ""
    status: str = "Open"
    notes: str = ""


class FindingOut(BaseModel):
    id: int
    finding_id: str
    title: str
    description: str
    category: str
    severity: str
    root_cause: str
    recommendation: str
    owner: str
    raised_date: str
    status: str
    notes: str
    model_config = {"from_attributes": True}


# ── Remediation Tracker (Sub-page 25) ─────────────────────────────────────
class RemediationCreate(BaseModel):
    action_id: str
    title: str
    linked_finding: str = ""
    action_type: str = "CAPA"
    owner: str = ""
    due_date: str = ""
    assigned_date: str = ""
    status: str = "Open"
    retest_date: str = ""
    retest_result: str = ""
    notes: str = ""


class RemediationOut(BaseModel):
    id: int
    action_id: str
    title: str
    linked_finding: str
    action_type: str
    owner: str
    due_date: str
    assigned_date: str
    status: str
    retest_date: str
    retest_result: str
    notes: str
    model_config = {"from_attributes": True}
