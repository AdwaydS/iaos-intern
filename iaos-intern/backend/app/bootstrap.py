"""First-run bootstrap: create tables and the Cap Corp super admin."""
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.modules.data_analytics_caat.models import DataSource


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
        if existing:
            return
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
    finally:
        db.close()
