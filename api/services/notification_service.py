from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.models import User, Notification, Review
from app.services.user_service import get_user_by_clerk_id

async def create_notification(db: Session, user_id: int, review_id: int, message: str) -> Notification:
    """
    Create a new notification for a user
    """
    notification = Notification(
        user_id=user_id,
        review_id=review_id,
        message=message,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

async def get_user_notifications(db: Session, clerk_id: str) -> List[Notification]:
    """
    Get all notifications for a user
    """
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return []
    
    return db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()

async def mark_notification_as_read(db: Session, notification_id: int, clerk_id: str) -> Optional[Notification]:
    """
    Mark a notification as read
    """
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return None
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user.id
    ).first()
    
    if not notification:
        return None
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification

async def mark_all_notifications_as_read(db: Session, clerk_id: str) -> List[Notification]:
    """
    Mark all notifications as read for a user
    """
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return []
    
    notifications = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False
    ).all()
    
    for notification in notifications:
        notification.is_read = True
    
    db.commit()
    
    return db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()
