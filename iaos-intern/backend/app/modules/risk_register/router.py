from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import Risk
from .schemas import RiskCreate, RiskOut

MANIFEST = {
    "name": "risk_register",
    "title": "Risk Register",
    "description": "Log, score, and track audit risks by likelihood × impact.",
    "icon": "alert-triangle",
    "group": "Audit Command Center",
    "industry": "",
    "version": "1.0.0",
    "owner": "demo",
}

router = APIRouter()


def _out(r: Risk) -> RiskOut:
    return RiskOut(
        id=r.id, title=r.title, category=r.category,
        likelihood=r.likelihood, impact=r.impact, owner=r.owner,
        notes=r.notes, score=r.likelihood * r.impact,
    )


@router.get("/risks", response_model=list[RiskOut])
def list_risks(current_user: CurrentUser, db: DbSession):
    q = tenant_scoped(db.query(Risk), current_user).order_by(Risk.id.desc())
    return [_out(r) for r in q.all()]


@router.post("/risks", response_model=RiskOut, status_code=201)
def create_risk(body: RiskCreate, current_user: CurrentUser, db: DbSession):
    risk = Risk(**body.model_dump(), tenant_id=current_user.tenant_id)
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return _out(risk)


@router.delete("/risks/{risk_id}", status_code=204)
def delete_risk(risk_id: int, current_user: CurrentUser, db: DbSession):
    risk = tenant_scoped(
        db.query(Risk).filter(Risk.id == risk_id), current_user
    ).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    db.delete(risk)
    db.commit()
