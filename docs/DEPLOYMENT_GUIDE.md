# ConstructAI Platform - Full Supabase Deployment Guide

## 🚀 Complete Supabase-Only Deployment Instructions

This guide will walk you through deploying the ConstructAI platform entirely on **Supabase** using their Edge Functions for both frontend hosting and backend services - a unified, powerful deployment solution.

## Prerequisites

- [Supabase Account](https://supabase.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Docker](https://docker.com) (for local development)
- Basic command line knowledge

---

## 🗄️ Step 1: Set up Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `ConstructAI Platform`
   - **Database Password**: Use a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete
6. **Copy your Project Reference ID** from the URL (you'll need this)

### 1.2 Install Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to your Supabase account
supabase login

# Navigate to your project directory
cd construction-ai-platform

# Link to your Supabase project
supabase link --project-ref your-project-ref-id
```

### 1.3 Configure Database
1. Run the database setup:
```bash
# Push the schema to your Supabase project
supabase db push

# Or manually: Copy content from supabase-schema.sql and run in SQL Editor
```
2. Verify tables were created in **Table Editor**

### 1.4 Set up Storage Buckets
```bash
# Create storage buckets via Supabase CLI
supabase storage create documents --public=false
supabase storage create bim-models --public=false
```

Or manually in dashboard:
1. Go to **Storage** in Supabase dashboard
2. Create bucket: **"documents"** (Public: `false`, File size limit: `500MB`)
3. Create bucket: **"bim-models"** (Public: `false`, File size limit: `1GB`)

---

## ⚡ Step 2: Deploy Edge Functions

### 2.1 Deploy All Functions
```bash
# Deploy all Edge Functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy nextjs-app
supabase functions deploy file-upload
supabase functions deploy chat-handler
```

### 2.2 Set Environment Variables
```bash
# Set up environment variables for Edge Functions
supabase secrets set SUPABASE_URL="https://your-project-ref.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
supabase secrets set NEXTAUTH_SECRET="your-long-random-secret"
```

### 2.3 Configure Function URLs
Your application will be available at:
- **Main App**: `https://your-project-ref.supabase.co/functions/v1/nextjs-app`
- **File Upload**: `https://your-project-ref.supabase.co/functions/v1/file-upload`
- **Chat API**: `https://your-project-ref.supabase.co/functions/v1/chat-handler`

---

## 🔧 Step 3: Configure Authentication

### 3.1 Update Auth Settings
1. Go to **Authentication > Settings** in Supabase dashboard
2. **Site URL**: `https://your-project-ref.supabase.co/functions/v1/nextjs-app`
3. **Redirect URLs**: Add your Edge Function URL
4. Enable **Email** provider
5. Configure **SMTP** (optional) for email functionality

### 3.2 Test Authentication
1. Visit your Edge Function URL
2. Try logging in with demo credentials:
   - **Admin**: `admin@constructai.demo` / `ConstructAI2025!`
   - **Manager**: `manager@constructai.demo` / `ConstructAI2025!`
   - **Architect**: `architect@constructai.demo` / `ConstructAI2025!`

---

## 🎯 Step 4: Configure Real-time Features

### 4.1 Enable Real-time
```sql
-- Run this in SQL Editor to enable real-time for chat
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table projects;
```

### 4.2 Test Real-time Features
1. Open multiple browser tabs to your app
2. Test chat functionality
3. Verify file upload notifications
4. Check project updates sync

---

## 📊 Step 5: Production Configuration

### 5.1 Environment Configuration
Update your `.env.local` with production values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_URL=https://your-project-ref.supabase.co/functions/v1/nextjs-app
NEXTAUTH_SECRET=your-production-secret
```

### 5.2 Performance Optimization
```bash
# Enable database optimizations
supabase db optimize

# Configure Edge Function regions (optional)
supabase functions deploy --region us-east-1,eu-west-1
```

---

## 🔄 Step 6: Updates & Maintenance

### 6.1 Deploy Updates
```bash
# Update your functions
git add .
git commit -m "Update: description of changes"

# Redeploy functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy nextjs-app
```

### 6.2 Database Migrations
```bash
# Create a new migration
supabase migration new add_new_feature

# Edit the migration file in supabase/migrations/
# Then apply it
supabase db push
```

### 6.3 Monitor Performance
1. Go to **Logs** in Supabase dashboard
2. Monitor Edge Function performance
3. Check database usage and optimization suggestions
4. Review real-time connection metrics

---

## 🛠️ Local Development

### 6.1 Start Local Supabase
```bash
# Start local Supabase (requires Docker)
supabase start

# This will give you local URLs:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

### 6.2 Develop Locally
```bash
# Run Next.js development server
npm run dev

# Run local Edge Functions
supabase functions serve

# Test functions locally
supabase functions serve --env-file .env.local
```

---

## 🆘 Troubleshooting

### Common Issues

**Edge Function Deployment Fails**
- Check your Supabase CLI is updated: `supabase --version`
- Verify you're linked to the correct project: `supabase status`
- Check function logs: `supabase functions logs nextjs-app`

**Database Connection Issues**
- Verify your project is active in Supabase dashboard
- Check RLS policies allow data access
- Ensure environment variables are set correctly

**Authentication Problems**
- Verify Edge Function URL in auth settings
- Check NEXTAUTH_SECRET is set in Supabase secrets
- Ensure redirect URLs match your function URLs

**File Upload Issues**
- Check storage buckets exist and have correct permissions
- Verify file size limits are appropriate
- Check Edge Function has proper CORS headers

### Getting Help
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Edge Functions Guide**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **CLI Reference**: [supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)

---

## 📈 Monitoring & Analytics

### 6.1 Built-in Monitoring
1. **Database Performance**: Monitor in Supabase dashboard
2. **Edge Function Logs**: Real-time logging and debugging
3. **Real-time Connections**: Track WebSocket usage
4. **Storage Usage**: Monitor file upload and storage usage

### 6.2 Custom Analytics
```sql
-- Add custom analytics tracking
create table analytics_events (
  id uuid default uuid_generate_v4() primary key,
  event_name text not null,
  user_id uuid references auth.users(id),
  properties jsonb default '{}',
  created_at timestamp with time zone default now()
);
```

---

## 🎯 Production Checklist

### Security & Performance
- [ ] RLS policies are properly configured
- [ ] Edge Function environment variables are set
- [ ] File upload limits are appropriate
- [ ] Authentication flows work correctly
- [ ] HTTPS is enabled (automatic with Supabase)

### Features Testing
- [ ] User authentication works via Edge Functions
- [ ] Real-time chat functions properly
- [ ] File uploads process correctly via Edge Functions
- [ ] Database operations succeed
- [ ] All pages load from Edge Function

### Monitoring
- [ ] Edge Function logs are accessible
- [ ] Database performance is optimized
- [ ] Real-time subscriptions work
- [ ] Error tracking is in place

---

## 📊 Architecture Overview

```
┌─────────────────┐    ┌─────────────────────────────────────┐
│                 │    │           SUPABASE                  │
│   USERS         │    │                                     │
│                 │    │  ┌─────────────┐ ┌─────────────┐   │
│ • Web Browsers  │◄───┤  │ Edge        │ │ PostgreSQL  │   │
│ • Mobile Apps   │    │  │ Functions   │ │ Database    │   │
│ • API Clients   │    │  │             │ │             │   │
│                 │    │  │ • nextjs-app│ │ • Tables    │   │
└─────────────────┘    │  │ • file-upload│ │ • RLS       │   │
                       │  │ • chat-handler│ │ • Real-time │   │
                       │  └─────────────┘ └─────────────┘   │
                       │                                     │
                       │  ┌─────────────┐ ┌─────────────┐   │
                       │  │ Storage     │ │ Auth        │   │
                       │  │ Buckets     │ │ System      │   │
                       │  └─────────────┘ └─────────────┘   │
                       └─────────────────────────────────────┘
```

## 🎉 Deployment Complete!

**Your ConstructAI platform is now fully deployed on Supabase!**

✅ **Frontend**: Served via Supabase Edge Functions
✅ **Backend**: PostgreSQL with real-time subscriptions
✅ **Authentication**: Supabase Auth with Edge Function integration
✅ **File Storage**: Supabase Storage buckets
✅ **Real-time**: WebSocket connections for chat and updates

**Access your deployed application at:**
`https://your-project-ref.supabase.co/functions/v1/nextjs-app`

This unified Supabase deployment provides enterprise-grade performance, security, and scalability for your construction AI platform! 🏗️✨
