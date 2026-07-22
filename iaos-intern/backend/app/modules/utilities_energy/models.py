"""Utilities & Energy Costs module (49) — data models.

Two families of tables, both tenant-isolated via TenantMixin:

  - UtilityRecord: one row per site/period of consumption, billing, fuel,
    and demand data. Deliberately wide so it can feed all 15 signature
    checks — populate only the fields relevant to a given record's source.
  - SignatureCheckRun / SignatureCheckException: execution history and
    flagged-record output every time a signature check is run.

The 10 "Shell" use cases (dashboard, scope, RCM, rule library, data
source setup, sampling, exception queue, working papers, findings,
remediation) are NOT modeled here — confirm with the platform team
whether those are generic/shared across all modules before duplicating
that scaffolding per-module.
"""
from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import Date, Enum as SAEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.tenancy import TenantMixin


class UtilityRecord(Base, TenantMixin):
    """One period's worth of consumption/billing/fuel/demand data for a site."""

    __tablename__ = "mod_utilities_energy_records"

    id: Mapped[int] = mapped_column(primary_key=True)

    site: Mapped[str] = mapped_column(String(120))
    cost_centre: Mapped[str] = mapped_column(String(120), default="")
    period_start: Mapped[date] = mapped_column(Date)
    period_end: Mapped[date] = mapped_column(Date)

    # Energy / demand — checks 1, 2, 3, 12
    energy_consumed_kwh: Mapped[float] = mapped_column(Float, default=0)
    output_units: Mapped[float] = mapped_column(Float, default=0)
    sanctioned_load_kva: Mapped[float] = mapped_column(Float, default=0)
    contract_demand_kva: Mapped[float] = mapped_column(Float, default=0)
    actual_demand_kva: Mapped[float] = mapped_column(Float, default=0)
    power_factor: Mapped[float] = mapped_column(Float, default=0)

    # Fuel — checks 4, 13
    fuel_type: Mapped[str] = mapped_column(String(60), default="")
    fuel_consumed_litres: Mapped[float] = mapped_column(Float, default=0)
    fuel_norm_litres_per_unit: Mapped[float] = mapped_column(Float, default=0)
    fuel_opening_stock: Mapped[float] = mapped_column(Float, default=0)
    fuel_purchased: Mapped[float] = mapped_column(Float, default=0)
    fuel_closing_stock: Mapped[float] = mapped_column(Float, default=0)

    # Billing / metering — checks 6, 11
    billed_units_kwh: Mapped[float] = mapped_column(Float, default=0)
    meter_reading_units_kwh: Mapped[float] = mapped_column(Float, default=0)
    tariff_rate: Mapped[float] = mapped_column(Float, default=0)
    section: Mapped[str] = mapped_column(String(120), default="")
    submeter_units_kwh: Mapped[float] = mapped_column(Float, default=0)

    # Loss / renewables / other utilities — checks 5, 7, 8
    transmission_input_units: Mapped[float] = mapped_column(Float, default=0)
    transmission_output_units: Mapped[float] = mapped_column(Float, default=0)
    renewable_units_kwh: Mapped[float] = mapped_column(Float, default=0)
    open_access_savings: Mapped[float] = mapped_column(Float, default=0)
    water_consumed_kl: Mapped[float] = mapped_column(Float, default=0)
    effluent_charges: Mapped[float] = mapped_column(Float, default=0)

    # Idle-running / load profile — checks 9, 10
    equipment_id: Mapped[str] = mapped_column(String(120), default="")
    running_hours: Mapped[float] = mapped_column(Float, default=0)
    production_hours: Mapped[float] = mapped_column(Float, default=0)
    peak_units_kwh: Mapped[float] = mapped_column(Float, default=0)
    offpeak_units_kwh: Mapped[float] = mapped_column(Float, default=0)

    # Emissions — check 14
    emission_factor_kgco2_per_kwh: Mapped[float] = mapped_column(Float, default=0)

    notes: Mapped[str] = mapped_column(Text, default="")

    exceptions: Mapped[list["SignatureCheckException"]] = relationship(
        back_populates="record", cascade="all, delete-orphan"
    )


class CheckStatus(str, enum.Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    CLEARED = "cleared"
    CONFIRMED = "confirmed"


class SignatureCheckRun(Base, TenantMixin):
    """One execution of a signature check across the tenant's records."""

    __tablename__ = "mod_utilities_energy_check_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    check_key: Mapped[str] = mapped_column(String(60), index=True)
    run_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    records_scanned: Mapped[int] = mapped_column(Integer, default=0)
    exceptions_found: Mapped[int] = mapped_column(Integer, default=0)

    exceptions: Mapped[list["SignatureCheckException"]] = relationship(
        back_populates="run", cascade="all, delete-orphan"
    )


class SignatureCheckException(Base, TenantMixin):
    """A single flagged record produced by a signature check run."""

    __tablename__ = "mod_utilities_energy_exceptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int] = mapped_column(
        ForeignKey("mod_utilities_energy_check_runs.id", ondelete="CASCADE")
    )
    record_id: Mapped[int] = mapped_column(
        ForeignKey("mod_utilities_energy_records.id", ondelete="CASCADE")
    )
    check_key: Mapped[str] = mapped_column(String(60), index=True)
    metric_value: Mapped[float] = mapped_column(Float, default=0)
    threshold_value: Mapped[float] = mapped_column(Float, default=0)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[CheckStatus] = mapped_column(SAEnum(CheckStatus), default=CheckStatus.OPEN)
    reviewer_note: Mapped[str] = mapped_column(Text, default="")

    run: Mapped["SignatureCheckRun"] = relationship(back_populates="exceptions")
    record: Mapped["UtilityRecord"] = relationship(back_populates="exceptions")
