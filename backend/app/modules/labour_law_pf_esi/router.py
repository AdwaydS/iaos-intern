from fastapi import APIRouter, HTTPException
from app.api.deps import CurrentUser, DbSession
from app.core.tenancy import tenant_scoped
from .models import LabourComplianceRegistry, ContractWorker, ComplianceException
from .schemas import (
    RegistryCreate, RegistryUpdate, RegistryOut,
    ContractWorkerCreate, ContractWorkerUpdate, ContractWorkerOut,
    ComplianceExceptionCreate, ComplianceExceptionUpdate, ComplianceExceptionOut,
    DashboardSummary
)

MANIFEST = {
    "name": "labour_law_pf_esi",
    "title": "Labour Law & PF/ESI Compliance",
    "description": "Assurance over labour-law obligations including registers, licences, contract-labour compliance, wage codes, and social-security remittances.",
    "icon": "scale",
    "group": "Tax, Legal & Compliance",
    "industry": "",
    "version": "1.0.0",
    "owner": "unassigned",
}

router = APIRouter()
custom_router = APIRouter()


def register_labour_compliance_routes(r: APIRouter):
    # --- Registry Endpoints ---
    @r.get("/registry/{registry_type}", response_model=list[RegistryOut])
    def list_registry(registry_type: str, current_user: CurrentUser, db: DbSession):
        # registry_type should be UPPERCASE to match the db values
        reg_type = registry_type.upper()
        q = tenant_scoped(db.query(LabourComplianceRegistry), current_user)
        results = q.filter(LabourComplianceRegistry.registry_type == reg_type).all()
        return [RegistryOut.model_validate(x) for x in results]

    @r.post("/registry/{registry_type}", response_model=RegistryOut, status_code=201)
    def create_registry(registry_type: str, body: RegistryCreate, current_user: CurrentUser, db: DbSession):
        reg_type = registry_type.upper()
        item = LabourComplianceRegistry(
            registry_type=reg_type,
            title=body.title,
            identifier=body.identifier,
            status=body.status,
            date_value=body.date_value,
            remarks=body.remarks,
            tenant_id=current_user.tenant_id
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return RegistryOut.model_validate(item)

    @r.put("/registry/{registry_type}/{item_id}", response_model=RegistryOut)
    def update_registry(registry_type: str, item_id: int, body: RegistryUpdate, current_user: CurrentUser, db: DbSession):
        reg_type = registry_type.upper()
        item = tenant_scoped(
            db.query(LabourComplianceRegistry).filter(
                LabourComplianceRegistry.id == item_id,
                LabourComplianceRegistry.registry_type == reg_type
            ),
            current_user
        ).first()
        if not item:
            raise HTTPException(404, "Registry item not found")
        
        for k, v in body.model_dump(exclude_unset=True).items():
            setattr(item, k, v)
        
        db.commit()
        db.refresh(item)
        return RegistryOut.model_validate(item)

    @r.delete("/registry/{registry_type}/{item_id}", status_code=204)
    def delete_registry(registry_type: str, item_id: int, current_user: CurrentUser, db: DbSession):
        reg_type = registry_type.upper()
        item = tenant_scoped(
            db.query(LabourComplianceRegistry).filter(
                LabourComplianceRegistry.id == item_id,
                LabourComplianceRegistry.registry_type == reg_type
            ),
            current_user
        ).first()
        if not item:
            raise HTTPException(404, "Registry item not found")
        db.delete(item)
        db.commit()

    # --- Contract Worker Endpoints ---
    @r.get("/workers", response_model=list[ContractWorkerOut])
    def list_workers(current_user: CurrentUser, db: DbSession):
        q = tenant_scoped(db.query(ContractWorker), current_user)
        results = q.order_by(ContractWorker.id.desc()).all()
        return [ContractWorkerOut.model_validate(x) for x in results]

    @r.post("/workers", response_model=ContractWorkerOut, status_code=201)
    def create_worker(body: ContractWorkerCreate, current_user: CurrentUser, db: DbSession):
        item = ContractWorker(
            worker_name=body.worker_name,
            contractor_name=body.contractor_name,
            trade=body.trade,
            date_of_joining=body.date_of_joining,
            wage_rate=body.wage_rate,
            pf_status=body.pf_status,
            esi_status=body.esi_status,
            compliance_status=body.compliance_status,
            tenant_id=current_user.tenant_id
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return ContractWorkerOut.model_validate(item)

    @r.put("/workers/{worker_id}", response_model=ContractWorkerOut)
    def update_worker(worker_id: int, body: ContractWorkerUpdate, current_user: CurrentUser, db: DbSession):
        item = tenant_scoped(db.query(ContractWorker).filter(ContractWorker.id == worker_id), current_user).first()
        if not item:
            raise HTTPException(404, "Contract worker not found")
        
        for k, v in body.model_dump(exclude_unset=True).items():
            setattr(item, k, v)
        
        db.commit()
        db.refresh(item)
        return ContractWorkerOut.model_validate(item)

    @r.delete("/workers/{worker_id}", status_code=204)
    def delete_worker(worker_id: int, current_user: CurrentUser, db: DbSession):
        item = tenant_scoped(db.query(ContractWorker).filter(ContractWorker.id == worker_id), current_user).first()
        if not item:
            raise HTTPException(404, "Contract worker not found")
        db.delete(item)
        db.commit()

    # --- Compliance Exception Endpoints ---
    @r.get("/exceptions", response_model=list[ComplianceExceptionOut])
    def list_exceptions(current_user: CurrentUser, db: DbSession):
        q = tenant_scoped(db.query(ComplianceException), current_user)
        results = q.order_by(ComplianceException.id.desc()).all()
        return [ComplianceExceptionOut.model_validate(x) for x in results]

    @r.post("/exceptions", response_model=ComplianceExceptionOut, status_code=201)
    def create_exception(body: ComplianceExceptionCreate, current_user: CurrentUser, db: DbSession):
        item = ComplianceException(
            sub_page=body.sub_page,
            rule_violated=body.rule_violated,
            severity=body.severity,
            status=body.status,
            notes=body.notes,
            tenant_id=current_user.tenant_id
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return ComplianceExceptionOut.model_validate(item)

    @r.put("/exceptions/{exception_id}", response_model=ComplianceExceptionOut)
    def update_exception(exception_id: int, body: ComplianceExceptionUpdate, current_user: CurrentUser, db: DbSession):
        item = tenant_scoped(db.query(ComplianceException).filter(ComplianceException.id == exception_id), current_user).first()
        if not item:
            raise HTTPException(404, "Exception not found")
        
        for k, v in body.model_dump(exclude_unset=True).items():
            setattr(item, k, v)
        
        db.commit()
        db.refresh(item)
        return ComplianceExceptionOut.model_validate(item)

    @r.delete("/exceptions/{exception_id}", status_code=204)
    def delete_exception(exception_id: int, current_user: CurrentUser, db: DbSession):
        item = tenant_scoped(db.query(ComplianceException).filter(ComplianceException.id == exception_id), current_user).first()
        if not item:
            raise HTTPException(404, "Exception not found")
        db.delete(item)
        db.commit()

    # --- Dashboard Summary ---
    @r.get("/dashboard-summary", response_model=DashboardSummary)
    def get_dashboard_summary(current_user: CurrentUser, db: DbSession):
        # 1. Fetch exception counts
        ex_q = tenant_scoped(db.query(ComplianceException), current_user).all()
        open_exceptions = sum(1 for e in ex_q if e.status.lower() in ("open", "active", "action required"))
        pending_capa = sum(1 for e in ex_q if e.status.lower() in ("under review", "pending", "open"))
        
        high_ex = sum(1 for e in ex_q if e.status.lower() in ("open", "active") and e.severity.lower() == "high")
        med_ex = sum(1 for e in ex_q if e.status.lower() in ("open", "active") and e.severity.lower() == "medium")
        low_ex = sum(1 for e in ex_q if e.status.lower() in ("open", "active") and e.severity.lower() == "low")
        
        # 2. Fetch licenses for expired check
        lic_q = tenant_scoped(db.query(LabourComplianceRegistry), current_user).filter(
            LabourComplianceRegistry.registry_type == "LICENCE"
        ).all()
        expired_lics = sum(1 for l in lic_q if l.status.lower() in ("expired", "critical"))

        # 3. Calculate Risk Index (0 - 100)
        # Deduct score: high = 25, med = 10, low = 5, expired license = 30
        calculated_risk = (high_ex * 25) + (med_ex * 10) + (low_ex * 5) + (expired_lics * 30)
        risk_index = min(max(calculated_risk, 0.0), 100.0)

        # 4. Calculate Coverage % (APPLICABILITY)
        app_q = tenant_scoped(db.query(LabourComplianceRegistry), current_user).filter(
            LabourComplianceRegistry.registry_type == "APPLICABILITY"
        ).all()
        total_app = len(app_q)
        active_app = sum(1 for a in app_q if a.status.lower() in ("active", "compliant"))
        coverage_pct = (active_app / total_app * 100.0) if total_app > 0 else 100.0

        return DashboardSummary(
            risk_index=float(risk_index),
            coverage_pct=float(coverage_pct),
            open_exceptions=int(open_exceptions),
            pending_capa=int(pending_capa)
        )


# Register routes to both APIRouters
register_labour_compliance_routes(router)
register_labour_compliance_routes(custom_router)
