# ✅ Railway Deployment Checklist

## Pre-Deployment Verification

### ✓ Backend Configuration
- [x] Procfile created (`web: node server.js`)
- [x] CORS configured for production (`FRONTEND_URL` environment variable)
- [x] Environment variables template (`.env.example`)
- [x] MongoDB connection using `process.env.MONGO_URI`
- [x] JWT secret using `process.env.JWT_SECRET`
- [x] PORT configuration with fallback (`process.env.PORT || 5000`)

### ✓ Frontend Configuration
- [x] API URL configuration (`src/config.js`)
- [x] All API calls use `API_URL` from config (no hardcoded URLs)
- [x] Environment variable support (`REACT_APP_API_URL`)
- [x] Development environment file (`.env.development`)
- [x] Production environment file (`.env.production`)
- [x] Environment example file (`.env.example`)

### ✓ Project Files
- [x] .gitignore created (excludes node_modules, .env files)
- [x] Deployment documentation (RAILWAY_DEPLOYMENT.md)
- [x] Quick start guide (QUICKSTART.md)
- [x] Package.json scripts configured

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Railway deployment ready"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy Backend to Railway

#### A. Create Project
1. Visit https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

#### B. Configure Service
**Settings Tab:**
- Root Directory: `backend`
- Start Command: `node server.js` (auto-detected)
- Watch Paths: `backend/**`

**Variables Tab - Add these:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Networking Tab:**
- Click "Generate Domain"
- Copy the generated URL (e.g., `https://employee-attendance-production.up.railway.app`)

### 3. Deploy Frontend to Vercel

#### A. Create Project
1. Visit https://vercel.com
2. Click "New Project"
3. Import from GitHub
4. Select your repository

#### B. Configure Project
**Framework Preset:** Create React App
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `build`

**Environment Variables:**
```
REACT_APP_API_URL=https://your-backend.railway.app
```
(Use Railway URL from step 2B)

#### C. Deploy
- Click "Deploy"
- Wait for deployment to complete
- Copy your Vercel URL (e.g., `https://employee-attendance.vercel.app`)

### 4. Update Backend CORS
1. Go to Railway dashboard
2. Select your backend service
3. Go to Variables tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://employee-attendance.vercel.app
   ```
   (Use Vercel URL from step 3C)

### 5. MongoDB Atlas Configuration
1. Go to https://cloud.mongodb.com
2. Navigate to "Network Access"
3. Click "Add IP Address"
4. Choose "Allow Access from Anywhere" (0.0.0.0/0)
5. Confirm

### 6. Create Super Admin

**Option A: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run script
railway run npm run create-super-admin
```

**Option B: Railway Dashboard**
1. Go to your service in Railway
2. Click on "Deployments"
3. Click on latest deployment
4. Click "View Logs"
5. Note: You may need to add admin manually via MongoDB Atlas

## Post-Deployment Verification

### Test Checklist
- [ ] Visit Vercel URL - site loads correctly
- [ ] Login page displays properly
- [ ] Can login with super admin credentials
- [ ] Dashboard loads after login
- [ ] API calls work (check browser console for errors)
- [ ] User management functions work
- [ ] Attendance check-in/out works
- [ ] No CORS errors in console

### Troubleshooting

#### Backend Issues
**Check Railway Logs:**
1. Go to Railway dashboard
2. Click your service
3. Click "View Logs"
4. Look for errors

**Common Issues:**
- MongoDB connection error → Check `MONGO_URI` and whitelist IPs
- Port binding error → Railway auto-assigns ports (should work)
- Module not found → Check package.json dependencies

#### Frontend Issues
**Check Vercel Logs:**
1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click on latest deployment
5. View build logs

**Common Issues:**
- API calls failing → Check `REACT_APP_API_URL` environment variable
- CORS errors → Verify `FRONTEND_URL` in Railway backend
- 404 errors → Check SPA routing (may need vercel.json for React Router)

#### CORS Errors
If you see CORS errors:
1. Verify `FRONTEND_URL` matches your Vercel URL exactly
2. Make sure it includes `https://` (no trailing slash)
3. Redeploy backend after changing environment variables

## Environment Variables Reference

### Backend (Railway)
| Variable | Example | Description |
|----------|---------|-------------|
| MONGO_URI | mongodb+srv://user:pass@cluster.mongodb.net/attendance | MongoDB connection string |
| JWT_SECRET | your_secret_key_32_chars_min | JWT signing secret |
| NODE_ENV | production | Environment mode |
| FRONTEND_URL | https://your-app.vercel.app | Frontend URL for CORS |
| PORT | (auto-assigned) | Server port (Railway sets this) |

### Frontend (Vercel)
| Variable | Example | Description |
|----------|---------|-------------|
| REACT_APP_API_URL | https://your-backend.railway.app | Backend API URL |

## Cost Monitoring

### Railway (Backend)
- **Free Tier:** $5/month in credits
- **Typical Usage:** $3-5/month for basic MERN app
- **Monitor:** Railway Dashboard → Usage tab

### Vercel (Frontend)
- **Free Tier:** 100GB bandwidth/month
- **Unlimited** deployments
- **Monitor:** Vercel Dashboard → Analytics

## Updates & Maintenance

### Updating Code
Both platforms auto-deploy on Git push:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Railway and Vercel will automatically rebuild and deploy.

### Viewing Live Logs
**Railway:**
- Dashboard → Your Service → View Logs

**Vercel:**
- Dashboard → Your Project → Functions (for serverless logs)

## Security Checklist
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Environment variables never committed to Git
- [ ] CORS restricted to your frontend URL only
- [ ] HTTPS enabled (automatic on both platforms)

## Support Resources
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

**Deployment Status:** ✅ Ready for Railway
**Estimated Setup Time:** 15-20 minutes
**Monthly Cost:** ~$3-5 (within Railway's $5 free tier)
