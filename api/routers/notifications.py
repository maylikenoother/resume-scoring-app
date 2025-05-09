from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from api.core.auth import get_current_active_user, validate_resource_ownership
from api.core.database import get_db
from api.models.models import User, Notification
from api.schemas.schemas import NotificationList, Notification as NotificationSchema

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={401: {"description": "Unauthorized"}},
)

@router.get("/", response_model=NotificationList)
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False
) -> Any:
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    result = await db.execute(
        query.order_by(desc(Notification.created_at))
        .offset(skip)
        .limit(limit)
    )
    
    notifications = result.scalars().all()
    return {"notifications": notifications}

@router.put("/{notification_id}/read", response_model=NotificationSchema)
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    await validate_resource_ownership(current_user.id, notification.user_id)
    
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    
    return notification

@router.put("/read-all", response_model=NotificationList)
async def mark_all_notifications_as_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )
    notifications = result.scalars().all()

    for notification in notifications:
        notification.is_read = True
    
    await db.commit()

    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(desc(Notification.created_at))
    )
    all_notifications = result.scalars().all()
    
    return {"notifications": all_notifications}

@router.get("/unread-count")
async def get_unread_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> int:
    result = await db.execute(
        select(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )
    notifications = result.scalars().all()
    
    return len(notifications)

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    await validate_resource_ownership(current_user.id, notification.user_id)
    
    await db.delete(notification)
    await db.commit()