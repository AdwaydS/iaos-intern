"""Exposes the list of loaded modules so the frontend can render nav/tiles."""
from fastapi import APIRouter, Request

from app.api.deps import CurrentUser

router = APIRouter(prefix="/api/modules", tags=["modules"])


@router.get("/registry")
def module_registry(request: Request, _: CurrentUser):
    """Return manifests of every auto-loaded module (excluding _template)."""
    loaded = getattr(request.app.state, "modules", [])
    return [m.manifest for m in loaded]
