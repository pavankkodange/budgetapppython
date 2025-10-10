from pydantic_settings import BaseSettings  # pyright: ignore[reportMissingImports]
from typing import List
import os
from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]

load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/budgetapp")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "R6Ld1KWM4Rui-rZFNF7wKVxkmbTesjqGd47ZopGSYgY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://*.vercel.app",  # Allow all Vercel deployments
    ]
    
    # File upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [
        "image/jpeg", "image/png", "image/gif",
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()  # Deployment fix: using hardcoded SECRET_KEY
