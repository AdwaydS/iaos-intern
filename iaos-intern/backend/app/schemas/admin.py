from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.AUDITOR
    tenant_id: int | None = None  # required when called by SUPER_ADMIN


class CreateTenantRequest(BaseModel):
    name: str
    admin_full_name: str
    admin_email: EmailStr
    admin_password: str


class UpdateUserRequest(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class TenantStats(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool
    user_count: int

    model_config = {"from_attributes": True}


class PlatformStats(BaseModel):
    """Headline numbers for the super admin overview."""
    total_tenants: int
    active_tenants: int
    suspended_tenants: int
    total_users: int
    active_users: int
    tenant_admins: int
    auditors: int
    recent_tenants: list[TenantStats]
