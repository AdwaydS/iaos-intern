"""Pydantic request/response models, generated from the sub-page catalogue.

Three schemas are built per entity:
  - `<Model>Create` — required fields enforced, defaults applied
  - `<Model>Update` — all fields optional (PATCH semantics)
  - `<Model>Out`    — full read model incl. server-computed (derived) columns
"""
from typing import Optional

from pydantic import ConfigDict, Field, create_model

from .specs import SUBPAGES

PY_TYPES = {
    "text": str,
    "textarea": str,
    "select": str,
    "int": int,
    "float": float,
    "bool": bool,
}

#: entity key -> {"create": ..., "update": ..., "out": ...}
SCHEMAS: dict[str, dict] = {}

for _sp in SUBPAGES:
    if _sp["key"] == "dashboard":
        continue
    _create_fields, _update_fields, _out_fields = {}, {}, {"id": (int, ...)}
    for _col in _sp["columns"]:
        _ftype = PY_TYPES[_col["type"]]
        _opt = Optional[_ftype]
        if _col.get("derived"):
            _out_fields[_col["name"]] = (_opt, None)
            continue
        if _col.get("required"):
            if _ftype is str:
                _create_fields[_col["name"]] = (_ftype, Field(..., min_length=1))
            else:
                _create_fields[_col["name"]] = (_ftype, ...)
        else:
            _create_fields[_col["name"]] = (_opt, _col.get("default"))
        _update_fields[_col["name"]] = (_opt, None)
        _out_fields[_col["name"]] = (_opt, None)

    SCHEMAS[_sp["key"]] = {
        "create": create_model(f"{_sp['model']}Create", **_create_fields),
        "update": create_model(f"{_sp['model']}Update", **_update_fields),
        "out": create_model(
            f"{_sp['model']}Out",
            __config__=ConfigDict(from_attributes=True),
            **_out_fields,
        ),
    }
