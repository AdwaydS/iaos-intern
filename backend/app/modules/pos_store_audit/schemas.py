from datetime import date
from pydantic import BaseModel, Field


class PosBankReconciliationCreate(BaseModel):
    store_id: str
    sale_date: date
    total_sales: float = 0
    total_settlements: float = 0
    variance: float = 0
    status: str = "open"
    notes: str = ""


class PosBankReconciliationOut(BaseModel):
    id: int
    store_id: str
    sale_date: date
    total_sales: float
    total_settlements: float
    variance: float
    status: str
    notes: str
    model_config = {"from_attributes": True}


class CashVarianceCreate(BaseModel):
    store_id: str
    date: date
    expected_cash: float = 0
    actual_cash: float = 0
    variance: float = 0
    trend_flag: str = "normal"
    notes: str = ""


class CashVarianceOut(BaseModel):
    id: int
    store_id: str
    date: date
    expected_cash: float
    actual_cash: float
    variance: float
    trend_flag: str
    notes: str
    model_config = {"from_attributes": True}


class DiscountOverrideCreate(BaseModel):
    store_id: str
    transaction_id: str
    discount_amount: float = 0
    original_amount: float = 0
    discount_pct: float = 0
    override_reason: str = ""
    cashier_id: str = ""
    timestamp: str = ""
    risk_level: str = "low"


class DiscountOverrideOut(BaseModel):
    id: int
    store_id: str
    transaction_id: str
    discount_amount: float
    original_amount: float
    discount_pct: float
    override_reason: str
    cashier_id: str
    timestamp: str
    risk_level: str
    model_config = {"from_attributes": True}


class VoidRefundCreate(BaseModel):
    store_id: str
    transaction_id: str
    type: str
    amount: float = 0
    reason: str = ""
    cashier_id: str = ""
    timestamp: str = ""
    risk_level: str = "low"


class VoidRefundOut(BaseModel):
    id: int
    store_id: str
    transaction_id: str
    type: str
    amount: float
    reason: str
    cashier_id: str
    timestamp: str
    risk_level: str
    model_config = {"from_attributes": True}


class ShrinkageStockLossCreate(BaseModel):
    store_id: str
    period: str
    category: str = ""
    book_stock: float = 0
    physical_stock: float = 0
    variance: float = 0
    variance_pct: float = 0
    root_cause: str = ""


class ShrinkageStockLossOut(BaseModel):
    id: int
    store_id: str
    period: str
    category: str
    book_stock: float
    physical_stock: float
    variance: float
    variance_pct: float
    root_cause: str
    model_config = {"from_attributes": True}


class CardWalletSettlementCreate(BaseModel):
    store_id: str
    settlement_date: date
    total_card_sales: float = 0
    mdr_amount: float = 0
    mdr_rate: float = 0
    net_settlement: float = 0
    settlement_timing_days: int = 0
    status: str = "pending"


class CardWalletSettlementOut(BaseModel):
    id: int
    store_id: str
    settlement_date: date
    total_card_sales: float
    mdr_amount: float
    mdr_rate: float
    net_settlement: float
    settlement_timing_days: int
    status: str
    model_config = {"from_attributes": True}


class CashierExceptionCreate(BaseModel):
    store_id: str
    cashier_id: str
    exception_type: str
    count: int = 0
    period: str


class CashierExceptionOut(BaseModel):
    id: int
    store_id: str
    cashier_id: str
    exception_type: str
    count: int
    period: str
    model_config = {"from_attributes": True}


class PriceIntegrityTestCreate(BaseModel):
    store_id: str
    item_code: str
    shelf_price: float = 0
    system_price: float = 0
    variance: float = 0
    test_date: date
    status: str = "pass"


class PriceIntegrityTestOut(BaseModel):
    id: int
    store_id: str
    item_code: str
    shelf_price: float
    system_price: float
    variance: float
    test_date: date
    status: str
    model_config = {"from_attributes": True}


class LoyaltyPointsAbuseCreate(BaseModel):
    store_id: str
    loyalty_id: str
    transaction_id: str
    points_accrued: int = 0
    points_expected: int = 0
    anomaly_flag: str = "normal"
    timestamp: str = ""


class LoyaltyPointsAbuseOut(BaseModel):
    id: int
    store_id: str
    loyalty_id: str
    transaction_id: str
    points_accrued: int
    points_expected: int
    anomaly_flag: str
    timestamp: str
    model_config = {"from_attributes": True}


class StoreTransferCreate(BaseModel):
    from_store: str
    to_store: str
    item_code: str
    quantity: int = 0
    transfer_date: date
    status: str = "pending"
    document_ref: str = ""


class StoreTransferOut(BaseModel):
    id: int
    from_store: str
    to_store: str
    item_code: str
    quantity: int
    transfer_date: date
    status: str
    document_ref: str
    model_config = {"from_attributes": True}


class DamageWriteOffCreate(BaseModel):
    store_id: str
    item_code: str
    quantity: int = 0
    write_off_type: str
    value: float = 0
    date: date
    approved_by: str = ""


class DamageWriteOffOut(BaseModel):
    id: int
    store_id: str
    item_code: str
    quantity: int
    write_off_type: str
    value: float
    date: date
    approved_by: str
    model_config = {"from_attributes": True}


class FootfallConversionCreate(BaseModel):
    store_id: str
    date: date
    footfall_count: int = 0
    transaction_count: int = 0
    conversion_rate: float = 0
    expected_revenue: float = 0
    actual_revenue: float = 0


class FootfallConversionOut(BaseModel):
    id: int
    store_id: str
    date: date
    footfall_count: int
    transaction_count: int
    conversion_rate: float
    expected_revenue: float
    actual_revenue: float
    model_config = {"from_attributes": True}


class EmployeePurchaseCreate(BaseModel):
    store_id: str
    employee_id: str
    transaction_id: str
    discount_percent: float = 0
    amount: float = 0
    approved_by: str = ""
    timestamp: str = ""


class EmployeePurchaseOut(BaseModel):
    id: int
    store_id: str
    employee_id: str
    transaction_id: str
    discount_percent: float
    amount: float
    approved_by: str
    timestamp: str
    model_config = {"from_attributes": True}


class PettyCashFloatCreate(BaseModel):
    store_id: str
    float_amount: float = 0
    disbursed_amount: float = 0
    replenished_amount: float = 0
    balance: float = 0
    as_of_date: date


class PettyCashFloatOut(BaseModel):
    id: int
    store_id: str
    float_amount: float
    disbursed_amount: float
    replenished_amount: float
    balance: float
    as_of_date: date
    model_config = {"from_attributes": True}


class PhysicalCountVsSystemCreate(BaseModel):
    store_id: str
    count_date: date
    item_code: str
    system_qty: int = 0
    physical_qty: int = 0
    variance: int = 0
    counted_by: str = ""
    verified_by: str = ""


class PhysicalCountVsSystemOut(BaseModel):
    id: int
    store_id: str
    count_date: date
    item_code: str
    system_qty: int
    physical_qty: int
    variance: int
    counted_by: str
    verified_by: str
    model_config = {"from_attributes": True}


# ── Shell schemas ───────────────────────────────────────────────────────

class AuditScopeCreate(BaseModel):
    unit_name: str
    description: str = ""
    process_owner: str = ""
    status: str = "in_scope"


class AuditScopeOut(BaseModel):
    id: int
    unit_name: str
    description: str
    process_owner: str
    status: str
    model_config = {"from_attributes": True}


class RiskControlMatrixCreate(BaseModel):
    risk_description: str
    control_description: str
    assertion: str = ""
    control_owner: str = ""
    risk_rating: str = "medium"


class RiskControlMatrixOut(BaseModel):
    id: int
    risk_description: str
    control_description: str
    assertion: str
    control_owner: str
    risk_rating: str
    model_config = {"from_attributes": True}


class TestRuleLibraryCreate(BaseModel):
    rule_name: str
    description: str = ""
    threshold: str = ""
    severity: str = "medium"
    is_active: bool = True


class TestRuleLibraryOut(BaseModel):
    id: int
    rule_name: str
    description: str
    threshold: str
    severity: str
    is_active: bool
    model_config = {"from_attributes": True}


class DataSourceConnectorCreate(BaseModel):
    source_name: str
    source_type: str = "api"
    connection_details: str = ""
    is_active: bool = True


class DataSourceConnectorOut(BaseModel):
    id: int
    source_name: str
    source_type: str
    connection_details: str
    is_active: bool
    model_config = {"from_attributes": True}


class SamplingPopulationCreate(BaseModel):
    population_name: str
    total_count: int = 0
    sample_size: int = 0
    method: str = "random"
    confidence_level: float = 95


class SamplingPopulationOut(BaseModel):
    id: int
    population_name: str
    total_count: int
    sample_size: int
    method: str
    confidence_level: float
    model_config = {"from_attributes": True}


class ExceptionRedFlagCreate(BaseModel):
    title: str
    description: str = ""
    severity: str = "medium"
    status: str = "open"
    disposition: str = ""
    assigned_to: str = ""


class ExceptionRedFlagOut(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    disposition: str
    assigned_to: str
    model_config = {"from_attributes": True}


class WorkingPaperEvidenceCreate(BaseModel):
    title: str
    description: str = ""
    file_ref: str = ""
    status: str = "draft"
    reviewer_notes: str = ""


class WorkingPaperEvidenceOut(BaseModel):
    id: int
    title: str
    description: str
    file_ref: str
    status: str
    reviewer_notes: str
    model_config = {"from_attributes": True}


class ObservationFindingCreate(BaseModel):
    title: str
    description: str = ""
    severity: str = "medium"
    status: str = "draft"
    finding_type: str = "observation"


class ObservationFindingOut(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    finding_type: str
    model_config = {"from_attributes": True}


class RemediationActionCreate(BaseModel):
    action_item: str
    description: str = ""
    owner: str = ""
    due_date: str = ""
    status: str = "open"
    retest_status: str = "pending"


class RemediationActionOut(BaseModel):
    id: int
    action_item: str
    description: str
    owner: str
    due_date: str
    status: str
    retest_status: str
    model_config = {"from_attributes": True}
