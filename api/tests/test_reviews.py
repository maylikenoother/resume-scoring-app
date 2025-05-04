import io
from fastapi.testclient import TestClient

def test_upload_cv(client: TestClient):
    file_content = "Test CV Content\nSkills: Python, FastAPI\nExperience: 5 years"
    file = io.BytesIO(file_content.encode())
    
    response = client.post(
        "/api/py/reviews/upload",
        files={"file": ("test_cv.txt", file, "text/plain")}
    )
    
    assert response.status_code == 201
    assert response.json()["filename"] == "test_cv.txt"
    assert response.json()["status"] == "pending"
    assert "id" in response.json()

def test_get_user_reviews(client: TestClient):
    file_content = "Another Test CV Content"
    file = io.BytesIO(file_content.encode())
    client.post(
        "/api/py/reviews/upload",
        files={"file": ("another_cv.txt", file, "text/plain")}
    )
    
    response = client.get("/api/py/reviews/")
    
    assert response.status_code == 200
    assert "reviews" in response.json()
    assert len(response.json()["reviews"]) > 0

    review = response.json()["reviews"][0]
    assert "id" in review
    assert "filename" in review
    assert "status" in review

def test_get_review_by_id(client: TestClient):
    file_content = "Test CV for ID retrieval"
    file = io.BytesIO(file_content.encode())
    upload_response = client.post(
        "/api/py/reviews/upload",
        files={"file": ("id_test_cv.txt", file, "text/plain")}
    )
    review_id = upload_response.json()["id"]
    
    response = client.get(f"/api/py/reviews/{review_id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == review_id
    assert response.json()["filename"] == "id_test_cv.txt"

def test_get_nonexistent_review(client: TestClient):
    response = client.get("/api/py/reviews/9999")
    
    assert response.status_code == 404
    assert "detail" in response.json()

def test_upload_cv_insufficient_credits(client: TestClient, monkeypatch):
    import sqlalchemy
    
    original_execute = sqlalchemy.ext.asyncio.AsyncSession.execute
    
    async def mock_execute(*args, **kwargs):
        if "SELECT credit_balances" in str(args[1]):
            return MockResult(balance=0)
        return await original_execute(*args, **kwargs)
    
    class MockResult:
        def __init__(self, balance=0):
            self.balance = balance
        
        def scalars(self):
            return self
        
        def first(self):
            if hasattr(self, 'balance'):
                class MockBalance:
                    def __init__(self, balance):
                        self.balance = balance
                return MockBalance(self.balance)
            return None
    
    monkeypatch.setattr(sqlalchemy.ext.asyncio.AsyncSession, "execute", mock_execute)

    file_content = "Test CV Content"
    file = io.BytesIO(file_content.encode())
    
    response = client.post(
        "/api/py/reviews/upload",
        files={"file": ("no_credits_cv.txt", file, "text/plain")}
    )
    
    assert response.status_code == 402
    assert "detail" in response.json()