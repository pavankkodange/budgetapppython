# 🚀 Vercel Deployment Guide

This guide will help you deploy your Budget App to Vercel in just a few minutes!

## 📋 Prerequisites

1. **GitHub Account**: You'll need to push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database**: Choose one of these options:
   - **Vercel Postgres** (Recommended - integrates perfectly)
   - **Neon** (Free tier available)
   - **Supabase** (Free tier available)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Create a new repository on GitHub**:
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `budget-app` (or any name you prefer)
   - Make it public or private (your choice)

2. **Upload your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Budget App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Set Up Database

#### Option A: Vercel Postgres (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign in and go to your dashboard
3. Click "Storage" → "Create Database"
4. Choose "Postgres"
5. Name it `budget-app-db`
6. Select the free tier
7. **Copy the connection string** (you'll need this)

#### Option B: Neon (Free PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string

#### Option C: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### Step 3: Deploy to Vercel

1. **Import Project**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Click "Import Git Repository"
   - Select your `budget-app` repository
   - Click "Import"

2. **Configure Project**:
   - **Project Name**: `budget-app` (or your preferred name)
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Leave as default
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

3. **Set Environment Variables**:
   Click "Environment Variables" and add:
   ```
   SECRET_KEY = your-super-secret-jwt-key-change-this-in-production
   DATABASE_URL = postgresql://user:password@host:port/database
   ALLOWED_ORIGINS = https://your-app-name.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete (2-3 minutes)
   - Your app will be available at `https://your-app-name.vercel.app`

### Step 4: Initialize Database

After deployment, you need to run database migrations:

1. **Option A: Using Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   # Add DATABASE_URL to .env.local
   cd backend
   alembic upgrade head
   ```

2. **Option B: Using the API**:
   - Visit your deployed app
   - Try to register a user
   - The database will be automatically initialized

## ✅ Verification

1. **Check Frontend**: Visit your Vercel URL
2. **Check Backend**: Visit `https://your-app.vercel.app/docs`
3. **Test Registration**: Create a new user account
4. **Test Features**: Try adding a tax deduction or expense

## 🔧 Environment Variables Reference

### Required Variables
```bash
SECRET_KEY=your-super-secret-jwt-key-change-this
DATABASE_URL=postgresql://user:password@host:port/database
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Optional Variables
```bash
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check that all environment variables are set
   - Verify the DATABASE_URL format
   - Check Vercel deployment logs

2. **Database Connection Error**:
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from Vercel
   - Check database credentials

3. **Authentication Issues**:
   - Verify SECRET_KEY is set
   - Check ALLOWED_ORIGINS includes your domain
   - Clear browser cache

4. **API Not Working**:
   - Check that backend deployed successfully
   - Verify API routes in Vercel dashboard
   - Check network tab in browser dev tools

### Getting Help

1. **Check Logs**:
   - Go to Vercel dashboard → Functions
   - Check function logs for errors

2. **Browser Console**:
   - Open browser dev tools
   - Check console for JavaScript errors
   - Check network tab for API errors

## 📈 Post-Deployment

### Custom Domain (Optional)
1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update ALLOWED_ORIGINS environment variable

### Monitoring
- Vercel provides built-in analytics
- Check function execution logs
- Monitor database performance

### Updates
- Push changes to GitHub
- Vercel automatically redeploys
- No manual intervention needed

## 🎉 Success!

Your Budget App is now live on Vercel! 

- **Frontend**: `https://your-app.vercel.app`
- **API Docs**: `https://your-app.vercel.app/docs`
- **Admin**: Manage in Vercel dashboard

Start tracking your finances today! 💰

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connection
4. Review browser console errors

Happy budgeting! 🚀
