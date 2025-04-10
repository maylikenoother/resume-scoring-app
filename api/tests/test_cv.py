# api/tests/test_cv.py
import pytest
import os
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
from unittest.mock import patch, MagicMock

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

@pytest.fixture
def mock_process_cv():
    with patch("api.queue.job_queue.job_queue.add_job", MagicMock(return_value=None)):
        yield

def test_upload_cv(client, auth_headers, mock_process_cv):
    # Create a temporary test file
    test_file_content = "This is a test CV file"
    test_file_path = "test_cv.txt"
    
    with open(test_file_path, "w") as f:
        f.write(test_file_content)
    
    try:
        # Test upload with sufficient credits
        with open(test_file_path, "rb") as f:
            response = client.post(
                "/api/py/cv/upload",
                files={"file": ("test_cv.txt", f, "text/plain")},
                headers=auth_headers
            )
        
        assert response.status_code == 200
        assert "id" in response.json()
        assert response.json()["original_filename"] == "test_cv.txt"
        assert response.json()["status"] == "pending"
        
    finally:
        # Clean up the test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_get_submissions(client, auth_headers, mock_process_cv):
    # First upload a CV
    test_file_content = "This is a test CV file"
    test_file_path = "test_cv.txt"
    
    with open(test_file_path, "w") as f:
        f.write(test_file_content)
    
    try:
        with open(test_file_path, "rb") as f:
            client.post(
                "/api/py/cv/upload",
                files={"file": ("test_cv.txt", f, "text/plain")},
                headers=auth_headers
            )
        
        # Now get the submissions
        response = client.get(
            "/api/py/cv/submissions",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        submissions = response.json()
        assert len(submissions) > 0
        assert submissions[0]["original_filename"] == "test_cv.txt"
        
    finally:
        # Clean up the test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)