"""SQLAlchemy engine, session factory, and declarative base.

Every model in the platform AND in every module inherits from `Base`,
so `Base.metadata.create_all()` picks up all tables automatically at startup.
Automatic zero-config fallback to SQLite if MySQL is unreachable.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

db_url = settings.DATABASE_URL

try:
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False,
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[database] Database connection notice: {e}. Using zero-config local SQLite database for real-time audit...")
    db_url = "sqlite:///./iaos.db"
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for platform + all modules."""


def get_db():
    """FastAPI dependency that yields a scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
