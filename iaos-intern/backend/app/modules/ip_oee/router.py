"""Auto-generated stub for the "OEE" module.

Tenant-isolated CRUD scaffold — replace with the real workflow.
Mounted at /api/modules/ip_oee.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import IpOeeItem
from .schemas import ItemCreate, ItemOut

MANIFEST = {
    "name": "ip_oee",
    "title": "OEE",
    "description": "OEE — audit module.",
    "icon": "grid",
    "group": "Industry Packs",
    "industry": "Manufacturing",
    "version": "0.1.0",
    "owner": "unassigned",
}

router = APIRouter()


@router.get("/items", response_model=list[ItemOut])
def list_items(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(IpOeeItem), current_user)
    return [ItemOut.model_validate(i) for i in q.order_by(IpOeeItem.id.desc()).all()]


@router.post("/items", response_model=ItemOut, status_code=201)
def create_item(body: ItemCreate, current_user: CurrentUser, db: DbSession):
    item = IpOeeItem(title=body.title, notes=body.notes, tenant_id=current_user.tenant_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItemOut.model_validate(item)


@router.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, current_user: CurrentUser, db: DbSession):
    item = tenant_scoped(
        db.query(IpOeeItem).filter(IpOeeItem.id == item_id), current_user
    ).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
