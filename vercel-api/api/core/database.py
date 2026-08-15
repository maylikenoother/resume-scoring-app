from typing import Optional

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from api.core.config import settings

engine: Optional[AsyncEngine] = None
AsyncSessionLocal: Optional[sessionmaker] = None


def get_engine() -> AsyncEngine:
    """Create the database engine only when the serverless runtime needs it."""
    global engine
    if engine is None:
        database_url = settings.database_url
        engine = create_async_engine(
            database_url,
            echo=False,
            future=True,
            connect_args={"check_same_thread": False} if "sqlite" in database_url else {},
        )
    return engine


def get_session_factory() -> sessionmaker:
    """Return a lazily initialized async session factory."""
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        AsyncSessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return AsyncSessionLocal


async def create_tables():
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

Base = declarative_base()

async def get_db() -> AsyncSession:
    async with get_session_factory()() as session:
        try:
            yield session
        finally:
            await session.close()
