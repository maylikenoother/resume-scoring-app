from datetime import datetime
from typing import List, Optional, Union
from enum import Enum
from pydantic import BaseModel, EmailStr, Field, validator

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class TransactionType(str, Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    REFUND = "refund"
    BONUS = "bonus"

class ReviewStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    
class UserCreate(UserBase):
    clerk_user_id: str
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

class UserInDBBase(UserBase):
    id: int
    clerk_user_id: str
    is_active: bool
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    sub: Optional[str] = None

class CreditBalanceBase(BaseModel):
    balance: int

class CreditBalance(CreditBalanceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CreditTransactionBase(BaseModel):
    amount: int
    description: str
    transaction_type: TransactionType

class CreditTransaction(CreditTransactionBase):
    id: int
    credit_balance_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    pass

class ReviewCreate(ReviewBase):
    filename: str = Field(..., description="Original filename")
    content: str = Field(..., description="CV content")

class ReviewUpdate(ReviewBase):
    review_result: Optional[str] = None
    status: Optional[ReviewStatus] = None
    score: Optional[float] = None

class Review(ReviewBase):
    id: int
    user_id: int
    filename: str
    content: str
    content_type: Optional[str] = None
    file_size: Optional[int] = None
    review_result: Optional[str] = None
    status: ReviewStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    score: Optional[float] = None
    
    class Config:
        from_attributes = True

class ReviewList(BaseModel):
    reviews: List[Review]

class NotificationBase(BaseModel):
    message: str

class NotificationCreate(NotificationBase):
    user_id: int
    review_id: Optional[int] = None

class Notification(NotificationBase):
    id: int
    user_id: int
    review_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationList(BaseModel):
    notifications: List[Notification]

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Union[dict, list]] = None
    
    @classmethod
    def success_response(cls, message: str, data: Optional[Union[dict, list]] = None) -> "ApiResponse":
        return cls(success=True, message=message, data=data)
    
    @classmethod
    def error_response(cls, message: str) -> "ApiResponse":
        return cls(success=False, message=message)