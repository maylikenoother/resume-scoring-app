import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio
from datetime import datetime

from app.core.database import Base
from app.models.models import User, CreditBalance
from app.services.credit_service import check_and_deduct_credits, add_credits

# Create in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    # Drop the database tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
async def test_user(db_session):
    # Create test user
    user = User(
        clerk_id="test_clerk_id",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Create credit balance
    credit_balance = CreditBalance(
        user_id=user.id,
        balance=5,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(credit_balance)
    db_session.commit()
    db_session.refresh(credit_balance)
    
    return user

@pytest.mark.asyncio
async def test_check_and_deduct_credits_sufficient(db_session, test_user):
    # Check and deduct credits
    result = await check_and_deduct_credits(db_session, test_user.clerk_id)
    
    # Check credits were deducted
    assert result is True
    
    # Check credit balance was updated
    credit_balance = db_session.query(CreditBalance).filter(CreditBalance.user_id == test_user.id).first()
    assert credit_balance.balance == 4

@pytest.mark.asyncio
async def test_check_and_deduct_credits_insufficient(db_session, test_user):
    # Set credit balance to 0
    credit_balance = db_session.query(CreditBalance).filter(CreditBalance.user_id == test_user.id).first()
    credit_balance.balance = 0
    db_session.commit()
    db_session.refresh(credit_balance)
    
    # Check and deduct credits
    result = await check_and_deduct_credits(db_session, test_user.clerk_id)
    
    # Check credits were not deducted
    assert result is False
    
    # Check credit balance was not updated
    credit_balance = db_session.query(CreditBalance).filter(CreditBalance.user_id == test_user.id).first()
    assert credit_balance.balance == 0

@pytest.mark.asyncio
async def test_check_and_deduct_credits_nonexistent_user(db_session):
    # Check and deduct credits for non-existent user
    result = await check_and_deduct_credits(db_session, "non_existent_clerk_id")
    
    # Check credits were not deducted
    assert result is False

@pytest.mark.asyncio
async def test_add_credits(db_session, test_user):
    # Add credits
    credit_balance = await add_credits(db_session, test_user.id, 10)
    
    # Check credits were added
    assert credit_balance is not None
    assert credit_balance.balance == 15
    
    # Check credit balance was updated in database
    db_credit_balance = db_session.query(CreditBalance).filter(CreditBalance.user_id == test_user.id).first()
    assert db_credit_balance.balance == 15

@pytest.mark.asyncio
async def test_add_credits_nonexistent_user(db_session):
    # Add credits for non-existent user
    credit_balance = await add_credits(db_session, 999, 10)
    
    # Check credits were not added
    assert credit_balance is None
