from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
from contextlib import asynccontextmanager

from api.core.config import settings
from api.core.database import engine, Base
from api.routers import auth, reviews, credits, notifications
from api.services.background_tasks import setup_background_tasks

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

    logger.info(f"OpenAI API Key set: {bool(settings.OPENAI_API_KEY)}")
    logger.info(f"Using AI model: {settings.AI_MODEL}")
    
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

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(credits.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": f"Welcome to Resume Scoring App"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)