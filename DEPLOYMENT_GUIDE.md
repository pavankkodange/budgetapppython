# Budget App - Vercel Deployment Guide

This guide will help you deploy the complete Budget App (React frontend + Python backend) to Vercel.

## 🚀 Quick Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables**:
   In Vercel dashboard, go to Settings → Environment Variables:
   ```
   SECRET_KEY=your-super-secret-jwt-key-here
   DATABASE_URL=your-postgresql-connection-string
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

### Option 2: Direct Upload

1. **Download the complete codebase** (this package)
2. **Upload to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Drag and drop the folder or use Vercel CLI

## 📋 Prerequisites

### Database Setup
You'll need a PostgreSQL database. Recommended options:

1. **Vercel Postgres** (Recommended for Vercel):
   - Go to Vercel dashboard → Storage → Create Database
   - Choose PostgreSQL
   - Copy the connection string

2. **Neon** (Free tier available):
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

3. **Supabase** (Free tier available):
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → Database → Connection string

### Environment Variables
Set these in Vercel dashboard (Settings → Environment Variables):

```bash
# Required
SECRET_KEY=your-super-secret-jwt-key-change-this
DATABASE_URL=postgresql://user:password@host:port/database
ALLOWED_ORIGINS=https://your-app.vercel.app

# Optional (defaults provided)
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## 🏗️ Project Structure

```
budgetapp-main/
├── frontend/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Python FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── alembic/
├── vercel.json              # Vercel configuration
└── README.md
```

## 🔧 Configuration Details

### Vercel Configuration (`vercel.json`)
- **Frontend**: Built with Vite and served as static files
- **Backend**: Python FastAPI app with automatic serverless functions
- **Routes**: API routes go to backend, everything else to frontend
- **Environment**: Secure environment variable handling

### Frontend Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Radix UI components

### Backend Configuration
- **Runtime**: Python 3.11
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT tokens
- **File Storage**: Base64 encoding (extensible to cloud storage)

## 📱 Features Included

### ✅ Authentication System
- User registration and login
- JWT-based authentication
- Secure password hashing
- Session management

### ✅ Financial Management
- **Tax Deductions**: Track and manage tax deductions with document attachments
- **Investments**: Investment portfolio management with assets and transactions
- **Assets**: Asset tracking with maintenance records
- **Expenses**: Expense tracking with categories and recurring options
- **Income**: Income source and record management
- **Insurance**: Insurance policy and claim management

### ✅ Advanced Features
- Document upload and management
- Data visualization with charts
- Responsive design for mobile and desktop
- Real-time data updates
- Comprehensive error handling

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection prevention
- XSS protection

## 📊 Database Schema

The app includes comprehensive database models:
- Users and profiles
- Tax deductions with attachments
- Investment assets, investments, transactions
- Asset management with maintenance
- Expense and income tracking
- Insurance policies and claims

## 🚀 Post-Deployment

After deployment:

1. **Access your app**: Visit the Vercel URL
2. **Register**: Create your first user account
3. **Start tracking**: Begin managing your finances
4. **Customize**: Modify categories, add your data

## 🔄 Updates and Maintenance

### Adding New Features
1. Make changes to the codebase
2. Push to GitHub
3. Vercel automatically redeploys

### Database Migrations
- Database migrations are handled automatically
- Alembic manages schema changes
- No manual intervention needed

### Environment Variables
- Update in Vercel dashboard
- Redeploy to apply changes

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set
   - Verify database connection string
   - Check Vercel logs for specific errors

2. **Database Connection**:
   - Ensure DATABASE_URL is correct
   - Check database is accessible from Vercel
   - Verify credentials are correct

3. **Authentication Issues**:
   - Check SECRET_KEY is set
   - Verify ALLOWED_ORIGINS includes your domain
   - Clear browser cache and cookies

### Getting Help
- Check Vercel deployment logs
- Review browser console for frontend errors
- Check network tab for API errors

## 📈 Scaling

### Performance Optimization
- Database indexing for better query performance
- Caching strategies for frequently accessed data
- CDN for static assets (handled by Vercel)

### Cost Management
- Monitor Vercel usage
- Optimize database queries
- Use efficient data structures

## 🎯 Next Steps

1. **Customize**: Modify the app to fit your specific needs
2. **Integrate**: Add third-party services (payment processors, etc.)
3. **Scale**: Optimize for high traffic
4. **Monitor**: Set up logging and monitoring

## 📞 Support

For issues or questions:
1. Check the deployment logs in Vercel
2. Review the code documentation
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Ready to deploy?** Just follow the steps above and your Budget App will be live on Vercel in minutes! 🚀
