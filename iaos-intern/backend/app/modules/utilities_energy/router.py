"""Utilities & Energy Costs module (49) — signature analytics.

Mounted at /api/modules/utilities_energy.

Implements the 15 "Signature" use cases from the audit-scope spec as
real, tenant-scoped calculations against UtilityRecord data — not
placeholder CRUD. Each check function takes a tenant's list of records
and yields (record, metric_value, threshold_value, description) tuples
for anything it flags.

IMPORTANT: the numeric thresholds below (e.g. "PF < 0.90", "loss > 5%")
are reasonable industry-standard starting points, not the client's
actual contracted/policy thresholds. A domain reviewer should confirm
and tune these — ideally by moving them into a per-tenant config table
once the "Test & Analytics Rule Library" (Shell use case 19) exists,
rather than hardcoding them here permanently.

The 10 "Shell" use cases (dashboard, scope/audit universe, RCM, rule
library, data source setup, sampling, exception queue UI, working
papers, findings, remediation tracker) are intentionally NOT built in
this file — see note to the team about whether those are generic
platform features shared across all 49 modules before duplicating them
per-module.
"""
from __future__ import annotations

from statistics import mean
from typing import Callable, Iterable

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import SignatureCheckException, SignatureCheckRun, UtilityRecord
from .schemas import (
    CheckRunOut,
    ExceptionOut,
    ExceptionUpdate,
    SignatureCheckMeta,
    UtilityRecordCreate,
    UtilityRecordOut,
)

MANIFEST = {
    "name": "utilities_energy",
    "title": "Utilities & Energy",
    "description": "Assurance over power, fuel and utility costs: consumption vs "
    "output, tariff/contract-demand optimisation, and loss/leakage analytics.",
    "icon": "zap",
    "group": "Supply Chain & Operations",
    "industry": "Manufacturing, Infra, Utilities",
    "version": "0.1.0",
    "owner": "unassigned",
}

router = APIRouter()

# ---------------------------------------------------------------------------
# Signature check registry
# ---------------------------------------------------------------------------
# Each entry: key -> (label, description, compute_fn)
# compute_fn(records) -> iterable of (record, metric_value, threshold_value, description)

Flag = tuple[UtilityRecord, float, float, str]


def _energy_per_unit_output(records: list[UtilityRecord]) -> Iterable[Flag]:
    """1. Specific-energy-consumption trend — flag SEC > 1.2x tenant average."""
    secs = [
        (r, r.energy_consumed_kwh / r.output_units)
        for r in records
        if r.output_units > 0
    ]
    if not secs:
        return
    avg = mean(v for _, v in secs)
    threshold = avg * 1.2
    for r, v in secs:
        if v > threshold:
            yield r, v, threshold, f"SEC {v:.2f} kWh/unit vs tenant average {avg:.2f} (>20% over)"


def _tariff_contract_demand_review(records: list[UtilityRecord]) -> Iterable[Flag]:
    """2. Demand vs sanctioned load — flag actual demand within 10% of sanctioned load."""
    for r in records:
        if r.sanctioned_load_kva > 0 and r.actual_demand_kva > 0:
            ratio = r.actual_demand_kva / r.sanctioned_load_kva
            threshold = 0.9
            if ratio >= threshold:
                yield r, ratio, threshold, (
                    f"Actual demand {r.actual_demand_kva:.1f} kVA is "
                    f"{ratio*100:.0f}% of sanctioned load {r.sanctioned_load_kva:.1f} kVA — breach risk"
                )


def _power_factor_penalty(records: list[UtilityRecord]) -> Iterable[Flag]:
    """3. PF optimisation — flag power factor below 0.90 (typical penalty threshold)."""
    threshold = 0.90
    for r in records:
        if 0 < r.power_factor < threshold:
            yield r, r.power_factor, threshold, f"Power factor {r.power_factor:.2f} below {threshold} — likely penalty"


def _fuel_consumption_vs_norm(records: list[UtilityRecord]) -> Iterable[Flag]:
    """4. DG/boiler fuel efficiency — flag actual fuel/unit > 10% over norm."""
    for r in records:
        if r.output_units > 0 and r.fuel_norm_litres_per_unit > 0:
            actual = r.fuel_consumed_litres / r.output_units
            threshold = r.fuel_norm_litres_per_unit * 1.1
            if actual > threshold:
                yield r, actual, threshold, (
                    f"Fuel use {actual:.2f} l/unit exceeds norm "
                    f"{r.fuel_norm_litres_per_unit:.2f} l/unit by >10%"
                )


def _transmission_distribution_loss(records: list[UtilityRecord]) -> Iterable[Flag]:
    """5. Internal energy loss — flag T&D loss > 5% of input."""
    threshold = 0.05
    for r in records:
        if r.transmission_input_units > 0:
            loss = (r.transmission_input_units - r.transmission_output_units) / r.transmission_input_units
            if loss > threshold:
                yield r, loss, threshold, f"Transmission/distribution loss {loss*100:.1f}% exceeds 5%"


def _utility_bill_validation(records: list[UtilityRecord]) -> Iterable[Flag]:
    """6. Billed units vs meter reading — flag mismatch beyond 2% tolerance."""
    threshold = 0.02
    for r in records:
        if r.meter_reading_units_kwh > 0:
            diff = abs(r.billed_units_kwh - r.meter_reading_units_kwh) / r.meter_reading_units_kwh
            if diff > threshold:
                yield r, diff, threshold, (
                    f"Billed {r.billed_units_kwh:.0f} kWh vs metered "
                    f"{r.meter_reading_units_kwh:.0f} kWh — {diff*100:.1f}% variance"
                )


def _renewable_open_access_savings(records: list[UtilityRecord]) -> Iterable[Flag]:
    """7. Green-power cost benefit — flag sites with zero renewable uptake."""
    for r in records:
        if r.energy_consumed_kwh > 0 and r.renewable_units_kwh == 0:
            yield r, 0, 0, "No renewable/open-access units recorded — unrealised savings opportunity"


def _water_effluent_charges(records: list[UtilityRecord]) -> Iterable[Flag]:
    """8. Utility cost beyond power — flag effluent cost/kL > 1.5x tenant average."""
    rates = [
        (r, r.effluent_charges / r.water_consumed_kl)
        for r in records
        if r.water_consumed_kl > 0
    ]
    if not rates:
        return
    avg = mean(v for _, v in rates)
    threshold = avg * 1.5
    for r, v in rates:
        if v > threshold:
            yield r, v, threshold, f"Effluent cost {v:.2f}/kL exceeds 1.5x tenant average {avg:.2f}/kL"


def _idle_running_detection(records: list[UtilityRecord]) -> Iterable[Flag]:
    """9. Equipment run without load — flag running hours materially exceeding production hours."""
    for r in records:
        if r.running_hours > 0 and r.running_hours > r.production_hours:
            idle = r.running_hours - r.production_hours
            threshold = 0.0
            yield r, idle, threshold, (
                f"{r.equipment_id or 'Equipment'} ran {idle:.1f} hrs beyond production hours (idle running)"
            )


def _peak_vs_offpeak_usage(records: list[UtilityRecord]) -> Iterable[Flag]:
    """10. Load-shifting opportunities — flag peak usage exceeding off-peak usage."""
    for r in records:
        if r.peak_units_kwh > 0 and r.peak_units_kwh > r.offpeak_units_kwh:
            threshold = r.offpeak_units_kwh
            yield r, r.peak_units_kwh, threshold, (
                f"Peak usage {r.peak_units_kwh:.0f} kWh exceeds off-peak {r.offpeak_units_kwh:.0f} kWh "
                "— load-shifting opportunity"
            )


def _sub_meter_reconciliation(records: list[UtilityRecord]) -> Iterable[Flag]:
    """11. Section-wise consumption tie-out — flag sub-meter vs main-meter mismatch > 3%."""
    threshold = 0.03
    for r in records:
        if r.energy_consumed_kwh > 0 and r.submeter_units_kwh > 0:
            diff = abs(r.energy_consumed_kwh - r.submeter_units_kwh) / r.energy_consumed_kwh
            if diff > threshold:
                yield r, diff, threshold, (
                    f"Sub-meter {r.submeter_units_kwh:.0f} kWh vs main meter "
                    f"{r.energy_consumed_kwh:.0f} kWh — {diff*100:.1f}% variance for section {r.section or 'n/a'}"
                )


def _demand_charge_optimisation(records: list[UtilityRecord]) -> Iterable[Flag]:
    """12. Maximum-demand management — flag actual demand exceeding contracted demand."""
    for r in records:
        if r.contract_demand_kva > 0 and r.actual_demand_kva > r.contract_demand_kva:
            yield r, r.actual_demand_kva, r.contract_demand_kva, (
                f"Actual demand {r.actual_demand_kva:.1f} kVA exceeds contracted "
                f"{r.contract_demand_kva:.1f} kVA — excess demand charge"
            )


def _fuel_stock_reconciliation(records: list[UtilityRecord]) -> Iterable[Flag]:
    """13. DG/boiler fuel-stock control — flag opening+purchased-closing vs consumed mismatch."""
    threshold = 0.02
    for r in records:
        expected_consumed = r.fuel_opening_stock + r.fuel_purchased - r.fuel_closing_stock
        if expected_consumed > 0:
            diff = abs(expected_consumed - r.fuel_consumed_litres) / expected_consumed
            if diff > threshold:
                yield r, diff, threshold, (
                    f"Stock-implied consumption {expected_consumed:.0f} l vs recorded "
                    f"{r.fuel_consumed_litres:.0f} l — {diff*100:.1f}% variance"
                )


def _carbon_emission_tracking(records: list[UtilityRecord]) -> Iterable[Flag]:
    """14. Energy-linked emissions — flag missing emission factor (data-quality gap)."""
    for r in records:
        if r.energy_consumed_kwh > 0 and r.emission_factor_kgco2_per_kwh == 0:
            yield r, 0, 0, "Emission factor not recorded — carbon footprint cannot be computed for this record"


def _utility_cost_allocation(records: list[UtilityRecord]) -> Iterable[Flag]:
    """15. Charge-out to cost centres — flag records with no cost centre assigned."""
    for r in records:
        if not r.cost_centre.strip():
            yield r, 0, 0, "No cost centre assigned — cost cannot be charged out"


CHECK_REGISTRY: dict[str, tuple[str, str, Callable[[list[UtilityRecord]], Iterable[Flag]]]] = {
    "energy_per_unit_output": ("Energy per Unit Output", "Specific-energy-consumption trend", _energy_per_unit_output),
    "tariff_contract_demand_review": ("Tariff & Contract-Demand Review", "Demand vs sanctioned load", _tariff_contract_demand_review),
    "power_factor_penalty_rebate": ("Power-Factor Penalty / Rebate", "PF optimisation", _power_factor_penalty),
    "fuel_consumption_vs_norm": ("Fuel Consumption vs Norm", "DG/boiler fuel efficiency", _fuel_consumption_vs_norm),
    "transmission_distribution_loss": ("Transmission / Distribution Loss", "Internal energy loss", _transmission_distribution_loss),
    "utility_bill_validation": ("Utility-Bill Validation", "Billed units vs meter reading", _utility_bill_validation),
    "renewable_open_access_savings": ("Renewable / Open-Access Savings", "Green-power cost benefit", _renewable_open_access_savings),
    "water_effluent_charges": ("Water & Effluent Charges", "Utility cost beyond power", _water_effluent_charges),
    "idle_running_detection": ("Idle-Running Detection", "Equipment run without load", _idle_running_detection),
    "peak_vs_offpeak_usage": ("Peak vs Off-Peak Usage", "Load-shifting opportunities", _peak_vs_offpeak_usage),
    "sub_meter_reconciliation": ("Sub-Meter Reconciliation", "Section-wise consumption tie-out", _sub_meter_reconciliation),
    "demand_charge_optimisation": ("Demand-Charge Optimisation", "Maximum-demand management", _demand_charge_optimisation),
    "fuel_stock_reconciliation": ("Fuel-Stock Reconciliation", "DG/boiler fuel-stock control", _fuel_stock_reconciliation),
    "carbon_emission_tracking": ("Carbon / Emission Tracking", "Energy-linked emissions", _carbon_emission_tracking),
    "utility_cost_allocation": ("Utility Cost Allocation", "Charge-out to cost centres", _utility_cost_allocation),
}


# ---------------------------------------------------------------------------
# Records CRUD
# ---------------------------------------------------------------------------


@router.get("/records", response_model=list[UtilityRecordOut])
def list_records(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(UtilityRecord), current_user)
    return [UtilityRecordOut.model_validate(r) for r in q.order_by(UtilityRecord.period_start.desc()).all()]


@router.post("/records", response_model=UtilityRecordOut, status_code=201)
def create_record(body: UtilityRecordCreate, current_user: CurrentUser, db: DbSession):
    record = UtilityRecord(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return UtilityRecordOut.model_validate(record)


@router.post("/records/bulk", response_model=list[UtilityRecordOut], status_code=201)
def create_records_bulk(body: list[UtilityRecordCreate], current_user: CurrentUser, db: DbSession):
    records = [UtilityRecord(**item.model_dump(), tenant_id=current_user.tenant_id) for item in body]
    db.add_all(records)
    db.commit()
    for r in records:
        db.refresh(r)
    return [UtilityRecordOut.model_validate(r) for r in records]


@router.delete("/records/{record_id}", status_code=204)
def delete_record(record_id: int, current_user: CurrentUser, db: DbSession):
    record = tenant_scoped(
        db.query(UtilityRecord).filter(UtilityRecord.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Record not found")
    db.delete(record)
    db.commit()


# ---------------------------------------------------------------------------
# Signature checks
# ---------------------------------------------------------------------------


@router.get("/checks", response_model=list[SignatureCheckMeta])
def list_checks():
    return [
        SignatureCheckMeta(key=key, label=label, description=desc)
        for key, (label, desc, _fn) in CHECK_REGISTRY.items()
    ]


@router.post("/checks/{check_key}/run", response_model=CheckRunOut, status_code=201)
def run_check(check_key: str, current_user: CurrentUser, db: DbSession):
    if check_key not in CHECK_REGISTRY:
        raise HTTPException(404, f"Unknown check '{check_key}'")
    _label, _desc, compute_fn = CHECK_REGISTRY[check_key]

    records = tenant_scoped(db.query(UtilityRecord), current_user).all()

    run = SignatureCheckRun(check_key=check_key, records_scanned=len(records), tenant_id=current_user.tenant_id)
    db.add(run)
    db.flush()  # get run.id before attaching exceptions

    count = 0
    for record, metric_value, threshold_value, description in compute_fn(records):
        db.add(
            SignatureCheckException(
                run_id=run.id,
                record_id=record.id,
                check_key=check_key,
                metric_value=metric_value,
                threshold_value=threshold_value,
                description=description,
                tenant_id=current_user.tenant_id,
            )
        )
        count += 1

    run.exceptions_found = count
    db.commit()
    db.refresh(run)
    return CheckRunOut.model_validate(run)


@router.get("/runs", response_model=list[CheckRunOut])
def list_runs(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(SignatureCheckRun), current_user)
    return [CheckRunOut.model_validate(r) for r in q.order_by(SignatureCheckRun.run_at.desc()).all()]


@router.get("/runs/{run_id}/exceptions", response_model=list[ExceptionOut])
def list_run_exceptions(run_id: int, current_user: CurrentUser, db: DbSession):
    run = tenant_scoped(
        db.query(SignatureCheckRun).filter(SignatureCheckRun.id == run_id), current_user
    ).first()
    if not run:
        raise HTTPException(404, "Run not found")
    q = tenant_scoped(
        db.query(SignatureCheckException).filter(SignatureCheckException.run_id == run_id), current_user
    )
    return [ExceptionOut.model_validate(e) for e in q.all()]


@router.patch("/exceptions/{exception_id}", response_model=ExceptionOut)
def update_exception(exception_id: int, body: ExceptionUpdate, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(
        db.query(SignatureCheckException).filter(SignatureCheckException.id == exception_id), current_user
    ).first()
    if not exc:
        raise HTTPException(404, "Exception not found")
    if body.status is not None:
        exc.status = body.status
    if body.reviewer_note is not None:
        exc.reviewer_note = body.reviewer_note
    db.commit()
    db.refresh(exc)
    return ExceptionOut.model_validate(exc)

"""
ADD THIS TO THE BOTTOM OF backend/app/modules/utilities_energy/router.py
(the file you already saved from the previous step). Do not replace the
whole file — just append everything below to the end of it.

This registers utilities_energy's existing SignatureCheckRun/
SignatureCheckException data with the shared dashboard/exception-queue
endpoints, per the "reuse existing signature data" decision — no new
tables, just an adapter.
"""

# --- registration for the shared audit framework (Shell #16 / #22) --------
from sqlalchemy.orm import Session

from app.shared.audit_framework.registry import register_module
from app.shared.audit_framework.schemas import GenericExceptionOut, ModuleSummaryOut
from .models import CheckStatus  # not imported above — needed for the OPEN-status filter below


def _get_summary(tenant_id: int, db: Session) -> ModuleSummaryOut:
    runs = (
        db.query(SignatureCheckRun)
        .filter(SignatureCheckRun.tenant_id == tenant_id)
        .order_by(SignatureCheckRun.run_at.desc())
        .all()
    )
    total_exceptions = sum(r.exceptions_found for r in runs)
    open_exceptions = (
        db.query(SignatureCheckException)
        .filter(
            SignatureCheckException.tenant_id == tenant_id,
            SignatureCheckException.status == CheckStatus.OPEN,
        )
        .count()
    )
    checks_ever_run = {r.check_key for r in runs}
    coverage_pct = round(100 * len(checks_ever_run) / len(CHECK_REGISTRY), 1) if CHECK_REGISTRY else None

    return ModuleSummaryOut(
        module_key="utilities_energy",
        risk_score=None,  # no scoring model defined yet — surface as unset rather than fabricate one
        open_exceptions=open_exceptions,
        total_exceptions=total_exceptions,
        coverage_pct=coverage_pct,
        trend="",  # needs >1 period of run history to compute meaningfully — left blank for now
    )


def _get_exceptions(tenant_id: int, db: Session) -> list[GenericExceptionOut]:
    exceptions = (
        db.query(SignatureCheckException)
        .filter(SignatureCheckException.tenant_id == tenant_id)
        .order_by(SignatureCheckException.id.desc())
        .all()
    )
    return [
        GenericExceptionOut(
            id=e.id,
            module_key="utilities_energy",
            check_key=e.check_key,
            description=e.description,
            status=e.status.value,
            metric_value=e.metric_value,
            threshold_value=e.threshold_value,
        )
        for e in exceptions
    ]


register_module("utilities_energy", _get_summary, _get_exceptions)
"""
ADD THIS TO THE BOTTOM OF backend/app/modules/utilities_energy/router.py
(the file you already saved from the previous step). Do not replace the
whole file — just append everything below to the end of it.

This registers utilities_energy's existing SignatureCheckRun/
SignatureCheckException data with the shared dashboard/exception-queue
endpoints, per the "reuse existing signature data" decision — no new
tables, just an adapter.
"""

# --- registration for the shared audit framework (Shell #16 / #22) --------
from sqlalchemy.orm import Session

from app.shared.audit_framework.registry import register_module
from app.shared.audit_framework.schemas import GenericExceptionOut, ModuleSummaryOut
from .models import CheckStatus  # not imported above — needed for the OPEN-status filter below


def _get_summary(tenant_id: int, db: Session) -> ModuleSummaryOut:
    runs = (
        db.query(SignatureCheckRun)
        .filter(SignatureCheckRun.tenant_id == tenant_id)
        .order_by(SignatureCheckRun.run_at.desc())
        .all()
    )
    total_exceptions = sum(r.exceptions_found for r in runs)
    open_exceptions = (
        db.query(SignatureCheckException)
        .filter(
            SignatureCheckException.tenant_id == tenant_id,
            SignatureCheckException.status == CheckStatus.OPEN,
        )
        .count()
    )
    checks_ever_run = {r.check_key for r in runs}
    coverage_pct = round(100 * len(checks_ever_run) / len(CHECK_REGISTRY), 1) if CHECK_REGISTRY else None

    return ModuleSummaryOut(
        module_key="utilities_energy",
        risk_score=None,  # no scoring model defined yet — surface as unset rather than fabricate one
        open_exceptions=open_exceptions,
        total_exceptions=total_exceptions,
        coverage_pct=coverage_pct,
        trend="",  # needs >1 period of run history to compute meaningfully — left blank for now
    )


def _get_exceptions(tenant_id: int, db: Session) -> list[GenericExceptionOut]:
    exceptions = (
        db.query(SignatureCheckException)
        .filter(SignatureCheckException.tenant_id == tenant_id)
        .order_by(SignatureCheckException.id.desc())
        .all()
    )
    return [
        GenericExceptionOut(
            id=e.id,
            module_key="utilities_energy",
            check_key=e.check_key,
            description=e.description,
            status=e.status.value,
            metric_value=e.metric_value,
            threshold_value=e.threshold_value,
        )
        for e in exceptions
    ]


register_module("utilities_energy", _get_summary, _get_exceptions)
"""
ADD THIS TO THE BOTTOM OF backend/app/modules/utilities_energy/router.py
(the file you already saved from the previous step). Do not replace the
whole file — just append everything below to the end of it.

This registers utilities_energy's existing SignatureCheckRun/
SignatureCheckException data with the shared dashboard/exception-queue
endpoints, per the "reuse existing signature data" decision — no new
tables, just an adapter.
"""

# --- registration for the shared audit framework (Shell #16 / #22) --------
from sqlalchemy.orm import Session

from app.shared.audit_framework.registry import register_module
from app.shared.audit_framework.schemas import GenericExceptionOut, ModuleSummaryOut
from .models import CheckStatus  # not imported above — needed for the OPEN-status filter below


def _get_summary(tenant_id: int, db: Session) -> ModuleSummaryOut:
    runs = (
        db.query(SignatureCheckRun)
        .filter(SignatureCheckRun.tenant_id == tenant_id)
        .order_by(SignatureCheckRun.run_at.desc())
        .all()
    )
    total_exceptions = sum(r.exceptions_found for r in runs)
    open_exceptions = (
        db.query(SignatureCheckException)
        .filter(
            SignatureCheckException.tenant_id == tenant_id,
            SignatureCheckException.status == CheckStatus.OPEN,
        )
        .count()
    )
    checks_ever_run = {r.check_key for r in runs}
    coverage_pct = round(100 * len(checks_ever_run) / len(CHECK_REGISTRY), 1) if CHECK_REGISTRY else None

    return ModuleSummaryOut(
        module_key="utilities_energy",
        risk_score=None,  # no scoring model defined yet — surface as unset rather than fabricate one
        open_exceptions=open_exceptions,
        total_exceptions=total_exceptions,
        coverage_pct=coverage_pct,
        trend="",  # needs >1 period of run history to compute meaningfully — left blank for now
    )


def _get_exceptions(tenant_id: int, db: Session) -> list[GenericExceptionOut]:
    exceptions = (
        db.query(SignatureCheckException)
        .filter(SignatureCheckException.tenant_id == tenant_id)
        .order_by(SignatureCheckException.id.desc())
        .all()
    )
    return [
        GenericExceptionOut(
            id=e.id,
            module_key="utilities_energy",
            check_key=e.check_key,
            description=e.description,
            status=e.status.value,
            metric_value=e.metric_value,
            threshold_value=e.threshold_value,
        )
        for e in exceptions
    ]


register_module("utilities_energy", _get_summary, _get_exceptions)
