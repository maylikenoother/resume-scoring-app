# api/tests/test_credits.py
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
            credits=5,
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

def test_get_pricing(client, auth_headers):
    response = client.get("/api/py/credits/pricing", headers=auth_headers)
    assert response.status_code == 200
    pricing = response.json()
    assert "basic" in pricing
    assert "premium" in pricing
    assert "enterprise" in pricing
    
    for tier in pricing.values():
        assert "amount" in tier
        assert "price" in tier

def test_purchase_credits(client, auth_headers):
    # First check initial user credits
    user_response = client.get("/api/py/users/me", headers=auth_headers)
    initial_credits = user_response.json()["credits"]
    
    # Purchase basic tier
    response = client.post(
        "/api/py/credits/purchase",
        json={"tier": "basic"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["type"] == "purchase"
    
    # Check updated user credits
    user_response = client.get("/api/py/users/me", headers=auth_headers)
    updated_credits = user_response.json()["credits"]
    
    # Basic tier should add 10 credits
    assert updated_credits == initial_credits + 10
    
    # Test invalid tier
    response = client.post(
        "/api/py/credits/purchase",
        json={"tier": "nonexistent"},
        headers=auth_headers
    )
    assert response.status_code == 400