from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.models.models import User, CreditBalance
from app.models.schemas import UserCreate

async def get_user_by_clerk_id(db: Session, clerk_id: str) -> Optional[User]:
    """
    Get a user by Clerk ID
    """
    return db.query(User).filter(User.clerk_id == clerk_id).first()

async def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get a user by email
    """
    return db.query(User).filter(User.email == email).first()

async def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user with initial credit balance
    """
    # Create user
    db_user = User(
        clerk_id=user.clerk_id,
        email=user.email,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create initial credit balance (5 credits)
    db_credit_balance = CreditBalance(
        user_id=db_user.id,
        balance=5,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_credit_balance)
    db.commit()
    db.refresh(db_credit_balance)
    
    return db_user

async def get_credit_balance(db: Session, user_id: int) -> Optional[CreditBalance]:
    """
    Get a user's credit balance
    """
    return db.query(CreditBalance).filter(CreditBalance.user_id == user_id).first()
