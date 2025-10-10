from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user_id

router = APIRouter()

@router.get("/")
async def get_investments(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all investments for the current user."""
    # TODO: Implement investment retrieval
    return {"message": "Investments endpoint - TODO"}

@router.post("/")
async def create_investment(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new investment."""
    # TODO: Implement investment creation
    return {"message": "Create investment endpoint - TODO"}
