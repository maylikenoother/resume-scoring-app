from sqlalchemy.orm import Session
from typing import Optional, Tuple

from app.models.models import User, CreditBalance
from app.services.user_service import get_user_by_clerk_id

async def check_and_deduct_credits(db: Session, clerk_id: str) -> bool:
    """
    Check if user has sufficient credits and deduct 1 credit if true
    Returns True if credits were successfully deducted, False otherwise
    """
    # Get user
    user = await get_user_by_clerk_id(db, clerk_id)
    if not user:
        return False
    
    # Get credit balance
    credit_balance = db.query(CreditBalance).filter(CreditBalance.user_id == user.id).first()
    if not credit_balance or credit_balance.balance < 1:
        return False
    
    # Deduct 1 credit
    credit_balance.balance -= 1
    db.commit()
    db.refresh(credit_balance)
    
    return True

async def add_credits(db: Session, user_id: int, amount: int) -> Optional[CreditBalance]:
    """
    Add credits to a user's balance
    """
    credit_balance = db.query(CreditBalance).filter(CreditBalance.user_id == user_id).first()
    if not credit_balance:
        return None
    
    credit_balance.balance += amount
    db.commit()
    db.refresh(credit_balance)
    
    return credit_balance
