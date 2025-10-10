# Budget App Backend

A Python FastAPI backend for the budget tracking application.

## Features

- **Authentication**: JWT-based authentication system
- **Financial Data Management**: 
  - Tax deductions tracking
  - Investment portfolio management
  - Asset management
  - Expense tracking
  - Income management
  - Insurance policy management
- **File Upload**: Document attachment support
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful API with FastAPI

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL
- pip

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Set up the database:
```bash
# Create PostgreSQL database
createdb budgetapp

# Run migrations
alembic upgrade head
```

6. Start the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost/budgetapp` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-here` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration time | `30` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:5173` |
| `UPLOAD_DIR` | File upload directory | `uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Tax Deductions
- `GET /api/tax-deductions/` - Get all tax deductions
- `POST /api/tax-deductions/` - Create tax deduction
- `GET /api/tax-deductions/{id}` - Get specific tax deduction
- `PUT /api/tax-deductions/{id}` - Update tax deduction
- `DELETE /api/tax-deductions/{id}` - Delete tax deduction

### Investments (TODO)
- `GET /api/investments/` - Get all investments
- `POST /api/investments/` - Create investment

### Assets (TODO)
- `GET /api/assets/` - Get all assets
- `POST /api/assets/` - Create asset

### Expenses (TODO)
- `GET /api/expenses/` - Get all expenses
- `POST /api/expenses/` - Create expense

### Income (TODO)
- `GET /api/income/` - Get all income records
- `POST /api/income/` - Create income record

### Insurance (TODO)
- `GET /api/insurance/` - Get all insurance policies
- `POST /api/insurance/` - Create insurance policy

## Database Schema

The application uses the following main entities:
- Users and User Profiles
- Tax Deductions with Document Attachments
- Investment Assets, Investments, Transactions, Portfolios, Goals
- Assets with Maintenance Records and Documents
- Expenses with Categories and Recurring Options
- Income Sources and Income Records
- Insurance Policies with Claims and Documents

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migrations
alembic downgrade -1
```

### Code Style
The project uses standard Python formatting. Consider using:
- `black` for code formatting
- `flake8` for linting
- `mypy` for type checking
