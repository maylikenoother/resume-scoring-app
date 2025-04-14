from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.router import api_router
from app.services.background_tasks import setup_background_tasks

import asyncio
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        from fastapi import APIRouter

from app.routers import auth, reviews, credits, notifications

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(reviews.router)
api_router.include_router(credits.router)
api_router.include_router(notifications.router)
asyncio.run(create_tables())

app = FastAPI(
    title="CV Review API",
    description="API for AI-powered CV review application with credit system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/py")

background_tasks = setup_background_tasks()

@app.on_event("startup")
async def startup_event():
    pass

@app.on_event("shutdown")
async def shutdown_event():
    if background_tasks:
        background_tasks.shutdown()

@app.get("/api/py/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/py")
async def root():
    return {"message": "Welcome to CV Review API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)