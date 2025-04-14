from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from api.core.config import settings
from api.core.database import engine, Base
from api.routers import auth, reviews, credits, notifications
from api.services.background_tasks import setup_background_tasks

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Create database tables at startup
asyncio.run(create_tables())

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for AI-powered CV review application with credit system",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(credits.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

# Set up background tasks
background_tasks = setup_background_tasks()

@app.on_event("startup")
async def startup_event():
    pass

@app.on_event("shutdown")
async def shutdown_event():
    if background_tasks:
        background_tasks.shutdown()

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "healthy"}

@app.get(settings.API_V1_STR)
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)