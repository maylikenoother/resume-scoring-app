from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from api.auth.dependencies import get_current_active_user
from api.db.database import get_db
from api.db.models import User, UserRead, CreditTransaction, CreditTransactionRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User information
    """
    return current_user


@router.get("/me/transactions", response_model=List[CreditTransactionRead])
def get_user_transactions(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get current user's credit transactions.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of credit transactions
    """
    transactions = db.exec(
        select(CreditTransaction)
        .where(CreditTransaction.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(CreditTransaction.created_at.desc())
    ).all()
    
    return transactions