from typing import Any, List
import os
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.models import User, Review, CreditBalance, Notification, CreditTransaction
from app.schemas.schemas import ReviewList, Review as ReviewSchema
from app.services.ai_service import generate_review
from app.core.config import settings

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
    responses={401: {"description": "Unauthorized"}},
)

@router.post("/upload", response_model=ReviewSchema, status_code=status.HTTP_201_CREATED)
async def upload_cv_for_review(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
        select(CreditBalance).where(CreditBalance.user_id == current_user.id)
    )
    credit_balance = result.scalars().first()
    
    if not credit_balance or credit_balance.balance < settings.REVIEW_CREDIT_COST:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Please purchase more credits.",
        )
    
    content = await file.read()
    if isinstance(content, bytes):
        content = content.decode("utf-8")
    
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    file_uuid = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{file_uuid}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    new_review = Review(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        content=content,
        status="pending"
    )
    db.add(new_review)
    
    credit_balance.balance -= settings.REVIEW_CREDIT_COST

    transaction = CreditTransaction(
        credit_balance_id=credit_balance.id,
        amount=-settings.REVIEW_CREDIT_COST,
        description=f"CV Review: {file.filename}",
        transaction_type="usage"
    )
    db.add(transaction)
    
    notification = Notification(
        user_id=current_user.id,
        review_id=None, 
        message=f"Your CV '{file.filename}' has been submitted for review",
        is_read=False
    )
    db.add(notification)
    
    await db.commit()
    await db.refresh(new_review)
    
    notification.review_id = new_review.id
    await db.commit()

    background_tasks.add_task(process_review, new_review.id, db)
    
    return new_review

async def process_review(review_id: int, db: AsyncSession):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Review).where(Review.id == review_id)
        )
        review = result.scalars().first()
        
        if not review:
            return
        
        try:
            review.status = "processing"
            
            notification = Notification(
                user_id=review.user_id,
                review_id=review.id,
                message=f"Your CV review is now being processed",
                is_read=False
            )
            session.add(notification)
            await session.commit()
            
            review_result = await generate_review(review.content)
            
            review.status = "completed"
            review.review_result = review_result
            review.score = 7.5 
            
            notification = Notification(
                user_id=review.user_id,
                review_id=review.id,
                message=f"Your CV review is now complete",
                is_read=False
            )
            session.add(notification)
            
            await session.commit()
            
        except Exception as e:
            review.status = "failed"
            
            notification = Notification(
                user_id=review.user_id,
                review_id=review.id,
                message=f"Your CV review has failed: {str(e)}",
                is_read=False
            )
            session.add(notification)
            
            await session.commit()

@router.get("/", response_model=ReviewList)
async def get_user_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    result = await db.execute(
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
    )
    reviews = result.scalars().all()
    return {"reviews": reviews}

@router.get("/{review_id}", response_model=ReviewSchema)
async def get_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(
        select(Review)
        .where(Review.id == review_id, Review.user_id == current_user.id)
    )
    review = result.scalars().first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return review
    