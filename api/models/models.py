from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Float, LargeBinary, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from api.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)  # Added hashed_password field
    is_active = Column(Boolean, default=True)
    role = Column(String, default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    credit_balance = relationship("CreditBalance", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class CreditBalance(Base):
    __tablename__ = "credit_balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    balance = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="credit_balance")
    transactions = relationship("CreditTransaction", back_populates="credit_balance")


class TransactionType(str, enum.Enum):
    PURCHASE = "purchase"
    USAGE = "usage"
    REFUND = "refund"
    BONUS = "bonus"

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    credit_balance_id = Column(Integer, ForeignKey("credit_balances.id", ondelete="CASCADE"))
    amount = Column(Integer)
    description = Column(String)
    transaction_type = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    credit_balance = relationship("CreditBalance", back_populates="transactions")

class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    filename = Column(String)
    file_path = Column(String, nullable=True)
    file_content = Column(LargeBinary, nullable=True)
    content = Column(Text)
    content_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True) 
    review_result = Column(Text, nullable=True) 
    status = Column(String, default=ReviewStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    score = Column(Float, nullable=True) 

    user = relationship("User", back_populates="reviews")
    notifications = relationship("Notification", back_populates="review")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    review_id = Column(Integer, ForeignKey("reviews.id", ondelete="SET NULL"), nullable=True)
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
    review = relationship("Review", back_populates="notifications")