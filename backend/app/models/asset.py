from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class AssetCategory(str, enum.Enum):
    REAL_ESTATE = "Real Estate"
    VEHICLE = "Vehicle"
    ELECTRONICS = "Electronics"
    FURNITURE = "Furniture"
    JEWELRY = "Jewelry"
    ART = "Art"
    OTHER = "Other"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(Enum(AssetCategory), nullable=False)
    purchase_price = Column(Integer, nullable=False)  # Store as cents
    current_value = Column(Integer, nullable=False)  # Store as cents
    purchase_date = Column(DateTime(timezone=True), nullable=False)
    warranty_end_date = Column(DateTime(timezone=True))
    description = Column(Text)
    location = Column(String)  # For real estate
    brand = Column(String)
    model = Column(String)
    serial_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="assets")
    documents = relationship("AssetDocument", back_populates="asset", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset", cascade="all, delete-orphan")

class AssetDocument(Base):
    __tablename__ = "asset_documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String)
    file_data = Column(Text)  # Base64 encoded
    document_type = Column(String, nullable=False)  # "Purchase Receipt", "Warranty", etc.
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="asset_documents")
    asset = relationship("Asset", back_populates="documents")

class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    description = Column(Text, nullable=False)
    cost = Column(Integer)  # Store as cents
    service_provider = Column(String)
    next_maintenance_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="maintenance_records")
    asset = relationship("Asset", back_populates="maintenance_records")
    documents = relationship("MaintenanceDocument", back_populates="maintenance_record", cascade="all, delete-orphan")

class MaintenanceDocument(Base):
    __tablename__ = "maintenance_documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    maintenance_record_id = Column(String, ForeignKey("maintenance_records.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_url = Column(String)
    file_data = Column(Text)  # Base64 encoded
    document_type = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="maintenance_documents")
    maintenance_record = relationship("MaintenanceRecord", back_populates="documents")
