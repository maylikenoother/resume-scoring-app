from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from api.auth.dependencies import get_current_active_user
from api.config.settings import settings
from api.db.database import get_db
from api.db.models import User, CreditTransaction, CreditTransactionCreate, CreditTransactionType

router = APIRouter(prefix="/credits", tags=["credits"])


class PurchaseCredits(BaseModel):
    tier: str


class CreditPricing(BaseModel):
    amount: int
    price: float


@router.get("/pricing", response_model=Dict[str, CreditPricing])
def get_credit_pricing() -> Any:
    """
    Get credit pricing information.
    
    Returns:
        Dictionary of credit pricing tiers
    """
    return settings.credit_pricing


@router.post("/purchase", response_model=CreditTransaction)
def purchase_credits(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    purchase: PurchaseCredits,
) -> Any:
    """
    Purchase credits for the current user.
    
    Args:
        db: Database session
        current_user: Current authenticated user
        purchase: Purchase information including the pricing tier
        
    Returns:
        Created credit transaction
        
    Raises:
        HTTPException: If the tier is invalid
    """
    # Check if the tier is valid
    if purchase.tier not in settings.credit_pricing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid tier. Available tiers: {', '.join(settings.credit_pricing.keys())}",
        )
    
    # Get the tier information
    tier_info = settings.credit_pricing[purchase.tier]
    credit_amount = tier_info["amount"]
    
    # Create a credit transaction
    transaction_create = CreditTransactionCreate(
        amount=credit_amount,
        type=CreditTransactionType.PURCHASE,
        description=f"Purchased {credit_amount} credits ({purchase.tier} tier)",
    )
    
    transaction = CreditTransaction(
        user_id=current_user.id,
        amount=transaction_create.amount,
        type=transaction_create.type,
        description=transaction_create.description,
    )
    
    # Add the transaction to the database
    db.add(transaction)
    
    # Update user's credits
    current_user.credits += credit_amount
    
    # Commit changes
    db.commit()
    db.refresh(transaction)
    
    return transaction