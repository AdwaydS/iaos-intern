from datetime import datetime, date
from sqlalchemy import String, Text, Integer, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class SoftwareLicenseProcedure(Base, TenantMixin):
    __tablename__ = "mod_software_license_procedures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    step_no: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="pending")
    performed_by: Mapped[str] = mapped_column(String(150), default="")
    signed_by: Mapped[str] = mapped_column(String(150), default="")
    signed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SoftwareLicenseScope(Base, TenantMixin):
    __tablename__ = "mod_software_license_scope"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    process_owner: Mapped[str] = mapped_column(String(150), default="")
    status: Mapped[str] = mapped_column(String(20), default="in_scope")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseRCM(Base, TenantMixin):
    __tablename__ = "mod_software_license_rcm"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    risk_id: Mapped[str] = mapped_column(String(50), nullable=False)
    control_desc: Mapped[str] = mapped_column(Text, default="")
    assertion: Mapped[str] = mapped_column(String(100), default="")
    control_owner: Mapped[str] = mapped_column(String(150), default="")
    status: Mapped[str] = mapped_column(String(20), default="effective")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseTestRule(Base, TenantMixin):
    __tablename__ = "mod_software_license_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(200), nullable=False)
    rule_type: Mapped[str] = mapped_column(String(50), default="threshold")
    threshold: Mapped[str] = mapped_column(String(150), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseDataSource(Base, TenantMixin):
    __tablename__ = "mod_software_license_datasources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_name: Mapped[str] = mapped_column(String(200), nullable=False)
    connector_type: Mapped[str] = mapped_column(String(50), default="upload")
    connection_string: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="not_connected")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseSample(Base, TenantMixin):
    __tablename__ = "mod_software_license_samples"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    population_desc: Mapped[str] = mapped_column(String(250), nullable=False)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(50), default="judgemental")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseException(Base, TenantMixin):
    __tablename__ = "mod_software_license_exceptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open")
    disposition: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseEvidence(Base, TenantMixin):
    __tablename__ = "mod_software_license_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    procedure_id: Mapped[int | None] = mapped_column(ForeignKey("mod_software_license_procedures.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_ref: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseFinding(Base, TenantMixin):
    __tablename__ = "mod_software_license_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open")
    control_owner: Mapped[str] = mapped_column(String(150), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SoftwareLicenseAction(Base, TenantMixin):
    __tablename__ = "mod_software_license_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    finding_id: Mapped[int | None] = mapped_column(ForeignKey("mod_software_license_findings.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(150), default="")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open")
    retest_status: Mapped[str] = mapped_column(String(20), default="not_started")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
