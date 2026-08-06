from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

class InvestmentsExceptionOut(BaseModel):
    id: str
    module: str
    security: str
    amount: str
    exception: str
    date: date
    severity: str
    status: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResolvePayload(BaseModel):
    id: str

class SimulationPayload(BaseModel):
    procedure_id: str
    sample_size: int
    tolerance: float

class SectorGuardrailOut(BaseModel):
    id: int
    sector: str
    limit_pct: float
    current_pct: float
    status: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ComplianceTrendPointOut(BaseModel):
    id: int
    month: str
    score: int
    exceptions_count: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)