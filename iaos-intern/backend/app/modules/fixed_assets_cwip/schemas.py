"""
Fixed Assets & CWIP — Pydantic Schemas
=======================================
Module 18: Fixed Assets & CWIP.

This file defines the request/response schemas (Pydantic v2 models) for every
API endpoint in the module.  The naming convention is:

  - ``<Feature>Create``  — POST request body
  - ``<Feature>Update``  — PATCH request body (all fields optional)
  - ``<Feature>Out``     — Response body (includes id + timestamps)

All ``Out`` schemas use ``model_config = {"from_attributes": True}`` so
they can be built directly from SQLAlchemy model instances.

To add fields to a schema, just add the attribute — FastAPI picks it up
automatically.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Legacy stub schemas (kept for backward-compat)
# ---------------------------------------------------------------------------
class ItemCreate(BaseModel):
    title: str
    notes: str = ""


class ItemOut(BaseModel):
    id: int
    title: str
    notes: str

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 1. PHYSICAL VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════
class PhysicalVerificationCreate(BaseModel):
    """Request body for creating a physical verification record."""
    asset_tag: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    location: str = Field(..., max_length=255)
    register_location: str = Field(..., max_length=255)
    verified_by: str = Field(..., max_length=150)
    verification_date: date
    status: str = Field(default="pending", pattern="^(pending|verified|missing|mismatch)$")
    remarks: Optional[str] = None


class PhysicalVerificationUpdate(BaseModel):
    """PATCH body — only supplied fields are updated."""
    location: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(pending|verified|missing|mismatch)$")
    remarks: Optional[str] = None


class PhysicalVerificationOut(BaseModel):
    id: int
    asset_tag: str
    asset_description: str
    location: str
    register_location: str
    verified_by: str
    verification_date: date
    status: str
    remarks: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 2. DEPRECIATION RECOMPUTATION
# ═══════════════════════════════════════════════════════════════════════════
class DepreciationRecompCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    original_cost: Decimal
    useful_life_years: int = Field(..., gt=0)
    residual_value: Decimal = Decimal("0")
    method: str = Field(default="SLM", pattern="^(SLM|WDV|UOP)$")
    date_placed_in_service: date
    erp_accumulated_dep: Decimal
    recomputed_dep: Decimal
    variance: Decimal
    is_material: bool = False
    notes: Optional[str] = None


class DepreciationRecompUpdate(BaseModel):
    recomputed_dep: Optional[Decimal] = None
    variance: Optional[Decimal] = None
    is_material: Optional[bool] = None
    notes: Optional[str] = None


class DepreciationRecompOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    original_cost: Decimal
    useful_life_years: int
    residual_value: Decimal
    method: str
    date_placed_in_service: date
    erp_accumulated_dep: Decimal
    recomputed_dep: Decimal
    variance: Decimal
    is_material: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 3. CWIP AGEING & CAPITALISATION
# ═══════════════════════════════════════════════════════════════════════════
class CwipAgeingCreate(BaseModel):
    project_code: str = Field(..., max_length=100)
    project_name: str = Field(..., max_length=500)
    cwip_amount: Decimal
    start_date: date
    expected_capitalisation_date: Optional[date] = None
    actual_capitalisation_date: Optional[date] = None
    ageing_days: int = 0
    status: str = Field(default="in_progress", pattern="^(in_progress|capitalised|delayed|written_off)$")
    reason_for_delay: Optional[str] = None
    notes: Optional[str] = None


class CwipAgeingUpdate(BaseModel):
    actual_capitalisation_date: Optional[date] = None
    ageing_days: Optional[int] = None
    status: Optional[str] = Field(default=None, pattern="^(in_progress|capitalised|delayed|written_off)$")
    reason_for_delay: Optional[str] = None
    notes: Optional[str] = None


class CwipAgeingOut(BaseModel):
    id: int
    project_code: str
    project_name: str
    cwip_amount: Decimal
    start_date: date
    expected_capitalisation_date: Optional[date]
    actual_capitalisation_date: Optional[date]
    ageing_days: int
    status: str
    reason_for_delay: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 4. DISPOSAL & RETIREMENT REVIEW
# ═══════════════════════════════════════════════════════════════════════════
class DisposalRetirementCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    disposal_date: date
    disposal_method: str = Field(..., pattern="^(sale|scrap|donation|write_off)$")
    wdv_at_disposal: Decimal
    sale_proceeds: Decimal = Decimal("0")
    gain_loss: Decimal
    approval_status: str = Field(default="pending", pattern="^(pending|approved|rejected)$")
    approved_by: Optional[str] = None
    notes: Optional[str] = None


class DisposalRetirementUpdate(BaseModel):
    approval_status: Optional[str] = Field(default=None, pattern="^(pending|approved|rejected)$")
    approved_by: Optional[str] = None
    notes: Optional[str] = None


class DisposalRetirementOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    disposal_date: date
    disposal_method: str
    wdv_at_disposal: Decimal
    sale_proceeds: Decimal
    gain_loss: Decimal
    approval_status: str
    approved_by: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 5. ADDITIONS TO CAPEX APPROVAL
# ═══════════════════════════════════════════════════════════════════════════
class CapexAdditionCreate(BaseModel):
    afe_number: str = Field(..., max_length=100)
    asset_code: str = Field(..., max_length=100)
    description: str = Field(..., max_length=500)
    invoice_number: str = Field(..., max_length=100)
    invoice_amount: Decimal
    capitalised_amount: Decimal
    variance: Decimal
    afe_budget: Decimal = Decimal("0")
    addition_date: date
    reconciliation_status: str = Field(default="pending", pattern="^(pending|reconciled|exception)$")
    notes: Optional[str] = None


class CapexAdditionUpdate(BaseModel):
    reconciliation_status: Optional[str] = Field(default=None, pattern="^(pending|reconciled|exception)$")
    notes: Optional[str] = None


class CapexAdditionOut(BaseModel):
    id: int
    afe_number: str
    asset_code: str
    description: str
    invoice_number: str
    invoice_amount: Decimal
    capitalised_amount: Decimal
    variance: Decimal
    afe_budget: Decimal
    addition_date: date
    reconciliation_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 6. ASSET REGISTER COMPLETENESS
# ═══════════════════════════════════════════════════════════════════════════
class AssetRegisterCheckCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    description: str = Field(..., max_length=500)
    issue_type: str = Field(..., pattern="^(ghost|missing|duplicate|data_gap)$")
    ledger_value: Decimal = Decimal("0")
    physical_verified: bool = False
    resolution_status: str = Field(default="open", pattern="^(open|resolved|escalated)$")
    notes: Optional[str] = None


class AssetRegisterCheckUpdate(BaseModel):
    resolution_status: Optional[str] = Field(default=None, pattern="^(open|resolved|escalated)$")
    physical_verified: Optional[bool] = None
    notes: Optional[str] = None


class AssetRegisterCheckOut(BaseModel):
    id: int
    asset_code: str
    description: str
    issue_type: str
    ledger_value: Decimal
    physical_verified: bool
    resolution_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 7. COMPONENTISATION & USEFUL LIFE
# ═══════════════════════════════════════════════════════════════════════════
class ComponentUsefulLifeCreate(BaseModel):
    parent_asset_code: str = Field(..., max_length=100)
    component_name: str = Field(..., max_length=255)
    component_cost: Decimal
    useful_life_years: int = Field(..., gt=0)
    schedule_ii_life: Optional[int] = None
    deviation: Optional[int] = None
    justification: Optional[str] = None
    review_status: str = Field(default="pending", pattern="^(pending|compliant|non_compliant)$")


class ComponentUsefulLifeUpdate(BaseModel):
    review_status: Optional[str] = Field(default=None, pattern="^(pending|compliant|non_compliant)$")
    justification: Optional[str] = None


class ComponentUsefulLifeOut(BaseModel):
    id: int
    parent_asset_code: str
    component_name: str
    component_cost: Decimal
    useful_life_years: int
    schedule_ii_life: Optional[int]
    deviation: Optional[int]
    justification: Optional[str]
    review_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 8. IDLE / UNDER-UTILISED ASSETS
# ═══════════════════════════════════════════════════════════════════════════
class IdleAssetCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    location: str = Field(..., max_length=255)
    book_value: Decimal
    idle_since: Optional[date] = None
    idle_days: int = 0
    reason: Optional[str] = None
    recommended_action: str = Field(default="review", pattern="^(review|redeploy|dispose|impair)$")
    status: str = Field(default="open", pattern="^(open|action_taken|closed)$")


class IdleAssetUpdate(BaseModel):
    recommended_action: Optional[str] = Field(default=None, pattern="^(review|redeploy|dispose|impair)$")
    status: Optional[str] = Field(default=None, pattern="^(open|action_taken|closed)$")
    reason: Optional[str] = None


class IdleAssetOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    location: str
    book_value: Decimal
    idle_since: Optional[date]
    idle_days: int
    reason: Optional[str]
    recommended_action: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 9. IMPAIRMENT INDICATORS
# ═══════════════════════════════════════════════════════════════════════════
class ImpairmentIndicatorCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    indicator_type: str = Field(..., pattern="^(market_decline|obsolescence|legal_change|physical_damage|idle|other)$")
    book_value: Decimal
    estimated_recoverable: Optional[Decimal] = None
    impairment_loss: Optional[Decimal] = None
    assessment_date: date
    assessed_by: str = Field(..., max_length=150)
    status: str = Field(default="identified", pattern="^(identified|tested|impaired|no_impairment)$")
    notes: Optional[str] = None


class ImpairmentIndicatorUpdate(BaseModel):
    estimated_recoverable: Optional[Decimal] = None
    impairment_loss: Optional[Decimal] = None
    status: Optional[str] = Field(default=None, pattern="^(identified|tested|impaired|no_impairment)$")
    notes: Optional[str] = None


class ImpairmentIndicatorOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    indicator_type: str
    book_value: Decimal
    estimated_recoverable: Optional[Decimal]
    impairment_loss: Optional[Decimal]
    assessment_date: date
    assessed_by: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 10. INSURANCE-TO-ASSET MAPPING
# ═══════════════════════════════════════════════════════════════════════════
class InsuranceMappingCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    asset_value: Decimal
    policy_number: Optional[str] = None
    insurer: Optional[str] = None
    coverage_amount: Decimal = Decimal("0")
    coverage_gap: Decimal = Decimal("0")
    policy_expiry: Optional[date] = None
    is_adequately_insured: bool = False
    notes: Optional[str] = None


class InsuranceMappingUpdate(BaseModel):
    policy_number: Optional[str] = None
    coverage_amount: Optional[Decimal] = None
    coverage_gap: Optional[Decimal] = None
    is_adequately_insured: Optional[bool] = None
    notes: Optional[str] = None


class InsuranceMappingOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    asset_value: Decimal
    policy_number: Optional[str]
    insurer: Optional[str]
    coverage_amount: Decimal
    coverage_gap: Decimal
    policy_expiry: Optional[date]
    is_adequately_insured: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 11. CAPEX VS OPEX CLASSIFICATION
# ═══════════════════════════════════════════════════════════════════════════
class CapexOpexCreate(BaseModel):
    voucher_number: str = Field(..., max_length=100)
    description: str = Field(..., max_length=500)
    amount: Decimal
    gl_account: str = Field(..., max_length=50)
    booked_as: str = Field(..., pattern="^(capex|opex)$")
    should_be: str = Field(..., pattern="^(capex|opex)$")
    is_misclassified: bool = False
    transaction_date: date
    review_status: str = Field(default="pending", pattern="^(pending|confirmed|reclassified)$")
    notes: Optional[str] = None


class CapexOpexUpdate(BaseModel):
    should_be: Optional[str] = Field(default=None, pattern="^(capex|opex)$")
    is_misclassified: Optional[bool] = None
    review_status: Optional[str] = Field(default=None, pattern="^(pending|confirmed|reclassified)$")
    notes: Optional[str] = None


class CapexOpexOut(BaseModel):
    id: int
    voucher_number: str
    description: str
    amount: Decimal
    gl_account: str
    booked_as: str
    should_be: str
    is_misclassified: bool
    transaction_date: date
    review_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 12. LEASE VS OWN (Ind AS 116)
# ═══════════════════════════════════════════════════════════════════════════
class LeaseVsOwnCreate(BaseModel):
    lease_id: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    lessor: str = Field(..., max_length=255)
    lease_start: date
    lease_end: date
    lease_term_months: int = Field(..., gt=0)
    annual_lease_payment: Decimal
    rou_asset_recognised: bool = False
    rou_value: Decimal = Decimal("0")
    lease_liability: Decimal = Decimal("0")
    is_short_term_exempt: bool = False
    review_status: str = Field(default="pending", pattern="^(pending|compliant|non_compliant)$")
    notes: Optional[str] = None


class LeaseVsOwnUpdate(BaseModel):
    rou_asset_recognised: Optional[bool] = None
    rou_value: Optional[Decimal] = None
    lease_liability: Optional[Decimal] = None
    review_status: Optional[str] = Field(default=None, pattern="^(pending|compliant|non_compliant)$")
    notes: Optional[str] = None


class LeaseVsOwnOut(BaseModel):
    id: int
    lease_id: str
    asset_description: str
    lessor: str
    lease_start: date
    lease_end: date
    lease_term_months: int
    annual_lease_payment: Decimal
    rou_asset_recognised: bool
    rou_value: Decimal
    lease_liability: Decimal
    is_short_term_exempt: bool
    review_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 13. ASSET TRANSFER & LOCATION MOVE
# ═══════════════════════════════════════════════════════════════════════════
class AssetTransferCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    from_location: str = Field(..., max_length=255)
    to_location: str = Field(..., max_length=255)
    transfer_date: date
    transfer_value: Decimal
    authorised_by: str = Field(..., max_length=150)
    documentation_complete: bool = False
    register_updated: bool = False
    status: str = Field(default="pending", pattern="^(pending|completed|rejected)$")
    notes: Optional[str] = None


class AssetTransferUpdate(BaseModel):
    documentation_complete: Optional[bool] = None
    register_updated: Optional[bool] = None
    status: Optional[str] = Field(default=None, pattern="^(pending|completed|rejected)$")
    notes: Optional[str] = None


class AssetTransferOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    from_location: str
    to_location: str
    transfer_date: date
    transfer_value: Decimal
    authorised_by: str
    documentation_complete: bool
    register_updated: bool
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 14. SCRAP & SALVAGE REALISATION
# ═══════════════════════════════════════════════════════════════════════════
class ScrapSalvageCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    scrap_date: date
    wdv_at_scrap: Decimal
    expected_salvage: Decimal = Decimal("0")
    actual_realisation: Decimal = Decimal("0")
    variance: Decimal
    scrap_buyer: Optional[str] = None
    receipt_reference: Optional[str] = None
    status: str = Field(default="pending", pattern="^(pending|realised|written_off)$")
    notes: Optional[str] = None


class ScrapSalvageUpdate(BaseModel):
    actual_realisation: Optional[Decimal] = None
    variance: Optional[Decimal] = None
    status: Optional[str] = Field(default=None, pattern="^(pending|realised|written_off)$")
    notes: Optional[str] = None


class ScrapSalvageOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    scrap_date: date
    wdv_at_scrap: Decimal
    expected_salvage: Decimal
    actual_realisation: Decimal
    variance: Decimal
    scrap_buyer: Optional[str]
    receipt_reference: Optional[str]
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════════════════════════════
# 15. REVALUATION & FAIR-VALUE REVIEW
# ═══════════════════════════════════════════════════════════════════════════
class RevaluationReviewCreate(BaseModel):
    asset_code: str = Field(..., max_length=100)
    asset_description: str = Field(..., max_length=500)
    revaluation_date: date
    book_value_before: Decimal
    revalued_amount: Decimal
    revaluation_surplus: Decimal
    valuer_name: Optional[str] = None
    valuation_method: str = Field(..., max_length=100)
    is_independent_valuer: bool = False
    review_status: str = Field(default="pending", pattern="^(pending|adequate|inadequate)$")
    notes: Optional[str] = None


class RevaluationReviewUpdate(BaseModel):
    review_status: Optional[str] = Field(default=None, pattern="^(pending|adequate|inadequate)$")
    is_independent_valuer: Optional[bool] = None
    notes: Optional[str] = None


class RevaluationReviewOut(BaseModel):
    id: int
    asset_code: str
    asset_description: str
    revaluation_date: date
    book_value_before: Decimal
    revalued_amount: Decimal
    revaluation_surplus: Decimal
    valuer_name: Optional[str]
    valuation_method: str
    is_independent_valuer: bool
    review_status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
