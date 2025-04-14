from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager

from core.config import settings
from core.database import engine, Base
from routers import auth, reviews, credits, notifications
from services.background_tasks import setup_background_tasks

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    
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
    allow_origins=[origin for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(credits.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": f"Welcome to Resume Scoring App"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)