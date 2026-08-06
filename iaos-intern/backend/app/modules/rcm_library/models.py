"""RCM Library module — models.

Backs all 25 catalogue sub-pages for "Risk & Control Matrix (RCM) Library".
Every table is prefixed `mod_rcm_library_` and tenant-isolated via TenantMixin.
"""
from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class RcmLibraryEntry(Base, TenantMixin):
    """Core register row: one process/risk/control combination.

    Backs sub-pages 1 (Process-Risk-Control Mapping), 2 (Control Attribute
    Register), 3 (Assertion Mapping), 4 (Regulatory Cross-Reference),
    6 (Test Procedure Linkage), 7 (Design vs Operating Effectiveness),
    8 (Control Rationalisation), 10 (Key-Control Designation) and 18
    (Shell: Risk & Control Matrix).
    """

    __tablename__ = "mod_rcm_library_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    process: Mapped[str] = mapped_column(String(200), nullable=False)
    risk: Mapped[str] = mapped_column(Text, nullable=False)
    control_description: Mapped[str] = mapped_column(Text, nullable=False)

    control_type: Mapped[str] = mapped_column(String(30), default="Preventive")  # Preventive, Detective, Corrective
    frequency: Mapped[str] = mapped_column(String(30), default="Monthly")  # Daily, Weekly, Monthly, Quarterly, Annual, Continuous, Event-Driven
    nature: Mapped[str] = mapped_column(String(30), default="Manual")  # Manual, Automated, IT-Dependent Manual
    is_key_control: Mapped[bool] = mapped_column(Boolean, default=False)

    assertions: Mapped[str] = mapped_column(String(400), default="")  # comma-separated
    regulatory_refs: Mapped[str] = mapped_column(String(400), default="")  # comma-separated

    owner: Mapped[str] = mapped_column(String(120), default="")
    reviewer: Mapped[str] = mapped_column(String(120), default="")

    test_procedure: Mapped[str] = mapped_column(Text, default="")

    design_effectiveness: Mapped[str] = mapped_column(String(30), default="Not Tested")  # Not Tested, Effective, Deficient
    operating_effectiveness: Mapped[str] = mapped_column(String(30), default="Not Tested")

    rationalization_status: Mapped[str] = mapped_column(String(30), default="Active")  # Active, Redundant, Over-Controlled, Under Review

    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default="Draft")  # Draft, Approved

    notes: Mapped[str] = mapped_column(Text, default="")


class RcmLibraryVersionLog(Base, TenantMixin):
    """Sub-page 9: Change & Version Control — audit trail of edits to entries."""

    __tablename__ = "mod_rcm_library_version_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    entry_id: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_process: Mapped[str] = mapped_column(String(200), default="")
    field_changed: Mapped[str] = mapped_column(String(60), default="")
    old_value: Mapped[str] = mapped_column(Text, default="")
    new_value: Mapped[str] = mapped_column(Text, default="")
    changed_by: Mapped[str] = mapped_column(String(120), default="")


class RcmLibraryOwner(Base, TenantMixin):
    """Sub-page 5: Control Owner Directory."""

    __tablename__ = "mod_rcm_library_owners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(160), default="")
    department: Mapped[str] = mapped_column(String(120), default="")
    role: Mapped[str] = mapped_column(String(30), default="Owner")  # Owner, Reviewer, Approver


class RcmLibraryTemplate(Base, TenantMixin):
    """Sub-page 12: Framework Templates — prebuilt RCMs by cycle/industry."""

    __tablename__ = "mod_rcm_library_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    cycle: Mapped[str] = mapped_column(String(120), default="")
    industry: Mapped[str] = mapped_column(String(120), default="All industries")
    description: Mapped[str] = mapped_column(Text, default="")
    default_process: Mapped[str] = mapped_column(String(200), default="")
    default_risk: Mapped[str] = mapped_column(Text, default="")
    default_control: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class RcmLibraryApproval(Base, TenantMixin):
    """Sub-page 15: RCM Approval Workflow."""

    __tablename__ = "mod_rcm_library_approvals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    entry_id: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_process: Mapped[str] = mapped_column(String(200), default="")
    requested_by: Mapped[str] = mapped_column(String(120), default="")
    approver: Mapped[str] = mapped_column(String(120), default="")
    status: Mapped[str] = mapped_column(String(20), default="Pending")  # Pending, Approved, Rejected
    comments: Mapped[str] = mapped_column(Text, default="")


class RcmLibraryScope(Base, TenantMixin):
    """Sub-page 17 (Shell): Scope & Audit Universe for this module."""

    __tablename__ = "mod_rcm_library_scope"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    unit_name: Mapped[str] = mapped_column(String(200), nullable=False)
    unit_type: Mapped[str] = mapped_column(String(30), default="Process")  # Entity, Process, Function, Location
    description: Mapped[str] = mapped_column(Text, default="")
    in_scope: Mapped[bool] = mapped_column(Boolean, default=True)


class RcmLibraryTestRule(Base, TenantMixin):
    """Sub-page 19 (Shell): Test & Analytics Rule Library."""

    __tablename__ = "mod_rcm_library_test_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    data_source: Mapped[str] = mapped_column(String(160), default="")
    threshold: Mapped[str] = mapped_column(String(160), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class RcmLibraryConnector(Base, TenantMixin):
    """Sub-page 20 (Shell): Data Source & Connector Setup."""

    __tablename__ = "mod_rcm_library_connectors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    source_type: Mapped[str] = mapped_column(String(30), default="ERP")  # ERP, API, Manual Upload, Database
    connection_details: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="Pending")  # Connected, Pending, Error


class RcmLibrarySample(Base, TenantMixin):
    """Sub-page 21 (Shell): Sampling & Population Builder."""

    __tablename__ = "mod_rcm_library_samples"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    population_description: Mapped[str] = mapped_column(Text, nullable=False)
    sampling_method: Mapped[str] = mapped_column(String(30), default="Random")  # Random, Judgemental, Systematic, Stratified
    population_size: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")


class RcmLibraryException(Base, TenantMixin):
    """Sub-page 22 (Shell): Exception & Red-Flag Queue."""

    __tablename__ = "mod_rcm_library_exceptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source_rule: Mapped[str] = mapped_column(String(200), default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium")  # Low, Medium, High, Critical
    status: Mapped[str] = mapped_column(String(20), default="Open")  # Open, Under Review, Closed, False Positive
    disposition_notes: Mapped[str] = mapped_column(Text, default="")


class RcmLibraryWorkingPaper(Base, TenantMixin):
    """Sub-page 23 (Shell): Working Papers & Evidence."""

    __tablename__ = "mod_rcm_library_working_papers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    related_entry_id: Mapped[int] = mapped_column(Integer, nullable=True)
    content: Mapped[str] = mapped_column(Text, default="")
    reviewer: Mapped[str] = mapped_column(String(120), default="")
    sign_off_status: Mapped[str] = mapped_column(String(20), default="Pending")  # Pending, Reviewed, Signed Off


class RcmLibraryFinding(Base, TenantMixin):
    """Sub-page 24 (Shell): Observation & Finding Log."""

    __tablename__ = "mod_rcm_library_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="Medium")  # Low, Medium, High, Critical
    related_entry_id: Mapped[int] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")  # Open, In Progress, Closed


class RcmLibraryRemediation(Base, TenantMixin):
    """Sub-page 25 (Shell): Remediation / Action Tracker."""

    __tablename__ = "mod_rcm_library_remediation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    finding_id: Mapped[int] = mapped_column(Integer, nullable=True)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    owner: Mapped[str] = mapped_column(String(120), default="")
    due_date: Mapped[str] = mapped_column(String(30), default="")
    status: Mapped[str] = mapped_column(String(20), default="Not Started")  # Not Started, In Progress, Completed, Overdue
    retest_status: Mapped[str] = mapped_column(String(20), default="Pending")  # Pending, Passed, Failed
