from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class TaxDeduction(Base):
    __tablename__ = "tax_deductions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    year = Column(Integer, nullable=False)
    deduction_type = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)  # Store as cents to avoid floating point issues
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="tax_deductions")
    attachments = relationship("DocumentAttachment", back_populates="tax_deduction", cascade="all, delete-orphan")

class DocumentAttachment(Base):
    __tablename__ = "document_attachments"

    id = Column(String, primary_key=True, index=True)
    tax_deduction_id = Column(String, ForeignKey("tax_deductions.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String)  # For cloud storage
    file_data = Column(Text)  # Base64 encoded file data
    document_type = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    tax_deduction = relationship("TaxDeduction", back_populates="attachments")
