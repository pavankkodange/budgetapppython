from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey  # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import relationship  # pyright: ignore[reportMissingImports]
from sqlalchemy.sql import func  # pyright: ignore[reportMissingImports]
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tax_deductions = relationship("TaxDeduction", back_populates="user")
    investment_assets = relationship("InvestmentAsset", back_populates="user")
    investments = relationship("Investment", back_populates="user")
    investment_transactions = relationship("InvestmentTransaction", back_populates="user")
    portfolios = relationship("Portfolio", back_populates="user")
    investment_goals = relationship("InvestmentGoal", back_populates="user")
    policy_documents = relationship("PolicyDocument", back_populates="user")
    assets = relationship("Asset", back_populates="user")
    asset_documents = relationship("AssetDocument", back_populates="user")
    maintenance_records = relationship("MaintenanceRecord", back_populates="user")
    maintenance_documents = relationship("MaintenanceDocument", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    income_sources = relationship("IncomeSource", back_populates="user")
    incomes = relationship("Income", back_populates="user")
    monthly_income_summaries = relationship("MonthlyIncomeSummary", back_populates="user")
    insurance_policies = relationship("InsurancePolicy", back_populates="user")
    insurance_documents = relationship("InsuranceDocument", back_populates="user")
    insurance_claims = relationship("InsuranceClaim", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    address_line_1 = Column(String)
    address_line_2 = Column(String)
    city = Column(String)
    state = Column(String)
    pincode = Column(String)
    country = Column(String)
    date_of_birth = Column(DateTime(timezone=True))
    profile_picture_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User")
