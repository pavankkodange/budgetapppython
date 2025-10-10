from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Store as cents
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    is_recurring = Column(Boolean, default=False)
    recurrence_interval = Column(String)  # "monthly", "weekly", etc.
    next_due_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))  # For recurring expenses
    tags = Column(Text)  # JSON string for tags
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="expenses")
