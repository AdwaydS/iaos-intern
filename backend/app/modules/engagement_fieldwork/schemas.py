from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, field_validator, model_validator


# --- Engagement Schemas ---
class EngagementCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class EngagementUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is not None:
            allowed = ["Scoping", "Programme", "Fieldwork", "QualityReview", "Completed"]
            if v not in allowed:
                raise ValueError(f"Engagement status must be one of: {', '.join(allowed)}")
        return v


class EngagementOut(BaseModel):
    id: int
    title: str
    description: str
    status: str
    start_date: Optional[date]
    end_date: Optional[date]
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- ScopingMemo Schemas ---
class ScopingMemoCreate(BaseModel):
    background: str = ""
    scope_limitations: str = ""
    objectives_summary: str = ""


class ScopingMemoUpdate(BaseModel):
    background: Optional[str] = None
    scope_limitations: Optional[str] = None
    objectives_summary: Optional[str] = None
    status: Optional[str] = None
    review_notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is not None:
            allowed = ["Draft", "Under Review", "Approved", "Rejected"]
            if v not in allowed:
                raise ValueError(f"ScopingMemo status must be one of: {', '.join(allowed)}")
        return v


class ScopingMemoOut(BaseModel):
    id: int
    engagement_id: int
    background: str
    scope_limitations: str
    objectives_summary: str
    status: str
    review_notes: str
    created_by: str
    reviewed_by: Optional[str]
    approved_by: Optional[str]
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- ProgrammeItem Schemas ---
class ProgrammeItemCreate(BaseModel):
    objective: str = Field(..., max_length=255)
    risk_area: str = Field(..., max_length=255)
    procedures: str = ""


class ProgrammeItemUpdate(BaseModel):
    objective: Optional[str] = Field(None, max_length=255)
    risk_area: Optional[str] = Field(None, max_length=255)
    procedures: Optional[str] = None


class ProgrammeItemOut(BaseModel):
    id: int
    engagement_id: int
    objective: str
    risk_area: str
    procedures: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- FieldworkTask Schemas ---
class FieldworkTaskCreate(BaseModel):
    programme_item_id: Optional[int] = None
    title: str = Field(..., max_length=255)
    description: str = ""
    assigned_to: Optional[str] = Field(None, max_length=255)
    status: str = Field("To Do", max_length=50)
    doc_link: Optional[str] = Field(None, max_length=512)

    # Scoping memo status context passed during validation
    scoping_memo_status: Optional[str] = Field(default=None, exclude=True)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = ["To Do", "In Progress", "Review Required", "Done"]
        if v not in allowed:
            raise ValueError(f"Task status must be one of: {', '.join(allowed)}")
        return v

    @field_validator("doc_link")
    @classmethod
    def validate_doc_link(cls, v: str | None) -> str | None:
        if v:
            v_stripped = v.strip()
            if not (v_stripped.startswith("http://") or v_stripped.startswith("https://")):
                raise ValueError("doc_link must be a valid HTTP or HTTPS URL")
            return v_stripped
        return v

    @model_validator(mode="after")
    def check_scoping_status(self) -> "FieldworkTaskCreate":
        if self.scoping_memo_status is not None:
            if self.status in ("In Progress", "Review Required", "Done"):
                if self.scoping_memo_status != "Approved":
                    raise ValueError("Tasks cannot be started (status set to In Progress/Review Required/Done) unless the Scoping Memo is 'Approved'.")
        return self


class FieldworkTaskUpdate(BaseModel):
    programme_item_id: Optional[int] = None
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    assigned_to: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = None
    doc_link: Optional[str] = Field(None, max_length=512)

    # Scoping memo status context passed during validation
    scoping_memo_status: Optional[str] = Field(default=None, exclude=True)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is not None:
            allowed = ["To Do", "In Progress", "Review Required", "Done"]
            if v not in allowed:
                raise ValueError(f"Task status must be one of: {', '.join(allowed)}")
        return v

    @field_validator("doc_link")
    @classmethod
    def validate_doc_link(cls, v: str | None) -> str | None:
        if v:
            v_stripped = v.strip()
            if not (v_stripped.startswith("http://") or v_stripped.startswith("https://")):
                raise ValueError("doc_link must be a valid HTTP or HTTPS URL")
            return v_stripped
        return v

    @model_validator(mode="after")
    def check_scoping_status(self) -> "FieldworkTaskUpdate":
        if self.scoping_memo_status is not None:
            if self.status is not None and self.status in ("In Progress", "Review Required", "Done"):
                if self.scoping_memo_status != "Approved":
                    raise ValueError("Tasks cannot be started (status set to In Progress/Review Required/Done) unless the Scoping Memo is 'Approved'.")
        return self


class FieldworkTaskOut(BaseModel):
    id: int
    engagement_id: int
    programme_item_id: Optional[int]
    title: str
    description: str
    assigned_to: Optional[str]
    status: str
    doc_link: Optional[str]
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- TimeLog Schemas ---
class TimeLogCreate(BaseModel):
    hours: float
    date: date
    description: str = ""

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Logged hours must be greater than 0")
        if v > 24:
            raise ValueError("Logged hours cannot exceed 24 in a single entry")
        return v


class TimeLogOut(BaseModel):
    id: int
    engagement_id: int
    task_id: int
    auditor_email: str
    hours: float
    date: date
    description: str
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- QualityReview Schemas ---
class QualityReviewInitiate(BaseModel):
    reviewer_email: Optional[str] = Field(None, max_length=255)
    review_notes: str = ""


class QualityReviewSignOff(BaseModel):
    reviewer_email: str = Field(..., max_length=255)
    status: str = Field(..., max_length=50)  # Passed, Failed
    review_notes: str = ""
    checks_completed: dict[str, bool] = Field(default_factory=dict)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = ["Passed", "Failed"]
        if v not in allowed:
            raise ValueError("QualityReview status in sign-off must be Passed or Failed")
        return v


class QualityReviewOut(BaseModel):
    id: int
    engagement_id: int
    reviewer_email: Optional[str]
    status: str
    review_notes: str
    sign_off_date: Optional[datetime]
    checks_completed: dict[str, Any]
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    @field_validator("checks_completed", mode="before")
    @classmethod
    def parse_checks(cls, v: Any) -> dict[str, Any]:
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v or {}

    model_config = {"from_attributes": True}
