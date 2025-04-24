from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/py"

    DATABASE_URL: str = "sqlite+aiosqlite:///./cv_review.db"
    POSTGRES_URL: Optional[str] = None
    
    @property
    def get_database_url(self) -> str:
        return self.POSTGRES_URL if self.POSTGRES_URL else self.DATABASE_URL

    SECRET_KEY: str 
    
    CLERK_SECRET_KEY: str
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str
    CLERK_JWT_KEY: str = None
    CLERK_FRONTEND_API: str = "https://magnetic-longhorn-34.clerk.accounts.dev"
    CLERK_AUDIENCE: str = "cv-review-app"
    
    HUGGINGFACE_API_KEY: str
    HUGGINGFACE_MODEL_ID: str = "google/flan-t5-large"
    
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1 
    
    BACKGROUND_WORKERS: int = 2
    
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    NEXT_PUBLIC_API_URL: str
    API_BASE_URL: str

    ALGORITHM: str = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  
    
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