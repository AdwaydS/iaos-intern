"""Utilities & Energy Costs module — Pydantic I/O schemas."""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from .models import CheckStatus


class UtilityRecordCreate(BaseModel):
    site: str
    cost_centre: str = ""
    period_start: date
    period_end: date

    energy_consumed_kwh: float = 0
    output_units: float = 0
    sanctioned_load_kva: float = 0
    contract_demand_kva: float = 0
    actual_demand_kva: float = 0
    power_factor: float = 0

    fuel_type: str = ""
    fuel_consumed_litres: float = 0
    fuel_norm_litres_per_unit: float = 0
    fuel_opening_stock: float = 0
    fuel_purchased: float = 0
    fuel_closing_stock: float = 0

    billed_units_kwh: float = 0
    meter_reading_units_kwh: float = 0
    tariff_rate: float = 0
    section: str = ""
    submeter_units_kwh: float = 0

    transmission_input_units: float = 0
    transmission_output_units: float = 0
    renewable_units_kwh: float = 0
    open_access_savings: float = 0
    water_consumed_kl: float = 0
    effluent_charges: float = 0

    equipment_id: str = ""
    running_hours: float = 0
    production_hours: float = 0
    peak_units_kwh: float = 0
    offpeak_units_kwh: float = 0

    emission_factor_kgco2_per_kwh: float = 0

    notes: str = ""


class UtilityRecordOut(UtilityRecordCreate):
    id: int
    model_config = {"from_attributes": True}


class SignatureCheckMeta(BaseModel):
    key: str
    label: str
    description: str


class CheckRunOut(BaseModel):
    id: int
    check_key: str
    run_at: datetime
    records_scanned: int
    exceptions_found: int
    model_config = {"from_attributes": True}


class ExceptionOut(BaseModel):
    id: int
    run_id: int
    record_id: int
    check_key: str
    metric_value: float
    threshold_value: float
    description: str
    status: CheckStatus
    reviewer_note: str
    model_config = {"from_attributes": True}


class ExceptionUpdate(BaseModel):
    status: Optional[CheckStatus] = None
    reviewer_note: Optional[str] = None
