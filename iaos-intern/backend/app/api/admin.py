"""Admin APIs.

- SUPER_ADMIN (Cap Corp): manage ALL tenants + users across the platform.
- TENANT_ADMIN: manage users within their own tenant only (self-service).
"""
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func

from app.api.deps import CurrentUser, DbSession, require_super_admin, require_tenant_admin
from app.core.security import hash_password
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.schemas.admin import (
    CreateTenantRequest,
    CreateUserRequest,
    PlatformStats,
    TenantStats,
    UpdateUserRequest,
)
from app.schemas.auth import TenantOut, UserOut
from fastapi import Depends

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─────────────────────────── SUPER ADMIN: stats ─────────────────────────────
@router.get("/stats", response_model=PlatformStats)
def platform_stats(db: DbSession, _: User = Depends(require_super_admin)):
    total_tenants = db.query(func.count(Tenant.id)).scalar() or 0
    active_tenants = (
        db.query(func.count(Tenant.id)).filter(Tenant.is_active.is_(True)).scalar()
        or 0
    )
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = (
        db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0
    )
    tenant_admins = (
        db.query(func.count(User.id))
        .filter(User.role == UserRole.TENANT_ADMIN)
        .scalar()
        or 0
    )
    auditors = (
        db.query(func.count(User.id)).filter(User.role == UserRole.AUDITOR).scalar()
        or 0
    )

    recent_rows = (
        db.query(Tenant, func.count(User.id))
        .outerjoin(User, User.tenant_id == Tenant.id)
        .group_by(Tenant.id)
        .order_by(Tenant.id.desc())
        .limit(5)
        .all()
    )
    recent = [
        TenantStats(
            id=t.id, name=t.name, slug=t.slug,
            is_active=t.is_active, user_count=c,
        )
        for t, c in recent_rows
    ]

    return PlatformStats(
        total_tenants=total_tenants,
        active_tenants=active_tenants,
        suspended_tenants=total_tenants - active_tenants,
        total_users=total_users,
        active_users=active_users,
        tenant_admins=tenant_admins,
        auditors=auditors,
        recent_tenants=recent,
    )


# ─────────────────────────── SUPER ADMIN: tenants ───────────────────────────
@router.get("/tenants", response_model=list[TenantStats])
def list_tenants(db: DbSession, _: User = Depends(require_super_admin)):
    rows = (
        db.query(Tenant, func.count(User.id))
        .outerjoin(User, User.tenant_id == Tenant.id)
        .group_by(Tenant.id)
        .all()
    )
    return [
        TenantStats(
            id=t.id, name=t.name, slug=t.slug,
            is_active=t.is_active, user_count=count,
        )
        for t, count in rows
    ]


@router.post("/tenants", response_model=TenantOut, status_code=201)
def create_tenant(
    body: CreateTenantRequest, db: DbSession,
    _: User = Depends(require_super_admin),
):
    import re
    slug = re.sub(r"[^a-z0-9]+", "-", body.name.lower()).strip("-") or "org"
    if db.query(Tenant).filter(Tenant.slug == slug).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Tenant slug already exists")

    tenant = Tenant(name=body.name, slug=slug)
    db.add(tenant)
    db.flush()
    admin = User(
        email=body.admin_email,
        full_name=body.admin_full_name,
        hashed_password=hash_password(body.admin_password),
        role=UserRole.TENANT_ADMIN,
        tenant_id=tenant.id,
    )
    db.add(admin)
    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)


@router.patch("/tenants/{tenant_id}/toggle", response_model=TenantOut)
def toggle_tenant(
    tenant_id: int, db: DbSession, _: User = Depends(require_super_admin),
):
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    tenant.is_active = not tenant.is_active
    db.commit()
    db.refresh(tenant)
    return TenantOut.model_validate(tenant)


# ───────────────────────────────── users ────────────────────────────────────
@router.get("/users", response_model=list[UserOut])
def list_users(current_user: CurrentUser, db: DbSession):
    """SUPER_ADMIN sees everyone; TENANT_ADMIN sees only their tenant."""
    require_tenant_admin(current_user)
    q = db.query(User)
    if current_user.role == UserRole.TENANT_ADMIN:
        q = q.filter(User.tenant_id == current_user.tenant_id)
    return [UserOut.model_validate(u) for u in q.order_by(User.id).all()]


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(body: CreateUserRequest, current_user: CurrentUser, db: DbSession):
    require_tenant_admin(current_user)
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    if current_user.role == UserRole.TENANT_ADMIN:
        # A tenant admin can only add users into their own tenant, never super admins.
        tenant_id = current_user.tenant_id
        if body.role == UserRole.SUPER_ADMIN:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Cannot create super admins")
    else:  # SUPER_ADMIN
        tenant_id = body.tenant_id
        if body.role != UserRole.SUPER_ADMIN and tenant_id is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "tenant_id required")

    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=body.role,
        tenant_id=None if body.role == UserRole.SUPER_ADMIN else tenant_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int, body: UpdateUserRequest,
    current_user: CurrentUser, db: DbSession,
):
    require_tenant_admin(current_user)
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    if (
        current_user.role == UserRole.TENANT_ADMIN
        and user.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Outside your tenant")

    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)
