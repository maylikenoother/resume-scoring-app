from typing import Any
import io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from api.core.auth import get_current_active_user, validate_resource_ownership
from api.core.database import get_db, AsyncSessionLocal
from api.models.models import User, Review, CreditBalance, Notification, CreditTransaction, ReviewStatus
from api.schemas.schemas import ReviewList, Review as ReviewSchema
from api.services.ai_service import generate_review
from api.core.config import settings
from api.utils.document_converter import convert_to_text

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
    responses={401: {"description": "Unauthorized"}}
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
            detail=f"Insufficient credits. You need {settings.REVIEW_CREDIT_COST} credits to request a review.",
        )

    file_content = await file.read()
    content_type = file.content_type or 'text/plain'
    text_content = convert_to_text(file_content, content_type)
    
    if not text_content or not text_content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract text from the uploaded document. Please upload a valid CV document."
        )
    
    new_review = Review(
        user_id=current_user.id,
        filename=file.filename,
        file_content=file_content,
        content=text_content,
        content_type=file.content_type,
        file_size=len(file_content),
        status=ReviewStatus.PENDING
    )
    db.add(new_review)

    credit_balance.balance -= settings.REVIEW_CREDIT_COST
    db.add(CreditTransaction(
        credit_balance_id=credit_balance.id,
        amount=-settings.REVIEW_CREDIT_COST,
        description=f"CV Review: {file.filename}",
        transaction_type="usage"
    ))

    notification = Notification(
        user_id=current_user.id,
        message=f"Your CV '{file.filename}' has been submitted for review",
        is_read=False
    )
    db.add(notification)

    await db.commit()
    await db.refresh(new_review)

    notification.review_id = new_review.id
    await db.commit()

    background_tasks.add_task(process_review, new_review.id)
    return new_review

async def process_review(review_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Review).where(Review.id == review_id))
        review = result.scalars().first()
        if not review:
            return

        try:
            review.status = ReviewStatus.PROCESSING
            session.add(Notification(
                user_id=review.user_id,
                review_id=review.id,
                message="Your CV review is now being processed",
                is_read=False
            ))
            await session.commit()

            review_result, score = await generate_review(review.content)

            review.status = ReviewStatus.COMPLETED
            review.review_result = review_result
            review.score = score
            session.add(Notification(
                user_id=review.user_id,
                review_id=review.id,
                message="Your CV review is now complete",
                is_read=False
            ))
            await session.commit()

        except Exception as e:
            review.status = ReviewStatus.FAILED
            session.add(Notification(
                user_id=review.user_id,
                review_id=review.id,
                message=f"Your CV review has failed: {str(e)}",
                is_read=False
            ))
            await session.commit()

@router.get("/file/{review_id}")
async def get_review_file(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    await validate_resource_ownership(current_user.id, review.user_id)

    return StreamingResponse(
        io.BytesIO(review.file_content),
        media_type=review.content_type or "application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={review.filename}"}
    )

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
    return {"reviews": result.scalars().all()}

@router.get("/{review_id}", response_model=ReviewSchema)
async def get_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalars().first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    await validate_resource_ownership(current_user.id, review.user_id)
    return review