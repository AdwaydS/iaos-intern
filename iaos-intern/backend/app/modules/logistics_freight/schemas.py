from pydantic import BaseModel


class ItemCreate(BaseModel):
    title: str
    notes: str = ""


class ItemOut(BaseModel):
    id: int
    title: str
    notes: str

    model_config = {"from_attributes": True}
