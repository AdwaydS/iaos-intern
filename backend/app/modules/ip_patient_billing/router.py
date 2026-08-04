"""Patient Billing & Revenue Cycle — API.

Tenant-isolated, data-driven endpoints backed by the sub-page catalogue:
  - GET  /subpages          catalogue of the 25 sub-pages (drives the UI)
  - GET  /overview          live KPIs for the module dashboard
  - GET  /data/{key}        list records for a sub-page
  - POST /data/{key}        create a record
  - PATCH /data/{key}/{id}  update a record
  - DELETE /data/{key}/{id} delete a record
  - GET  /data/{key}/summary  counts per categorical column + money totals
  - POST /seed              load demo data (only into empty tables)
Mounted automatically at /api/modules/ip_patient_billing.
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import func

from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped

from .models import MODELS
from .schemas import SCHEMAS
from .seed import SEED
from .specs import SUBPAGES, SUB_BY_KEY

MANIFEST = {
    "name": "ip_patient_billing",
    "title": "Patient Billing & Revenue Cycle",
    "description": (
        "Assurance over the hospital revenue cycle: charge capture, package/tariff "
        "integrity, TPA/insurance claims and revenue leakage at every touchpoint."
    ),
    "icon": "wallet",
    "group": "Industry Packs",
    "industry": "Healthcare",
    "version": "1.0.0",
    "owner": "intern-79",
}

router = APIRouter()


def _meta(sp: dict) -> dict:
    return {
        "no": sp["no"],
        "key": sp["key"],
        "title": sp["title"],
        "type": sp["type"],
        "purpose": sp["purpose"],
        "columns": [
            {
                "name": c["name"],
                "label": c["label"],
                "type": c["type"],
                "options": c.get("options", []),
                "required": c.get("required", False),
                "derived": c.get("derived", False),
                "default": c.get("default"),
                "money": c.get("money", False),
                "pct": c.get("pct", False),
            }
            for c in sp["columns"]
        ],
    }


def _derive(sp: dict, data: dict) -> dict:
    fn = sp.get("derive")
    if fn:
        fn(data)
    return data


def _model(key: str):
    if key not in SUB_BY_KEY or key == "dashboard":
        raise HTTPException(404, f"Unknown sub-page '{key}'")
    return MODELS[key]


@router.get("/subpages")
def subpages(current_user: CurrentUser, db: DbSession):
    return [_meta(sp) for sp in SUBPAGES]


@router.get("/data/{key}", response_model=list)
def list_records(key: str, current_user: CurrentUser, db: DbSession):
    model = _model(key)
    q = tenant_scoped(db.query(model), current_user).order_by(model.id.desc())
    out = SCHEMAS[key]["out"]
    return [out.model_validate(r) for r in q.all()]


@router.post("/data/{key}", status_code=201)
def create_record(key: str, body: dict, current_user: CurrentUser, db: DbSession):
    model = _model(key)
    sp = SUB_BY_KEY[key]
    payload = SCHEMAS[key]["create"].model_validate(body)
    data = _derive(sp, payload.model_dump(exclude_unset=True))
    row = model(**data, tenant_id=current_user.tenant_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return SCHEMAS[key]["out"].model_validate(row)


@router.patch("/data/{key}/{record_id}")
def update_record(
    key: str, record_id: int, body: dict, current_user: CurrentUser, db: DbSession
):
    model = _model(key)
    sp = SUB_BY_KEY[key]
    row = tenant_scoped(db.query(model).filter(model.id == record_id), current_user).first()
    if not row:
        raise HTTPException(404, "Record not found")
    payload = SCHEMAS[key]["update"].model_validate(body)
    merged = {
        c["name"]: getattr(row, c["name"]) for c in sp["columns"] if not c.get("derived")
    }
    merged.update(payload.model_dump(exclude_unset=True))
    data = _derive(sp, merged)
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return SCHEMAS[key]["out"].model_validate(row)


@router.delete("/data/{key}/{record_id}", status_code=204)
def delete_record(key: str, record_id: int, current_user: CurrentUser, db: DbSession):
    model = _model(key)
    row = tenant_scoped(db.query(model).filter(model.id == record_id), current_user).first()
    if not row:
        raise HTTPException(404, "Record not found")
    db.delete(row)
    db.commit()


@router.get("/data/{key}/summary")
def record_summary(key: str, current_user: CurrentUser, db: DbSession):
    """Counts per categorical column + money totals for the sub-page."""
    model = _model(key)
    sp = SUB_BY_KEY[key]
    result = {"selects": {}, "totals": {}}
    for col in sp["columns"]:
        attr = getattr(model, col["name"], None)
        if attr is None:
            continue
        if col["type"] == "select":
            rows = tenant_scoped(
                db.query(attr, func.count()).group_by(attr), current_user
            ).all()
            result["selects"][col["name"]] = [
                {"label": r[0] or "—", "count": r[1]} for r in rows
            ]
        elif col["type"] == "float" and col.get("money"):
            total = tenant_scoped(db.query(func.sum(attr)), current_user).scalar() or 0
            result["totals"][col["name"]] = round(total, 2)
    return result


@router.get("/overview")
def overview(current_user: CurrentUser, db: DbSession):
    counts = {}
    for key, model in MODELS.items():
        counts[key] = tenant_scoped(db.query(model), current_user).count()

    signature = [sp for sp in SUBPAGES if sp["type"] == "signature"]
    covered = sum(1 for sp in signature if counts.get(sp["key"], 0) > 0)
    coverage_pct = round(covered / len(signature) * 100) if signature else 0

    # Exceptions
    exc_model = MODELS["exception_queue"]
    open_exc = tenant_scoped(
        db.query(exc_model)
        .filter(exc_model.disposition.notin_(["Resolved", "False Positive"])),
        current_user,
    ).all()
    open_exceptions = len(open_exc)
    open_critical = sum(1 for e in open_exc if e.severity in ("High", "Critical"))
    open_exception_money = round(sum(e.amount_at_risk or 0 for e in open_exc), 2)

    # Findings
    find_model = MODELS["finding_log"]
    open_findings_rows = tenant_scoped(
        db.query(find_model).filter(find_model.status != "Closed"), current_user
    ).all()
    open_findings = len(open_findings_rows)
    high_crit_findings = sum(1 for f in open_findings_rows if f.severity in ("High", "Critical"))

    # Revenue leakage
    leak_model = MODELS["revenue_leakage"]
    leaks_open = tenant_scoped(
        db.query(leak_model).filter(leak_model.status.in_(["Open", "Investigating"])),
        current_user,
    ).all()
    leakage_at_risk = round(sum(l.amount or 0 for l in leaks_open), 2)
    leakage_total = round(
        sum(l.amount or 0 for l in tenant_scoped(db.query(leak_model), current_user).all()), 2
    )

    # Charge capture
    cc_model = MODELS["charge_capture"]
    cc_total = counts.get("charge_capture", 0)
    cc_captured = tenant_scoped(
        db.query(cc_model).filter(cc_model.status == "Captured"), current_user
    ).count()
    charge_capture_rate = round(cc_captured / cc_total * 100, 1) if cc_total else 0.0
    missed_amount = round(
        sum(
            c.billed_amount or 0
            for c in tenant_scoped(
                db.query(cc_model).filter(cc_model.status.in_(["Missed", "Partial"])),
                current_user,
            ).all()
        ),
        2,
    )

    # TPA claims
    claim_model = MODELS["tpa_claim"]
    billed_total = tenant_scoped(
        db.query(func.sum(claim_model.billed_amount)), current_user
    ).scalar() or 0
    approved_total = tenant_scoped(
        db.query(func.sum(claim_model.approved_amount)), current_user
    ).scalar() or 0
    claim_realisation_pct = (
        round(approved_total / billed_total * 100, 1) if billed_total else 0.0
    )

    # Denials
    denial_model = MODELS["claim_denial"]
    denial_amount = round(
        tenant_scoped(db.query(func.sum(denial_model.denied_amount)), current_user).scalar() or 0,
        2,
    )

    # Credit ageing
    ageing_model = MODELS["credit_ageing"]
    ageing_rows = tenant_scoped(
        db.query(ageing_model.bucket, func.count(), func.sum(ageing_model.amount)).group_by(
            ageing_model.bucket
        ),
        current_user,
    ).all()
    ageing_buckets = []
    ageing_over_90 = 0.0
    for bucket, cnt, amt in ageing_rows:
        ageing_buckets.append({"bucket": bucket, "count": cnt, "amount": round(amt or 0, 2)})
        if bucket == "90+":
            ageing_over_90 = round(amt or 0, 2)
    credit_outstanding = tenant_scoped(
        db.query(func.sum(ageing_model.amount))
        .filter(ageing_model.status.in_(["Open", "Partially Paid"])),
        current_user,
    ).scalar() or 0

    # Payer mix
    pm_model = MODELS["payer_mix"]
    mix_rows = tenant_scoped(
        db.query(pm_model.payer_type, func.count(), func.sum(pm_model.revenue_amount)).group_by(
            pm_model.payer_type
        ),
        current_user,
    ).all()
    payer_mix = [
        {"payer_type": p, "count": c, "revenue": round(r or 0, 2)}
        for p, c, r in mix_rows
    ]

    recent = tenant_scoped(db.query(exc_model), current_user).order_by(exc_model.id.desc()).limit(5).all()
    recent_exceptions = [
        {
            "exception_id": e.exception_id,
            "entity_ref": e.entity_ref,
            "severity": e.severity,
            "amount_at_risk": e.amount_at_risk,
            "disposition": e.disposition,
            "raised_date": e.raised_date,
        }
        for e in recent
    ]

    # Composite risk score (0–100)
    points = 0.0
    points += min(25.0, open_critical * 8)
    points += min(20.0, high_crit_findings * 8)
    points += min(20.0, (100 - charge_capture_rate) / 5) if cc_total else 10.0
    points += min(15.0, denial_amount / 200000 * 15)
    points += min(10.0, leakage_at_risk / 200000 * 10)
    points += min(10.0, open_exceptions / 10 * 5)
    risk_score = round(min(100.0, points))

    return {
        "counts": counts,
        "coverage_pct": coverage_pct,
        "risk_score": risk_score,
        "open_exceptions": open_exceptions,
        "open_critical": open_critical,
        "open_exception_money": open_exception_money,
        "open_findings": open_findings,
        "high_critical_findings": high_crit_findings,
        "leakage_at_risk": leakage_at_risk,
        "leakage_total": leakage_total,
        "charge_capture_rate": charge_capture_rate,
        "missed_charge_amount": missed_amount,
        "claim_realisation_pct": claim_realisation_pct,
        "denial_amount": denial_amount,
        "credit_outstanding": round(credit_outstanding, 2),
        "ageing_over_90": ageing_over_90,
        "ageing_buckets": ageing_buckets,
        "payer_mix": payer_mix,
        "recent_exceptions": recent_exceptions,
    }


@router.post("/seed")
def seed_demo(current_user: CurrentUser, db: DbSession):
    added = {}
    for key, rows in SEED.items():
        model = MODELS[key]
        if tenant_scoped(db.query(model), current_user).count() > 0:
            added[key] = 0
            continue
        sp = SUB_BY_KEY[key]
        for row in rows:
            data = _derive(sp, dict(row))
            db.add(model(**data, tenant_id=current_user.tenant_id))
        added[key] = len(rows)
    db.commit()
    return added
