from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from api.auth.dependencies import get_current_active_user
from api.db.database import get_db
from api.db.models import User, Submission, SubmissionRead, SubmissionStatus

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.get("", response_model=List[SubmissionRead])
def get_submissions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    status: Optional[SubmissionStatus] = None,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all submissions for the current user, optionally filtered by status.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        status: Optional filter by submission status
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return (pagination)
        
    Returns:
        List of submissions
    """
    query = select(Submission).where(Submission.user_id == current_user.id)
    
    # Filter by status if provided
    if status:
        query = query.where(Submission.status == status)
    
    # Apply pagination and sorting
    submissions = db.exec(
        query
        .offset(skip)
        .limit(limit)
        .order_by(Submission.submitted_at.desc())
    ).all()
    
    return submissions


@router.get("/{submission_id}", response_model=SubmissionRead)
def get_submission(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    submission_id: int,
) -> Any:
    """
    Get a specific submission by ID.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        submission_id: ID of the submission to retrieve
        
    Returns:
        Submission details
        
    Raises:
        HTTPException: If submission is not found or belongs to another user
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


@router.get("/stats/summary", response_model=Dict[str, Any])
def get_submission_stats(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get summary statistics for the current user's submissions.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        
    Returns:
        Summary statistics
    """
    # Get total count
    total_submissions = db.exec(
        select(Submission)
        .where(Submission.user_id == current_user.id)
    ).all()
    
    # Count by status
    status_counts = {}
    for status in SubmissionStatus:
        count = sum(1 for s in total_submissions if s.status == status)
        status_counts[status] = count
    
    # Calculate average score (for completed submissions)
    completed_submissions = [s for s in total_submissions if s.status == SubmissionStatus.COMPLETED and s.score is not None]
    avg_score = sum(s.score for s in completed_submissions) / len(completed_submissions) if completed_submissions else 0
    
    return {
        "total_submissions": len(total_submissions),
        "status_counts": status_counts,
        "average_score": avg_score,
    }