"""Module API. Mounted automatically at /api/modules/_template.

Every route is tenant-isolated via `tenant_scoped()` + `CurrentUser`, so an
auditor from tenant A can never read tenant B's rows — you get this for free.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import TemplateItem
from .schemas import ItemCreate, ItemOut

# MANIFEST powers the dashboard tile + navigation on the frontend.
MANIFEST = {
    "name": "_template",
    "title": "Template Module",
    "description": "Reference module — copy me to start yours.",
    "icon": "clipboard",
    "group": "Other",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()


@router.get("/items", response_model=list[ItemOut])
def list_items(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(TemplateItem), current_user)
    return [ItemOut.model_validate(i) for i in q.order_by(TemplateItem.id).all()]


@router.post("/items", response_model=ItemOut, status_code=201)
def create_item(body: ItemCreate, current_user: CurrentUser, db: DbSession):
    item = TemplateItem(
        title=body.title, notes=body.notes, tenant_id=current_user.tenant_id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemOut.model_validate(item)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(TemplateItem).filter(TemplateItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
