import os
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Determine if we're in production or development
IS_PRODUCTION = os.environ.get("VERCEL_ENV") == "production"
BASE_DIR = Path(__file__).parent.parent.parent

# Use different database paths for production and development
if IS_PRODUCTION:
    # In production on Vercel, use an in-memory SQLite database
    # This is a limitation of Vercel's serverless functions
    DATABASE_URL = "sqlite://"  # In-memory database
else:
    # In development, use a file-based SQLite database
    database_path = BASE_DIR / "cv_scoring_app.db"
    DATABASE_URL = f"sqlite:///{database_path}"

# Create engine for synchronous operations
engine = create_engine(
    DATABASE_URL, 
    echo=False, 
    connect_args={"check_same_thread": False}
)

# Session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Get a database session.
    This dependency will be used in FastAPI endpoints for database operations.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_db_and_tables():
    """
    Create all tables in the database.
    This function should be called when the application starts.
    """
    SQLModel.metadata.create_all(engine)


def get_session():
    """Alternative way to get a database session."""
    with Session(engine) as session:
        yield session