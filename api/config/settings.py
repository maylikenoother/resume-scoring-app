# api/config/settings.py
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Dict, Optional

class Settings(BaseSettings):
    # Base settings
    api_v1_prefix: str = "/api/py"
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-for-development-only")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///cv_scoring_app.db")
    
    # CV Upload
    cv_upload_dir: str = os.getenv("CV_UPLOAD_DIR", "uploads")
    
    # Credits
    min_credits_per_submission: int = 1
    
    # OpenAI
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    
    # Credit pricing (for different tiers)
    credit_pricing: Dict[str, Dict[str, float]] = {
        "basic": {"amount": 10, "price": 9.99},
        "premium": {"amount": 50, "price": 39.99},
        "enterprise": {"amount": 200, "price": 129.99}
    }
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()