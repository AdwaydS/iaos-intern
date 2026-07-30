"""First-run bootstrap: create tables and the Cap Corp super admin."""
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User, UserRole


def create_all_tables():
    # Importing app.models + every module's models happens before this call,
    # so metadata already knows about all platform and module tables.
    Base.metadata.create_all(bind=engine)


def ensure_super_admin():
    db: Session = SessionLocal()
    try:
        existing = (
            db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
        )
        if not existing:
            admin = User(
                email=settings.SUPERADMIN_EMAIL,
                full_name=settings.SUPERADMIN_NAME,
                hashed_password=hash_password(settings.SUPERADMIN_PASSWORD),
                role=UserRole.SUPER_ADMIN,
                tenant_id=None,
            )
            db.add(admin)
            db.commit()
            print(f"[bootstrap] created super admin: {settings.SUPERADMIN_EMAIL}")

        # Seed all modules across tenant 1
        try:
            from app.seed_all_modules import seed_all_module_items
            seed_all_module_items(db, tenant_id=1)
        except Exception as seed_err:
            print(f"[bootstrap] seeding warning: {seed_err}")
    finally:
        db.close()

