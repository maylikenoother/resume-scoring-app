# api/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/py"
    
    # Database settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./cv_review.db"
    
    # Security settings
    SECRET_KEY: str = "supersecretkey"
    
    # Clerk authentication settings
    CLERK_SECRET_KEY: Optional[str] = None
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    CLERK_JWT_KEY: Optional[str] = None
    CLERK_FRONTEND_API: Optional[str] = None
    CLERK_AUDIENCE: str = "cv-review-app"
    
    # OpenAI settings
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-3.5-turbo"
    
    # Credit system settings
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1 
    
    # Background task settings
    BACKGROUND_WORKERS: int = 2
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Next.js related settings
    NEXT_PUBLIC_API_URL: Optional[str] = None
    API_BASE_URL: Optional[str] = None
    
    # Legacy settings (can be removed later)
    ALGORITHM: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # This is crucial - allow extra fields in the environment

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()