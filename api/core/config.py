from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional, Dict, Any
from functools import lru_cache
import secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/py"

    DATABASE_URL: str = "sqlite+aiosqlite:///./cv_review.db"
    POSTGRES_URL: Optional[str] = None
    
    @property
    def get_database_url(self) -> str:
        return self.POSTGRES_URL if self.POSTGRES_URL else self.DATABASE_URL

    SECRET_KEY: str = secrets.token_hex(32)

    ALGORITHM: str = "HS256" 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 
    
    HUGGINGFACE_API_KEY: str = ""
    HUGGINGFACE_MODEL_ID: str = "google/flan-t5-large"
    
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1 
    PRICING_TIERS: Dict[str, Dict[str, Any]] = {
        "basic": {"amount": 5, "price": 4.99},
        "standard": {"amount": 15, "price": 9.99},
        "premium": {"amount": 50, "price": 24.99}
    }
    
    BACKGROUND_WORKERS: int = 2

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"
    API_BASE_URL: str = "http://localhost:8000"
    
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