"""Pydantic schemas for all 25 sub-pages of Module 22 (Cash & Petty Cash).

Mirrors models.py: one Create/Out pair per tabular sub-page, built from the
same PAGE_FIELDS spec so the two files can never drift out of sync.
"""
from pydantic import BaseModel, ConfigDict, create_model

from .models import ALL_PAGES, PAGE_FIELDS


def _py_type(kind: str):
    return float if kind == "num" else str


# slug -> (CreateSchema, OutSchema)
SCHEMAS: dict[str, tuple[type[BaseModel], type[BaseModel]]] = {}

# OutModel reads its fields off a SQLAlchemy row (record.reference_no, etc.)
# instead of a dict, so it needs from_attributes=True. That MUST be passed
# in via __config__ at create_model() time — pydantic v2 builds and caches
# the validator right then, so assigning `.model_config = ...` afterwards
# is too late and silently has no effect (causes a "not a valid dictionary
# or instance of X" error on every save).
_OUT_CONFIG = ConfigDict(from_attributes=True)

for _no, _slug, _title in ALL_PAGES:
    if _slug not in PAGE_FIELDS:
        continue  # module_dashboard_kpis: computed, no stored record

    _fields = PAGE_FIELDS[_slug]
    _create_fields = {name: (_py_type(kind), default) for name, kind, default in _fields}
    _out_fields = {**_create_fields, "id": (int, ...)}

    CreateModel = create_model(f"{_slug}_Create", **_create_fields)  # type: ignore[call-overload]
    OutModel = create_model(  # type: ignore[call-overload]
        f"{_slug}_Out", __config__=_OUT_CONFIG, **_out_fields
    )

    SCHEMAS[_slug] = (CreateModel, OutModel)
