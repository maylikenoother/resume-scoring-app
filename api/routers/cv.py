import os
import uuid
from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, BackgroundTasks, status
from sqlmodel import Session, select

from api.auth.dependencies import get_current_active_user
from api.config.settings import settings
from api.db.database import get_db
from api.db.models import (
    User, 
    Submission, 
    SubmissionCreate, 
    SubmissionRead,
    SubmissionStatus,
    CreditTransaction,
    CreditTransactionType
)
from api.integrations.openai import analyze_cv

router = APIRouter(prefix="/cv", tags=["cv"])


def ensure_upload_dir():
    """Ensure that the upload directory exists."""
    os.makedirs(settings.cv_upload_dir, exist_ok=True)


async def process_cv(db: Session, submission_id: int):
    """
    Background task to process a CV submission.
    
    Args:
        db: Database session
        submission_id: ID of the submission to process
    """
    # Get the submission
    submission = db.get(Submission, submission_id)
    if not submission:
        return
    
    # Update status to processing
    submission.status = SubmissionStatus.PROCESSING
    db.commit()
    
    try:
        # Read the CV file
        file_path = os.path.join(settings.cv_upload_dir, submission.filename)
        with open(file_path, "r") as f:
            cv_text = f.read()
        
        # Analyze the CV
        score, feedback = await analyze_cv(cv_text)
        
        # Update the submission with the results
        submission.score = score
        submission.feedback = feedback
        submission.status = SubmissionStatus.COMPLETED
        submission.completed_at = datetime.utcnow()
        
        # Commit the changes
        db.commit()
    except Exception as e:
        # Update the submission status to failed
        submission.status = SubmissionStatus.FAILED
        submission.feedback = f"Error processing CV: {str(e)}"
        submission.completed_at = datetime.utcnow()
        db.commit()


@router.post("/upload", response_model=SubmissionRead)
async def upload_cv(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks,
) -> Any:
    """
    Upload a CV file for analysis.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        file: Uploaded CV file
        background_tasks: Background tasks manager
        
    Returns:
        Created submission
        
    Raises:
        HTTPException: If the user doesn't have enough credits or the file type is invalid
    """
    # Check if user has enough credits
    if current_user.credits < settings.min_credits_per_submission:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Not enough credits. Required: {settings.min_credits_per_submission}, Available: {current_user.credits}",
        )
    
    # Check file type (only text-based files are supported for simplicity)
    allowed_extensions = (".txt", ".md", ".docx", ".pdf")
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed extensions: {', '.join(allowed_extensions)}",
        )
    
    # Ensure upload directory exists
    ensure_upload_dir()
    
    # Generate a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.cv_upload_dir, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Create submission
    submission_create = SubmissionCreate(
        filename=unique_filename,
        original_filename=file.filename,
    )
    
    submission = Submission(
        user_id=current_user.id,
        filename=submission_create.filename,
        original_filename=submission_create.original_filename,
        status=SubmissionStatus.PENDING,
    )
    
    # Add submission to database
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Deduct credits
    current_user.credits -= settings.min_credits_per_submission
    
    # Create credit transaction
    transaction = CreditTransaction(
        user_id=current_user.id,
        amount=-settings.min_credits_per_submission,
        type=CreditTransactionType.USAGE,
        description=f"CV analysis: {file.filename}",
    )
    
    # Add transaction to database
    db.add(transaction)
    db.commit()
    
    # Start background task to process the CV
    background_tasks.add_task(process_cv, db, submission.id)
    
    return submission


@router.get("/submissions", response_model=List[SubmissionRead])
def get_user_submissions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get current user's CV submissions.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of CV submissions
    """
    submissions = db.exec(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Submission.submitted_at.desc())
    ).all()
    
    return submissions


@router.get("/submissions/{submission_id}", response_model=SubmissionRead)
def get_submission(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    submission_id: int,
) -> Any:
    """
    Get a specific CV submission.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        submission_id: ID of the submission to retrieve
        
    Returns:
        CV submission information
        
    Raises:
        HTTPException: If the submission is not found or doesn't belong to the user
    """
    submission = db.get(Submission, submission_id)
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found",
        )
    
    # Check if the submission belongs to the current user
    if submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this submission",
        )
    
    return submission