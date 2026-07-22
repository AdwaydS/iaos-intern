from pydantic import BaseModel


class DataSourceCreate(BaseModel):
    source_name: str
    source_type: str
    host: str
    database_name: str
    status: str = "Active"


class DataSourceOut(BaseModel):
    id: int
    source_name: str
    source_type: str
    host: str
    database_name: str
    status: str

    model_config = {"from_attributes": True}