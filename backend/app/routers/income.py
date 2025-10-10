from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user_id

router = APIRouter()

@router.get("/")
async def get_income(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all income records for the current user."""
    # TODO: Implement income retrieval
    return {"message": "Income endpoint - TODO"}

@router.post("/")
async def create_income(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new income record."""
    # TODO: Implement income creation
    return {"message": "Create income endpoint - TODO"}
