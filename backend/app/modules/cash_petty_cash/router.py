"""Module API for Module 22 — Cash & Petty Cash. Mounted at
/api/modules/cash_petty_cash.

All 25 sub-pages are served through one generic set of routes instead of
25 hand-written blocks:

  GET    /pages                       -> nav + form metadata for all 25 pages
  GET    /dashboard                   -> KPI counts for page 16
  GET    /pages/{slug}/records        -> list rows for one sub-page
  POST   /pages/{slug}/records        -> create a row
  DELETE /pages/{slug}/records/{id}   -> delete a row

Every route is tenant-isolated via `tenant_scoped()` + `CurrentUser`, same
as every other module in this repo.
"""
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import ALL_PAGES, MODELS, PAGE_FIELDS
from .schemas import SCHEMAS

MANIFEST = {
    "name": "cash_petty_cash",
    "title": "Cash & Petty Cash",
    "description": (
        "Controls over physical cash: imprest limits, surprise counts, "
        "voucher support, and statutory cash-payment limits."
    ),
    "icon": "wallet",
    "group": "Finance & Close",
    "industry": "Retail / Hospitality / All",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()


def _field_meta(slug: str):
    out = []
    for name, kind, _default in PAGE_FIELDS.get(slug, []):
        out.append(
            {
                "name": name,
                "kind": "number" if kind == "num" else ("textarea" if kind == "text" else "text"),
                "label": name.replace("_", " ").title(),
            }
        )
    return out


@router.get("/pages")
def list_pages():
    """Metadata for all 25 sub-pages — drives the frontend nav + forms."""
    return [
        {
            "no": no,
            "slug": slug,
            "title": title,
            "group": "signature" if no <= 15 else "shell",
            "has_table": slug in MODELS,
            "fields": _field_meta(slug),
        }
        for no, slug, title in ALL_PAGES
    ]


@router.get("/dashboard")
def dashboard(current_user: CurrentUser, db: DbSession):
    """Page 16: Module Dashboard & KPIs — computed over the other 24 pages."""
    by_page = {}
    for slug, model in MODELS.items():
        by_page[slug] = tenant_scoped(db.query(model), current_user).count()
    return {
        "total_records": sum(by_page.values()),
        "pages_with_data": sum(1 for n in by_page.values() if n),
        "by_page": by_page,
    }


@router.get("/pages/{slug}/records")
def list_records(slug: str, current_user: CurrentUser, db: DbSession):
    model = MODELS.get(slug)
    if not model:
        raise HTTPException(404, "Unknown or non-tabular page")
    _, OutModel = SCHEMAS[slug]
    q = tenant_scoped(db.query(model), current_user).order_by(model.id.desc())
    return [OutModel.model_validate(row) for row in q.all()]


@router.post("/pages/{slug}/records", status_code=201)
def create_record(slug: str, body: dict, current_user: CurrentUser, db: DbSession):
    model = MODELS.get(slug)
    if not model:
        raise HTTPException(404, "Unknown or non-tabular page")
    CreateModel, OutModel = SCHEMAS[slug]
    payload = CreateModel(**body)
    record = model(**payload.model_dump(), tenant_id=current_user.tenant_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return OutModel.model_validate(record)


@router.delete("/pages/{slug}/records/{record_id}", status_code=204)
def delete_record(slug: str, record_id: int, current_user: CurrentUser, db: DbSession):
    model = MODELS.get(slug)
    if not model:
        raise HTTPException(404, "Unknown or non-tabular page")
    record = tenant_scoped(
        db.query(model).filter(model.id == record_id), current_user
    ).first()
    if not record:
        raise HTTPException(404, "Record not found")
    db.delete(record)
    db.commit()
