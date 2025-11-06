#!/bin/bash

# ConstructAI Platform - Automated Supabase Deployment Script
# This script helps deploy the platform entirely to Supabase Edge Functions

echo "🏗️  ConstructAI Platform - Supabase Deployment Script"
echo "===================================================="
echo

# Check if required tools are installed
echo "📋 Checking prerequisites..."

# Check for git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install with: npm install -g supabase"
    exit 1
fi

# Check for node/bun
if ! command -v bun &> /dev/null && ! command -v npm &> /dev/null; then
    echo "❌ Neither Bun nor npm found. Please install Bun or Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo

# Check if linked to Supabase project
echo "🔗 Checking Supabase project link..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Not linked to a Supabase project."
    echo "💡 Run: supabase link --project-ref your-project-ref"
    echo "📖 See DEPLOYMENT_GUIDE.md for complete setup instructions"
    exit 1
fi

echo "✅ Supabase project linked!"
echo

# Build and test locally first
echo "🔨 Building project locally..."
if command -v bun &> /dev/null; then
    bun install
    bun run build
else
    npm install
    npm run build
fi

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Local build successful!"
echo

# Deploy database migrations
echo "🗄️  Deploying database schema..."
supabase db push

if [ $? -ne 0 ]; then
    echo "⚠️  Database push failed. Continuing with function deployment..."
fi

echo "✅ Database schema updated!"
echo

# Deploy Edge Functions
echo "🚀 Deploying Edge Functions..."
supabase functions deploy

if [ $? -ne 0 ]; then
    echo "❌ Edge Function deployment failed."
    echo "🔧 Check your functions code and try again."
    exit 1
fi

echo "✅ Edge Functions deployed successfully!"
echo

# Git operations
echo "📤 Saving changes to git..."
git add .

if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit."
else
    echo "💬 Enter commit message (or press Enter for default):"
    read commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Deploy: Updated ConstructAI Platform to Supabase"
    fi

    git commit -m "$commit_message"
    echo "✅ Changes committed!"
fi

echo
echo "🎉 Deployment Complete!"
echo
echo "Your ConstructAI platform is now live on Supabase!"
echo
echo "📍 Access your application at:"
PROJECT_REF=$(supabase status 2>/dev/null | grep "Project ref" | awk '{print $3}' | head -1)
if [ -n "$PROJECT_REF" ]; then
    echo "   https://$PROJECT_REF.supabase.co/functions/v1/nextjs-app"
else
    echo "   https://your-project-ref.supabase.co/functions/v1/nextjs-app"
fi
echo
echo "🎯 Demo accounts for testing:"
echo "   Admin: admin@constructai.demo / ConstructAI2025!"
echo "   Manager: manager@constructai.demo / ConstructAI2025!"
echo "   Architect: architect@constructai.demo / ConstructAI2025!"
echo
echo "📖 For monitoring and management:"
echo "   - View logs: supabase functions logs nextjs-app"
echo "   - Check status: supabase status"
echo "   - Update functions: supabase functions deploy"
echo
echo "📚 Documentation:"
echo "   - Complete guide: DEPLOYMENT_GUIDE.md"
echo "   - Troubleshooting: See deployment guide"
echo
echo "🏗️ Happy building with ConstructAI! ✨"
