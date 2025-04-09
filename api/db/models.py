from datetime import datetime
from enum import Enum
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    username: str = Field(index=True)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    credits: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    submissions: List["Submission"] = Relationship(back_populates="user")
    credit_transactions: List["CreditTransaction"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    credits: int
    created_at: datetime


class TokenData(SQLModel):
    email: str
    exp: datetime


class SubmissionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    filename: str
    original_filename: str
    status: SubmissionStatus = Field(default=SubmissionStatus.PENDING)
    score: Optional[float] = None
    feedback: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="submissions")


class SubmissionCreate(SQLModel):
    filename: str
    original_filename: str


class SubmissionRead(SQLModel):
    id: int
    filename: str
    original_filename: str
    status: SubmissionStatus
    score: Optional[float]
    feedback: Optional[str]
    submitted_at: datetime
    completed_at: Optional[datetime]


class CreditTransactionType(str, Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    REFUND = "refund"
    BONUS = "bonus"


class CreditTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    amount: int
    type: CreditTransactionType
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="credit_transactions")


class CreditTransactionCreate(SQLModel):
    amount: int
    type: CreditTransactionType
    description: str


class CreditTransactionRead(SQLModel):
    id: int
    amount: int
    type: CreditTransactionType
    description: str
    created_at: datetime