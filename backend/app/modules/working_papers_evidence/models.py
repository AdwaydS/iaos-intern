"""Working Papers & Evidence Vault — data model.

All tables prefixed `mod_working_papers_evidence_` per MODULE_GUIDE.md rule 1.
Everything tenant-owned inherits TenantMixin (rule 2).

Signature features covered here:
  #1  Document Index & Cross-Reference -> WorkingPaper.programme_step
  #2  Evidence Upload & Tagging        -> WorkingPaper (+ tags)
  #3  Tick-mark & Annotation Tool      -> TickMark
  #4  Version History & Audit Trail    -> WorkingPaperVersion
  #5  Reviewer Sign-off Chain          -> SignOff
  #6  Retention & Purge Policy         -> WorkingPaper.retention_years / purge_at
  #7  Access & Permission Matrix       -> AccessGrant
  #8  Evidence Integrity / Hashing     -> WorkingPaper.hash_algorithm / hash_value
  #9  Screenshot & Screen-capture Log  -> WorkingPaper.source_type == "screenshot"
  #10 Sampling Evidence Linker         -> WorkingPaper.sample_ref
  #11 Cross-Engagement Reuse           -> WorkingPaper.reused_from_id
  #12 Confidential / Privileged Flag   -> WorkingPaper.is_confidential
  #13 E-signature & Confirmation Store -> SignOff.signature_payload
  #14 Bulk Export / Regulator Pack     -> handled in router (reads across the above)
  #15 Completeness Scan                -> handled in router (query, no new table)
"""
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class WorkingPaper(Base, TenantMixin):
    """One piece of evidence / working paper. The central record of the vault."""

    __tablename__ = "mod_working_papers_evidence_papers"

    id: Mapped[int] = mapped_column(primary_key=True)

    # #1 Document Index & Cross-Reference — which programme step this supports
    programme_step: Mapped[str] = mapped_column(String(255), default="")
    engagement_ref: Mapped[str] = mapped_column(String(255), default="")

    # #2 Evidence Upload & Tagging
    title: Mapped[str] = mapped_column(String(255))
    filename: Mapped[str] = mapped_column(String(500), default="")
    storage_path: Mapped[str] = mapped_column(String(1000), default="")
    tags: Mapped[str] = mapped_column(String(500), default="")  # comma-separated
    notes: Mapped[str] = mapped_column(Text, default="")

    # #9 Screenshot & Screen-capture Log — same table, distinguished by source_type
    source_type: Mapped[str] = mapped_column(String(50), default="upload")  # upload | screenshot
    source_system: Mapped[str] = mapped_column(String(255), default="")

    # #10 Sampling Evidence Linker
    sample_ref: Mapped[str] = mapped_column(String(255), default="")

    # #11 Cross-Engagement Reuse
    reused_from_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_working_papers_evidence_papers.id"), nullable=True
    )

    # #12 Confidential / Privileged Flagging
    is_confidential: Mapped[bool] = mapped_column(Boolean, default=False)
    confidential_reason: Mapped[str] = mapped_column(String(500), default="")

    # #6 Retention & Purge Policy
    retention_years: Mapped[int] = mapped_column(Integer, default=7)
    purge_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # #8 Evidence Integrity / Hashing
    hash_algorithm: Mapped[str] = mapped_column(String(20), default="sha256")
    hash_value: Mapped[str] = mapped_column(String(128), default="")
    hash_verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    current_version: Mapped[int] = mapped_column(Integer, default=1)
    uploaded_by: Mapped[str] = mapped_column(String(255), default="")

    versions: Mapped[list["WorkingPaperVersion"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )
    tick_marks: Mapped[list["TickMark"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )
    sign_offs: Mapped[list["SignOff"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )
    access_grants: Mapped[list["AccessGrant"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )


class WorkingPaperVersion(Base, TenantMixin):
    """#4 Version History & Audit Trail — one row per change to a paper."""

    __tablename__ = "mod_working_papers_evidence_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(
        ForeignKey("mod_working_papers_evidence_papers.id", ondelete="CASCADE")
    )
    version_no: Mapped[int] = mapped_column(Integer)
    changed_by: Mapped[str] = mapped_column(String(255), default="")
    change_summary: Mapped[str] = mapped_column(Text, default="")
    storage_path: Mapped[str] = mapped_column(String(1000), default="")

    paper: Mapped["WorkingPaper"] = relationship(back_populates="versions")


class TickMark(Base, TenantMixin):
    """#3 Tick-mark & Annotation Tool."""

    __tablename__ = "mod_working_papers_evidence_tickmarks"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(
        ForeignKey("mod_working_papers_evidence_papers.id", ondelete="CASCADE")
    )
    symbol: Mapped[str] = mapped_column(String(10))  # e.g. "✓", "TB", "F", "N/A"
    location_ref: Mapped[str] = mapped_column(String(255), default="")  # page/cell/coord
    comment: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String(255), default="")

    paper: Mapped["WorkingPaper"] = relationship(back_populates="tick_marks")


class SignOff(Base, TenantMixin):
    """#5 Reviewer Sign-off Chain + #13 E-signature & Confirmation Store."""

    __tablename__ = "mod_working_papers_evidence_signoffs"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(
        ForeignKey("mod_working_papers_evidence_papers.id", ondelete="CASCADE")
    )
    stage: Mapped[str] = mapped_column(String(50))  # preparer | reviewer | manager | partner
    signed_by: Mapped[str] = mapped_column(String(255))
    signature_payload: Mapped[str] = mapped_column(Text, default="")  # typed name / e-sig token
    signed_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    paper: Mapped["WorkingPaper"] = relationship(back_populates="sign_offs")


class AccessGrant(Base, TenantMixin):
    """#7 Access & Permission Matrix — restrict a paper by role or specific user."""

    __tablename__ = "mod_working_papers_evidence_access"

    id: Mapped[int] = mapped_column(primary_key=True)
    paper_id: Mapped[int] = mapped_column(
        ForeignKey("mod_working_papers_evidence_papers.id", ondelete="CASCADE")
    )
    role: Mapped[str] = mapped_column(String(50), default="")   # auditor | tenant_admin | ""
    user_email: Mapped[str] = mapped_column(String(255), default="")
    permission: Mapped[str] = mapped_column(String(20), default="view")  # view | edit

    paper: Mapped["WorkingPaper"] = relationship(back_populates="access_grants")


# ============================================================================
# Shell features (#17-#22, #24-#25). #16 Dashboard and #23 Working Papers &
# Evidence are computed/served straight off the tables above — no new tables
# needed for those two.
# ============================================================================


class ScopeUnit(Base, TenantMixin):
    """#17 Scope & Audit Universe — auditable entities/processes in scope."""

    __tablename__ = "mod_working_papers_evidence_scope_units"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    unit_type: Mapped[str] = mapped_column(String(50), default="process")  # entity | process
    description: Mapped[str] = mapped_column(Text, default="")
    in_scope: Mapped[bool] = mapped_column(Boolean, default=True)


class RiskControl(Base, TenantMixin):
    """#18 Risk & Control Matrix (RCM)."""

    __tablename__ = "mod_working_papers_evidence_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    scope_unit_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_working_papers_evidence_scope_units.id"), nullable=True
    )
    risk: Mapped[str] = mapped_column(String(500))
    control: Mapped[str] = mapped_column(String(500), default="")
    assertion: Mapped[str] = mapped_column(String(120), default="")  # completeness, existence, etc.
    control_owner: Mapped[str] = mapped_column(String(255), default="")


class AnalyticsRule(Base, TenantMixin):
    """#19 Test & Analytics Rule Library — automated red-flag rules / CAAT scripts."""

    __tablename__ = "mod_working_papers_evidence_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    rule_type: Mapped[str] = mapped_column(String(50), default="threshold")  # threshold | script
    config: Mapped[str] = mapped_column(Text, default="")  # threshold value or script/query text
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class DataSourceConnector(Base, TenantMixin):
    """#20 Data Source & Connector Setup — ERP tables/APIs/uploads feeding analytics."""

    __tablename__ = "mod_working_papers_evidence_data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(50), default="upload")  # erp_table | api | upload
    connection_info: Mapped[str] = mapped_column(String(500), default="")
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class SamplePopulation(Base, TenantMixin):
    """#21 Sampling & Population Builder — the population a sample is drawn from."""

    __tablename__ = "mod_working_papers_evidence_populations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(50), default="judgemental")  # statistical | judgemental
    sample_size: Mapped[int] = mapped_column(Integer, default=0)

    items: Mapped[list["SampleItem"]] = relationship(
        back_populates="population", cascade="all, delete-orphan"
    )


class SampleItem(Base, TenantMixin):
    """A single drawn sample item — what WorkingPaper.sample_ref (#10) points at."""

    __tablename__ = "mod_working_papers_evidence_sample_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    population_id: Mapped[int] = mapped_column(
        ForeignKey("mod_working_papers_evidence_populations.id", ondelete="CASCADE")
    )
    reference: Mapped[str] = mapped_column(String(255))  # e.g. transaction/invoice ID
    description: Mapped[str] = mapped_column(String(500), default="")

    population: Mapped["SamplePopulation"] = relationship(back_populates="items")


class ExceptionItem(Base, TenantMixin):
    """#22 Exception & Red-Flag Queue — system-generated exceptions to triage."""

    __tablename__ = "mod_working_papers_evidence_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_working_papers_evidence_rules.id"), nullable=True
    )
    description: Mapped[str] = mapped_column(String(1000))
    status: Mapped[str] = mapped_column(String(30), default="open")  # open | disposed | escalated
    disposition: Mapped[str] = mapped_column(String(500), default="")
    raised_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class Finding(Base, TenantMixin):
    """#24 Observation & Finding Log."""

    __tablename__ = "mod_working_papers_evidence_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    grade: Mapped[str] = mapped_column(String(20), default="medium")  # low | medium | high | critical
    status: Mapped[str] = mapped_column(String(30), default="open")   # open | closed | in_remediation
    paper_id: Mapped[int | None] = mapped_column(
        ForeignKey("mod_working_papers_evidence_papers.id"), nullable=True
    )
    raised_by: Mapped[str] = mapped_column(String(255), default="")

    actions: Mapped[list["RemediationAction"]] = relationship(
        back_populates="finding", cascade="all, delete-orphan"
    )


class RemediationAction(Base, TenantMixin):
    """#25 Remediation / Action Tracker — CAPA items against a finding."""

    __tablename__ = "mod_working_papers_evidence_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    finding_id: Mapped[int] = mapped_column(
        ForeignKey("mod_working_papers_evidence_findings.id", ondelete="CASCADE")
    )
    action: Mapped[str] = mapped_column(String(500))
    owner: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="open")  # open | done | overdue
    retest_status: Mapped[str] = mapped_column(String(30), default="not_started")

    finding: Mapped["Finding"] = relationship(back_populates="actions")
