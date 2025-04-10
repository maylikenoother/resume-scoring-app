# api/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from api.db.models import User
from api.core.security import get_password_hash
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

def test_login(client):
    # Test login with valid credentials
    response = client.post(
        "/api/py/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    
    # Test login with invalid credentials
    response = client.post(
        "/api/py/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_register(client):
    # Test registration with new email
    response = client.post(
        "/api/py/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    assert response.json()["email"] == "newuser@example.com"
    assert response.json()["username"] == "newuser"
    
    # Test registration with existing email
    response = client.post(
        "/api/py/auth/register",
        json={
            "email": "test@example.com",
            "username": "existinguser",
            "password": "password123"
        }
    )
    assert response.status_code == 400