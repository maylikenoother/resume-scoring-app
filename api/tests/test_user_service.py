import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio
from datetime import datetime

from app.core.database import Base
from app.models.models import User, CreditBalance
from app.models.schemas import UserCreate
from app.services.user_service import get_user_by_clerk_id, get_user_by_email, create_user, get_credit_balance

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

@pytest.mark.asyncio
async def test_create_user(db_session):
    # Create test user data
    user_data = UserCreate(
        clerk_id="test_clerk_id",
        email="test@example.com"
    )
    
    # Create user
    user = await create_user(db_session, user_data)
    
    # Check user was created
    assert user.clerk_id == "test_clerk_id"
    assert user.email == "test@example.com"
    
    # Check credit balance was created
    credit_balance = await get_credit_balance(db_session, user.id)
    assert credit_balance is not None
    assert credit_balance.balance == 5  # Default 5 credits

@pytest.mark.asyncio
async def test_get_user_by_clerk_id(db_session):
    # Create test user
    db_user = User(
        clerk_id="test_clerk_id",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    
    # Get user by clerk_id
    user = await get_user_by_clerk_id(db_session, "test_clerk_id")
    
    # Check user was found
    assert user is not None
    assert user.clerk_id == "test_clerk_id"
    assert user.email == "test@example.com"
    
    # Try to get non-existent user
    user = await get_user_by_clerk_id(db_session, "non_existent_clerk_id")
    assert user is None

@pytest.mark.asyncio
async def test_get_user_by_email(db_session):
    # Create test user
    db_user = User(
        clerk_id="test_clerk_id",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    
    # Get user by email
    user = await get_user_by_email(db_session, "test@example.com")
    
    # Check user was found
    assert user is not None
    assert user.clerk_id == "test_clerk_id"
    assert user.email == "test@example.com"
    
    # Try to get non-existent user
    user = await get_user_by_email(db_session, "non_existent@example.com")
    assert user is None

@pytest.mark.asyncio
async def test_get_credit_balance(db_session):
    # Create test user
    db_user = User(
        clerk_id="test_clerk_id",
        email="test@example.com",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    
    # Create credit balance
    db_credit_balance = CreditBalance(
        user_id=db_user.id,
        balance=10,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db_session.add(db_credit_balance)
    db_session.commit()
    db_session.refresh(db_credit_balance)
    
    # Get credit balance
    credit_balance = await get_credit_balance(db_session, db_user.id)
    
    # Check credit balance was found
    assert credit_balance is not None
    assert credit_balance.user_id == db_user.id
    assert credit_balance.balance == 10
    
    # Try to get non-existent credit balance
    credit_balance = await get_credit_balance(db_session, 999)
    assert credit_balance is None
