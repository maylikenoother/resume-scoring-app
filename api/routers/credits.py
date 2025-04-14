from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.schemas import CreditUpdate
from app.models.user import User
from app.auth.auth import get_current_user

router = APIRouter()

@router.get("/balance")
async def get_credit_balance(current_user: User = Depends(get_current_user)):
    """
    Get the current user's credit balance
    """
    return {"credit_balance": current_user.credit_balance}

@router.post("/add")
async def add_credits(
    credit_update: CreditUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add credits to the current user's account
    This would typically be connected to a payment system in a production environment
    """
    if credit_update.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credit amount must be positive"
        )
    
    current_user.credit_balance += credit_update.amount
    db.commit()
    
    return {"message": f"Added {credit_update.amount} credits", "new_balance": current_user.credit_balance}
