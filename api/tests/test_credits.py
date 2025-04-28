import pytest
from fastapi.testclient import TestClient

def test_get_credit_balance(client: TestClient):
    """Test getting user's credit balance."""
    response = client.get("/api/py/credits/balance")
    
    assert response.status_code == 200
    assert "balance" in response.json()
    assert response.json()["balance"] == 10

def test_purchase_credits(client: TestClient):
    """Test purchasing credits."""
    response = client.post(
        "/api/py/credits/purchase",
        json={"credit_amount": 5}
    )
    
    assert response.status_code == 200
    assert "amount" in response.json()
    assert response.json()["amount"] == 5
    assert response.json()["transaction_type"] == "purchase"
    
    balance_response = client.get("/api/py/credits/balance")
    assert balance_response.json()["balance"] == 15  # 10 + 5

def test_purchase_negative_credits(client: TestClient):
    """Test that purchasing negative credits is not allowed."""
    response = client.post(
        "/api/py/credits/purchase",
        json={"credit_amount": -5}
    )
    
    assert response.status_code == 400
    assert "detail" in response.json()

def test_get_pricing_tiers(client: TestClient):
    """Test getting pricing tiers."""
    response = client.get("/api/py/credits/pricing")
    
    assert response.status_code == 200
    assert "basic" in response.json()
    assert "standard" in response.json()
    assert "premium" in response.json()
    
    assert "amount" in response.json()["basic"]
    assert "price" in response.json()["basic"]

def test_get_transactions(client: TestClient):
    """Test getting transaction history."""
    client.post(
        "/api/py/credits/purchase",
        json={"credit_amount": 3}
    )
    
    response = client.get("/api/py/credits/transactions")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0
    
    transaction = response.json()[0]
    assert "amount" in transaction
    assert "description" in transaction
    assert "transaction_type" in transaction
    assert "created_at" in transaction