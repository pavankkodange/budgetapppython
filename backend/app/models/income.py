from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class IncomeSourceType(str, enum.Enum):
    SALARY = "Salary"
    FREELANCE = "Freelance"
    BUSINESS = "Business"
    INVESTMENT = "Investment"
    RENTAL = "Rental"
    PENSION = "Pension"
    OTHER = "Other"

class DeductionCategory(str, enum.Enum):
    SECTION_80C = "Section 80C"
    SECTION_80D = "Section 80D"
    SECTION_24 = "Section 24"
    HRA = "HRA"
    LTA = "LTA"
    OTHER = "Other"

class IncomeSource(Base):
    __tablename__ = "income_sources"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(IncomeSourceType), nullable=False)
    deduction_category = Column(Enum(DeductionCategory))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="income_sources")
    incomes = relationship("Income", back_populates="income_source")

class Income(Base):
    __tablename__ = "incomes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    income_source_id = Column(String, ForeignKey("income_sources.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Store as cents
    gross_amount = Column(Integer)  # Store as cents
    net_amount = Column(Integer)  # Store as cents
    date = Column(DateTime(timezone=True), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    description = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="incomes")
    income_source = relationship("IncomeSource", back_populates="incomes")

class MonthlyIncomeSummary(Base):
    __tablename__ = "monthly_income_summaries"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    total_gross_income = Column(Integer, default=0)  # Store as cents
    total_net_income = Column(Integer, default=0)  # Store as cents
    total_deductions = Column(Integer, default=0)  # Store as cents
    income_sources = Column(Text)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="monthly_income_summaries")
