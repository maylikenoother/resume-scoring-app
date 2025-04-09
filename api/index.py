import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.auth.routes import router as auth_router
from api.routers.users import router as users_router
from api.routers.credits import router as credits_router
from api.routers.cv import router as cv_router
from api.routers.submissions import router as submissions_router
from api.config.settings import settings
from api.db.database import create_db_and_tables

# Create FastAPI app
app = FastAPI(
    title="CV Scoring API",
    description="API for CV analysis and scoring",
    version="1.0.0",
    docs_url=f"{settings.api_v1_prefix}/docs",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)
app.include_router(credits_router, prefix=settings.api_v1_prefix)
app.include_router(cv_router, prefix=settings.api_v1_prefix)
app.include_router(submissions_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def on_startup():
    """
    Initialize the application on startup.
    """
    # Create database tables
    create_db_and_tables()
    
    # Create upload directory
    os.makedirs(settings.cv_upload_dir, exist_ok=True)


@app.get(f"{settings.api_v1_prefix}/health")
def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status
    """
    return {"status": "healthy"}


@app.get(f"{settings.api_v1_prefix}/")
def root():
    """
    Root endpoint.
    
    Returns:
        API information
    """
    return {
        "message": "CV Scoring API",
        "docs": f"{settings.api_v1_prefix}/docs",
    }


# Add exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler.
    
    Args:
        request: FastAPI request
        exc: Exception
        
    Returns:
        Error response
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )