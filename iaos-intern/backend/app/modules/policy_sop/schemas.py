"""Policy & SOP module — Pydantic schemas.

Create / Update / Response schemas for every domain entity, plus shared
pagination and list-response helpers.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    pages: int


# ---------------------------------------------------------------------------
# Policy
# ---------------------------------------------------------------------------

class PolicyCreate(BaseModel):
    policy_number: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    version: str = "1.0"
    status: str = "draft"
    owner_id: Optional[int] = None
    custodian_id: Optional[int] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    next_review_date: Optional[date] = None
    tags: Optional[list] = None
    language: str = "en"
    is_mandatory: bool = False
    requires_attestation: bool = False
    file_path: Optional[str] = None
    file_type: Optional[str] = None


class PolicyUpdate(BaseModel):
    policy_number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    version: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[int] = None
    custodian_id: Optional[int] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    next_review_date: Optional[date] = None
    tags: Optional[list] = None
    language: Optional[str] = None
    is_mandatory: Optional[bool] = None
    requires_attestation: Optional[bool] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None


class PolicyResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    policy_number: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    version: str
    status: str
    owner_id: Optional[int] = None
    custodian_id: Optional[int] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    next_review_date: Optional[date] = None
    tags: Optional[list] = None
    language: str
    is_mandatory: bool
    requires_attestation: bool
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Policy Version
# ---------------------------------------------------------------------------

class PolicyVersionCreate(BaseModel):
    policy_id: int
    version_number: str
    change_summary: Optional[str] = None
    file_path: Optional[str] = None
    effective_date: Optional[date] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    status: str = "pending"


class PolicyVersionUpdate(BaseModel):
    version_number: Optional[str] = None
    change_summary: Optional[str] = None
    file_path: Optional[str] = None
    effective_date: Optional[date] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    status: Optional[str] = None


class PolicyVersionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    policy_id: int
    version_number: str
    change_summary: Optional[str] = None
    file_path: Optional[str] = None
    effective_date: Optional[date] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_by: Optional[int] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Approval Workflow
# ---------------------------------------------------------------------------

class ApprovalWorkflowCreate(BaseModel):
    policy_id: int
    submitted_by: int
    reviewer_id: Optional[int] = None
    status: str = "draft"
    comments: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None


class ApprovalWorkflowUpdate(BaseModel):
    reviewer_id: Optional[int] = None
    status: Optional[str] = None
    comments: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None


class ApprovalWorkflowResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    policy_id: int
    submitted_by: int
    reviewer_id: Optional[int] = None
    status: str
    comments: Optional[str] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Attestation
# ---------------------------------------------------------------------------

class AttestationCreate(BaseModel):
    policy_id: int
    user_id: int
    status: str = "pending"
    acknowledged_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AttestationUpdate(BaseModel):
    status: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AttestationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    policy_id: int
    user_id: int
    status: str
    acknowledged_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Policy Exception
# ---------------------------------------------------------------------------

class PolicyExceptionCreate(BaseModel):
    policy_id: int
    title: str
    description: Optional[str] = None
    requested_by: Optional[int] = None
    approved_by: Optional[int] = None
    risk_rating: str = "medium"
    status: str = "pending"
    justification: Optional[str] = None
    expiry_date: Optional[date] = None
    supporting_doc: Optional[str] = None


class PolicyExceptionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    approved_by: Optional[int] = None
    risk_rating: Optional[str] = None
    status: Optional[str] = None
    justification: Optional[str] = None
    expiry_date: Optional[date] = None
    supporting_doc: Optional[str] = None


class PolicyExceptionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    policy_id: int
    title: str
    description: Optional[str] = None
    requested_by: int
    approved_by: Optional[int] = None
    risk_rating: str
    status: str
    justification: Optional[str] = None
    expiry_date: Optional[date] = None
    supporting_doc: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Gap Analysis
# ---------------------------------------------------------------------------

class GapAnalysisCreate(BaseModel):
    regulation_name: str
    regulation_section: Optional[str] = None
    requirement_description: Optional[str] = None
    mapped_policy_id: Optional[int] = None
    gap_status: str = "non_compliant"
    risk_level: str = "medium"
    recommendation: Optional[str] = None
    assessed_by: Optional[int] = None
    assessed_at: Optional[datetime] = None


class GapAnalysisUpdate(BaseModel):
    regulation_name: Optional[str] = None
    regulation_section: Optional[str] = None
    requirement_description: Optional[str] = None
    mapped_policy_id: Optional[int] = None
    gap_status: Optional[str] = None
    risk_level: Optional[str] = None
    recommendation: Optional[str] = None
    assessed_by: Optional[int] = None
    assessed_at: Optional[datetime] = None


class GapAnalysisResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    regulation_name: str
    regulation_section: Optional[str] = None
    requirement_description: Optional[str] = None
    mapped_policy_id: Optional[int] = None
    gap_status: str
    risk_level: str
    recommendation: Optional[str] = None
    assessed_by: Optional[int] = None
    assessed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Breach Report
# ---------------------------------------------------------------------------

class BreachReportCreate(BaseModel):
    title: str
    description: Optional[str] = None
    policy_id: Optional[int] = None
    reported_by: Optional[int] = None
    department: Optional[str] = None
    severity: str = "medium"
    status: str = "open"
    evidence_path: Optional[str] = None
    evidence_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None


class BreachReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    policy_id: Optional[int] = None
    department: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    evidence_path: Optional[str] = None
    evidence_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None


class BreachReportResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    policy_id: Optional[int] = None
    reported_by: int
    department: Optional[str] = None
    severity: str
    status: str
    evidence_path: Optional[str] = None
    evidence_notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Notification
# ---------------------------------------------------------------------------

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: Optional[str] = None
    type: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    is_read: bool = False


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    user_id: int
    title: str
    message: Optional[str] = None
    type: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    is_read: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Observation
# ---------------------------------------------------------------------------

class ObservationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    finding_type: Optional[str] = None
    severity: str = "medium"
    recommendation: Optional[str] = None
    evidence_path: Optional[str] = None
    assigned_to: Optional[int] = None
    status: str = "open"


class ObservationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    finding_type: Optional[str] = None
    severity: Optional[str] = None
    recommendation: Optional[str] = None
    evidence_path: Optional[str] = None
    assigned_to: Optional[int] = None
    status: Optional[str] = None


class ObservationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    finding_type: Optional[str] = None
    severity: str
    recommendation: Optional[str] = None
    evidence_path: Optional[str] = None
    assigned_to: Optional[int] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Remediation
# ---------------------------------------------------------------------------

class RemediationCreate(BaseModel):
    finding_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    action_type: str = "corrective"
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    status: str = "open"
    progress: int = 0
    completion_date: Optional[datetime] = None
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None


class RemediationUpdate(BaseModel):
    finding_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    action_type: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    completion_date: Optional[datetime] = None
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None


class RemediationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    finding_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    action_type: str
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    status: str
    progress: int
    completion_date: Optional[datetime] = None
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Risk Control
# ---------------------------------------------------------------------------

class RiskControlCreate(BaseModel):
    risk_name: str
    risk_description: Optional[str] = None
    control_name: str
    control_description: Optional[str] = None
    control_owner: Optional[int] = None
    risk_rating: str = "medium"
    control_type: str = "preventive"
    department: Optional[str] = None
    linked_policy_id: Optional[int] = None
    assertions: Optional[dict] = None


class RiskControlUpdate(BaseModel):
    risk_name: Optional[str] = None
    risk_description: Optional[str] = None
    control_name: Optional[str] = None
    control_description: Optional[str] = None
    control_owner: Optional[int] = None
    risk_rating: Optional[str] = None
    control_type: Optional[str] = None
    department: Optional[str] = None
    linked_policy_id: Optional[int] = None
    assertions: Optional[dict] = None


class RiskControlResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    risk_name: str
    risk_description: Optional[str] = None
    control_name: str
    control_description: Optional[str] = None
    control_owner: Optional[int] = None
    risk_rating: str
    control_type: str
    department: Optional[str] = None
    linked_policy_id: Optional[int] = None
    assertions: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Regulation
# ---------------------------------------------------------------------------

class RegulationCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    source: Optional[str] = None
    category: Optional[str] = None


class RegulationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    source: Optional[str] = None
    category: Optional[str] = None


class RegulationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    name: str
    code: str
    description: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    source: Optional[str] = None
    category: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Policy Template
# ---------------------------------------------------------------------------

class PolicyTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    sections: Optional[dict] = None
    is_active: bool = True


class PolicyTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    sections: Optional[dict] = None
    is_active: Optional[bool] = None


class PolicyTemplateResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    sections: Optional[dict] = None
    is_active: bool
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Working Paper
# ---------------------------------------------------------------------------

class WorkingPaperCreate(BaseModel):
    title: str
    description: Optional[str] = None
    audit_id: Optional[int] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    evidence_notes: Optional[str] = None
    reviewer_id: Optional[int] = None
    review_status: str = "pending"
    signed_off_by: Optional[int] = None
    signed_off_at: Optional[datetime] = None


class WorkingPaperUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    audit_id: Optional[int] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    evidence_notes: Optional[str] = None
    reviewer_id: Optional[int] = None
    review_status: Optional[str] = None
    signed_off_by: Optional[int] = None
    signed_off_at: Optional[datetime] = None


class WorkingPaperResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    audit_id: Optional[int] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    evidence_notes: Optional[str] = None
    reviewer_id: Optional[int] = None
    review_status: str
    signed_off_by: Optional[int] = None
    signed_off_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Data Source
# ---------------------------------------------------------------------------

class DataSourceCreate(BaseModel):
    name: str
    source_type: str = "manual"
    connection_config: Optional[dict] = None
    description: Optional[str] = None
    is_active: bool = True
    last_synced: Optional[datetime] = None


class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    source_type: Optional[str] = None
    connection_config: Optional[dict] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    last_synced: Optional[datetime] = None


class DataSourceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    name: str
    source_type: str
    connection_config: Optional[dict] = None
    description: Optional[str] = None
    is_active: bool
    last_synced: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Sampling
# ---------------------------------------------------------------------------

class SamplingCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sample_type: str = "random"
    population_size: int = 0
    sample_size: int = 0
    criteria: Optional[dict] = None
    results: Optional[dict] = None


class SamplingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sample_type: Optional[str] = None
    population_size: Optional[int] = None
    sample_size: Optional[int] = None
    criteria: Optional[dict] = None
    results: Optional[dict] = None


class SamplingResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    sample_type: str
    population_size: int
    sample_size: int
    criteria: Optional[dict] = None
    results: Optional[dict] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Ownership Directory
# ---------------------------------------------------------------------------

class OwnershipDirectoryCreate(BaseModel):
    user_id: int
    role_type: str = "owner"
    department: Optional[str] = None
    responsibilities: Optional[str] = None
    is_active: bool = True


class OwnershipDirectoryUpdate(BaseModel):
    user_id: Optional[int] = None
    role_type: Optional[str] = None
    department: Optional[str] = None
    responsibilities: Optional[str] = None
    is_active: Optional[bool] = None


class OwnershipDirectoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    user_id: int
    role_type: str
    department: Optional[str] = None
    responsibilities: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Department
# ---------------------------------------------------------------------------

class DepartmentCreate(BaseModel):
    name: str
    code: str
    head_id: Optional[int] = None
    parent_id: Optional[int] = None
    is_active: bool = True


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    head_id: Optional[int] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    name: str
    code: str
    head_id: Optional[int] = None
    parent_id: Optional[int] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Announcement
# ---------------------------------------------------------------------------

class AnnouncementCreate(BaseModel):
    title: str
    content: Optional[str] = None
    priority: str = "medium"
    published_by: Optional[int] = None
    is_published: bool = False
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    published_by: Optional[int] = None
    is_published: Optional[bool] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AnnouncementResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    priority: str
    published_by: Optional[int] = None
    is_published: bool
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------

class AuditLogCreate(BaseModel):
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None


class AuditLogUpdate(BaseModel):
    action: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None


class AuditLogResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    tenant_id: Optional[int] = None
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
