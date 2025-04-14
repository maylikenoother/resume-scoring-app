from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    clerk_id: str

class UserResponse(UserBase):
    id: int
    clerk_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Credit balance schemas
class CreditBalanceBase(BaseModel):
    balance: int

class CreditBalanceResponse(CreditBalanceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Review schemas
class ReviewBase(BaseModel):
    cv_content: str = Field(..., description="Content of the CV to be reviewed")

class ReviewCreate(ReviewBase):
    cv_filename: str = Field(..., description="Filename of the uploaded CV")

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    cv_filename: str
    review_content: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReviewList(BaseModel):
    reviews: List[ReviewResponse]
    
# Notification schemas
class NotificationBase(BaseModel):
    message: str

class NotificationCreate(NotificationBase):
    user_id: int
    review_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    review_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationList(BaseModel):
    notifications: List[NotificationResponse]

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    clerk_id: Optional[str] = None
