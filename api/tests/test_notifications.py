from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from api.models.models import Notification
from api.tests.conftest import TestingSessionLocal, TEST_USER

async def create_test_notifications():
    async with TestingSessionLocal() as session:
        for i in range(3):
            notification = Notification(
                user_id=TEST_USER.id,
                message=f"Test notification {i+1}",
                is_read=i == 0 
            )
            session.add(notification)
        
        await session.commit()

def test_get_notifications(client: TestClient):
    asyncio.run(create_test_notifications())
    
    response = client.get("/api/py/notifications/")
    
    assert response.status_code == 200
    assert "notifications" in response.json()
    assert len(response.json()["notifications"]) == 3

    notification = response.json()["notifications"][0]
    assert "id" in notification
    assert "message" in notification
    assert "is_read" in notification
    assert "created_at" in notification

def test_get_unread_notifications(client: TestClient):
    response = client.get("/api/py/notifications/?unread_only=true")
    
    assert response.status_code == 200
    assert "notifications" in response.json()
    
    assert len(response.json()["notifications"]) == 2
    
    for notification in response.json()["notifications"]:
        assert notification["is_read"] is False

def test_mark_notification_as_read(client: TestClient):
    response = client.get("/api/py/notifications/?unread_only=true")
    notification_id = response.json()["notifications"][0]["id"]
    
    response = client.put(f"/api/py/notifications/{notification_id}/read")
    
    assert response.status_code == 200
    assert response.json()["id"] == notification_id
    assert response.json()["is_read"] is True

def test_mark_nonexistent_notification(client: TestClient):
    response = client.put("/api/py/notifications/9999/read")
    
    assert response.status_code == 404
    assert "detail" in response.json()

def test_mark_all_as_read(client: TestClient):
    response = client.put("/api/py/notifications/read-all")
    
    assert response.status_code == 200
    assert "notifications" in response.json()
    
    for notification in response.json()["notifications"]:
        assert notification["is_read"] is True
    
    unread_response = client.get("/api/py/notifications/?unread_only=true")
    assert len(unread_response.json()["notifications"]) == 0

def test_get_unread_count(client: TestClient):
    """Test getting the count of unread notifications."""
    asyncio.run(create_unread_notification())
    
    response = client.get("/api/py/notifications/unread-count")
    
    assert response.status_code == 200
    assert response.json() > 0

async def create_unread_notification():
    async with TestingSessionLocal() as session:
        notification = Notification(
            user_id=TEST_USER.id,
            message="New unread notification for testing",
            is_read=False
        )
        session.add(notification)
        await session.commit()