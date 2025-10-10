from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user_id

router = APIRouter()

@router.get("/")
async def get_insurance_policies(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all insurance policies for the current user."""
    # TODO: Implement insurance policy retrieval
    return {"message": "Insurance policies endpoint - TODO"}

@router.post("/")
async def create_insurance_policy(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new insurance policy."""
    # TODO: Implement insurance policy creation
    return {"message": "Create insurance policy endpoint - TODO"}
