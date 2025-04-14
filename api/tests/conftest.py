import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from typing import AsyncGenerator, Generator

from fastapi.testclient import TestClient
from fastapi import Depends

from api.core.database import Base, get_db
from api.core.auth import get_current_active_user
from api.index import app
from api.models.models import User, CreditBalance

TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

TEST_USER = User(
    id=1,
    email="test@example.com",
    full_name="Test User",
    hashed_password="$2b$12$WtXBzbrfuKZwQCYAuhLNbOtQGZ/9pQUJmhpK8uJRJPLaqpHu0vWje",  # "password"
    is_active=True,
)

async def override_get_current_active_user() -> User:
    return TEST_USER

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def setup_test_db() -> AsyncGenerator:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        session.add(TEST_USER)
        await session.commit()
        await session.refresh(TEST_USER)
        
        credit_balance = CreditBalance(
            user_id=TEST_USER.id,
            balance=10 
        )
        session.add(credit_balance)
        await session.commit()
    
    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
def client(setup_test_db) -> TestClient:
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_active_user] = override_get_current_active_user

    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides = {}