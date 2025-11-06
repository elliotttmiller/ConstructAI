# Supabase Project Setup Instructions

## 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and name: "ConstructAI Platform"
4. Set database password (save this!)
5. Select region closest to your users
6. Click "Create new project"

## 2. Database Setup
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the complete schema from `supabase-schema.sql`
3. Run the SQL to create all tables and policies

## 3. Environment Variables (Update .env.local)
```
# Get these from Supabase Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Keep these the same
NEXTAUTH_URL=https://your-deployment-url.vercel.app
NEXTAUTH_SECRET=construction-ai-platform-secret-key-12345
NODE_ENV=production
```

## 4. Storage Buckets Setup
1. Go to Storage in Supabase dashboard
2. Create bucket: "documents" (public: false)
3. Create bucket: "bim-models" (public: false)
4. Set up RLS policies for file access

## 5. Authentication Setup
1. Go to Authentication > Settings
2. Enable email provider
3. Add site URL: https://your-deployment-url.vercel.app
4. Configure redirect URLs for auth

## 6. Edge Functions (Optional for AI processing)
1. Install Supabase CLI: `npm i -g supabase`
2. Login: `supabase login`
3. Deploy edge functions for AI processing

## 7. Deployment Strategy
Since Supabase focuses on backend services, we'll use:
- **Supabase**: Database, Auth, Storage, Real-time subscriptions
- **Vercel**: Frontend hosting (best Next.js support)
- **Supabase Edge Functions**: AI processing and file handling

This gives you the full power of Supabase backend with optimal Next.js hosting!
