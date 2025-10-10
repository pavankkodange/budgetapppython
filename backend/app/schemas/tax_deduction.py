from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentAttachmentBase(BaseModel):
    file_name: str
    file_type: str
    file_size: int
    document_type: str
    file_url: Optional[str] = None
    file_data: Optional[str] = None

class DocumentAttachmentCreate(DocumentAttachmentBase):
    pass

class DocumentAttachment(DocumentAttachmentBase):
    id: str
    upload_date: datetime

    class Config:
        from_attributes = True

class TaxDeductionBase(BaseModel):
    year: int
    deduction_type: str
    amount: int  # In cents
    description: Optional[str] = None

class TaxDeductionCreate(TaxDeductionBase):
    attachments: Optional[List[DocumentAttachmentCreate]] = []

class TaxDeductionUpdate(BaseModel):
    year: Optional[int] = None
    deduction_type: Optional[str] = None
    amount: Optional[int] = None
    description: Optional[str] = None

class TaxDeduction(TaxDeductionBase):
    id: str
    created_at: datetime
    attachments: Optional[List[DocumentAttachment]] = []

    class Config:
        from_attributes = True
