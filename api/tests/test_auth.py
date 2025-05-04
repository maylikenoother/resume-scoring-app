from fastapi.testclient import TestClient

def test_login(client: TestClient):
    response = client.post(
        "/api/py/auth/login",
        data={"username": "test@example.com", "password": "password"}
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient):
    response = client.post(
        "/api/py/auth/login",
        data={"username": "test@example.com", "password": "wrong_password"}
    )
    
    assert response.status_code == 401
    assert "detail" in response.json()

def test_register(client: TestClient):
    response = client.post(
        "/api/py/auth/register",
        json={
            "email": "new_user@example.com",
            "full_name": "New User",
            "password": "newpassword"
        }
    )
    
    assert response.status_code == 201
    assert response.json()["email"] == "new_user@example.com"
    assert response.json()["full_name"] == "New User"
    assert "id" in response.json()

def test_register_existing_user(client: TestClient):
    client.post(
        "/api/py/auth/register",
        json={
            "email": "duplicate@example.com",
            "full_name": "Duplicate User",
            "password": "password123"
        }
    )
    
    response = client.post(
        "/api/py/auth/register",
        json={
            "email": "duplicate@example.com",
            "full_name": "Another User",
            "password": "password123"
        }
    )
    
    assert response.status_code == 400
    assert "detail" in response.json()

def test_me_endpoint(client: TestClient):
    response = client.get("/api/py/auth/me")
    
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
    assert response.json()["full_name"] == "Test User"