"""Central application configuration, loaded from environment / .env."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env relative to the backend/ root, not CWD.
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE) if _ENV_FILE.exists() else ".env",
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "mysql+pymysql://iaos:iaos123@localhost:3306/iaos"

    # Security
    SECRET_KEY: str = "insecure-dev-key-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # Bootstrap super admin
    SUPERADMIN_EMAIL: str = "admin@capcorp.com"
    SUPERADMIN_PASSWORD: str = "ChangeMe123!"
    SUPERADMIN_NAME: str = "Cap Corp Administrator"

    ENV: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
