from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user_id
from app.models.schemas import NotificationResponse, NotificationList
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read
)

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=NotificationList)
async def get_notifications(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get all notifications for the current user
    """
    notifications = await get_user_notifications(db, clerk_id)
    return {"notifications": notifications}

@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: int,
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read
    """
    notification = await mark_notification_as_read(db, notification_id, clerk_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification

@router.put("/read-all", response_model=NotificationList)
async def read_all_notifications(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for the current user
    """
    notifications = await mark_all_notifications_as_read(db, clerk_id)
    return {"notifications": notifications}
