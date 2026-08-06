from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Self-service tenant signup: creates a tenant + its first admin."""
    organization_name: str
    full_name: str
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    tenant_id: int | None

    model_config = {"from_attributes": True}


class TenantOut(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool

    model_config = {"from_attributes": True}


class SessionOut(BaseModel):
    """Everything the frontend needs after login."""
    token: Token
    user: UserOut
    tenant: TenantOut | None
