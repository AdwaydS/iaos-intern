from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import (
    PosBankReconciliation, CashVariance, DiscountOverride, VoidRefund,
    ShrinkageStockLoss, CardWalletSettlement, CashierException,
    PriceIntegrityTest, LoyaltyPointsAbuse, StoreTransfer, DamageWriteOff,
    FootfallConversion, EmployeePurchase, PettyCashFloat, PhysicalCountVsSystem,
    AuditScope, RiskControlMatrix, TestRuleLibrary, DataSourceConnector,
    SamplingPopulation, ExceptionRedFlag, WorkingPaperEvidence,
    ObservationFinding, RemediationAction,
)
from .schemas import (
    PosBankReconciliationCreate, PosBankReconciliationOut,
    CashVarianceCreate, CashVarianceOut,
    DiscountOverrideCreate, DiscountOverrideOut,
    VoidRefundCreate, VoidRefundOut,
    ShrinkageStockLossCreate, ShrinkageStockLossOut,
    CardWalletSettlementCreate, CardWalletSettlementOut,
    CashierExceptionCreate, CashierExceptionOut,
    PriceIntegrityTestCreate, PriceIntegrityTestOut,
    LoyaltyPointsAbuseCreate, LoyaltyPointsAbuseOut,
    StoreTransferCreate, StoreTransferOut,
    DamageWriteOffCreate, DamageWriteOffOut,
    FootfallConversionCreate, FootfallConversionOut,
    EmployeePurchaseCreate, EmployeePurchaseOut,
    PettyCashFloatCreate, PettyCashFloatOut,
    PhysicalCountVsSystemCreate, PhysicalCountVsSystemOut,
    AuditScopeCreate, AuditScopeOut,
    RiskControlMatrixCreate, RiskControlMatrixOut,
    TestRuleLibraryCreate, TestRuleLibraryOut,
    DataSourceConnectorCreate, DataSourceConnectorOut,
    SamplingPopulationCreate, SamplingPopulationOut,
    ExceptionRedFlagCreate, ExceptionRedFlagOut,
    WorkingPaperEvidenceCreate, WorkingPaperEvidenceOut,
    ObservationFindingCreate, ObservationFindingOut,
    RemediationActionCreate, RemediationActionOut,
)

MANIFEST = {
    "name": "pos_store_audit",
    "title": "Point-of-Sale & Store Audit",
    "description": "Store-level assurance over POS integrity, cash/card reconciliation, discount abuse detection, and shrinkage tracking.",
    "icon": "shopping-cart",
    "group": "Revenue & Customers",
    "industry": "Retail",
    "version": "1.0.0",
    "owner": "intern-71",
}

router = APIRouter()


def _register_crud(prefix, model_cls, create_schema, out_schema):
    """Register standard CRUD endpoints for a given model."""

    @router.get(f"/{prefix}", response_model=list[out_schema])
    def list_items(current_user: CurrentUser, db: DbSession):
        q = tenant_scoped(db.query(model_cls), current_user)
        return [out_schema.model_validate(r) for r in q.order_by(model_cls.id.desc()).all()]

    @router.post(f"/{prefix}", response_model=out_schema, status_code=201)
    def create_item(body: create_schema, current_user: CurrentUser, db: DbSession):
        item = model_cls(**body.model_dump(), tenant_id=current_user.tenant_id)
        db.add(item)
        db.commit()
        db.refresh(item)
        return out_schema.model_validate(item)

    @router.delete(f"/{prefix}/{{item_id}}", status_code=204)
    def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
        item = tenant_scoped(
            db.query(model_cls).filter(model_cls.id == item_id), current_user
        ).first()
        if not item:
            from fastapi import HTTPException
            raise HTTPException(404, "Item not found")
        db.delete(item)
        db.commit()


# Register all CRUD endpoints
_register_crud("pos-bank-reconciliation", PosBankReconciliation, PosBankReconciliationCreate, PosBankReconciliationOut)
_register_crud("cash-variance", CashVariance, CashVarianceCreate, CashVarianceOut)
_register_crud("discount-override", DiscountOverride, DiscountOverrideCreate, DiscountOverrideOut)
_register_crud("void-refund", VoidRefund, VoidRefundCreate, VoidRefundOut)
_register_crud("shrinkage", ShrinkageStockLoss, ShrinkageStockLossCreate, ShrinkageStockLossOut)
_register_crud("card-settlement", CardWalletSettlement, CardWalletSettlementCreate, CardWalletSettlementOut)
_register_crud("cashier-exception", CashierException, CashierExceptionCreate, CashierExceptionOut)
_register_crud("price-integrity", PriceIntegrityTest, PriceIntegrityTestCreate, PriceIntegrityTestOut)
_register_crud("loyalty-abuse", LoyaltyPointsAbuse, LoyaltyPointsAbuseCreate, LoyaltyPointsAbuseOut)
_register_crud("store-transfer", StoreTransfer, StoreTransferCreate, StoreTransferOut)
_register_crud("damage-writeoff", DamageWriteOff, DamageWriteOffCreate, DamageWriteOffOut)
_register_crud("footfall-conversion", FootfallConversion, FootfallConversionCreate, FootfallConversionOut)
_register_crud("employee-purchase", EmployeePurchase, EmployeePurchaseCreate, EmployeePurchaseOut)
_register_crud("petty-cash", PettyCashFloat, PettyCashFloatCreate, PettyCashFloatOut)
_register_crud("physical-count", PhysicalCountVsSystem, PhysicalCountVsSystemCreate, PhysicalCountVsSystemOut)
_register_crud("scope", AuditScope, AuditScopeCreate, AuditScopeOut)
_register_crud("rcm", RiskControlMatrix, RiskControlMatrixCreate, RiskControlMatrixOut)
_register_crud("rules", TestRuleLibrary, TestRuleLibraryCreate, TestRuleLibraryOut)
_register_crud("datasource", DataSourceConnector, DataSourceConnectorCreate, DataSourceConnectorOut)
_register_crud("sampling", SamplingPopulation, SamplingPopulationCreate, SamplingPopulationOut)
_register_crud("exceptions", ExceptionRedFlag, ExceptionRedFlagCreate, ExceptionRedFlagOut)
_register_crud("working-papers", WorkingPaperEvidence, WorkingPaperEvidenceCreate, WorkingPaperEvidenceOut)
_register_crud("findings", ObservationFinding, ObservationFindingCreate, ObservationFindingOut)
_register_crud("remediation", RemediationAction, RemediationActionCreate, RemediationActionOut)
