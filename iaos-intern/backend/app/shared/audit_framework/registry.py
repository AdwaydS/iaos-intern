"""Module summary/exception provider registry.

The Dashboard & KPIs (Shell #16) and Exception & Red-Flag Queue (Shell
#22) use cases are views over data each module already owns (for
utilities_energy, that's SignatureCheckRun/SignatureCheckException) —
they are NOT rebuilt as their own tables here.

Instead, each module registers two small functions at import time:

    from app.shared.audit_framework.registry import register_module

    def get_summary(tenant_id, db) -> ModuleSummaryOut: ...
    def get_exceptions(tenant_id, db) -> list[GenericExceptionOut]: ...

    register_module("utilities_energy", get_summary, get_exceptions)

The shared /dashboard/{module_key} and /exceptions/{module_key}
endpoints look up the right module's functions here and call them. This
means the shared framework never needs to know each module's internal
schema, and adding a new module never requires touching this file.
"""
from __future__ import annotations

from typing import Callable, NamedTuple

from sqlalchemy.orm import Session

from .schemas import GenericExceptionOut, ModuleSummaryOut

SummaryFn = Callable[[int, Session], ModuleSummaryOut]
ExceptionsFn = Callable[[int, Session], list[GenericExceptionOut]]


class ModuleProviders(NamedTuple):
    get_summary: SummaryFn
    get_exceptions: ExceptionsFn


_REGISTRY: dict[str, ModuleProviders] = {}


def register_module(module_key: str, get_summary: SummaryFn, get_exceptions: ExceptionsFn) -> None:
    """Call this once from each module's router.py (at import time)."""
    _REGISTRY[module_key] = ModuleProviders(get_summary, get_exceptions)


def get_providers(module_key: str) -> ModuleProviders | None:
    return _REGISTRY.get(module_key)


def registered_module_keys() -> list[str]:
    return list(_REGISTRY.keys())
