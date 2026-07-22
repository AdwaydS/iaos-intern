"""Auto-generated stub for the "Data Analytics & CAAT" module.

Tenant-isolated CRUD scaffold — replace with the real workflow.
Mounted at /api/modules/data_analytics_caat.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import DataSource
from .schemas import DataSourceCreate, DataSourceOut

MANIFEST = {
    "name": "data_analytics_caat",
    "title": "Data Analytics & CAAT",
    "description": "Data Analytics & CAAT — audit module.",
    "icon": "file-check",
    "group": "Audit Command Center",
    "industry": "",
    "version": "0.1.0",
    "owner": "unassigned",
}

router = APIRouter()

@router.get("/data-sources", response_model=list[DataSourceOut])
def list_data_sources(db: DbSession):
    q = db.query(DataSource)
    return [DataSourceOut.model_validate(i) for i in q.order_by(DataSource.id.desc()).all()]


@router.post("/data-sources", response_model=DataSourceOut, status_code=201)
def create_data_source(
    body: DataSourceCreate,
    db: DbSession,
):
    item = DataSource(
        source_name=body.source_name,
        source_type=body.source_type,
        host=body.host,
        database_name=body.database_name,
        status=body.status,
        tenant_id=1
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return DataSourceOut.model_validate(item)

@router.put("/data-sources/{item_id}", response_model=DataSourceOut)
def update_data_source(
    item_id: int,
    body: DataSourceCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    item = tenant_scoped(
        db.query(DataSource).filter(DataSource.id == item_id),
        current_user,
    ).first()

    if not item:
        raise HTTPException(404, "Data Source not found")

    item.source_name = body.source_name
    item.source_type = body.source_type
    item.host = body.host
    item.database_name = body.database_name
    item.status = body.status

    db.commit()
    db.refresh(item)

    return DataSourceOut.model_validate(item)


@router.delete("/data-sources/{item_id}", status_code=204)
def delete_data_source(item_id: int, current_user: CurrentUser, db: DbSession):
    item = db.query(DataSource).filter(DataSource.id == item_id).first()

    if not item:
        raise HTTPException(404, "Data Source not found")

    db.delete(item)
    db.commit()