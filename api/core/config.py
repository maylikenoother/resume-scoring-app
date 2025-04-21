# api/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/py"

    DATABASE_URL: str = "sqlite+aiosqlite:///./cv_review.db"

    SECRET_KEY: str 
    
    CLERK_SECRET_KEY: str
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: str
    CLERK_JWT_KEY: str
    CLERK_FRONTEND_API: str
    CLERK_AUDIENCE: str = "cv-review-app"
    
    OPENAI_API_KEY:str
    AI_MODEL: str = "gpt-3.5-turbo"
    
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1 
    
    BACKGROUND_WORKERS: int = 2
    
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    NEXT_PUBLIC_API_URL: str
    API_BASE_URL: str

    ALGORITHM: Optional[str] = "RS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" 

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()