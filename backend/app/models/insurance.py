from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class InsurancePolicyType(str, enum.Enum):
    LIFE = "Life Insurance"
    HEALTH = "Health Insurance"
    MOTOR = "Motor Insurance"
    HOME = "Home Insurance"
    TRAVEL = "Travel Insurance"
    OTHER = "Other"

class PremiumFrequency(str, enum.Enum):
    MONTHLY = "Monthly"
    QUARTERLY = "Quarterly"
    HALF_YEARLY = "Half Yearly"
    YEARLY = "Yearly"

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    policy_number = Column(String, nullable=False)
    policy_type = Column(Enum(InsurancePolicyType), nullable=False)
    insurance_company = Column(String, nullable=False)
    premium_amount = Column(Integer, nullable=False)  # Store as cents
    premium_frequency = Column(Enum(PremiumFrequency), nullable=False)
    sum_assured = Column(Integer)  # Store as cents
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    next_premium_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    description = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="insurance_policies")
    documents = relationship("InsuranceDocument", back_populates="policy", cascade="all, delete-orphan")
    claims = relationship("InsuranceClaim", back_populates="policy", cascade="all, delete-orphan")

class InsuranceDocument(Base):
    __tablename__ = "insurance_documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    policy_id = Column(String, ForeignKey("insurance_policies.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String)
    file_data = Column(Text)  # Base64 encoded
    document_type = Column(String, nullable=False)  # "Policy Document", "Premium Receipt", etc.
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="insurance_documents")
    policy = relationship("InsurancePolicy", back_populates="documents")

class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    policy_id = Column(String, ForeignKey("insurance_policies.id"), nullable=False)
    claim_number = Column(String, nullable=False)
    claim_amount = Column(Integer, nullable=False)  # Store as cents
    approved_amount = Column(Integer)  # Store as cents
    claim_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False)  # "pending", "approved", "rejected"
    description = Column(Text, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="insurance_claims")
    policy = relationship("InsurancePolicy", back_populates="claims")
