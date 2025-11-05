# Environment Variables Setup Guide

## 🔒 Security First!

**CRITICAL**: Never commit `.env.local` or any file containing real API keys to version control!

## Quick Setup

1. **Copy the example file:**
   ```powershell
   Copy-Item .env.example .env.local
   ```

2. **Fill in your actual values in `.env.local`**

3. **Verify `.gitignore` includes `.env*`** (already configured)

## Required Environment Variables

### 🗄️ Supabase Configuration (Required)

Get these from your Supabase project dashboard: https://app.supabase.com/project/YOUR_PROJECT/settings/api

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get:**
- Go to Supabase Dashboard → Project Settings → API
- Copy `URL`, `anon public`, and `service_role` keys

### 🔐 NextAuth Configuration (Required)

```env
NEXTAUTH_SECRET=your-randomly-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**How to generate NEXTAUTH_SECRET:**
```powershell
# Using PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

# Or use online generator
# https://generate-secret.vercel.app/32
```

### 🤖 AI Services (Optional but Recommended)

#### OpenAI API Key
Get from: https://platform.openai.com/api-keys

```env
OPENAI_API_KEY=sk-proj-...
```

#### Google AI API Key (for Gemini)
Get from: https://makersuite.google.com/app/apikey

```env
GOOGLE_AI_API_KEY=AIza...
```

### 🎨 Hunyuan3D Configuration (Optional)

```env
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
HUNYUAN3D_SERVER_URL=http://localhost:8000
```

Change to your deployed URL in production.

### 🤝 Collaboration Service (Optional)

```env
NEXT_PUBLIC_COLLABORATION_WS_URL=ws://localhost:3001
```

### 👤 Demo User Password (Development Only)

```env
DEMO_PASSWORD=ConstructAI2025!
```

**⚠️ IMPORTANT**: Change this in production or remove demo users entirely!

## Environment-Specific Configurations

### Development (.env.local)
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
```

### Production (.env.production)
```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_HUNYUAN3D_URL=https://your-hunyuan3d-server.com
```

## Supabase Edge Functions

Edge functions need their own environment variables set via Supabase CLI:

```powershell
# Set secrets for Edge Functions
supabase secrets set SUPABASE_URL="https://your-project-ref.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set OPENAI_API_KEY="sk-..."
supabase secrets set GOOGLE_AI_API_KEY="AIza..."

# List all secrets
supabase secrets list

# Unset a secret
supabase secrets unset SECRET_NAME
```

## Verification Checklist

- [ ] `.env.local` file exists and is populated
- [ ] `.env.local` is in `.gitignore`
- [ ] All required Supabase variables are set
- [ ] NEXTAUTH_SECRET is generated and set
- [ ] At least one AI API key is configured (OpenAI or Google)
- [ ] Edge function secrets are set (if deploying to Supabase)
- [ ] Production environment variables are configured separately

## Troubleshooting

### "Supabase environment variables not found"
- Check that `.env.local` exists in the project root
- Verify variable names match exactly (case-sensitive)
- Restart your development server after changes

### "Invalid or missing API key"
- Ensure API keys are valid and not expired
- Check for extra spaces or quotes around values
- Verify billing is enabled for AI services

### Demo login not working
- Check DEMO_PASSWORD matches in `.env.local`
- Clear browser cookies and try again
- Check browser console for errors

## Security Best Practices

1. **Never commit `.env.local`** - Always use `.env.example` as template
2. **Rotate keys regularly** - Especially after team member changes
3. **Use different keys per environment** - Dev, staging, production
4. **Limit key permissions** - Use read-only keys where possible
5. **Monitor key usage** - Set up alerts for unusual activity
6. **Use Supabase RLS** - Protect data at the database level
7. **Remove demo credentials in production** - Or use strong passwords

## File Locations

```
constructai-platform/
├── .env.example          # Template (committed to git)
├── .env.local            # Development (NOT committed)
├── .env.production       # Production (NOT committed)
├── .env.test             # Testing (NOT committed)
└── .gitignore            # Ensures .env* files are ignored
```

## Additional Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/managing-environments)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [OpenAI API Keys](https://platform.openai.com/docs/quickstart/account-setup)
- [Google AI Studio](https://ai.google.dev/tutorials/setup)

## Need Help?

1. Check the `.env.example` file for all available options
2. Review error messages in the console
3. Verify all required services are running
4. Check Supabase dashboard for project status
