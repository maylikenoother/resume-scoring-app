from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Credit schemas
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
    transaction_type: str

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
    status: Optional[str] = None
    score: Optional[float] = None

class Review(ReviewBase):
    id: int
    user_id: int
    filename: str
    content: str
    review_result: Optional[str] = None
    status: str
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