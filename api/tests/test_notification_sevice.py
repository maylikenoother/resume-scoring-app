import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio
from datetime import datetime

from app.core.database import Base
from app.models.models import User, Review, Notification
from app.services.notification_service import (
    create_notification, 
    get_user_notifications, 
    mark_notification_as_read,
    mark_all_notifications_as_read
)

# Create in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    # Drop the database tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
async def test_user(db_session):
    # Create test user
    user = User(
        clerk_id="test_clerk_id",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return user

@pytest.fixture
async def test_review(db_session, test_user):
    # Create test review
    review = Review(
        user_id=test_user.id,
        cv_filename="test_cv.pdf",
        cv_content="Test CV content",
        status="completed",
        review_content="Test review content",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(review)
    db_session.commit()
    db_session.refresh(review)
    
    return review

@pytest.mark.asyncio
async def test_create_notification(db_session, test_user, test_review):
    # Create notification
    message = "Test notification message"
    notification = await create_notification(db_session, test_user.id, test_review.id, message)
    
    # Check notification was created
    assert notification is not None
    assert notification.user_id == test_user.id
    assert notification.review_id == test_review.id
    assert notification.message == message
    assert notification.is_read is False
    
    # Check notification exists in database
    db_notification = db_session.query(Notification).filter(Notification.id == notification.id).first()
    assert db_notification is not None
    assert db_notification.message == message

@pytest.mark.asyncio
async def test_get_user_notifications(db_session, test_user, test_review):
    # Create notifications
    await create_notification(db_session, test_user.id, test_review.id, "Notification 1")
    await create_notification(db_session, test_user.id, test_review.id, "Notification 2")
    await create_notification(db_session, test_user.id, test_review.id, "Notification 3")
    
    # Get user notifications
    notifications = await get_user_notifications(db_session, test_user.clerk_id)
    
    # Check notifications were retrieved
    assert len(notifications) == 3
    assert notifications[0].message == "Notification 3"  # Most recent first
    assert notifications[1].message == "Notification 2"
    assert notifications[2].message == "Notification 1"

@pytest.mark.asyncio
async def test_get_user_notifications_nonexistent_user(db_session):
    # Get notifications for non-existent user
    notifications = await get_user_notifications(db_session, "non_existent_clerk_id")
    
    # Check no notifications were retrieved
    assert len(notifications) == 0

@pytest.mark.asyncio
async def test_mark_notification_as_read(db_session, test_user, test_review):
    # Create notification
    notification = await create_notification(db_session, test_user.id, test_review.id, "Test notification")
    
    # Mark notification as read
    updated_notification = await mark_notification_as_read(db_session, notification.id, test_user.clerk_id)
    
    # Check notification was marked as read
    assert updated_notification is not None
    assert updated_notification.is_read is True
    
    # Check notification was updated in database
    db_notification = db_session.query(Notification).filter(Notification.id == notification.id).first()
    assert db_notification.is_read is True

@pytest.mark.asyncio
async def test_mark_notification_as_read_nonexistent_notification(db_session, test_user):
    # Mark non-existent notification as read
    updated_notification = await mark_notification_as_read(db_session, 999, test_user.clerk_id)
    
    # Check no notification was updated
    assert updated_notification is None

@pytest.mark.asyncio
async def test_mark_all_notifications_as_read(db_session, test_user, test_review):
    # Create notifications
    await create_notification(db_session, test_user.id, test_review.id, "Notification 1")
    await create_notification(db_session, test_user.id, test_review.id, "Notification 2")
    await create_notification(db_session, test_user.id, test_review.id, "Notification 3")
    
    # Mark all notifications as read
    updated_notifications = await mark_all_notifications_as_read(db_session, test_user.clerk_id)
    
    # Check all notifications were marked as read
    assert len(updated_notifications) == 3
    for notification in updated_notifications:
        assert notification.is_read is True
    
    # Check all notifications were updated in database
    db_notifications = db_session.query(Notification).filter(Notification.user_id == test_user.id).all()
    for notification in db_notifications:
        assert notification.is_read is True

@pytest.mark.asyncio
async def test_mark_all_notifications_as_read_nonexistent_user(db_session):
    # Mark all notifications as read for non-existent user
    updated_notifications = await mark_all_notifications_as_read(db_session, "non_existent_clerk_id")
    
    # Check no notifications were updated
    assert len(updated_notifications) == 0
