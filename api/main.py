from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager
import os

from api.core.config import settings
from api.core.database import engine
from api.routers import reviews, credits, notifications, cloudinary
from api.services.background_tasks import setup_background_tasks
from api.core.auth import router as auth_router
from alembic.config import Config
from alembic import command

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def apply_migrations():
    """Apply database migrations on startup"""
    logger.info("Checking database migrations...")
    try:
        auto_migrate = os.environ.get("AUTO_APPLY_MIGRATIONS", "false").lower() == "true"
        
        if auto_migrate:
            logger.info("Auto-applying migrations...")
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")
            logger.info("Migrations applied successfully")
        else:
            logger.info("Skipping auto-migrations (AUTO_APPLY_MIGRATIONS not set to 'true')")
    except Exception as e:
        logger.error(f"Error applying migrations: {e}")
        logger.warning("Application starting with potentially outdated database schema")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application")
    await apply_migrations()

    logger.info(f"JWT Authentication enabled with algorithm: {settings.ALGORITHM}")
    logger.info(f"Token expiration: {settings.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
    
    db_url_parts = settings.get_database_url.split('@')
    if len(db_url_parts) > 1:
        masked_url = f"{db_url_parts[0].split(':')[0]}:***@{db_url_parts[1]}"
    else:
        masked_url = settings.get_database_url.split(':')[0]
    logger.info(f"Database URL: {masked_url} (masked credentials)")
    
    background_task_manager = setup_background_tasks()
    
    yield
    
    if background_task_manager:
        background_task_manager.shutdown()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for AI-powered CV review application with credit system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Authorization"],
)

app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(credits.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(cloudinary.router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth")

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": f"Welcome to CV Review App API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)