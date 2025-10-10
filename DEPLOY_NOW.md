# 🚀 Deploy to Vercel NOW!

## Quick Steps:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Budget App - Ready for Vercel"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variables:
     ```
     SECRET_KEY=your-super-secret-jwt-key-change-this
     DATABASE_URL=postgresql://user:password@host:port/database
     ALLOWED_ORIGINS=https://your-app.vercel.app
     ```
   - Click Deploy!

3. **Set up Database**:
   - Use Vercel Postgres, Neon, or Supabase
   - Copy the connection string to DATABASE_URL

## That's it! Your app will be live in minutes! 🎉

For detailed instructions, see VERCEL_DEPLOYMENT.md
