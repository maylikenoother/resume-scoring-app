from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.core.config import settings
from api.core.auth import get_current_active_user
from api.core.rbac import all_users
from api.core.database import get_db
from api.models.models import User, CreditBalance, CreditTransaction, TransactionType
from api.schemas.schemas import CreditBalance as CreditBalanceSchema
from api.schemas.schemas import CreditTransaction as CreditTransactionSchema

router = APIRouter(
    prefix="/credits",
    tags=["credits"],
    responses={401: {"description": "Unauthorized"}},
)

@router.get("/balance", response_model=CreditBalanceSchema)
async def get_credit_balance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    result = await db.execute(
        select(CreditBalance).where(CreditBalance.user_id == current_user.id)
    )
    credit_balance = result.scalars().first()
    
    if not credit_balance:
        # Automatically create CreditBalance if missing
        credit_balance = CreditBalance(user_id=current_user.id, balance=settings.DEFAULT_CREDITS)
        db.add(credit_balance)
        await db.commit()
        await db.refresh(credit_balance)
    
    return credit_balance

@router.post("/purchase", response_model=CreditTransactionSchema)
async def purchase_credits(
    credit_amount: int = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    if credit_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credit amount must be positive",
        )

    result = await db.execute(
        select(CreditBalance).where(CreditBalance.user_id == current_user.id)
    )
    credit_balance = result.scalars().first()
    
    if not credit_balance:
        credit_balance = CreditBalance(
            user_id=current_user.id,
            balance=0
        )
        db.add(credit_balance)
        await db.commit()
        await db.refresh(credit_balance)

    credit_balance.balance += credit_amount
    transaction = CreditTransaction(
        credit_balance_id=credit_balance.id,
        amount=credit_amount,
        description=f"Purchased {credit_amount} credits",
        transaction_type=TransactionType.PURCHASE
    )
    db.add(transaction)
    
    await db.commit()
    await db.refresh(transaction)
    
    return transaction

@router.get("/pricing", response_model=Dict[str, Dict[str, Any]])
async def get_pricing_tiers() -> Any:
    """
    Get available credit pricing tiers
    """
    return {
        "basic": {
            "amount": 5,
            "price": 4.99
        },
        "standard": {
            "amount": 15,
            "price": 9.99
        },
        "premium": {
            "amount": 50,
            "price": 24.99
        }
    }

@router.get("/transactions", response_model=list[CreditTransactionSchema])
async def get_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    result = await db.execute(
        select(CreditBalance).where(CreditBalance.user_id == current_user.id)
    )
    credit_balance = result.scalars().first()
    
    if not credit_balance:
        return []

    result = await db.execute(
        select(CreditTransaction)
        .where(CreditTransaction.credit_balance_id == credit_balance.id)
        .order_by(CreditTransaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    transactions = result.scalars().all()
    return transactions

@router.post("/admin/grant-credits", response_model=CreditTransactionSchema)
async def admin_grant_credits(
    user_id: int = Body(..., embed=True),
    credit_amount: int = Body(..., embed=True),
    reason: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(lambda: all_users([UserRole.ADMIN]))
) -> Any:

    if credit_amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credit amount must be positive",
        )

    user_result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    result = await db.execute(
        select(CreditBalance).where(CreditBalance.user_id == user_id)
    )
    credit_balance = result.scalars().first()
    
    if not credit_balance:
        credit_balance = CreditBalance(
            user_id=user_id,
            balance=0
        )
        db.add(credit_balance)
        await db.commit()
        await db.refresh(credit_balance)
    
    # Update balance
    credit_balance.balance += credit_amount
    
    transaction = CreditTransaction(
        credit_balance_id=credit_balance.id,
        amount=credit_amount,
        description=f"Admin granted {credit_amount} credits: {reason}",
        transaction_type=TransactionType.BONUS
    )
    db.add(transaction)
    
    await db.commit()
    await db.refresh(transaction)
    
    return transaction