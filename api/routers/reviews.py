from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import asyncio

from app.core.database import get_db
from app.core.auth import get_current_user_id
from app.models.schemas import ReviewCreate, ReviewResponse, ReviewList
from app.services.review_service import (
    create_review, 
    get_reviews_by_user, 
    get_review_by_id,
    process_review_request
)
from app.services.credit_service import check_and_deduct_credits

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review_request(
    background_tasks: BackgroundTasks,
    cv_file: UploadFile = File(...),
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Submit a CV for review
    - Requires authentication
    - Checks credit balance
    - Deducts 1 credit if sufficient balance
    - Queues the review request for processing
    """
    # Read CV file content
    cv_content = await cv_file.read()
    cv_content_str = cv_content.decode("utf-8")
    
    # Create review request
    review_data = ReviewCreate(
        cv_filename=cv_file.filename,
        cv_content=cv_content_str
    )
    
    # Check and deduct credits
    has_credits = await check_and_deduct_credits(db, clerk_id)
    if not has_credits:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits"
        )
    
    # Create review in database
    review = await create_review(db, review_data, clerk_id)
    
    # Queue review processing in background
    background_tasks.add_task(
        process_review_request,
        db=db,
        review_id=review.id
    )
    
    return review

@router.get("/", response_model=ReviewList)
async def get_user_reviews(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get all reviews for the current user
    """
    reviews = await get_reviews_by_user(db, clerk_id)
    return {"reviews": reviews}

@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: int,
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get a specific review by ID
    """
    review = await get_review_by_id(db, review_id, clerk_id)
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    return review
