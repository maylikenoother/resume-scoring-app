# api/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from api.db.models import User
from api.core.security import get_password_hash, create_access_token
from api.index import app
from api.db.database import get_db

# Create a test database
TEST_DATABASE_URL = "sqlite://"  # In-memory database

@pytest.fixture
def test_db():
    engine = create_engine(
        TEST_DATABASE_URL, 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    
    # Create a test user
    with Session(engine) as session:
        test_user = User(
            email="test@example.com",
            username="testuser",
            hashed_password=get_password_hash("password123"),
            credits=10,
            is_active=True
        )
        session.add(test_user)
        session.commit()
        session.refresh(test_user)
    
    # Override the get_db dependency
    def override_get_db():
        with Session(engine) as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield engine
    
    # Clean up
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()

@pytest.fixture
def client(test_db):
    return TestClient(app)

@pytest.fixture
def auth_headers():
    access_token = create_access_token(subject="test@example.com")
    return {"Authorization": f"Bearer {access_token}"}