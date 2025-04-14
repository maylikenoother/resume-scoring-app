from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db() -> AsyncSession:
    """
    Dependency for getting async database session
    
    Yields:
        AsyncSession: database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()