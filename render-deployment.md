# Render Backend Deployment Guide

## Step 1: Prepare Your MongoDB Database
1. **Create MongoDB Atlas Account** (if you don't have one):
   - Go to https://mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/)

## Step 2: Deploy Backend to Render

### Repository Structure:
```
all-in-one-society/          ← GitHub Repository
├── backend/                 ← Set this as Root Directory in Render
│   ├── server.js
│   ├── package.json
│   └── ...
├── frontend/                ← Set this as Root Directory in Vercel  
│   ├── src/
│   ├── package.json
│   └── ...
└── other files
```

1. **Go to Render.com** and sign up/login
2. **Create New Web Service**:
   - Connect your GitHub repository: `Amansingh1602/all-in-one-society`
   - **Root Directory**: `backend` (Important: This tells Render to use the backend folder as the project root)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables in Render**:
   ```
   MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/society_m?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-random-string-here
   NODE_ENV=production
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

## Step 3: Update Frontend Configuration
1. **Update frontend/.env**:
   ```
   VITE_API_URL=https://your-render-app-name.onrender.com/api
   ```

2. **Deploy Frontend to Vercel**:
   - Import GitHub repository: `Amansingh1602/all-in-one-society`
   - **CRITICAL**: In project settings, set Root Directory to `frontend`
   - Framework: Vite (should auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable in Vercel dashboard:
     ```
     VITE_API_URL=https://your-render-app-name.onrender.com/api
     ```

## Step 4: Update CORS in Backend
After deployment, update the CORS origin in `backend/server.js`:
- Replace `https://your-vercel-app.vercel.app` with your actual Vercel URL
- Set `FRONTEND_URL` environment variable in Render to your Vercel URL

## Important Notes:
- Render free tier may have cold starts (app sleeps after inactivity)
- Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Render's IP ranges
- Test your API endpoints: `https://your-render-app.onrender.com/api/test`