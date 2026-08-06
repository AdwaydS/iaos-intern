"""Policy & SOP module — all domain models.

Migrated from the standalone policy-sop-repository into the iaos-intern
modular architecture. Every model inherits TenantMixin for row-level
multi-tenancy and uses SQLAlchemy 2.0 Mapped[] column style.
"""
from __future__ import annotations

import enum
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class PolicyStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    under_review = "under_review"
    approved = "approved"
    rejected = "rejected"
    retired = "retired"


# ---------------------------------------------------------------------------
# Policy
# ---------------------------------------------------------------------------

class Policy(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_policies"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    category: Mapped[Optional[str]] = mapped_column(String(100), index=True, default=None)
    department: Mapped[Optional[str]] = mapped_column(String(100), index=True, default=None)
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    status: Mapped[str] = mapped_column(String(20), index=True, default="draft")
    owner_id: Mapped[Optional[int]] = mapped_column(default=None)
    custodian_id: Mapped[Optional[int]] = mapped_column(default=None)
    effective_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    next_review_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    tags: Mapped[Optional[list]] = mapped_column(JSON, default=None)
    language: Mapped[str] = mapped_column(String(10), default="en")
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_attestation: Mapped[bool] = mapped_column(Boolean, default=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    file_type: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    created_by: Mapped[Optional[int]] = mapped_column(default=None)

    versions = relationship("PolicyVersion", back_populates="policy", cascade="all, delete-orphan")
    attestations = relationship("Attestation", back_populates="policy", cascade="all, delete-orphan")
    mappings = relationship("GapAnalysis", back_populates="mapped_policy")
    exceptions = relationship("PolicyException", back_populates="policy", cascade="all, delete-orphan")
    approvals = relationship("ApprovalWorkflow", back_populates="policy", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Policy Version
# ---------------------------------------------------------------------------

class PolicyVersion(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(ForeignKey("mod_policy_sop_policies.id"), index=True)
    version_number: Mapped[str] = mapped_column(String(20))
    change_summary: Mapped[Optional[str]] = mapped_column(Text, default=None)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    effective_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    approved_by: Mapped[Optional[int]] = mapped_column(default=None)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    created_by: Mapped[Optional[int]] = mapped_column(default=None)
    status: Mapped[str] = mapped_column(String(20), default="pending")

    policy = relationship("Policy", back_populates="versions")


# ---------------------------------------------------------------------------
# Approval Workflow
# ---------------------------------------------------------------------------

class ApprovalWorkflow(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_approvals"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(ForeignKey("mod_policy_sop_policies.id"), index=True)
    submitted_by: Mapped[int] = mapped_column(Integer)
    reviewer_id: Mapped[Optional[int]] = mapped_column(default=None)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    comments: Mapped[Optional[str]] = mapped_column(Text, default=None)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)

    policy = relationship("Policy", back_populates="approvals")


# ---------------------------------------------------------------------------
# Attestation
# ---------------------------------------------------------------------------

class Attestation(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_attestations"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(ForeignKey("mod_policy_sop_policies.id"), index=True)
    user_id: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)

    policy = relationship("Policy", back_populates="attestations")


# ---------------------------------------------------------------------------
# Policy Exception
# ---------------------------------------------------------------------------

class PolicyException(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    policy_id: Mapped[int] = mapped_column(ForeignKey("mod_policy_sop_policies.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    requested_by: Mapped[int] = mapped_column(Integer)
    approved_by: Mapped[Optional[int]] = mapped_column(default=None)
    risk_rating: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    justification: Mapped[Optional[str]] = mapped_column(Text, default=None)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    supporting_doc: Mapped[Optional[str]] = mapped_column(String(500), default=None)

    policy = relationship("Policy", back_populates="exceptions")


# ---------------------------------------------------------------------------
# Gap Analysis
# ---------------------------------------------------------------------------

class GapAnalysis(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_gap_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    regulation_name: Mapped[str] = mapped_column(String(255))
    regulation_section: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    requirement_description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    mapped_policy_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("mod_policy_sop_policies.id"), default=None
    )
    gap_status: Mapped[str] = mapped_column(String(20), default="non_compliant")
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")
    recommendation: Mapped[Optional[str]] = mapped_column(Text, default=None)
    assessed_by: Mapped[Optional[int]] = mapped_column(default=None)
    assessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)

    mapped_policy = relationship("Policy", back_populates="mappings")


# ---------------------------------------------------------------------------
# Breach Report
# ---------------------------------------------------------------------------

class BreachReport(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_breach_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    policy_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("mod_policy_sop_policies.id"), default=None
    )
    reported_by: Mapped[int] = mapped_column(Integer)
    department: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open")
    evidence_path: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    evidence_notes: Mapped[Optional[str]] = mapped_column(Text, default=None)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, default=None)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)


# ---------------------------------------------------------------------------
# Notification
# ---------------------------------------------------------------------------

class Notification(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[Optional[str]] = mapped_column(Text, default=None)
    type: Mapped[Optional[str]] = mapped_column(String(50), default=None)
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), default=None)
    reference_id: Mapped[Optional[int]] = mapped_column(default=None)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)


# ---------------------------------------------------------------------------
# Observation
# ---------------------------------------------------------------------------

class Observation(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_observations"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    finding_type: Mapped[Optional[str]] = mapped_column(String(50), default=None)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    recommendation: Mapped[Optional[str]] = mapped_column(Text, default=None)
    evidence_path: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    assigned_to: Mapped[Optional[int]] = mapped_column(default=None)
    status: Mapped[str] = mapped_column(String(20), default="open")


# ---------------------------------------------------------------------------
# Remediation
# ---------------------------------------------------------------------------

class Remediation(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_remediations"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[Optional[int]] = mapped_column(default=None)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    action_type: Mapped[str] = mapped_column(String(20), default="corrective")
    assigned_to: Mapped[Optional[int]] = mapped_column(default=None)
    due_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    status: Mapped[str] = mapped_column(String(20), default="open")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    completion_date: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    verified_by: Mapped[Optional[int]] = mapped_column(default=None)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)


# ---------------------------------------------------------------------------
# Risk Control
# ---------------------------------------------------------------------------

class RiskControl(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_risk_controls"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_name: Mapped[str] = mapped_column(String(255))
    risk_description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    control_name: Mapped[str] = mapped_column(String(255))
    control_description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    control_owner: Mapped[Optional[int]] = mapped_column(default=None)
    risk_rating: Mapped[str] = mapped_column(String(20), default="medium")
    control_type: Mapped[str] = mapped_column(String(20), default="preventive")
    department: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    linked_policy_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("mod_policy_sop_policies.id"), default=None
    )
    assertions: Mapped[Optional[dict]] = mapped_column(JSON, default=None)


# ---------------------------------------------------------------------------
# Regulation
# ---------------------------------------------------------------------------

class Regulation(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_regulations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    code: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    version: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    effective_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, default=None)
    source: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    category: Mapped[Optional[str]] = mapped_column(String(100), default=None)


# ---------------------------------------------------------------------------
# Template
# ---------------------------------------------------------------------------

class PolicyTemplate(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    category: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    content: Mapped[Optional[str]] = mapped_column(Text, default=None)
    sections: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[Optional[int]] = mapped_column(default=None)


# ---------------------------------------------------------------------------
# Working Paper
# ---------------------------------------------------------------------------

class WorkingPaper(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_working_papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    audit_id: Mapped[Optional[int]] = mapped_column(default=None)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), default=None)
    file_type: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    evidence_notes: Mapped[Optional[str]] = mapped_column(Text, default=None)
    reviewer_id: Mapped[Optional[int]] = mapped_column(default=None)
    review_status: Mapped[str] = mapped_column(String(20), default="pending")
    signed_off_by: Mapped[Optional[int]] = mapped_column(default=None)
    signed_off_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    created_by: Mapped[Optional[int]] = mapped_column(default=None)


# ---------------------------------------------------------------------------
# Data Source
# ---------------------------------------------------------------------------

class DataSource(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(20), default="manual")
    connection_config: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_synced: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    created_by: Mapped[Optional[int]] = mapped_column(default=None)


# ---------------------------------------------------------------------------
# Sampling
# ---------------------------------------------------------------------------

class Sampling(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_samplings"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, default=None)
    sample_type: Mapped[str] = mapped_column(String(20), default="random")
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    criteria: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    results: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    created_by: Mapped[Optional[int]] = mapped_column(default=None)


# ---------------------------------------------------------------------------
# Ownership Directory
# ---------------------------------------------------------------------------

class OwnershipDirectory(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_ownership"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer)
    role_type: Mapped[str] = mapped_column(String(20), default="owner")
    department: Mapped[Optional[str]] = mapped_column(String(100), default=None)
    responsibilities: Mapped[Optional[str]] = mapped_column(Text, default=None)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


# ---------------------------------------------------------------------------
# Department
# ---------------------------------------------------------------------------

class Department(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    code: Mapped[str] = mapped_column(String(50), unique=True)
    head_id: Mapped[Optional[int]] = mapped_column(default=None)
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("mod_policy_sop_departments.id"), default=None
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    parent = relationship("Department", remote_side="Department.id", backref="children")


# ---------------------------------------------------------------------------
# Announcement
# ---------------------------------------------------------------------------

class Announcement(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_announcements"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[Optional[str]] = mapped_column(Text, default=None)
    priority: Mapped[str] = mapped_column(String(10), default="medium")
    published_by: Mapped[Optional[int]] = mapped_column(default=None)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None)


# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------

class AuditLog(Base, TenantMixin):
    __tablename__ = "mod_policy_sop_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(default=None)
    action: Mapped[str] = mapped_column(String(100))
    entity_type: Mapped[str] = mapped_column(String(100))
    entity_id: Mapped[Optional[int]] = mapped_column(default=None)
    details: Mapped[Optional[dict]] = mapped_column(JSON, default=None)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), default=None)
