from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn

from app.database import engine, Base
from app.routers import auth, tax_deductions, investments, assets, expenses, income, insurance
from app.core.config import settings

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Budget App API",
    description="A comprehensive budget tracking and financial management API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tax_deductions.router, prefix="/api/tax-deductions", tags=["tax-deductions"])
app.include_router(investments.router, prefix="/api/investments", tags=["investments"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(income.router, prefix="/api/income", tags=["income"])
app.include_router(insurance.router, prefix="/api/insurance", tags=["insurance"])

@app.get("/")
async def root():
    return {"message": "Budget App API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
