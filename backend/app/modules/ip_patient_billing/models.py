"""Tenant-scoped SQLAlchemy models for Patient Billing & Revenue Cycle.

Models are built dynamically from the sub-page catalogue in `specs.py` so the
schema, the API and the UI all stay in sync. Every table is prefixed
`mod_ip_patient_billing_` and inherits `TenantMixin` for row-level tenancy.
"""
from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import mapped_column

from app.core.database import Base
from app.core.tenancy import TenantMixin

from .specs import SUBPAGES

TYPE_FACTORY = {
    "text": lambda: String(255),
    "textarea": lambda: Text(),
    "int": lambda: Integer(),
    "float": lambda: Float(),
    "bool": lambda: Boolean(),
    "select": lambda: String(120),
}

#: entity key -> SQLAlchemy model class
MODELS: dict[str, type] = {}

for _sp in SUBPAGES:
    if _sp["key"] == "dashboard":
        continue
    attrs: dict = {"__tablename__": f"mod_ip_patient_billing_{_sp['key']}"}
    attrs["id"] = mapped_column(Integer, primary_key=True, autoincrement=True)
    for _col in _sp["columns"]:
        _kw = {}
        if _col.get("default") is not None:
            _kw["default"] = _col["default"]
        attrs[_col["name"]] = mapped_column(TYPE_FACTORY[_col["type"]](), **_kw)
    _cls = type(_sp["model"], (Base, TenantMixin), attrs)
    _cls.__module__ = __name__
    MODELS[_sp["key"]] = _cls
