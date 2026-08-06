from sqlalchemy import Integer, String, Float, Text, Date, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin

import enum
from datetime import datetime


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ── Signature Pages (1-15) ──────────────────────────────────────────────

class PosBankReconciliation(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_bank_rec"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    sale_date: Mapped[str] = mapped_column(Date)
    total_sales: Mapped[float] = mapped_column(Float, default=0)
    total_settlements: Mapped[float] = mapped_column(Float, default=0)
    variance: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(50), default="open")
    notes: Mapped[str] = mapped_column(Text, default="")


class CashVariance(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_cash_var"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    date: Mapped[str] = mapped_column(Date)
    expected_cash: Mapped[float] = mapped_column(Float, default=0)
    actual_cash: Mapped[float] = mapped_column(Float, default=0)
    variance: Mapped[float] = mapped_column(Float, default=0)
    trend_flag: Mapped[str] = mapped_column(String(20), default="normal")
    notes: Mapped[str] = mapped_column(Text, default="")


class DiscountOverride(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_discount_ovr"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    transaction_id: Mapped[str] = mapped_column(String(100))
    discount_amount: Mapped[float] = mapped_column(Float, default=0)
    original_amount: Mapped[float] = mapped_column(Float, default=0)
    discount_pct: Mapped[float] = mapped_column(Float, default=0)
    override_reason: Mapped[str] = mapped_column(String(255), default="")
    cashier_id: Mapped[str] = mapped_column(String(50), default="")
    timestamp: Mapped[str] = mapped_column(String(50), default="")
    risk_level: Mapped[str] = mapped_column(String(20), default="low")


class VoidRefund(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_void_refund"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    transaction_id: Mapped[str] = mapped_column(String(100))
    type: Mapped[str] = mapped_column(String(20))  # void / refund
    amount: Mapped[float] = mapped_column(Float, default=0)
    reason: Mapped[str] = mapped_column(String(255), default="")
    cashier_id: Mapped[str] = mapped_column(String(50), default="")
    timestamp: Mapped[str] = mapped_column(String(50), default="")
    risk_level: Mapped[str] = mapped_column(String(20), default="low")


class ShrinkageStockLoss(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_shrinkage"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    period: Mapped[str] = mapped_column(String(50))
    category: Mapped[str] = mapped_column(String(100), default="")
    book_stock: Mapped[float] = mapped_column(Float, default=0)
    physical_stock: Mapped[float] = mapped_column(Float, default=0)
    variance: Mapped[float] = mapped_column(Float, default=0)
    variance_pct: Mapped[float] = mapped_column(Float, default=0)
    root_cause: Mapped[str] = mapped_column(String(255), default="")


class CardWalletSettlement(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_card_settle"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    settlement_date: Mapped[str] = mapped_column(Date)
    total_card_sales: Mapped[float] = mapped_column(Float, default=0)
    mdr_amount: Mapped[float] = mapped_column(Float, default=0)
    mdr_rate: Mapped[float] = mapped_column(Float, default=0)
    net_settlement: Mapped[float] = mapped_column(Float, default=0)
    settlement_timing_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="pending")


class CashierException(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_cashier_exc"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    cashier_id: Mapped[str] = mapped_column(String(50))
    exception_type: Mapped[str] = mapped_column(String(50))  # no_sale, drawer_open, etc
    count: Mapped[int] = mapped_column(Integer, default=0)
    period: Mapped[str] = mapped_column(String(50))


class PriceIntegrityTest(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_price_int"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    item_code: Mapped[str] = mapped_column(String(100))
    shelf_price: Mapped[float] = mapped_column(Float, default=0)
    system_price: Mapped[float] = mapped_column(Float, default=0)
    variance: Mapped[float] = mapped_column(Float, default=0)
    test_date: Mapped[str] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(50), default="pass")


class LoyaltyPointsAbuse(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_loyalty_abuse"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    loyalty_id: Mapped[str] = mapped_column(String(100))
    transaction_id: Mapped[str] = mapped_column(String(100))
    points_accrued: Mapped[int] = mapped_column(Integer, default=0)
    points_expected: Mapped[int] = mapped_column(Integer, default=0)
    anomaly_flag: Mapped[str] = mapped_column(String(20), default="normal")
    timestamp: Mapped[str] = mapped_column(String(50), default="")


class StoreTransfer(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_store_transfer"

    id: Mapped[int] = mapped_column(primary_key=True)
    from_store: Mapped[str] = mapped_column(String(50))
    to_store: Mapped[str] = mapped_column(String(50))
    item_code: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    transfer_date: Mapped[str] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    document_ref: Mapped[str] = mapped_column(String(100), default="")


class DamageWriteOff(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_damage_wo"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    item_code: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    write_off_type: Mapped[str] = mapped_column(String(20))  # damage / expiry
    value: Mapped[float] = mapped_column(Float, default=0)
    date: Mapped[str] = mapped_column(Date)
    approved_by: Mapped[str] = mapped_column(String(100), default="")


class FootfallConversion(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_footfall_conv"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    date: Mapped[str] = mapped_column(Date)
    footfall_count: Mapped[int] = mapped_column(Integer, default=0)
    transaction_count: Mapped[int] = mapped_column(Integer, default=0)
    conversion_rate: Mapped[float] = mapped_column(Float, default=0)
    expected_revenue: Mapped[float] = mapped_column(Float, default=0)
    actual_revenue: Mapped[float] = mapped_column(Float, default=0)


class EmployeePurchase(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_emp_purchase"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    employee_id: Mapped[str] = mapped_column(String(50))
    transaction_id: Mapped[str] = mapped_column(String(100))
    discount_percent: Mapped[float] = mapped_column(Float, default=0)
    amount: Mapped[float] = mapped_column(Float, default=0)
    approved_by: Mapped[str] = mapped_column(String(100), default="")
    timestamp: Mapped[str] = mapped_column(String(50), default="")


class PettyCashFloat(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_petty_cash"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    float_amount: Mapped[float] = mapped_column(Float, default=0)
    disbursed_amount: Mapped[float] = mapped_column(Float, default=0)
    replenished_amount: Mapped[float] = mapped_column(Float, default=0)
    balance: Mapped[float] = mapped_column(Float, default=0)
    as_of_date: Mapped[str] = mapped_column(Date)


class PhysicalCountVsSystem(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_phys_count"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String(50))
    count_date: Mapped[str] = mapped_column(Date)
    item_code: Mapped[str] = mapped_column(String(100))
    system_qty: Mapped[int] = mapped_column(Integer, default=0)
    physical_qty: Mapped[int] = mapped_column(Integer, default=0)
    variance: Mapped[int] = mapped_column(Integer, default=0)
    counted_by: Mapped[str] = mapped_column(String(100), default="")
    verified_by: Mapped[str] = mapped_column(String(100), default="")


# ── Shell / Framework Pages (16-25) ─────────────────────────────────────

class AuditScope(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_scope"

    id: Mapped[int] = mapped_column(primary_key=True)
    unit_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    process_owner: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(50), default="in_scope")


class RiskControlMatrix(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_rcm"

    id: Mapped[int] = mapped_column(primary_key=True)
    risk_description: Mapped[str] = mapped_column(Text)
    control_description: Mapped[str] = mapped_column(Text)
    assertion: Mapped[str] = mapped_column(String(100), default="")
    control_owner: Mapped[str] = mapped_column(String(255), default="")
    risk_rating: Mapped[str] = mapped_column(String(20), default="medium")


class TestRuleLibrary(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_rules"

    id: Mapped[int] = mapped_column(primary_key=True)
    rule_name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    threshold: Mapped[str] = mapped_column(String(100), default="")
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    is_active: Mapped[bool] = mapped_column(default=True)


class DataSourceConnector(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_datasrc"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_name: Mapped[str] = mapped_column(String(255))
    source_type: Mapped[str] = mapped_column(String(50), default="api")
    connection_details: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(default=True)


class SamplingPopulation(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_sampling"

    id: Mapped[int] = mapped_column(primary_key=True)
    population_name: Mapped[str] = mapped_column(String(255))
    total_count: Mapped[int] = mapped_column(Integer, default=0)
    sample_size: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(50), default="random")
    confidence_level: Mapped[float] = mapped_column(Float, default=95)


class ExceptionRedFlag(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="open")
    disposition: Mapped[str] = mapped_column(String(255), default="")
    assigned_to: Mapped[str] = mapped_column(String(255), default="")


class WorkingPaperEvidence(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_wp"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    file_ref: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    reviewer_notes: Mapped[str] = mapped_column(Text, default="")


class ObservationFinding(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    finding_type: Mapped[str] = mapped_column(String(50), default="observation")


class RemediationAction(Base, TenantMixin):
    __tablename__ = "mod_pos_store_audit_remediation"

    id: Mapped[int] = mapped_column(primary_key=True)
    action_item: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    owner: Mapped[str] = mapped_column(String(255), default="")
    due_date: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(50), default="open")
    retest_status: Mapped[str] = mapped_column(String(50), default="pending")
