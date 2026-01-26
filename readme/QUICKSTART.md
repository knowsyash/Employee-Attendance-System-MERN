# 🚀 RAILWAY DEPLOYMENT QUICKSTART

## Step 1: GitHub Setup
```bash
git init
git add .
git commit -m "Railway deployment ready"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 2: Backend on Railway
1. Go to [Railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repository
3. **Settings**:
   - Root Directory: `backend`
   - Start Command: `node server.js`
   - Watch Paths: `backend/**`

4. **Environment Variables** (Add these in Railway):
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_32_characters
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Generate Domain**: Settings → Networking → Generate Domain
6. Copy your Railway URL (e.g., `https://your-app.railway.app`)

## Step 3: Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) → New Project → Import from GitHub
2. **Settings**:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   ```
   (Use Railway URL from Step 2)

4. Deploy → Copy Vercel URL

## Step 4: Update Backend CORS
1. Go back to Railway → Your backend service
2. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

## Step 5: Create Super Admin
After deployment:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run super admin script
railway run npm run create-super-admin
```

## ✅ Done!
Visit your Vercel URL and login with super admin credentials.

---

**Cost**: ~$3-5/month on Railway's $5 free tier
**No Sleep Time**: Apps stay active 24/7
