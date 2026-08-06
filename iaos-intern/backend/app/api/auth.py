"""Authentication: login, self-service signup, and current-session lookup."""
import re

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, DbSession
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.schemas.auth import (
    LoginRequest,
    SessionOut,
    SignupRequest,
    TenantOut,
    Token,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "org"


def _build_session(db: Session, user: User) -> SessionOut:
    token = create_access_token(user.id, user.tenant_id, user.role.value)
    tenant = db.get(Tenant, user.tenant_id) if user.tenant_id else None
    return SessionOut(
        token=Token(access_token=token),
        user=UserOut.model_validate(user),
        tenant=TenantOut.model_validate(tenant) if tenant else None,
    )


@router.post("/login", response_model=SessionOut)
def login(body: LoginRequest, db: DbSession):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")
    return _build_session(db, user)


@router.post("/token", response_model=Token)
def token(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 password flow — used by Swagger UI's Authorize button."""
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return Token(access_token=create_access_token(
        user.id, user.tenant_id, user.role.value
    ))


@router.post("/signup", response_model=SessionOut, status_code=201)
def signup(body: SignupRequest, db: DbSession):
    """Self-service: create a new tenant and its first TENANT_ADMIN."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    base_slug = _slugify(body.organization_name)
    slug, i = base_slug, 1
    while db.query(Tenant).filter(Tenant.slug == slug).first():
        i += 1
        slug = f"{base_slug}-{i}"

    tenant = Tenant(name=body.organization_name, slug=slug)
    db.add(tenant)
    db.flush()

    admin = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=UserRole.TENANT_ADMIN,
        tenant_id=tenant.id,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return _build_session(db, admin)


@router.get("/me", response_model=SessionOut)
def me(current_user: CurrentUser, db: DbSession):
    return _build_session(db, current_user)
