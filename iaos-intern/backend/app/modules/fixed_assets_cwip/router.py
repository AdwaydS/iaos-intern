"""
Fixed Assets & CWIP — API Router
=================================
Module 18: Fixed Assets & CWIP (Finance Cycles domain).

This router is auto-discovered by ``app.module_loader`` and mounted at
``/api/modules/fixed_assets_cwip``.  It exposes CRUD + analytics endpoints
for all 25 features (15 signature + 10 common audit shell).

Architecture notes
------------------
- Every endpoint requires a logged-in user (``CurrentUser``).
- All queries are tenant-scoped via ``tenant_scoped()`` — users only see
  their own organisation's data.
- The common audit shell endpoints (features 16-25) provide lightweight
  placeholder logic.  They follow the same CRUD skeleton but will integrate
  with platform-level tables (RCM, sampling, working-papers) in future.
- Helper ``_crud_list`` / ``_crud_create`` / ``_crud_patch`` / ``_crud_delete``
  factories reduce boilerplate while keeping each route explicit.

Extending a feature
-------------------
1. Add columns to the model in ``models.py``
2. Add fields to the schema in ``schemas.py``
3. Add/modify the endpoint below
4. Run ``alembic revision --autogenerate``
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

# ── Models ──────────────────────────────────────────────────────────────
from .models import (
    AssetRegisterCheck,
    AssetTransfer,
    CapexAddition,
    CapexOpexClassification,
    ComponentUsefulLife,
    CwipAgeing,
    DepreciationRecomputation,
    DisposalRetirement,
    FixedAssetsCwipItem,
    IdleAsset,
    ImpairmentIndicator,
    InsuranceMapping,
    LeaseVsOwn,
    RevaluationReview,
    ScrapSalvage,
    PhysicalVerification,
)

# ── Schemas ─────────────────────────────────────────────────────────────
from .schemas import (
    # Legacy
    ItemCreate, ItemOut,
    # 1
    PhysicalVerificationCreate, PhysicalVerificationUpdate, PhysicalVerificationOut,
    # 2
    DepreciationRecompCreate, DepreciationRecompUpdate, DepreciationRecompOut,
    # 3
    CwipAgeingCreate, CwipAgeingUpdate, CwipAgeingOut,
    # 4
    DisposalRetirementCreate, DisposalRetirementUpdate, DisposalRetirementOut,
    # 5
    CapexAdditionCreate, CapexAdditionUpdate, CapexAdditionOut,
    # 6
    AssetRegisterCheckCreate, AssetRegisterCheckUpdate, AssetRegisterCheckOut,
    # 7
    ComponentUsefulLifeCreate, ComponentUsefulLifeUpdate, ComponentUsefulLifeOut,
    # 8
    IdleAssetCreate, IdleAssetUpdate, IdleAssetOut,
    # 9
    ImpairmentIndicatorCreate, ImpairmentIndicatorUpdate, ImpairmentIndicatorOut,
    # 10
    InsuranceMappingCreate, InsuranceMappingUpdate, InsuranceMappingOut,
    # 11
    CapexOpexCreate, CapexOpexUpdate, CapexOpexOut,
    # 12
    LeaseVsOwnCreate, LeaseVsOwnUpdate, LeaseVsOwnOut,
    # 13
    AssetTransferCreate, AssetTransferUpdate, AssetTransferOut,
    # 14
    ScrapSalvageCreate, ScrapSalvageUpdate, ScrapSalvageOut,
    # 15
    RevaluationReviewCreate, RevaluationReviewUpdate, RevaluationReviewOut,
)


# ═══════════════════════════════════════════════════════════════════════════
# MODULE MANIFEST  (consumed by the module loader & frontend catalogue)
# ═══════════════════════════════════════════════════════════════════════════
MANIFEST = {
    "name": "fixed_assets_cwip",
    "title": "Fixed Assets & CWIP",
    "description": (
        "Verifies asset existence, recomputes depreciation, and controls "
        "capex-to-capitalisation including CWIP ageing and disposal governance."
    ),
    "icon": "building",
    "group": "Treasury, Assets & Capital",
    "industry": "",
    "version": "1.0.0",
    "owner": "Module 18 — Roll No. 18",
    "features": 25,
}

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════
# GENERIC CRUD HELPERS
# ═══════════════════════════════════════════════════════════════════════════
# These thin wrappers reduce repetition across the 15 feature endpoints.
# Each feature still has its own explicit route for clarity and auditability.

def _list_all(db, model, user, order_col=None):
    """Return all tenant-scoped rows, newest first."""
    q = tenant_scoped(db.query(model), user)
    col = order_col or model.id
    return q.order_by(col.desc()).all()


def _get_or_404(db, model, item_id, user):
    """Fetch a single row by PK within the tenant, or raise 404."""
    item = tenant_scoped(
        db.query(model).filter(model.id == item_id), user
    ).first()
    if not item:
        raise HTTPException(404, "Record not found")
    return item


def _create(db, model, schema, user):
    """Insert a new tenant-scoped row from a Pydantic schema."""
    item = model(**schema.model_dump(), tenant_id=user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _patch(db, model, item_id, schema, user):
    """Partially update a tenant-scoped row."""
    item = _get_or_404(db, model, item_id, user)
    updates = schema.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


def _delete(db, model, item_id, user):
    """Delete a tenant-scoped row."""
    item = _get_or_404(db, model, item_id, user)
    db.delete(item)
    db.commit()


# ═══════════════════════════════════════════════════════════════════════════
# LEGACY STUB ENDPOINTS  (backward-compat with the original scaffold)
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/items", response_model=list[ItemOut], tags=["legacy"])
def list_items(current_user: CurrentUser, db: DbSession):
    """List all legacy items (original auto-generated stub)."""
    return [ItemOut.model_validate(i) for i in _list_all(db, FixedAssetsCwipItem, current_user)]


@router.post("/items", response_model=ItemOut, status_code=201, tags=["legacy"])
def create_item(body: ItemCreate, current_user: CurrentUser, db: DbSession):
    """Create a legacy item."""
    return ItemOut.model_validate(_create(db, FixedAssetsCwipItem, body, current_user))


@router.delete("/items/{item_id}", status_code=204, tags=["legacy"])
def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
    """Delete a legacy item."""
    _delete(db, FixedAssetsCwipItem, item_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 1: PHYSICAL VERIFICATION (Tag / QR)
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/physical-verification",
    response_model=list[PhysicalVerificationOut],
    summary="List all physical verification records",
)
def list_physical_verifications(current_user: CurrentUser, db: DbSession):
    """Return all scan-verification records for the tenant, newest first."""
    return [PhysicalVerificationOut.model_validate(r) for r in _list_all(db, PhysicalVerification, current_user)]


@router.post(
    "/physical-verification",
    response_model=PhysicalVerificationOut,
    status_code=201,
    summary="Create a physical verification record",
)
def create_physical_verification(body: PhysicalVerificationCreate, current_user: CurrentUser, db: DbSession):
    return PhysicalVerificationOut.model_validate(_create(db, PhysicalVerification, body, current_user))


@router.patch(
    "/physical-verification/{record_id}",
    response_model=PhysicalVerificationOut,
    summary="Update a physical verification record",
)
def update_physical_verification(record_id: int, body: PhysicalVerificationUpdate, current_user: CurrentUser, db: DbSession):
    return PhysicalVerificationOut.model_validate(_patch(db, PhysicalVerification, record_id, body, current_user))


@router.delete("/physical-verification/{record_id}", status_code=204)
def delete_physical_verification(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, PhysicalVerification, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 2: DEPRECIATION RECOMPUTATION
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/depreciation", response_model=list[DepreciationRecompOut], summary="List depreciation recomputations")
def list_depreciation(current_user: CurrentUser, db: DbSession):
    return [DepreciationRecompOut.model_validate(r) for r in _list_all(db, DepreciationRecomputation, current_user)]


@router.post("/depreciation", response_model=DepreciationRecompOut, status_code=201, summary="Create depreciation recomputation")
def create_depreciation(body: DepreciationRecompCreate, current_user: CurrentUser, db: DbSession):
    return DepreciationRecompOut.model_validate(_create(db, DepreciationRecomputation, body, current_user))


@router.patch("/depreciation/{record_id}", response_model=DepreciationRecompOut)
def update_depreciation(record_id: int, body: DepreciationRecompUpdate, current_user: CurrentUser, db: DbSession):
    return DepreciationRecompOut.model_validate(_patch(db, DepreciationRecomputation, record_id, body, current_user))


@router.delete("/depreciation/{record_id}", status_code=204)
def delete_depreciation(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, DepreciationRecomputation, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 3: CWIP AGEING & CAPITALISATION
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/cwip-ageing", response_model=list[CwipAgeingOut], summary="List CWIP ageing records")
def list_cwip(current_user: CurrentUser, db: DbSession):
    return [CwipAgeingOut.model_validate(r) for r in _list_all(db, CwipAgeing, current_user)]


@router.post("/cwip-ageing", response_model=CwipAgeingOut, status_code=201, summary="Create CWIP ageing record")
def create_cwip(body: CwipAgeingCreate, current_user: CurrentUser, db: DbSession):
    return CwipAgeingOut.model_validate(_create(db, CwipAgeing, body, current_user))


@router.patch("/cwip-ageing/{record_id}", response_model=CwipAgeingOut)
def update_cwip(record_id: int, body: CwipAgeingUpdate, current_user: CurrentUser, db: DbSession):
    return CwipAgeingOut.model_validate(_patch(db, CwipAgeing, record_id, body, current_user))


@router.delete("/cwip-ageing/{record_id}", status_code=204)
def delete_cwip(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, CwipAgeing, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 4: DISPOSAL & RETIREMENT REVIEW
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/disposal", response_model=list[DisposalRetirementOut], summary="List disposal/retirement records")
def list_disposals(current_user: CurrentUser, db: DbSession):
    return [DisposalRetirementOut.model_validate(r) for r in _list_all(db, DisposalRetirement, current_user)]


@router.post("/disposal", response_model=DisposalRetirementOut, status_code=201)
def create_disposal(body: DisposalRetirementCreate, current_user: CurrentUser, db: DbSession):
    return DisposalRetirementOut.model_validate(_create(db, DisposalRetirement, body, current_user))


@router.patch("/disposal/{record_id}", response_model=DisposalRetirementOut)
def update_disposal(record_id: int, body: DisposalRetirementUpdate, current_user: CurrentUser, db: DbSession):
    return DisposalRetirementOut.model_validate(_patch(db, DisposalRetirement, record_id, body, current_user))


@router.delete("/disposal/{record_id}", status_code=204)
def delete_disposal(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, DisposalRetirement, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 5: ADDITIONS TO CAPEX APPROVAL
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/capex-additions", response_model=list[CapexAdditionOut], summary="List capex additions")
def list_capex_additions(current_user: CurrentUser, db: DbSession):
    return [CapexAdditionOut.model_validate(r) for r in _list_all(db, CapexAddition, current_user)]


@router.post("/capex-additions", response_model=CapexAdditionOut, status_code=201)
def create_capex_addition(body: CapexAdditionCreate, current_user: CurrentUser, db: DbSession):
    return CapexAdditionOut.model_validate(_create(db, CapexAddition, body, current_user))


@router.patch("/capex-additions/{record_id}", response_model=CapexAdditionOut)
def update_capex_addition(record_id: int, body: CapexAdditionUpdate, current_user: CurrentUser, db: DbSession):
    return CapexAdditionOut.model_validate(_patch(db, CapexAddition, record_id, body, current_user))


@router.delete("/capex-additions/{record_id}", status_code=204)
def delete_capex_addition(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, CapexAddition, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 6: ASSET REGISTER COMPLETENESS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/register-completeness", response_model=list[AssetRegisterCheckOut], summary="List register completeness checks")
def list_register_checks(current_user: CurrentUser, db: DbSession):
    return [AssetRegisterCheckOut.model_validate(r) for r in _list_all(db, AssetRegisterCheck, current_user)]


@router.post("/register-completeness", response_model=AssetRegisterCheckOut, status_code=201)
def create_register_check(body: AssetRegisterCheckCreate, current_user: CurrentUser, db: DbSession):
    return AssetRegisterCheckOut.model_validate(_create(db, AssetRegisterCheck, body, current_user))


@router.patch("/register-completeness/{record_id}", response_model=AssetRegisterCheckOut)
def update_register_check(record_id: int, body: AssetRegisterCheckUpdate, current_user: CurrentUser, db: DbSession):
    return AssetRegisterCheckOut.model_validate(_patch(db, AssetRegisterCheck, record_id, body, current_user))


@router.delete("/register-completeness/{record_id}", status_code=204)
def delete_register_check(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, AssetRegisterCheck, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 7: COMPONENTISATION & USEFUL LIFE
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/componentisation", response_model=list[ComponentUsefulLifeOut], summary="List component useful life records")
def list_components(current_user: CurrentUser, db: DbSession):
    return [ComponentUsefulLifeOut.model_validate(r) for r in _list_all(db, ComponentUsefulLife, current_user)]


@router.post("/componentisation", response_model=ComponentUsefulLifeOut, status_code=201)
def create_component(body: ComponentUsefulLifeCreate, current_user: CurrentUser, db: DbSession):
    return ComponentUsefulLifeOut.model_validate(_create(db, ComponentUsefulLife, body, current_user))


@router.patch("/componentisation/{record_id}", response_model=ComponentUsefulLifeOut)
def update_component(record_id: int, body: ComponentUsefulLifeUpdate, current_user: CurrentUser, db: DbSession):
    return ComponentUsefulLifeOut.model_validate(_patch(db, ComponentUsefulLife, record_id, body, current_user))


@router.delete("/componentisation/{record_id}", status_code=204)
def delete_component(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ComponentUsefulLife, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 8: IDLE / UNDER-UTILISED ASSETS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/idle-assets", response_model=list[IdleAssetOut], summary="List idle/under-utilised assets")
def list_idle_assets(current_user: CurrentUser, db: DbSession):
    return [IdleAssetOut.model_validate(r) for r in _list_all(db, IdleAsset, current_user)]


@router.post("/idle-assets", response_model=IdleAssetOut, status_code=201)
def create_idle_asset(body: IdleAssetCreate, current_user: CurrentUser, db: DbSession):
    return IdleAssetOut.model_validate(_create(db, IdleAsset, body, current_user))


@router.patch("/idle-assets/{record_id}", response_model=IdleAssetOut)
def update_idle_asset(record_id: int, body: IdleAssetUpdate, current_user: CurrentUser, db: DbSession):
    return IdleAssetOut.model_validate(_patch(db, IdleAsset, record_id, body, current_user))


@router.delete("/idle-assets/{record_id}", status_code=204)
def delete_idle_asset(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, IdleAsset, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 9: IMPAIRMENT INDICATORS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/impairment", response_model=list[ImpairmentIndicatorOut], summary="List impairment indicators")
def list_impairments(current_user: CurrentUser, db: DbSession):
    return [ImpairmentIndicatorOut.model_validate(r) for r in _list_all(db, ImpairmentIndicator, current_user)]


@router.post("/impairment", response_model=ImpairmentIndicatorOut, status_code=201)
def create_impairment(body: ImpairmentIndicatorCreate, current_user: CurrentUser, db: DbSession):
    return ImpairmentIndicatorOut.model_validate(_create(db, ImpairmentIndicator, body, current_user))


@router.patch("/impairment/{record_id}", response_model=ImpairmentIndicatorOut)
def update_impairment(record_id: int, body: ImpairmentIndicatorUpdate, current_user: CurrentUser, db: DbSession):
    return ImpairmentIndicatorOut.model_validate(_patch(db, ImpairmentIndicator, record_id, body, current_user))


@router.delete("/impairment/{record_id}", status_code=204)
def delete_impairment(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ImpairmentIndicator, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 10: INSURANCE-TO-ASSET MAPPING
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/insurance-mapping", response_model=list[InsuranceMappingOut], summary="List insurance-to-asset mappings")
def list_insurance_mappings(current_user: CurrentUser, db: DbSession):
    return [InsuranceMappingOut.model_validate(r) for r in _list_all(db, InsuranceMapping, current_user)]


@router.post("/insurance-mapping", response_model=InsuranceMappingOut, status_code=201)
def create_insurance_mapping(body: InsuranceMappingCreate, current_user: CurrentUser, db: DbSession):
    return InsuranceMappingOut.model_validate(_create(db, InsuranceMapping, body, current_user))


@router.patch("/insurance-mapping/{record_id}", response_model=InsuranceMappingOut)
def update_insurance_mapping(record_id: int, body: InsuranceMappingUpdate, current_user: CurrentUser, db: DbSession):
    return InsuranceMappingOut.model_validate(_patch(db, InsuranceMapping, record_id, body, current_user))


@router.delete("/insurance-mapping/{record_id}", status_code=204)
def delete_insurance_mapping(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, InsuranceMapping, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 11: CAPEX VS OPEX CLASSIFICATION
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/capex-opex", response_model=list[CapexOpexOut], summary="List capex vs opex classification records")
def list_capex_opex(current_user: CurrentUser, db: DbSession):
    return [CapexOpexOut.model_validate(r) for r in _list_all(db, CapexOpexClassification, current_user)]


@router.post("/capex-opex", response_model=CapexOpexOut, status_code=201)
def create_capex_opex(body: CapexOpexCreate, current_user: CurrentUser, db: DbSession):
    return CapexOpexOut.model_validate(_create(db, CapexOpexClassification, body, current_user))


@router.patch("/capex-opex/{record_id}", response_model=CapexOpexOut)
def update_capex_opex(record_id: int, body: CapexOpexUpdate, current_user: CurrentUser, db: DbSession):
    return CapexOpexOut.model_validate(_patch(db, CapexOpexClassification, record_id, body, current_user))


@router.delete("/capex-opex/{record_id}", status_code=204)
def delete_capex_opex(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, CapexOpexClassification, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 12: LEASE VS OWN (Ind AS 116)
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/lease-vs-own", response_model=list[LeaseVsOwnOut], summary="List lease vs own (ROU) records")
def list_leases(current_user: CurrentUser, db: DbSession):
    return [LeaseVsOwnOut.model_validate(r) for r in _list_all(db, LeaseVsOwn, current_user)]


@router.post("/lease-vs-own", response_model=LeaseVsOwnOut, status_code=201)
def create_lease(body: LeaseVsOwnCreate, current_user: CurrentUser, db: DbSession):
    return LeaseVsOwnOut.model_validate(_create(db, LeaseVsOwn, body, current_user))


@router.patch("/lease-vs-own/{record_id}", response_model=LeaseVsOwnOut)
def update_lease(record_id: int, body: LeaseVsOwnUpdate, current_user: CurrentUser, db: DbSession):
    return LeaseVsOwnOut.model_validate(_patch(db, LeaseVsOwn, record_id, body, current_user))


@router.delete("/lease-vs-own/{record_id}", status_code=204)
def delete_lease(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, LeaseVsOwn, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 13: ASSET TRANSFER & LOCATION MOVE
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/transfers", response_model=list[AssetTransferOut], summary="List asset transfers")
def list_transfers(current_user: CurrentUser, db: DbSession):
    return [AssetTransferOut.model_validate(r) for r in _list_all(db, AssetTransfer, current_user)]


@router.post("/transfers", response_model=AssetTransferOut, status_code=201)
def create_transfer(body: AssetTransferCreate, current_user: CurrentUser, db: DbSession):
    return AssetTransferOut.model_validate(_create(db, AssetTransfer, body, current_user))


@router.patch("/transfers/{record_id}", response_model=AssetTransferOut)
def update_transfer(record_id: int, body: AssetTransferUpdate, current_user: CurrentUser, db: DbSession):
    return AssetTransferOut.model_validate(_patch(db, AssetTransfer, record_id, body, current_user))


@router.delete("/transfers/{record_id}", status_code=204)
def delete_transfer(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, AssetTransfer, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 14: SCRAP & SALVAGE REALISATION
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/scrap-salvage", response_model=list[ScrapSalvageOut], summary="List scrap/salvage records")
def list_scrap(current_user: CurrentUser, db: DbSession):
    return [ScrapSalvageOut.model_validate(r) for r in _list_all(db, ScrapSalvage, current_user)]


@router.post("/scrap-salvage", response_model=ScrapSalvageOut, status_code=201)
def create_scrap(body: ScrapSalvageCreate, current_user: CurrentUser, db: DbSession):
    return ScrapSalvageOut.model_validate(_create(db, ScrapSalvage, body, current_user))


@router.patch("/scrap-salvage/{record_id}", response_model=ScrapSalvageOut)
def update_scrap(record_id: int, body: ScrapSalvageUpdate, current_user: CurrentUser, db: DbSession):
    return ScrapSalvageOut.model_validate(_patch(db, ScrapSalvage, record_id, body, current_user))


@router.delete("/scrap-salvage/{record_id}", status_code=204)
def delete_scrap(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, ScrapSalvage, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURE 15: REVALUATION & FAIR-VALUE REVIEW
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/revaluation", response_model=list[RevaluationReviewOut], summary="List revaluation reviews")
def list_revaluations(current_user: CurrentUser, db: DbSession):
    return [RevaluationReviewOut.model_validate(r) for r in _list_all(db, RevaluationReview, current_user)]


@router.post("/revaluation", response_model=RevaluationReviewOut, status_code=201)
def create_revaluation(body: RevaluationReviewCreate, current_user: CurrentUser, db: DbSession):
    return RevaluationReviewOut.model_validate(_create(db, RevaluationReview, body, current_user))


@router.patch("/revaluation/{record_id}", response_model=RevaluationReviewOut)
def update_revaluation(record_id: int, body: RevaluationReviewUpdate, current_user: CurrentUser, db: DbSession):
    return RevaluationReviewOut.model_validate(_patch(db, RevaluationReview, record_id, body, current_user))


@router.delete("/revaluation/{record_id}", status_code=204)
def delete_revaluation(record_id: int, current_user: CurrentUser, db: DbSession):
    _delete(db, RevaluationReview, record_id, current_user)


# ═══════════════════════════════════════════════════════════════════════════
# FEATURES 16-25: COMMON AUDIT SHELL ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════
# These are lightweight placeholder endpoints for the 10 common audit
# features shared across all modules.  In a production system they would
# integrate with platform-level tables (audit_universe, rcm_entries,
# sampling_sets, etc.).  Here they return structured metadata so the
# frontend can render the UI and the endpoints are ready for wiring.
#
# FUTURE: Replace the stub responses with queries against the platform
# tables, filtered by module_slug = "fixed_assets_cwip".

@router.get("/dashboard", summary="Feature 16: Module Dashboard & KPIs")
def module_dashboard(current_user: CurrentUser, db: DbSession):
    """
    Returns live KPIs for the Fixed Assets & CWIP module.

    Future: Aggregate real counts from feature tables above.
    Currently returns mock KPI data for UI development.
    """
    # TODO: Replace with real aggregation queries
    return {
        "module": "fixed_assets_cwip",
        "kpis": {
            "total_assets_verified": 0,
            "verification_coverage_pct": 0.0,
            "depreciation_variances": 0,
            "material_variances": 0,
            "cwip_delayed_items": 0,
            "pending_disposals": 0,
            "idle_assets": 0,
            "impairment_triggers": 0,
            "uninsured_assets": 0,
            "misclassified_items": 0,
            "pending_transfers": 0,
            "open_exceptions": 0,
            "risk_score": 0.0,
        },
        "status": "placeholder — wire to real data",
    }


@router.get("/scope", summary="Feature 17: Scope & Audit Universe")
def audit_scope(current_user: CurrentUser, db: DbSession):
    """
    Returns the auditable units/entities/processes in scope for this module.

    Future: Query from a platform-level audit_universe table filtered
    by module_slug.
    """
    return {
        "module": "fixed_assets_cwip",
        "auditable_units": [
            {"unit": "Plant & Machinery", "entity": "Manufacturing Unit 1", "in_scope": True},
            {"unit": "Land & Buildings", "entity": "Head Office", "in_scope": True},
            {"unit": "Furniture & Fittings", "entity": "All Locations", "in_scope": True},
            {"unit": "Vehicles", "entity": "Fleet", "in_scope": True},
            {"unit": "CWIP — Civil Works", "entity": "New Factory", "in_scope": True},
            {"unit": "Intangible Assets", "entity": "IT Systems", "in_scope": False},
        ],
        "status": "placeholder — wire to platform audit_universe table",
    }


@router.get("/rcm", summary="Feature 18: Risk & Control Matrix")
def risk_control_matrix(current_user: CurrentUser, db: DbSession):
    """
    Returns the Risk & Control Matrix (RCM) entries for fixed assets.

    Future: Query from platform rcm_entries table.
    """
    return {
        "module": "fixed_assets_cwip",
        "rcm_entries": [
            {
                "risk_id": "FA-R01",
                "risk": "Ghost assets in register",
                "control": "Annual physical verification",
                "assertion": "Existence",
                "owner": "Asset Manager",
                "frequency": "Annual",
            },
            {
                "risk_id": "FA-R02",
                "risk": "Incorrect depreciation",
                "control": "Quarterly depreciation recomputation",
                "assertion": "Valuation",
                "owner": "Finance Controller",
                "frequency": "Quarterly",
            },
            {
                "risk_id": "FA-R03",
                "risk": "Delayed capitalisation of CWIP",
                "control": "Monthly CWIP ageing review",
                "assertion": "Completeness",
                "owner": "Project Manager",
                "frequency": "Monthly",
            },
            {
                "risk_id": "FA-R04",
                "risk": "Unauthorised asset disposal",
                "control": "Disposal approval workflow",
                "assertion": "Rights & Obligations",
                "owner": "CFO",
                "frequency": "Per event",
            },
            {
                "risk_id": "FA-R05",
                "risk": "Capex misclassified as opex",
                "control": "GL review of repair & maintenance",
                "assertion": "Classification",
                "owner": "Finance Controller",
                "frequency": "Quarterly",
            },
        ],
        "status": "placeholder — wire to platform RCM table",
    }


@router.get("/test-rules", summary="Feature 19: Test & Analytics Rule Library")
def test_rules(current_user: CurrentUser, db: DbSession):
    """
    Returns configured automated red-flag rules and CAAT scripts.

    Future: Query from platform analytics_rules table.
    """
    return {
        "module": "fixed_assets_cwip",
        "rules": [
            {"rule_id": "FA-RULE-01", "name": "Depreciation variance > 5%", "threshold": 5.0, "active": True},
            {"rule_id": "FA-RULE-02", "name": "CWIP ageing > 365 days", "threshold": 365, "active": True},
            {"rule_id": "FA-RULE-03", "name": "Disposal without approval", "threshold": None, "active": True},
            {"rule_id": "FA-RULE-04", "name": "Idle asset > 180 days", "threshold": 180, "active": True},
            {"rule_id": "FA-RULE-05", "name": "Insurance coverage gap > 10%", "threshold": 10.0, "active": True},
        ],
        "status": "placeholder — wire to platform analytics_rules table",
    }


@router.get("/data-sources", summary="Feature 20: Data Source & Connector Setup")
def data_sources(current_user: CurrentUser, db: DbSession):
    """
    Returns configured ERP data sources feeding this module.

    Future: Query from platform data_connectors table.
    """
    return {
        "module": "fixed_assets_cwip",
        "sources": [
            {"name": "ERP Asset Master", "type": "database", "status": "connected"},
            {"name": "ERP GL Ledger", "type": "database", "status": "connected"},
            {"name": "Asset Register CSV", "type": "file_upload", "status": "available"},
            {"name": "Physical Verification App", "type": "api", "status": "pending"},
            {"name": "Insurance Policy Feed", "type": "api", "status": "pending"},
        ],
        "status": "placeholder — wire to platform data_connectors table",
    }


@router.get("/sampling", summary="Feature 21: Sampling & Population Builder")
def sampling(current_user: CurrentUser, db: DbSession):
    """
    Returns sampling configuration and drawn samples.

    Future: Query from platform sampling_sets table.
    """
    return {
        "module": "fixed_assets_cwip",
        "populations": [
            {"name": "All Fixed Assets", "count": 0, "method": "statistical"},
            {"name": "High-Value Assets (>₹10L)", "count": 0, "method": "judgemental"},
            {"name": "CWIP Items", "count": 0, "method": "100%_coverage"},
            {"name": "Disposed Assets (FY)", "count": 0, "method": "statistical"},
        ],
        "status": "placeholder — wire to platform sampling table",
    }


@router.get("/exceptions", summary="Feature 22: Exception & Red-Flag Queue")
def exceptions_queue(current_user: CurrentUser, db: DbSession):
    """
    Returns system-generated exceptions for triage.

    Future: Query from platform exception_queue table.
    """
    return {
        "module": "fixed_assets_cwip",
        "exceptions": [],
        "summary": {
            "total": 0,
            "open": 0,
            "in_progress": 0,
            "resolved": 0,
            "false_positive": 0,
        },
        "status": "placeholder — wire to platform exception_queue table",
    }


@router.get("/working-papers", summary="Feature 23: Working Papers & Evidence")
def working_papers(current_user: CurrentUser, db: DbSession):
    """
    Returns working paper records with evidence attachments.

    Future: Query from platform working_papers table.
    """
    return {
        "module": "fixed_assets_cwip",
        "papers": [],
        "summary": {
            "total_papers": 0,
            "reviewed": 0,
            "pending_review": 0,
        },
        "status": "placeholder — wire to platform working_papers table",
    }


@router.get("/findings", summary="Feature 24: Observation & Finding Log")
def findings_log(current_user: CurrentUser, db: DbSession):
    """
    Returns audit findings specific to this module.

    Future: Query from platform findings table filtered by module.
    """
    return {
        "module": "fixed_assets_cwip",
        "findings": [],
        "summary": {
            "total": 0,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
        },
        "status": "placeholder — wire to platform findings table",
    }


@router.get("/remediation", summary="Feature 25: Remediation / Action Tracker")
def remediation_tracker(current_user: CurrentUser, db: DbSession):
    """
    Returns CAPA (Corrective and Preventive Action) items.

    Future: Query from platform remediation table.
    """
    return {
        "module": "fixed_assets_cwip",
        "actions": [],
        "summary": {
            "total": 0,
            "open": 0,
            "overdue": 0,
            "closed": 0,
            "re_testing": 0,
        },
        "status": "placeholder — wire to platform remediation table",
    }
