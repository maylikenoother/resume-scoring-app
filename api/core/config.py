from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "CV Review API"
    API_V1_STR: str = "/api/py"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    OPENAI_API_KEY: str
    AI_MODEL: str = "gpt-3.5-turbo"
    
    DEFAULT_CREDITS: int = 5
    REVIEW_CREDIT_COST: int = 1 
    
    BACKGROUND_WORKERS: int = 2
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    NEXTAUTH_URL: str
    NEXTAUTH_SECRET: str
    NEXT_PUBLIC_API_URL: str
    GITHUB_ID: str
    GITHUB_SECRET: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    API_BASE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

print("USING DATABASE URL:", settings.DATABASE_URL)