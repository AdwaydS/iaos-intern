from pydantic import BaseModel, Field


class RiskCreate(BaseModel):
    title: str
    category: str = "Operational"
    likelihood: int = Field(3, ge=1, le=5)
    impact: int = Field(3, ge=1, le=5)
    owner: str = ""
    notes: str = ""


class RiskOut(BaseModel):
    id: int
    title: str
    category: str
    likelihood: int
    impact: int
    owner: str
    notes: str
    score: int

    model_config = {"from_attributes": True}
