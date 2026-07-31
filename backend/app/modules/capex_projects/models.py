from sqlalchemy import String, Text, Integer, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


class CapexAFE(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_afes"

    id: Mapped[int] = mapped_column(primary_key=True)
    afe_no: Mapped[str] = mapped_column(String(50))
    project_name: Mapped[str] = mapped_column(String(255))
    project_type: Mapped[str] = mapped_column(String(80), default="")
    approved_afe: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    actual_spend: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    budget_pct: Mapped[str] = mapped_column(Numeric(8, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="open")
    approved_date: Mapped[str] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class CostOverrun(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_cost_overruns"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    afe_no: Mapped[str] = mapped_column(String(50), default="")
    sanctioned_cost: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    actual_cost: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    overrun_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    overrun_pct: Mapped[str] = mapped_column(Numeric(8, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class ScheduleOverrun(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_schedule_overruns"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    milestone: Mapped[str] = mapped_column(String(255), default="")
    planned_date: Mapped[str] = mapped_column(Date, nullable=True)
    actual_date: Mapped[str] = mapped_column(Date, nullable=True)
    delay_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class CapitalisationTiming(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_capitalisation_timing"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    commissioning_date: Mapped[str] = mapped_column(Date, nullable=True)
    capitalised_date: Mapped[str] = mapped_column(Date, nullable=True)
    delay_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class QuoteGovernance(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_quotes"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    item_desc: Mapped[str] = mapped_column(String(255), default="")
    quote_count: Mapped[int] = mapped_column(Integer, default=0)
    best_quote: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    chosen_quote: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    gap_pct: Mapped[str] = mapped_column(Numeric(8, 2), default=0)
    compliant: Mapped[str] = mapped_column(String(10), default="yes")
    notes: Mapped[str] = mapped_column(Text, default="")


class CwipTrace(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_cwip_trace"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    capex_spend: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    cwip_balance: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    fa_transfer: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    traced: Mapped[str] = mapped_column(String(10), default="no")
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class MilestonePayment(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_milestone_payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    milestone: Mapped[str] = mapped_column(String(255))
    scheduled_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    paid_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    progress_pct: Mapped[str] = mapped_column(Numeric(8, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class ChangeOrder(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_change_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    change_desc: Mapped[str] = mapped_column(Text)
    scope_impact: Mapped[str] = mapped_column(String(255), default="")
    cost_impact: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    approved: Mapped[str] = mapped_column(String(10), default="no")
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class ContractorAdvance(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_contractor_advances"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    contractor: Mapped[str] = mapped_column(String(255))
    advance_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    recovered_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    balance_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class RetentionLd(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_retention_ld"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    contractor: Mapped[str] = mapped_column(String(255))
    retention_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    retention_release_date: Mapped[str] = mapped_column(Date, nullable=True)
    ld_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="held")
    notes: Mapped[str] = mapped_column(Text, default="")


class IdleAbandonedCapex(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_idle_capex"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    capex_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="idle")
    last_activity_date: Mapped[str] = mapped_column(Date, nullable=True)
    idle_days: Mapped[int] = mapped_column(Integer, default=0)
    notes: Mapped[str] = mapped_column(Text, default="")


class CapexRoi(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_roi"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    capex_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    benefits_realised: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    roi_pct: Mapped[str] = mapped_column(Numeric(8, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class PoSplitting(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_po_splitting"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    vendor: Mapped[str] = mapped_column(String(255), default="")
    po_count: Mapped[int] = mapped_column(Integer, default=0)
    po_total: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    approval_threshold: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    flagged: Mapped[str] = mapped_column(String(10), default="no")
    notes: Mapped[str] = mapped_column(Text, default="")


class ProjectCashflow(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_cashflow"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_name: Mapped[str] = mapped_column(String(255))
    period: Mapped[str] = mapped_column(String(20), default="")
    planned_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    actual_amount: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    variance: Mapped[str] = mapped_column(Numeric(15, 2), default=0)
    status: Mapped[str] = mapped_column(String(40), default="on_track")
    notes: Mapped[str] = mapped_column(Text, default="")


class VendorPerformance(Base, TenantMixin):
    __tablename__ = "mod_capex_projects_vendor_perf"

    id: Mapped[int] = mapped_column(primary_key=True)
    vendor_name: Mapped[str] = mapped_column(String(255))
    project_name: Mapped[str] = mapped_column(String(255))
    on_time_delivery: Mapped[str] = mapped_column(String(10), default="yes")
    quality_rating: Mapped[str] = mapped_column(String(10), default="good")
    issues_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="active")
    notes: Mapped[str] = mapped_column(Text, default="")
