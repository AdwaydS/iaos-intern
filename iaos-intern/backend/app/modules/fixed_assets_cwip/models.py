"""
Fixed Assets & CWIP — SQLAlchemy Models
========================================
Module 18: Fixed Assets & CWIP (Finance Cycles domain).

This file defines the database models for all 15 *signature* (domain-specific)
features of the module.  The 10 *common audit shell* features (dashboard, RCM,
sampling, etc.) share platform-level tables and are NOT duplicated here.

Naming convention
-----------------
- Table prefix : ``mod_fa_`` (module: fixed-assets)
- Model class  : PascalCase matching the feature name

Every model inherits ``TenantMixin`` which adds:
  - ``tenant_id``  (FK → tenants.id, row-level multi-tenancy)
  - ``created_at`` / ``updated_at`` (auto-managed timestamps)

To extend a model later, add columns and run ``alembic revision --autogenerate``.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin


# ---------------------------------------------------------------------------
# Legacy stub model (kept for backward-compat; can be removed if unused)
# ---------------------------------------------------------------------------
class FixedAssetsCwipItem(Base, TenantMixin):
    """Original auto-generated stub. Retained so existing data is not lost."""
    __tablename__ = "mod_fixed_assets_cwip_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text, default="")


# ═══════════════════════════════════════════════════════════════════════════
# 1. PHYSICAL VERIFICATION (Tag / QR)
# ═══════════════════════════════════════════════════════════════════════════
class PhysicalVerification(Base, TenantMixin):
    """
    Tracks scan-verification of physical assets against the asset register.
    Each row represents one verification event for a single asset.

    Future enhancements:
    - Link to IoT / QR scanner integrations
    - GPS / location tagging
    """
    __tablename__ = "mod_fa_physical_verification"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_tag: Mapped[str] = mapped_column(String(100), index=True, comment="QR/barcode/RFID tag")
    asset_description: Mapped[str] = mapped_column(String(500))
    location: Mapped[str] = mapped_column(String(255), comment="Physical location where asset was found")
    register_location: Mapped[str] = mapped_column(String(255), comment="Location per the asset register")
    verified_by: Mapped[str] = mapped_column(String(150), comment="Name of the verifier")
    verification_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | verified | missing | mismatch"
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 2. DEPRECIATION RECOMPUTATION
# ═══════════════════════════════════════════════════════════════════════════
class DepreciationRecomputation(Base, TenantMixin):
    """
    Independently recomputes depreciation for an asset and compares
    the result against the ERP/book value.

    Future enhancements:
    - Auto-fetch ERP depreciation via connector
    - Support multiple depreciation methods (SLM, WDV, Units-of-production)
    """
    __tablename__ = "mod_fa_depreciation_recomp"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    original_cost: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    useful_life_years: Mapped[int] = mapped_column(Integer)
    residual_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    method: Mapped[str] = mapped_column(
        String(30), default="SLM",
        comment="Depreciation method: SLM | WDV | UOP"
    )
    date_placed_in_service: Mapped[date] = mapped_column(Date)
    erp_accumulated_dep: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="Depreciation per ERP/books")
    recomputed_dep: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="Independently recomputed figure")
    variance: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="recomputed − ERP (positive = over-depreciated)")
    is_material: Mapped[bool] = mapped_column(Boolean, default=False, comment="True if variance exceeds materiality")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 3. CWIP AGEING & CAPITALISATION
# ═══════════════════════════════════════════════════════════════════════════
class CwipAgeing(Base, TenantMixin):
    """
    Flags Capital Work-In-Progress items stuck beyond the expected timeline.

    Future enhancements:
    - Auto-calculate ageing buckets (0-90, 90-180, 180-365, >365 days)
    - Integrate with project management / capex approval workflows
    """
    __tablename__ = "mod_fa_cwip_ageing"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_code: Mapped[str] = mapped_column(String(100), index=True)
    project_name: Mapped[str] = mapped_column(String(500))
    cwip_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    start_date: Mapped[date] = mapped_column(Date, comment="Date project entered CWIP")
    expected_capitalisation_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_capitalisation_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    ageing_days: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String(30), default="in_progress",
        comment="in_progress | capitalised | delayed | written_off"
    )
    reason_for_delay: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 4. DISPOSAL & RETIREMENT REVIEW
# ═══════════════════════════════════════════════════════════════════════════
class DisposalRetirement(Base, TenantMixin):
    """
    Reviews asset disposals / retirements for proper approvals and
    gain/loss accounting.

    Future enhancements:
    - Workflow-based multi-level approval tracking
    - Attachment support for disposal certificates
    """
    __tablename__ = "mod_fa_disposal_retirement"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    disposal_date: Mapped[date] = mapped_column(Date)
    disposal_method: Mapped[str] = mapped_column(
        String(50), comment="sale | scrap | donation | write_off"
    )
    wdv_at_disposal: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="Written-down value")
    sale_proceeds: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    gain_loss: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="sale_proceeds − wdv")
    approval_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | approved | rejected"
    )
    approved_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 5. ADDITIONS TO CAPEX APPROVAL
# ═══════════════════════════════════════════════════════════════════════════
class CapexAddition(Base, TenantMixin):
    """
    Reconciles capex additions to AFE (Authorisation for Expenditure)
    and purchase invoices.

    Future enhancements:
    - Link to procurement module for invoice cross-referencing
    - AFE budget vs. actual variance tracking
    """
    __tablename__ = "mod_fa_capex_additions"

    id: Mapped[int] = mapped_column(primary_key=True)
    afe_number: Mapped[str] = mapped_column(String(100), index=True, comment="Authorisation for Expenditure ref")
    asset_code: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(500))
    invoice_number: Mapped[str] = mapped_column(String(100))
    invoice_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    capitalised_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    variance: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="capitalised − invoice")
    afe_budget: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    addition_date: Mapped[date] = mapped_column(Date)
    reconciliation_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | reconciled | exception"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 6. ASSET REGISTER COMPLETENESS
# ═══════════════════════════════════════════════════════════════════════════
class AssetRegisterCheck(Base, TenantMixin):
    """
    Detects ghost assets (in register but not physically present) and
    missing assets (physically present but not in register).

    Future enhancements:
    - Automated reconciliation between physical verification results and
      the asset register
    """
    __tablename__ = "mod_fa_register_completeness"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(String(500))
    issue_type: Mapped[str] = mapped_column(
        String(30), comment="ghost | missing | duplicate | data_gap"
    )
    ledger_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    physical_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_status: Mapped[str] = mapped_column(
        String(20), default="open",
        comment="open | resolved | escalated"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 7. COMPONENTISATION & USEFUL LIFE
# ═══════════════════════════════════════════════════════════════════════════
class ComponentUsefulLife(Base, TenantMixin):
    """
    Tests Ind AS component depreciation — verifying that significant
    components of an asset are depreciated separately with appropriate
    useful lives.

    Future enhancements:
    - Compare against Schedule II useful life tables
    - Automated componentisation suggestions based on asset class
    """
    __tablename__ = "mod_fa_component_useful_life"

    id: Mapped[int] = mapped_column(primary_key=True)
    parent_asset_code: Mapped[str] = mapped_column(String(100), index=True)
    component_name: Mapped[str] = mapped_column(String(255))
    component_cost: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    useful_life_years: Mapped[int] = mapped_column(Integer)
    schedule_ii_life: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="Ind AS Schedule II life")
    deviation: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="company_life − schedule_ii_life")
    justification: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="Reason if deviating from Sch II")
    review_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | compliant | non_compliant"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 8. IDLE / UNDER-UTILISED ASSETS
# ═══════════════════════════════════════════════════════════════════════════
class IdleAsset(Base, TenantMixin):
    """
    Detects non-productive / idle assets that may need impairment review,
    disposal, or redeployment.

    Future enhancements:
    - Integration with IoT / usage telemetry
    - Auto-flag assets idle for >N days
    """
    __tablename__ = "mod_fa_idle_assets"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    location: Mapped[str] = mapped_column(String(255))
    book_value: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    idle_since: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    idle_days: Mapped[int] = mapped_column(Integer, default=0)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="Why the asset is idle")
    recommended_action: Mapped[str] = mapped_column(
        String(30), default="review",
        comment="review | redeploy | dispose | impair"
    )
    status: Mapped[str] = mapped_column(
        String(20), default="open",
        comment="open | action_taken | closed"
    )


# ═══════════════════════════════════════════════════════════════════════════
# 9. IMPAIRMENT INDICATORS
# ═══════════════════════════════════════════════════════════════════════════
class ImpairmentIndicator(Base, TenantMixin):
    """
    Screens for impairment triggers (Ind AS 36) such as significant
    decline in market value, obsolescence, or adverse legal/economic changes.

    Future enhancements:
    - Automated impairment testing with recoverable-amount calculations
    - Linkage to valuation reports
    """
    __tablename__ = "mod_fa_impairment_indicators"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    indicator_type: Mapped[str] = mapped_column(
        String(50),
        comment="market_decline | obsolescence | legal_change | physical_damage | idle | other"
    )
    book_value: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    estimated_recoverable: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    impairment_loss: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    assessment_date: Mapped[date] = mapped_column(Date)
    assessed_by: Mapped[str] = mapped_column(String(150))
    status: Mapped[str] = mapped_column(
        String(20), default="identified",
        comment="identified | tested | impaired | no_impairment"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 10. INSURANCE-TO-ASSET MAPPING
# ═══════════════════════════════════════════════════════════════════════════
class InsuranceMapping(Base, TenantMixin):
    """
    Ensures key assets are covered by appropriate insurance policies
    and that coverage amounts are adequate.

    Future enhancements:
    - Link to insurance module for policy details
    - Automated gap analysis (under-insured / over-insured)
    """
    __tablename__ = "mod_fa_insurance_mapping"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    asset_value: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    policy_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    insurer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    coverage_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    coverage_gap: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0, comment="asset_value − coverage")
    policy_expiry: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_adequately_insured: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 11. CAPEX VS OPEX CLASSIFICATION
# ═══════════════════════════════════════════════════════════════════════════
class CapexOpexClassification(Base, TenantMixin):
    """
    Tests for expenditure wrongly classified as opex (should be capex)
    or vice-versa.

    Future enhancements:
    - Automated GL scanning for capex-like items in opex accounts
    - Configurable thresholds per asset class
    """
    __tablename__ = "mod_fa_capex_opex"

    id: Mapped[int] = mapped_column(primary_key=True)
    voucher_number: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(String(500))
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    gl_account: Mapped[str] = mapped_column(String(50), comment="GL account where booked")
    booked_as: Mapped[str] = mapped_column(String(10), comment="capex | opex")
    should_be: Mapped[str] = mapped_column(String(10), comment="capex | opex")
    is_misclassified: Mapped[bool] = mapped_column(Boolean, default=False)
    transaction_date: Mapped[date] = mapped_column(Date)
    review_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | confirmed | reclassified"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 12. LEASE VS OWN (Ind AS 116)
# ═══════════════════════════════════════════════════════════════════════════
class LeaseVsOwn(Base, TenantMixin):
    """
    Right-of-use (ROU) asset recognition under Ind AS 116.
    Tracks lease agreements and whether ROU assets are correctly recognised.

    Future enhancements:
    - Lease liability calculations
    - Modification / reassessment tracking
    """
    __tablename__ = "mod_fa_lease_vs_own"

    id: Mapped[int] = mapped_column(primary_key=True)
    lease_id: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    lessor: Mapped[str] = mapped_column(String(255))
    lease_start: Mapped[date] = mapped_column(Date)
    lease_end: Mapped[date] = mapped_column(Date)
    lease_term_months: Mapped[int] = mapped_column(Integer)
    annual_lease_payment: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    rou_asset_recognised: Mapped[bool] = mapped_column(Boolean, default=False)
    rou_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    lease_liability: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    is_short_term_exempt: Mapped[bool] = mapped_column(Boolean, default=False, comment="Short-term / low-value exempt")
    review_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | compliant | non_compliant"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 13. ASSET TRANSFER & LOCATION MOVE
# ═══════════════════════════════════════════════════════════════════════════
class AssetTransfer(Base, TenantMixin):
    """
    Tracks inter-unit / inter-location asset transfers and verifies
    proper documentation and controls.

    Future enhancements:
    - Multi-entity consolidation impact tracking
    - Transfer pricing implications
    """
    __tablename__ = "mod_fa_asset_transfers"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    from_location: Mapped[str] = mapped_column(String(255))
    to_location: Mapped[str] = mapped_column(String(255))
    transfer_date: Mapped[date] = mapped_column(Date)
    transfer_value: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    authorised_by: Mapped[str] = mapped_column(String(150))
    documentation_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    register_updated: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | completed | rejected"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 14. SCRAP & SALVAGE REALISATION
# ═══════════════════════════════════════════════════════════════════════════
class ScrapSalvage(Base, TenantMixin):
    """
    Tracks scrap/salvage proceeds against the written-down value (WDV)
    of disposed assets.

    Future enhancements:
    - Scrap auction tracking
    - Environmental compliance for hazardous asset disposal
    """
    __tablename__ = "mod_fa_scrap_salvage"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    scrap_date: Mapped[date] = mapped_column(Date)
    wdv_at_scrap: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    expected_salvage: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    actual_realisation: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    variance: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="actual − expected")
    scrap_buyer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    receipt_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, comment="Payment receipt ref")
    status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | realised | written_off"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# ═══════════════════════════════════════════════════════════════════════════
# 15. REVALUATION & FAIR-VALUE REVIEW
# ═══════════════════════════════════════════════════════════════════════════
class RevaluationReview(Base, TenantMixin):
    """
    Tests the basis and adequacy of asset revaluations under Ind AS 16.

    Future enhancements:
    - Integration with external valuation report uploads
    - Revaluation surplus tracking in equity reserves
    """
    __tablename__ = "mod_fa_revaluation_review"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_code: Mapped[str] = mapped_column(String(100), index=True)
    asset_description: Mapped[str] = mapped_column(String(500))
    revaluation_date: Mapped[date] = mapped_column(Date)
    book_value_before: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    revalued_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    revaluation_surplus: Mapped[Decimal] = mapped_column(Numeric(18, 2), comment="revalued − book_value")
    valuer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    valuation_method: Mapped[str] = mapped_column(String(100), comment="e.g. market_approach | cost_approach | income_approach")
    is_independent_valuer: Mapped[bool] = mapped_column(Boolean, default=False)
    review_status: Mapped[str] = mapped_column(
        String(20), default="pending",
        comment="pending | adequate | inadequate"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
