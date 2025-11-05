# Environment Configuration Workflow

## Overview

ConstructAI uses a hierarchical environment variable loading system that provides flexibility for different environments while maintaining security.

## File Structure

```
ConstructAI/
├── .env                 # Base configuration (committed to git)
├── .env.local          # Local overrides (NOT committed, gitignored)
├── .env.example        # Template for new developers (committed)
└── start.py            # Startup script with env loading
```

## Environment File Priority

Variables are loaded in this order (later files override earlier ones):

1. **`.env`** - Base configuration with placeholders
2. **`.env.local`** - Your actual secrets (NEVER commit this!)

## Setup Instructions

### For New Developers

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values in `.env.local`:**
   - Supabase credentials from your project dashboard
   - Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
   - Add your AI API keys (OpenAI, Google)
   - Configure any optional services

3. **Verify the setup:**
   ```bash
   python start.py
   ```
   The script will validate all required environment variables.

### Required Variables

These MUST be set in `.env.local`:

```bash
# Supabase (from https://app.supabase.com/project/YOUR_PROJECT/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Optional Variables

These enhance functionality but aren't required to run:

```bash
# AI Services
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...

# 3D Service
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
HUNYUAN3D_SERVER_URL=http://localhost:8000

# Real-time Collaboration
NEXT_PUBLIC_COLLABORATION_WS_URL=ws://localhost:3001
```

## How It Works

### 1. Python start.py Loading

The `start.py` script loads environment variables before starting the application:

```python
from dotenv import load_dotenv

# Load .env (base)
load_dotenv(".env", override=False)

# Load .env.local (overrides base)
load_dotenv(".env.local", override=True)
```

**Benefits:**
- ✅ Environment variables available before app starts
- ✅ Validation of required variables before startup
- ✅ Clear error messages if variables are missing
- ✅ Works consistently across all platforms

### 2. Next.js Runtime Loading

Next.js also loads environment variables automatically:

- **Build time:** Variables prefixed with `NEXT_PUBLIC_` are embedded
- **Runtime:** Server-side code can access all variables
- **Client-side:** Only `NEXT_PUBLIC_*` variables are accessible

## Environment-Specific Configurations

### Development (.env.local)
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
```

### Production (Deployment Platform Environment Variables)
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_HUNYUAN3D_URL=https://your-3d-service.com
```

**Note:** For production, set environment variables directly in your deployment platform (Vercel, Railway, etc.) rather than using files.

## Security Best Practices

### ✅ DO:
- ✅ Keep `.env.local` in `.gitignore` (already configured)
- ✅ Use `.env.example` as a template for teammates
- ✅ Commit `.env` with placeholder values
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/staging/production
- ✅ Generate strong `NEXTAUTH_SECRET` values

### ❌ DON'T:
- ❌ NEVER commit `.env.local` to version control
- ❌ Don't use demo/hardcoded passwords in production
- ❌ Don't share secrets via chat/email
- ❌ Don't use the same secrets across environments
- ❌ Don't commit real API keys to git

## Troubleshooting

### "Missing required environment variables"

**Problem:** Required variables not set in `.env.local`

**Solution:**
1. Ensure `.env.local` exists: `ls -la .env.local`
2. Check it has the required variables
3. Verify no typos in variable names (case-sensitive)
4. Restart the application: `python start.py`

### "Supabase environment variables not found"

**Problem:** Supabase credentials not configured

**Solution:**
1. Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy the service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Add these to `.env.local`

### "Authentication not working"

**Problem:** NEXTAUTH_SECRET not set or invalid

**Solution:**
1. Generate a new secret: `openssl rand -base64 32`
2. Add to `.env.local`: `NEXTAUTH_SECRET=<generated-value>`
3. Restart the application
4. Clear browser cookies if still having issues

### "Changes not taking effect"

**Problem:** Env variables cached or not reloaded

**Solution:**
1. Stop the application (Ctrl+C)
2. Verify changes saved in `.env.local`
3. Restart: `python start.py`
4. For Next.js build changes: `npm run build`

## Platform-Specific Notes

### Vercel Deployment

Set environment variables in the Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable (key and value)
3. Set appropriate environments (Production, Preview, Development)
4. Redeploy the application

### Railway Deployment

Set environment variables in Railway:
1. Go to project → Variables tab
2. Add each variable
3. Railway will automatically redeploy

### Docker Deployment

Pass environment variables to the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  -e NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
  constructai-app
```

Or use an env file:
```bash
docker run -p 3000:3000 --env-file .env.local constructai-app
```

## Validation

The `start.py` script automatically validates your environment:

```bash
python start.py
```

**Expected output if successful:**
```
✓ Loaded environment from: /path/to/.env
✓ Loaded local environment overrides from: /path/to/.env.local
✓ Environment variables loaded successfully

========================================
     Step 1: Validating Environment
========================================

ℹ [HH:MM:SS] Validating environment variables...
✓ [HH:MM:SS] All required environment variables are set
```

**If validation fails:**
```
✗ [HH:MM:SS] Missing required environment variables:
✗ [HH:MM:SS]   - NEXT_PUBLIC_SUPABASE_URL
✗ [HH:MM:SS]   - NEXTAUTH_SECRET

ℹ [HH:MM:SS] Please create .env.local file with these variables.
ℹ [HH:MM:SS] See .env.example for reference.
```

## Quick Reference

### Create .env.local
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Validate Configuration
```bash
python start.py
```

### Generate Secrets
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Check Current Values
```bash
# In terminal (bash/zsh)
echo $NEXT_PUBLIC_SUPABASE_URL

# In PowerShell
$env:NEXT_PUBLIC_SUPABASE_URL
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Setup](https://supabase.com/docs/guides/cli/managing-environments)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [python-dotenv Documentation](https://pypi.org/project/python-dotenv/)

## Support

If you encounter issues with environment configuration:

1. Check this guide first
2. Verify `.env.local` exists and has correct values
3. Ensure `.gitignore` includes `.env.local`
4. Check terminal output for specific error messages
5. Try the validation: `python start.py`

---

**Last Updated:** November 5, 2025  
**Version:** 2.0.0  
**Architecture:** Next.js 15 with integrated API routes
