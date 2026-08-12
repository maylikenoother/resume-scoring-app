from functools import lru_cache
from typing import Any, Dict, List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/py"

    DATABASE_URL: Optional[str] = None
    POSTGRES_URL: Optional[str] = None

    @property
    def database_url(self) -> str:
        """Return a SQLAlchemy async URL for local or managed PostgreSQL."""
        url = self.POSTGRES_URL or self.DATABASE_URL
        if not url:
            raise RuntimeError("DATABASE_URL or POSTGRES_URL must be configured.")

        if url.startswith("postgres://"):
            return f"postgresql+asyncpg://{url.removeprefix('postgres://')}"
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    SECRET_KEY: str = ""

    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 
    
    GEMINI_API_KEY: str = ""
    
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1 
    PRICING_TIERS: Dict[str, Dict[str, Any]] = {
        "basic": {"amount": 5, "price": 4.99},
        "standard": {"amount": 15, "price": 9.99},
        "premium": {"amount": 50, "price": 24.99}
    }
    
    BACKGROUND_WORKERS: int = 2

    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    ADMIN_USERS: List[str] = [] 
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
