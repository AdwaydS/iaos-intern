import asyncio
import json
import random
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, DbSession
from app.core.database import SessionLocal
from app.core.tenancy import tenant_scoped

from .models import InvestmentsException, SectorGuardrail, ComplianceTrendPoint
from .schemas import (
    InvestmentsExceptionOut,
    ResolvePayload,
    SimulationPayload,
    SectorGuardrailOut,
    ComplianceTrendPointOut,
)

router = APIRouter()

def seed_tenant_data_if_empty(db: DbSession, current_user: CurrentUser):
    tenant_id = current_user.tenant_id
    if tenant_scoped(db.query(InvestmentsException), current_user).count() == 0:
        db.add_all([
            InvestmentsException(tenant_id=tenant_id, security="Tesla Inc. Note", amount="$12.5M", exception="Exposure Breach", date=date.today(), severity="High"),
            InvestmentsException(tenant_id=tenant_id, security="Vertex Pharma", amount="$8M", exception="Rating Downgrade", date=date.today(), severity="High")
        ])
    if tenant_scoped(db.query(SectorGuardrail), current_user).count() == 0:
        db.add_all([
            SectorGuardrail(tenant_id=tenant_id, sector="Technology", limit_pct=25.0, current_pct=22.4),
            SectorGuardrail(tenant_id=tenant_id, sector="Real Estate", limit_pct=15.0, current_pct=18.2, status="Breached")
        ])
    if tenant_scoped(db.query(ComplianceTrendPoint), current_user).count() == 0:
        db.add_all([ComplianceTrendPoint(tenant_id=tenant_id, month=m, score=s, exceptions_count=1) 
                    for m, s in [("May", 90), ("Jun", 94), ("Jul", 96)]])
    db.commit()

@router.get("/exceptions", response_model=list[InvestmentsExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    seed_tenant_data_if_empty(db, current_user)
    return tenant_scoped(db.query(InvestmentsException), current_user).all()

@router.post("/exceptions/resolve", response_model=list[InvestmentsExceptionOut])
def resolve_exception(payload: ResolvePayload, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(db.query(InvestmentsException).filter(InvestmentsException.id == payload.id), current_user).first()
    if exc: exc.status = "Resolved"
    db.commit()
    return tenant_scoped(db.query(InvestmentsException), current_user).all()

@router.get("/compliance-trends", response_model=list[ComplianceTrendPointOut])
def list_compliance_trends(current_user: CurrentUser, db: DbSession):
    return tenant_scoped(db.query(ComplianceTrendPoint).order_by(ComplianceTrendPoint.id.asc()), current_user).all()

@router.get("/sector-guardrails", response_model=list[SectorGuardrailOut])
def list_sector_guardrails(current_user: CurrentUser, db: DbSession):
    return tenant_scoped(db.query(SectorGuardrail), current_user).all()

@router.post("/procedures/simulate")
async def simulate_procedure(payload: SimulationPayload, current_user: CurrentUser):
    tenant_id = current_user.tenant_id
    async def event_generator():
        db = SessionLocal()
        try:
            yield f"data: {json.dumps({'type': 'log', 'message': 'Agent Initialized...'})}\n\n"
            await asyncio.sleep(1)
            deviations_count = random.randint(1, 3)
            # Create a mock deviation
            new_exc = InvestmentsException(
                tenant_id=tenant_id, security="Simulated Security", amount="$1.0M",
                exception=f"Simulation found issue in {payload.procedure_id}", 
                date=date.today(), severity="Medium"
            )
            db.add(new_exc)
            db.commit()
            yield f"data: {json.dumps({'type': 'summary', 'status': 'FAILED', 'deviations_count': deviations_count, 'sample_size': payload.sample_size, 'tolerance': payload.tolerance, 'deviation_rate': 0.2})}\n\n"
        finally:
            db.close()
    return StreamingResponse(event_generator(), media_type="text/event-stream")