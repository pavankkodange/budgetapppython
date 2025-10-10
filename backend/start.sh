#!/bin/bash

# Budget App Backend Startup Script

echo "🚀 Starting Budget App Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing!"
    echo "   - Set your DATABASE_URL"
    echo "   - Set your SECRET_KEY"
    exit 1
fi

# Check if database is accessible
echo "🗄️  Checking database connection..."
python -c "
from app.database import engine
try:
    engine.connect()
    print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('Please check your DATABASE_URL in .env file')
    exit(1)
"

# Run database migrations
echo "🔄 Running database migrations..."
alembic upgrade head

# Start the server
echo "🌟 Starting FastAPI server..."
echo "📖 API docs available at: http://localhost:8000/docs"
echo "🔄 Server will auto-reload on code changes"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
