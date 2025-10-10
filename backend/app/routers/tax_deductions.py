from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.core.security import get_current_user_id
from app.schemas.tax_deduction import TaxDeduction, TaxDeductionCreate, TaxDeductionUpdate, DocumentAttachment
from app.models.tax_deduction import TaxDeduction as TaxDeductionModel, DocumentAttachment as DocumentAttachmentModel

router = APIRouter()

@router.get("/", response_model=List[TaxDeduction])
async def get_tax_deductions(
    skip: int = 0,
    limit: int = 100,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all tax deductions for the current user."""
    deductions = db.query(TaxDeductionModel).filter(
        TaxDeductionModel.user_id == current_user_id
    ).offset(skip).limit(limit).all()
    return deductions

@router.get("/{deduction_id}", response_model=TaxDeduction)
async def get_tax_deduction(
    deduction_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a specific tax deduction."""
    deduction = db.query(TaxDeductionModel).filter(
        TaxDeductionModel.id == deduction_id,
        TaxDeductionModel.user_id == current_user_id
    ).first()
    
    if not deduction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax deduction not found"
        )
    
    return deduction

@router.post("/", response_model=TaxDeduction)
async def create_tax_deduction(
    deduction_data: TaxDeductionCreate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new tax deduction."""
    deduction = TaxDeductionModel(
        id=str(uuid.uuid4()),
        user_id=current_user_id,
        year=deduction_data.year,
        deduction_type=deduction_data.deduction_type,
        amount=deduction_data.amount,
        description=deduction_data.description
    )
    
    db.add(deduction)
    
    # Add attachments if any
    if deduction_data.attachments:
        for attachment_data in deduction_data.attachments:
            attachment = DocumentAttachmentModel(
                id=str(uuid.uuid4()),
                tax_deduction_id=deduction.id,
                file_name=attachment_data.file_name,
                file_type=attachment_data.file_type,
                file_size=attachment_data.file_size,
                file_url=attachment_data.file_url,
                file_data=attachment_data.file_data,
                document_type=attachment_data.document_type
            )
            db.add(attachment)
    
    db.commit()
    db.refresh(deduction)
    return deduction

@router.put("/{deduction_id}", response_model=TaxDeduction)
async def update_tax_deduction(
    deduction_id: str,
    deduction_data: TaxDeductionUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update a tax deduction."""
    deduction = db.query(TaxDeductionModel).filter(
        TaxDeductionModel.id == deduction_id,
        TaxDeductionModel.user_id == current_user_id
    ).first()
    
    if not deduction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax deduction not found"
        )
    
    # Update fields if provided
    update_data = deduction_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deduction, field, value)
    
    db.commit()
    db.refresh(deduction)
    return deduction

@router.delete("/{deduction_id}")
async def delete_tax_deduction(
    deduction_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a tax deduction."""
    deduction = db.query(TaxDeductionModel).filter(
        TaxDeductionModel.id == deduction_id,
        TaxDeductionModel.user_id == current_user_id
    ).first()
    
    if not deduction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tax deduction not found"
        )
    
    db.delete(deduction)
    db.commit()
    
    return {"message": "Tax deduction deleted successfully"}
