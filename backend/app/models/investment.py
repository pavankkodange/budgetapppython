from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class InvestmentAssetType(str, enum.Enum):
    MUTUAL_FUND = "Mutual Fund"
    EMERGENCY_FUND = "Emergency Fund"
    SAVINGS_BANK_DEPOSIT = "Savings Bank Deposit"
    GOLD = "Gold"
    STOCKS = "Stocks"
    CRYPTOCURRENCY = "Cryptocurrency"

class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"

class InvestmentType(str, enum.Enum):
    SIP = "SIP"
    LUMPSUM = "Lumpsum"
    RECURRING_DEPOSIT = "Recurring Deposit"
    ONE_TIME_PURCHASE = "One-time Purchase"

class InvestmentAsset(Base):
    __tablename__ = "investment_assets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(InvestmentAssetType), nullable=False)
    category = Column(String)
    current_price = Column(Integer, nullable=False)  # Store as cents
    risk_level = Column(Enum(RiskLevel), nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Optional fields for specific asset types
    symbol = Column(String)
    fund_house = Column(String)
    scheme_code = Column(String)
    expense_ratio = Column(Float)  # Percentage
    interest_rate = Column(Float)  # Percentage
    maturity_date = Column(DateTime(timezone=True))
    purity = Column(String)  # For gold
    exchange = Column(String)  # For stocks/crypto
    
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="investment_assets")
    investments = relationship("Investment", back_populates="investment_asset")
    documents = relationship("PolicyDocument", back_populates="investment_asset")

class Investment(Base):
    __tablename__ = "investments"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    asset_id = Column(String, ForeignKey("investment_assets.id"), nullable=False)
    investment_type = Column(Enum(InvestmentType), nullable=False)
    amount = Column(Integer, nullable=False)  # Store as cents
    units = Column(Float, nullable=False)
    purchase_price = Column(Integer, nullable=False)  # Store as cents
    purchase_date = Column(DateTime(timezone=True), nullable=False)
    sip_date = Column(Integer)  # Day of month for SIP
    maturity_date = Column(DateTime(timezone=True))
    lock_in_period = Column(Integer)  # In months
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="investments")
    investment_asset = relationship("InvestmentAsset", back_populates="investments")
    transactions = relationship("InvestmentTransaction", back_populates="investment")

class InvestmentTransaction(Base):
    __tablename__ = "investment_transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    investment_id = Column(String, ForeignKey("investments.id"), nullable=False)
    transaction_type = Column(String, nullable=False)  # "buy", "sell", "dividend", etc.
    amount = Column(Integer, nullable=False)  # Store as cents
    units = Column(Float, nullable=False)
    price_per_unit = Column(Integer, nullable=False)  # Store as cents
    date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="investment_transactions")
    investment = relationship("Investment", back_populates="transactions")

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    target_allocation = Column(Text)  # JSON string
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="portfolios")
    investments = relationship("Investment", secondary="portfolio_investments")

class PortfolioInvestment(Base):
    __tablename__ = "portfolio_investments"

    portfolio_id = Column(String, ForeignKey("portfolios.id"), primary_key=True)
    investment_id = Column(String, ForeignKey("investments.id"), primary_key=True)
    weight = Column(Float)  # Allocation weight in portfolio

class InvestmentGoal(Base):
    __tablename__ = "investment_goals"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Integer, nullable=False)  # Store as cents
    current_amount = Column(Integer, default=0)  # Store as cents
    target_date = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="investment_goals")

class PolicyDocument(Base):
    __tablename__ = "policy_documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    asset_id = Column(String, ForeignKey("investment_assets.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String)
    file_data = Column(Text)  # Base64 encoded
    document_type = Column(String, nullable=False)  # "Policy Document", "Premium Receipt", etc.
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="policy_documents")
    investment_asset = relationship("InvestmentAsset", back_populates="documents")
