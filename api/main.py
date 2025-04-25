from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

from api.core.config import settings
from api.core.database import engine, Base
from api.routers import reviews, credits, notifications, cloudinary
from api.services.background_tasks import setup_background_tasks
from api.core.auth import router as auth_router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application")
    await create_tables()

    logger.info(f"Hugging Face API Key set: {bool(settings.HUGGINGFACE_API_KEY)}")
    logger.info(f"Using AI model: {settings.HUGGINGFACE_MODEL_ID}")
    logger.info(f"Clerk integration enabled: {bool(settings.CLERK_SECRET_KEY)}")
    logger.info(f"Cloudinary integration enabled: {bool(settings.CLOUDINARY_CLOUD_NAME)}")
    logger.info(f"Database URL: {settings.get_database_url.split('@')[0].split(':')[0]} (masked credentials)")
    
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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
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
    return {"message": f"Welcome to Resume Scoring App"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)