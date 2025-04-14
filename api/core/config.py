from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./cv_review.db"
    
    # Hugging Face settings
    HUGGINGFACE_API_TOKEN: Optional[str] = None
    HUGGINGFACE_MODEL: str = "distilbert-base-uncased"
    
    # Credit system settings
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1
    
    # Clerk authentication settings
    CLERK_API_KEY: Optional[str] = None
    CLERK_JWT_PUBLIC_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
