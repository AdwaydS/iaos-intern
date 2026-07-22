import asyncio
import json
import random
from datetime import date, datetime, timedelta
from typing import Generator

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

MANIFEST = {
    "name": "investments_audit",
    "title": "Investments Audit",
    "description": "Comprehensive compliance dashboard, concentration guardrails, exception resolution, and statistical simulations for investments.",
    "icon": "building",
    "group": "Treasury, Assets & Capital",
    "industry": "",
    "version": "1.0.0",
    "owner": "auditor",
}

router = APIRouter()


def seed_tenant_data_if_empty(db: DbSession, current_user: CurrentUser):
    """Seed initial mock data for the tenant if none exists to ensure a rich UI experience."""
    tenant_id = current_user.tenant_id

    # 1. Seed Exceptions
    exc_count = tenant_scoped(db.query(InvestmentsException), current_user).count()
    if exc_count == 0:
        today = date.today()
        exceptions = [
            InvestmentsException(
                tenant_id=tenant_id,
                module="Investments Audit",
                security="Tesla Inc. (TSLA) 4.5% Corporate Note",
                amount="$12,500,000",
                exception="Exposure exceeds single-issuer concentration cap of 10% of total portfolio value (currently at 12.5%).",
                date=today - timedelta(days=7),
                severity="High",
                status="Unresolved",
            ),
            InvestmentsException(
                tenant_id=tenant_id,
                module="Investments Audit",
                security="Evergreen Real Estate Trust Preferred Stock",
                amount="$4,200,000",
                exception="Maturity and Rollover check failed: reinvestment terms extended without Board Committee sign-off.",
                date=today - timedelta(days=3),
                severity="Medium",
                status="In Review",
            ),
            InvestmentsException(
                tenant_id=tenant_id,
                module="Investments Audit",
                security="Vertex Pharma Commercial Paper",
                amount="$8,000,000",
                exception="Credit rating downgraded below mandated IPS threshold (minimum A- required, downgraded to BBB+).",
                date=today - timedelta(days=12),
                severity="High",
                status="Unresolved",
            ),
            InvestmentsException(
                tenant_id=tenant_id,
                module="Investments Audit",
                security="Apex Global Equities",
                amount="$1,500,000",
                exception="Dividend Income Recomputation Deviation: actual received dividend of 2.4% vs declared rate of 4.5%.",
                date=today - timedelta(days=15),
                severity="Medium",
                status="Resolved",
            ),
        ]
        db.add_all(exceptions)

    # 2. Seed Sector Guardrails
    guard_count = tenant_scoped(db.query(SectorGuardrail), current_user).count()
    if guard_count == 0:
        guardrails = [
            SectorGuardrail(
                tenant_id=tenant_id,
                sector="Technology",
                limit_pct=25.0,
                current_pct=22.4,
                status="Compliant",
            ),
            SectorGuardrail(
                tenant_id=tenant_id,
                sector="Real Estate & Infrastructure",
                limit_pct=15.0,
                current_pct=18.2,
                status="Breached",
            ),
            SectorGuardrail(
                tenant_id=tenant_id,
                sector="Energy & Utilities",
                limit_pct=20.0,
                current_pct=14.5,
                status="Compliant",
            ),
            SectorGuardrail(
                tenant_id=tenant_id,
                sector="Financial Services",
                limit_pct=30.0,
                current_pct=28.9,
                status="Compliant",
            ),
            SectorGuardrail(
                tenant_id=tenant_id,
                sector="Healthcare & Pharmaceuticals",
                limit_pct=15.0,
                current_pct=9.8,
                status="Compliant",
            ),
        ]
        db.add_all(guardrails)

    # 3. Seed Compliance Trends
    trend_count = tenant_scoped(db.query(ComplianceTrendPoint), current_user).count()
    if trend_count == 0:
        trends = [
            ComplianceTrendPoint(tenant_id=tenant_id, month="Feb", score=85, exceptions_count=5),
            ComplianceTrendPoint(tenant_id=tenant_id, month="Mar", score=88, exceptions_count=4),
            ComplianceTrendPoint(tenant_id=tenant_id, month="Apr", score=92, exceptions_count=2),
            ComplianceTrendPoint(tenant_id=tenant_id, month="May", score=90, exceptions_count=3),
            ComplianceTrendPoint(tenant_id=tenant_id, month="Jun", score=94, exceptions_count=1),
            ComplianceTrendPoint(tenant_id=tenant_id, month="Jul", score=96, exceptions_count=1),
        ]
        db.add_all(trends)

    db.commit()


@router.get("/exceptions", response_model=list[InvestmentsExceptionOut])
def list_exceptions(current_user: CurrentUser, db: DbSession):
    seed_tenant_data_if_empty(db, current_user)
    q = tenant_scoped(db.query(InvestmentsException), current_user)
    return [
        InvestmentsExceptionOut.model_validate(e)
        for e in q.order_by(InvestmentsException.date.desc()).all()
    ]


@router.post("/exceptions/resolve", response_model=list[InvestmentsExceptionOut])
def resolve_exception(payload: ResolvePayload, current_user: CurrentUser, db: DbSession):
    exc = tenant_scoped(
        db.query(InvestmentsException).filter(InvestmentsException.id == payload.id),
        current_user,
    ).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    
    exc.status = "Resolved"
    db.commit()

    # Return the updated list
    q = tenant_scoped(db.query(InvestmentsException), current_user)
    return [
        InvestmentsExceptionOut.model_validate(e)
        for e in q.order_by(InvestmentsException.date.desc()).all()
    ]


@router.get("/compliance-trends", response_model=list[ComplianceTrendPointOut])
def list_compliance_trends(current_user: CurrentUser, db: DbSession):
    seed_tenant_data_if_empty(db, current_user)
    q = tenant_scoped(db.query(ComplianceTrendPoint), current_user)
    return [
        ComplianceTrendPointOut.model_validate(t)
        for t in q.order_by(ComplianceTrendPoint.id.asc()).all()
    ]


@router.get("/sector-guardrails", response_model=list[SectorGuardrailOut])
def list_sector_guardrails(current_user: CurrentUser, db: DbSession):
    seed_tenant_data_if_empty(db, current_user)
    q = tenant_scoped(db.query(SectorGuardrail), current_user)
    return [
        SectorGuardrailOut.model_validate(g)
        for g in q.order_by(SectorGuardrail.id.asc()).all()
    ]


@router.post("/procedures/simulate")
async def simulate_procedure(
    payload: SimulationPayload, current_user: CurrentUser
):
    """Draws a mock population, runs compliance testing, writes deviations to DB, and streams back real-time log updates."""
    tenant_id = current_user.tenant_id

    async def event_generator():
        # Open separate DB session for the duration of the generator to avoid lifetime issues
        db = SessionLocal()
        try:
            yield f"data: {json.dumps({'type': 'log', 'message': f'Initializing compliance simulation for [{payload.procedure_id}]...'})}\n\n"
            await asyncio.sleep(0.2)
            yield f"data: {json.dumps({'type': 'log', 'message': f'Configured tolerance limit: {payload.tolerance * 100:.1f}%. Sample size: {payload.sample_size}.'})}\n\n"
            await asyncio.sleep(0.2)
            yield f"data: {json.dumps({'type': 'log', 'message': 'Fetching portfolio custody logs from ERP/Connector... Done.'})}\n\n"
            await asyncio.sleep(0.2)

            deviations = []
            securities_pool = [
                ("Apple Inc. Bond 3.5%", "Technology", "$15,000,000"),
                ("Microsoft Corp Senior Note", "Technology", "$18,500,000"),
                ("Prologis Real Estate Bond", "Real Estate & Infrastructure", "$9,000,000"),
                ("Chevron Corp Debenture", "Energy & Utilities", "$6,400,000"),
                ("Johnson & Johnson Note", "Healthcare & Pharmaceuticals", "$8,200,000"),
                ("JPMorgan Chase Cert of Deposit", "Financial Services", "$22,000,000"),
                ("Amazon.com Commercial Paper", "Technology", "$11,500,000"),
                ("Digital Realty REIT Preferred", "Real Estate & Infrastructure", "$7,800,000"),
                ("NextEra Energy Green Bond", "Energy & Utilities", "$14,000,000"),
                ("Pfizer Inc Callable Note", "Healthcare & Pharmaceuticals", "$5,500,000"),
                ("Goldman Sachs Medium-Term Note", "Financial Services", "$16,000,000"),
                ("NVIDIA Corp Note", "Technology", "$13,200,000"),
            ]

            sample_securities = [
                random.choice(securities_pool) for _ in range(payload.sample_size)
            ]

            deviations_count = 0
            for idx, (security, sector, amt) in enumerate(sample_securities, 1):
                yield f"data: {json.dumps({'type': 'log', 'message': f'[{idx}/{payload.sample_size}] Checking security: {security} ({sector})...'})}\n\n"
                await asyncio.sleep(0.3)

                # Simulated failure probability
                is_deviation = random.random() < 0.15  # 15% probability of anomaly
                if is_deviation:
                    deviations_count += 1
                    anomaly_type = random.choice([
                        "Custodian reconcilation mismatch: quantity discrepancy between ERP and Demat statement.",
                        "Valuation discrepancy: market value differs from third-party vendor valuation by > 1.5%.",
                        "Board limits approval breach: transaction amount exceeds delegated executive authority limit.",
                        "Income mismatch: coupon payment received does not match computed accrual rate.",
                        "Rating breach: issuer downgraded to below investment grade.",
                    ])
                    deviations.append({
                        "security": security,
                        "amount": amt,
                        "exception": f"[{payload.procedure_id}] {anomaly_type}",
                    })
                    yield f"data: {json.dumps({'type': 'log', 'message': f'  -> [DEVIATION DETECTED] {anomaly_type}'})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'log', 'message': '  -> Verified. Compliant.'})}\n\n"
                await asyncio.sleep(0.1)

            # Calculation
            deviation_rate = deviations_count / payload.sample_size
            passed = deviation_rate <= payload.tolerance
            status_str = "PASSED" if passed else "FAILED"

            yield f"data: {json.dumps({'type': 'log', 'message': f'Simulation Complete. Total Deviations: {deviations_count} / {payload.sample_size} (Rate: {deviation_rate * 100:.1f}% vs Tolerance: {payload.tolerance * 100:.1f}%).'})}\n\n"
            await asyncio.sleep(0.2)

            if not passed:
                yield f"data: {json.dumps({'type': 'log', 'message': f'[BREACH] Failure rate of {deviation_rate*100:.1f}% exceeds tolerance. Creating exception records in database...'})}\n\n"
                await asyncio.sleep(0.2)
                
                # Write deviations to DB
                db_exceptions = []
                for dev in deviations:
                    db_exc = InvestmentsException(
                        tenant_id=tenant_id,
                        module="Investments Audit",
                        security=dev["security"],
                        amount=dev["amount"],
                        exception=dev["exception"],
                        date=date.today(),
                        severity="High",
                        status="Unresolved"
                    )
                    db_exceptions.append(db_exc)
                db.add_all(db_exceptions)
                db.commit()

                # Update Trend Point
                latest_trend = tenant_scoped(
                    db.query(ComplianceTrendPoint), current_user
                ).order_by(ComplianceTrendPoint.id.desc()).first()
                if latest_trend:
                    latest_trend.exceptions_count += deviations_count
                    latest_trend.score = max(50, latest_trend.score - (deviations_count * 5))
                    db.commit()

                yield f"data: {json.dumps({'type': 'log', 'message': f'Logged {len(deviations)} new exceptions to the Investments Exceptions Queue.'})}\n\n"
            else:
                yield f"data: {json.dumps({'type': 'log', 'message': 'No critical action required. Portfolio is within acceptable tolerance boundaries.'})}\n\n"

            summary = {
                "type": "summary",
                "procedure_id": payload.procedure_id,
                "sample_size": payload.sample_size,
                "tolerance": payload.tolerance,
                "deviations_count": deviations_count,
                "deviation_rate": deviation_rate,
                "status": status_str,
            }
            yield f"data: {json.dumps(summary)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'log', 'message': f'Error occurred during simulation: {str(e)}'})}\n\n"
        finally:
            db.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")
