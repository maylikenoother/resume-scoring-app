import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime
from unittest.mock import patch, MagicMock

from app.main import app
from app.core.database import Base, get_db
from app.models.models import User, CreditBalance, Review, Notification
from app.core.middleware import get_current_clerk_id

# Create in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the get_current_clerk_id dependency
def override_get_current_clerk_id():
    return "test_clerk_id"

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_clerk_id] = override_get_current_clerk_id

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_database():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create test user
    db = TestingSessionLocal()
    user = User(
        clerk_id="test_clerk_id",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create credit balance
    credit_balance = CreditBalance(
        user_id=user.id,
        balance=5,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(credit_balance)
    db.commit()
    
    # Create test reviews
    for i in range(3):
        review = Review(
            user_id=user.id,
            cv_filename=f"test_cv_{i}.pdf",
            cv_content=f"Test CV content {i}",
            status="completed" if i < 2 else "pending",
            review_content=f"Test review content {i}" if i < 2 else None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(review)
    db.commit()
    
    # Create test notifications
    for i in range(3):
        notification = Notification(
            user_id=user.id,
            review_id=i+1,
            message=f"Test notification {i}",
            is_read=i < 1,
            created_at=datetime.utcnow()
        )
        db.add(notification)
    db.commit()
    
    db.close()
    
    yield
    
    # Drop the database tables
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to CV Review API"}

def test_get_user_me(setup_database):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["clerk_id"] == "test_clerk_id"
    assert response.json()["email"] == "test@example.com"

def test_get_user_credits(setup_database):
    response = client.get("/api/v1/users/me/credits")
    assert response.status_code == 200
    assert response.json()["balance"] == 5

def test_get_user_reviews(setup_database):
    response = client.get("/api/v1/reviews/")
    assert response.status_code == 200
    assert len(response.json()["reviews"]) == 3

def test_get_review_by_id(setup_database):
    response = client.get("/api/v1/reviews/1")
    assert response.status_code == 200
    assert response.json()["cv_filename"] == "test_cv_0.pdf"
    assert response.json()["status"] == "completed"

def test_get_nonexistent_review(setup_database):
    response = client.get("/api/v1/reviews/999")
    assert response.status_code == 404

def test_get_notifications(setup_database):
    response = client.get("/api/v1/notifications/")
    assert response.status_code == 200
    assert len(response.json()["notifications"]) == 3

def test_mark_notification_as_read(setup_database):
    response = client.put("/api/v1/notifications/2/read")
    assert response.status_code == 200
    assert response.json()["is_read"] is True

def test_mark_all_notifications_as_read(setup_database):
    response = client.put("/api/v1/notifications/read-all")
    assert response.status_code == 200
    assert len(response.json()["notifications"]) == 3
    for notification in response.json()["notifications"]:
        assert notification["is_read"] is True

@patch('app.routers.reviews.check_and_deduct_credits')
@patch('app.routers.reviews.process_review_request')
def test_submit_review(mock_process_review, mock_check_credits, setup_database):
    # Mock check_and_deduct_credits to return True
    mock_check_credits.return_value = True
    
    # Create test file
    files = {"cv_file": ("test.pdf", "Test CV content", "application/pdf")}
    
    # Submit review
    response = client.post("/api/v1/reviews/", files=files)
    
    # Check response
    assert response.status_code == 201
    assert response.json()["cv_filename"] == "test.pdf"
    assert response.json()["status"] == "pending"
    
    # Check process_review_request was called
    assert mock_process_review.called

@patch('app.routers.reviews.check_and_deduct_credits')
def test_submit_review_insufficient_credits(mock_check_credits, setup_database):
    # Mock check_and_deduct_credits to return False
    mock_check_credits.return_value = False
    
    # Create test file
    files = {"cv_file": ("test.pdf", "Test CV content", "application/pdf")}
    
    # Submit review
    response = client.post("/api/v1/reviews/", files=files)
    
    # Check response
    assert response.status_code == 402  # Payment Required
