# Railway Deployment Guide

## Overview
This guide will help you deploy the Employee Attendance System MERN application to Railway.app.

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- MongoDB Atlas account (for database)

## Step 1: Prepare Your Repository

1. **Create a GitHub repository** (if not already done)
2. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Railway ready"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Step 2: Deploy Backend to Railway

### A. Create New Project
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will auto-detect it's a Node.js project

### B. Configure Backend Service
1. In Railway dashboard, click on your service
2. Go to **"Variables"** tab
3. Add the following environment variables:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. Go to **"Settings"** tab:
   - **Root Directory**: Set to `backend`
   - **Start Command**: `node server.js` (should auto-detect)
   - **Watch Paths**: `backend/**`

5. Click **"Deploy"** if not auto-deployed

6. Once deployed, go to **"Settings"** > **"Networking"**:
   - Click **"Generate Domain"** to get your public URL
   - Copy this URL (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend to Vercel

### A. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### B. Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```
   (Use the Railway URL from Step 2)

6. Click **"Deploy"**

### C. Update Backend CORS
1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

## Step 4: Create Super Admin

After deployment, create your super admin:

1. **Via Railway CLI**:
   ```bash
   railway run npm run create-super-admin
   ```

2. **Or via Railway Dashboard**:
   - Go to your service
   - Click on **"Deployments"**
   - Click on the latest deployment
   - Open the **"Deploy Logs"**
   - You can run commands using Railway CLI

## Step 5: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Try logging in with super admin credentials
3. Test attendance check-in/out functionality
4. Verify all API calls work correctly

## Environment Variables Summary

### Backend (Railway)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
PORT=5000
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.railway.app
```

## Troubleshooting

### Backend won't start
- Check Railway logs: Go to service > Deployments > View Logs
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check CORS settings in backend (FRONTEND_URL variable)
- Check Railway backend is running (green status)

### MongoDB connection error
- Whitelist all IPs in MongoDB Atlas:
  - Network Access > Add IP Address > Allow Access from Anywhere

### 502 Bad Gateway
- Backend service might be starting up (wait 30-60 seconds)
- Check Railway logs for errors
- Verify start command is `node server.js`

## Cost Monitoring

### Railway
- **Free tier**: $5/month in credits
- Monitor usage in Railway dashboard
- Typical MERN app uses ~$3-5/month

### Vercel
- **Free tier**: 100GB bandwidth, unlimited deployments
- More than enough for small-medium apps

## Updating Your App

### Backend Updates
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Railway will auto-deploy on push.

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel will auto-deploy on push.

## Security Checklist

✅ Strong JWT_SECRET (32+ characters)
✅ MongoDB Atlas network access restricted
✅ Environment variables never committed to Git
✅ CORS configured for specific frontend URL
✅ HTTPS enabled (automatic on Railway/Vercel)

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

**Your app is now live! 🚀**
