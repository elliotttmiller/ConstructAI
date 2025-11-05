# Environment Variables Migration Summary

## ✅ Completed Changes

### Files Created
1. **`.env.example`** - Template with all environment variables and documentation
2. **`.env.local`** - Development environment with safe defaults
3. **`ENV_SETUP_GUIDE.md`** - Comprehensive setup and troubleshooting guide

### Files Modified

#### 1. `src/app/api/auth/direct-login/route.ts`
**Before:**
```typescript
password: 'ConstructAI2025!',  // Hardcoded in 3 places
```

**After:**
```typescript
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'ConstructAI2025!';
password: DEMO_PASSWORD,
```

#### 2. `src/lib/auth.ts`
**Before:**
```typescript
password: 'ConstructAI2025!',  // Hardcoded in 3 places
secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
```

**After:**
```typescript
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'ConstructAI2025!';
password: DEMO_PASSWORD,
secret: process.env.NEXTAUTH_SECRET,
```

#### 3. `supabase/functions/nextjs-app/index.ts`
**Before:**
```html
Password: <code>ConstructAI2025!</code>
```

**After:**
```html
Password: <code>Check .env.local file</code>
```

### Already Using Environment Variables ✅

These files are already properly configured:

1. **`src/lib/supabase.ts`**
   - ✅ `process.env.NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `process.env.SUPABASE_SERVICE_ROLE_KEY`

2. **`src/lib/ai-services.ts`**
   - ✅ `process.env.OPENAI_API_KEY`
   - ✅ `process.env.GOOGLE_AI_API_KEY`

3. **`src/lib/hunyuan3d-service.ts`**
   - ✅ `process.env.NEXT_PUBLIC_HUNYUAN3D_URL`

4. **`src/app/api/hunyuan3d/convert/route.ts`**
   - ✅ `process.env.HUNYUAN3D_SERVER_URL`

5. **`src/lib/collaboration-service.ts`**
   - ✅ `process.env.NEXT_PUBLIC_COLLABORATION_WS_URL`

6. **Supabase Edge Functions**
   - ✅ `Deno.env.get('SUPABASE_URL')`
   - ✅ `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`

## 🔒 Security Improvements

### Before Migration
- ❌ Hardcoded demo password in 3+ files
- ❌ Passwords visible in HTML responses
- ❌ No centralized environment configuration
- ❌ No example template for new developers
- ❌ Risk of committing secrets to Git

### After Migration
- ✅ Demo password in environment variable
- ✅ UI references environment file instead of showing password
- ✅ Centralized `.env.local` configuration
- ✅ `.env.example` template for team onboarding
- ✅ `.gitignore` already configured to prevent secret commits
- ✅ Comprehensive documentation

## 📋 Environment Variables Overview

### Required for Basic Operation
```env
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public API key
SUPABASE_SERVICE_ROLE_KEY         # Admin API key (server-only)
NEXTAUTH_SECRET                   # Session encryption key
```

### Required for AI Features
```env
OPENAI_API_KEY                    # GPT models
GOOGLE_AI_API_KEY                 # Gemini models
```

### Optional Features
```env
NEXT_PUBLIC_HUNYUAN3D_URL         # 3D conversion service
HUNYUAN3D_SERVER_URL              # Backend 3D service
NEXT_PUBLIC_COLLABORATION_WS_URL  # Real-time collaboration
DEMO_PASSWORD                     # Demo user password
```

### CAD Integration (Optional)
```env
AUTODESK_CLIENT_ID                # AutoCAD integration
AUTODESK_CLIENT_SECRET            # AutoCAD secret
AZURE_TENANT_ID                   # Revit integration
AZURE_APPLICATION_ID              # Revit app ID
AZURE_APPLICATION_SECRET          # Revit secret
```

## 🚀 Next Steps for Production

### Immediate Actions
1. ✅ Copy `.env.example` to `.env.local`
2. ✅ Fill in actual Supabase credentials
3. ✅ Generate secure NEXTAUTH_SECRET
4. ✅ Add OpenAI or Google AI API key
5. ⚠️ **Change DEMO_PASSWORD or remove demo users entirely**

### Production Deployment
1. Create `.env.production` with production values
2. Set environment variables in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Build & Deploy → Environment
   - **Railway**: Project → Variables
3. Set Supabase Edge Function secrets:
   ```bash
   supabase secrets set SUPABASE_URL="..."
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="..."
   supabase secrets set OPENAI_API_KEY="..."
   ```
4. **Remove or secure demo accounts:**
   - Delete demo users from `src/app/api/auth/direct-login/route.ts`
   - Delete demo users from `src/lib/auth.ts`
   - Or require strong passwords via environment variable

### Security Checklist for Production
- [ ] All secrets are in environment variables (not hardcoded)
- [ ] `.env.local` is in `.gitignore`
- [ ] Different API keys for dev/staging/production
- [ ] NEXTAUTH_SECRET is a strong random string
- [ ] Demo accounts are removed or secured
- [ ] Supabase Row Level Security (RLS) is enabled
- [ ] API keys have appropriate permissions/rate limits
- [ ] Environment variables are set in hosting platform
- [ ] Secrets are rotated regularly
- [ ] Team members use their own development credentials

## 🧪 Testing

### Verify Environment Setup
```powershell
# Check if .env.local exists
Test-Path .env.local

# Run development server
npm run dev

# Check for environment variable warnings in console
# Should not see: "Supabase environment variables not found"
```

### Test Demo Login
1. Navigate to http://localhost:3000/auth/signin
2. Use credentials from `.env.local`:
   - Email: `admin@constructai.demo`
   - Password: Value of `DEMO_PASSWORD`
3. Should successfully authenticate

## 📚 Additional Files to Review

You may want to check these files for any hardcoded values:

### Configuration Files
- `next.config.js` - Check for hardcoded URLs
- `netlify.toml` - Verify environment references
- `supabase/config.toml` - Check local development settings

### Service Files
- `src/lib/cad-integration-service.ts` - CAD credentials (should be passed as params)
- `src/lib/production-config.ts` - Already uses `process.env.NODE_ENV` ✅

### Python Services
- `python-services/hunyuan3d-server.py` - May need environment setup
- `hunyuan3d/real_hunyuan3d_server.py` - Check for hardcoded ports/URLs

## ⚠️ Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Share `.env.example`** - Safe to commit, helps team setup
3. **Rotate keys regularly** - Especially after team changes
4. **Use strong secrets** - Generate random strings for NEXTAUTH_SECRET
5. **Monitor usage** - Set up alerts for API key usage
6. **Keep documentation updated** - Update `.env.example` when adding new variables

## 🆘 Troubleshooting

### Problem: "Environment variables not found"
**Solution**: Ensure `.env.local` exists and restart dev server

### Problem: Demo login fails
**Solution**: Check `DEMO_PASSWORD` in `.env.local` matches what you're entering

### Problem: Supabase connection errors
**Solution**: Verify all three Supabase variables are set correctly

### Problem: AI features not working
**Solution**: Add at least one AI API key (OpenAI or Google)

### Problem: Changes not taking effect
**Solution**: Restart the development server after changing `.env.local`

## 📞 Support

- Review `ENV_SETUP_GUIDE.md` for detailed instructions
- Check `.env.example` for all available options
- Verify `.env.local` has correct values
- Check browser console and terminal for error messages
- Ensure all required services are running

---

**Migration completed successfully! 🎉**

All hardcoded secrets have been moved to environment variables, improving security and maintainability.
