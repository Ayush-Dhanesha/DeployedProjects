# Git and Vercel Deployment Guide

This document provides step-by-step instructions for pushing the RecieptIO project to Git and deploying it to Vercel.

## Git Setup and Push

### 1. Initialize Git Repository (if not already done)
```bash
git init
```

### 2. Add All Files to Git
```bash
git add .
```

### 3. Commit Changes
```bash
git commit -m "Complete AI analysis system with fault-tolerance and direct API"
```

### 4. Add Remote Repository
```bash
# Replace with your actual GitHub/GitLab repository URL
git remote add origin https://github.com/yourusername/reciepttracker.git
```

### 5. Push to Remote
```bash
git push -u origin main
```

## Vercel Deployment

### 1. Install Vercel CLI (optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel CLI
```bash
vercel
```

### 3. Alternative: Deploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: .next

### 4. Environment Variables
Add these environment variables in the Vercel dashboard:
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `INNGEST_SIGNING_KEY`
- `INNGEST_EVENT_KEY`
- `SCHEMATIC_API_KEY`
- `NEXT_PUBLIC_SCHEMATIC_KEY`
- `NEXT_PUBLIC_SCHEMATIC_CUSTOMEER_PORTAL_COMPONENT_ID`
- `GOOGLE_API_KEY` / `GEMINI_API_KEY`

### 5. Deploy
Click "Deploy" to start the deployment process.

### 6. Verify Deployment
Once deployed, Vercel will provide a URL to access your application. Verify that:
- Authentication works correctly
- Receipt uploading functions properly
- AI analysis works with both direct and fallback approaches

### 7. Custom Domain (Optional)
1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Troubleshooting Deployment Issues

### Common Issues

**Build Failures**
- Check build logs for specific errors
- Ensure all dependencies are properly installed
- Verify environment variables are correctly set

**API Route Errors**
- Check serverless function logs in Vercel dashboard
- Verify API keys are correctly configured
- Test endpoints with proper request format

**Authentication Issues**
- Ensure Clerk domains include your Vercel deployment URL
- Check JWT issuer configuration
- Verify redirect URLs are properly set

**Database Connection Problems**
- Confirm Convex deployment is accessible
- Check network rules allow connections
- Verify database credentials are correct

## Continuous Integration

Set up automatic deployments by connecting your Git repository to Vercel:
1. Configure Vercel GitHub integration
2. Enable automatic deployments for the main branch
3. Set up preview deployments for pull requests

This ensures your production environment stays in sync with your codebase as you make improvements and fix issues.
