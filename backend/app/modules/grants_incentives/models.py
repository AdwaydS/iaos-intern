from sqlalchemy import String, Text, Integer, Numeric, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.core.tenancy import TenantMixin


class Scheme(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_schemes"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    scheme_type: Mapped[str] = mapped_column(String(80), default="grant")
    governing_body: Mapped[str] = mapped_column(String(255), default="")
    max_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    start_date: Mapped[str] = mapped_column(Date, nullable=True)
    end_date: Mapped[str] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="active")
    notes: Mapped[str] = mapped_column(Text, default="")


class SchemeEligibility(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_eligibility"
    id: Mapped[int] = mapped_column(primary_key=True)
    entity_name: Mapped[str] = mapped_column(String(255))
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    eligible: Mapped[str] = mapped_column(String(10), default="yes")
    validity_from: Mapped[str] = mapped_column(Date, nullable=True)
    validity_to: Mapped[str] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class Claim(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_claims"
    id: Mapped[int] = mapped_column(primary_key=True)
    claim_ref: Mapped[str] = mapped_column(String(50))
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    entity_name: Mapped[str] = mapped_column(String(255))
    claimed_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    computed_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    claim_date: Mapped[str] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class Document(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    claim_id: Mapped[int] = mapped_column(Integer)
    document_name: Mapped[str] = mapped_column(String(255))
    document_type: Mapped[str] = mapped_column(String(80), default="supporting")
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class Receipt(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_receipts"
    id: Mapped[int] = mapped_column(primary_key=True)
    claim_id: Mapped[int] = mapped_column(Integer)
    claim_ref: Mapped[str] = mapped_column(String(50))
    scheme_code: Mapped[str] = mapped_column(String(50))
    amount_received: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    receipt_date: Mapped[str] = mapped_column(Date, nullable=True)
    ageing_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class ConditionCompliance(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_conditions"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    entity_name: Mapped[str] = mapped_column(String(255))
    condition_desc: Mapped[str] = mapped_column(Text)
    compliance_status: Mapped[str] = mapped_column(String(40), default="pending")
    due_date: Mapped[str] = mapped_column(Date, nullable=True)
    evidence_ref: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")


class ExportIncentive(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_export"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    claim_ref: Mapped[str] = mapped_column(String(50))
    export_value: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    incentive_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    claim_date: Mapped[str] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class CapitalSubsidy(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_capital"
    id: Mapped[int] = mapped_column(primary_key=True)
    entity_name: Mapped[str] = mapped_column(String(255))
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    investment_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    subsidy_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    claim_date: Mapped[str] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class InterestSubvention(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_interest"
    id: Mapped[int] = mapped_column(primary_key=True)
    entity_name: Mapped[str] = mapped_column(String(255))
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    loan_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    subvention_pct: Mapped[str] = mapped_column(String(10), default="0")
    subvention_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    claim_date: Mapped[str] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class GrantAccounting(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_accounting"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    entity_name: Mapped[str] = mapped_column(String(255))
    grant_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    recognition_method: Mapped[str] = mapped_column(String(80), default="income")
    periods: Mapped[int] = mapped_column(Integer, default=1)
    period_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class ClawbackRisk(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_clawback"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    entity_name: Mapped[str] = mapped_column(String(255))
    condition_breached: Mapped[str] = mapped_column(Text)
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")
    exposure_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    mitigation: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class Deadline(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_deadlines"
    id: Mapped[int] = mapped_column(primary_key=True)
    deadline_type: Mapped[str] = mapped_column(String(80))
    deadline_name: Mapped[str] = mapped_column(String(255))
    due_date: Mapped[str] = mapped_column(Date)
    scheme_code: Mapped[str] = mapped_column(String(50), default="")
    claim_ref: Mapped[str] = mapped_column(String(50), default="")
    responsible: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class SchemeOverlap(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_overlaps"
    id: Mapped[int] = mapped_column(primary_key=True)
    entity_name: Mapped[str] = mapped_column(String(255))
    scheme_1_code: Mapped[str] = mapped_column(String(50))
    scheme_1_name: Mapped[str] = mapped_column(String(255))
    scheme_2_code: Mapped[str] = mapped_column(String(50))
    scheme_2_name: Mapped[str] = mapped_column(String(255))
    overlap_desc: Mapped[str] = mapped_column(Text)
    risk_level: Mapped[str] = mapped_column(String(20), default="medium")
    resolution: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class AuthorityCorrespondence(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_correspondence"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    authority: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(255))
    date_sent: Mapped[str] = mapped_column(Date, nullable=True)
    response_due: Mapped[str] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="sent")
    notes: Mapped[str] = mapped_column(Text, default="")


class UtilisationReport(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_utilisation"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    entity_name: Mapped[str] = mapped_column(String(255))
    grant_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    utilised_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    report_date: Mapped[str] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class IncentiveRealisation(Base, TenantMixin):
    __tablename__ = "mod_grants_incentives_realisation"
    id: Mapped[int] = mapped_column(primary_key=True)
    scheme_code: Mapped[str] = mapped_column(String(50))
    scheme_name: Mapped[str] = mapped_column(String(255))
    entity_name: Mapped[str] = mapped_column(String(255))
    claimed_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    received_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    variance: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    claim_date: Mapped[str] = mapped_column(Date, nullable=True)
    receipt_date: Mapped[str] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")
