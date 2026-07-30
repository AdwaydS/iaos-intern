"""Auto-discovery of intern modules — the key to conflict-free collaboration.

Each module lives in `app/modules/<name>/` and exposes:
  - router.py    → `router` (an APIRouter) and `MANIFEST` (a dict)
  - models.py    → SQLAlchemy models (optional; imported so tables register)

On startup we walk `app/modules/`, import each package, and mount its router
under `/api/modules/<name>`. Because NOTHING here references any specific
module by name, an intern adds a module simply by creating their folder — they
never edit a shared list. 80 branches → 80 new folders → zero merge conflicts.
"""
import importlib
import pkgutil
from dataclasses import dataclass

from fastapi import FastAPI

from app import modules as modules_pkg


@dataclass
class LoadedModule:
    name: str
    manifest: dict


def load_modules(app: FastAPI) -> list[LoadedModule]:
    loaded: list[LoadedModule] = []

    for _, name, is_pkg in pkgutil.iter_modules(modules_pkg.__path__):
        if not is_pkg or name.startswith("_"):
            continue  # skip _template and private helpers

        pkg = f"app.modules.{name}"

        # Import models first so their tables land on Base.metadata.
        try:
            importlib.import_module(f"{pkg}.models")
        except ModuleNotFoundError:
            pass  # module has no models — fine

        try:
            router_mod = importlib.import_module(f"{pkg}.router")
        except ModuleNotFoundError:
            print(f"[modules] '{name}' has no router.py — skipped")
            continue

        router = getattr(router_mod, "router", None)
        if router is None:
            print(f"[modules] '{name}' router.py has no `router` — skipped")
            continue

        manifest = getattr(router_mod, "MANIFEST", {"name": name})
        app.include_router(router, prefix=f"/api/modules/{name}", tags=[f"module:{name}"])
        loaded.append(LoadedModule(name=name, manifest=manifest))
        print(f"[modules] loaded '{name}'  ->  /api/modules/{name}")

    return loaded
