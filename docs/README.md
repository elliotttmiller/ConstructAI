# 📚 ConstructAI Platform Documentation

Welcome to the comprehensive documentation for the ConstructAI Platform. This folder contains all the guides you need to set up, deploy, and enhance your construction management system.

## 🚀 Getting Started

**📖 Main Documentation Index**: [../PLATFORM_DOCUMENTATION_INDEX.md](../PLATFORM_DOCUMENTATION_INDEX.md)  
**🏗️ Platform Architecture**: [../PLATFORM_ARCHITECTURE.md](../PLATFORM_ARCHITECTURE.md)

Start here if you're new to the platform:

1. **[Environment Setup Guide](./ENV_SETUP_GUIDE.md)** ⭐ START HERE
   - Complete environment variable configuration
   - Step-by-step setup instructions
   - Troubleshooting common issues

2. **[Change Repository Guide](./CHANGE_REPO_GUIDE.md)**
   - How to move to your own Git repository
   - Git configuration and best practices

## 🔧 Configuration & Setup

### Environment & Security
- **[Environment Setup Guide](./ENV_SETUP_GUIDE.md)** - Comprehensive .env configuration
- **[Environment Migration](./ENVIRONMENT_MIGRATION.md)** - Security improvements documentation

### Database & Backend
- See main [README.md](../README.md) for database schema setup
- Supabase configuration in deployment guides below

## 🚢 Deployment Guides

Choose the deployment guide that matches your target platform:

### General Deployment
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Overview of deployment options
- **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** - Production best practices

### Platform-Specific
- **[Supabase Deployment](./SUPABASE_DEPLOYMENT.md)** - Supabase Edge Functions & Database
- **[Hunyuan3D Complete Guide](./HUNYUAN3D_COMPLETE_GUIDE.md)** - Complete 3D service setup and deployment

## 🎨 Features & Integrations

### 3D Capabilities
- **[Hunyuan3D Complete Guide](./HUNYUAN3D_COMPLETE_GUIDE.md)** - Comprehensive 2D to 3D conversion setup (Basic + Advanced + Production)

### AI & Document Processing
- **[Blueprint Recognition Enhancements](./BLUEPRINT_RECOGNITION_ENHANCEMENTS.md)** - AI-powered blueprint analysis
- **[Enhancement Summary](./ENHANCEMENT_SUMMARY.md)** - Platform improvements overview

## 📋 Quick Reference

### Essential Files
```
docs/
├── README.md (this file)
├── ENV_SETUP_GUIDE.md              ⭐ Start here for setup
├── DEPLOYMENT_GUIDE.md             📦 General deployment
├── SUPABASE_DEPLOYMENT.md          🗄️ Supabase-specific
└── PRODUCTION_DEPLOYMENT.md        🚀 Production guide
```

### Common Tasks

#### First Time Setup
1. Read [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
2. Copy `.env.example` to `.env.local`
3. Fill in your credentials
4. Run `npm install`
5. Run `npm run dev`

#### Moving to Your Repository
1. Follow [CHANGE_REPO_GUIDE.md](./CHANGE_REPO_GUIDE.md)
2. Update remote URL
3. Push to your repository

#### Deploying to Production
1. Review [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
2. Configure environment variables in hosting platform
3. Set up Supabase (see [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md))
4. Deploy application

#### Adding 3D Features
1. Read [HUNYUAN3D_COMPLETE_GUIDE.md](./HUNYUAN3D_COMPLETE_GUIDE.md)
2. Set up Python environment
3. Configure Hunyuan3D server
4. Update environment variables

## 🔍 Finding What You Need

### By Topic

**Environment & Configuration**
- Setting up `.env` files → [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
- Understanding security changes → [ENVIRONMENT_MIGRATION.md](./ENVIRONMENT_MIGRATION.md)

**Git & Repository**
- Moving to your own repo → [CHANGE_REPO_GUIDE.md](./CHANGE_REPO_GUIDE.md)

**Deployment**
- General deployment → [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Supabase deployment → [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)
- Production setup → [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

**Features**
- 3D conversion → [HUNYUAN3D_COMPLETE_GUIDE.md](./HUNYUAN3D_COMPLETE_GUIDE.md)
- Blueprint AI → [BLUEPRINT_RECOGNITION_ENHANCEMENTS.md](./BLUEPRINT_RECOGNITION_ENHANCEMENTS.md)
- What's new → [ENHANCEMENT_SUMMARY.md](./ENHANCEMENT_SUMMARY.md)

### By Role

**Developers**
1. [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) - Set up development environment
2. [CHANGE_REPO_GUIDE.md](./CHANGE_REPO_GUIDE.md) - Git workflow
3. [ENHANCEMENT_SUMMARY.md](./ENHANCEMENT_SUMMARY.md) - Recent changes

**DevOps Engineers**
1. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment overview
2. [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) - Backend setup
3. [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Production config

**Project Managers**
1. [ENHANCEMENT_SUMMARY.md](./ENHANCEMENT_SUMMARY.md) - Feature overview
2. [BLUEPRINT_RECOGNITION_ENHANCEMENTS.md](./BLUEPRINT_RECOGNITION_ENHANCEMENTS.md) - AI capabilities

## 🛠️ Tools & Scripts

Available in the project root:

- **`verify-env.ps1`** - Verify environment configuration
- **`.env.example`** - Template for environment variables
- **`.env.local`** - Your local configuration (not in Git)

## 🆘 Troubleshooting

### Common Issues

**Environment variables not working**
- See [ENV_SETUP_GUIDE.md - Troubleshooting](./ENV_SETUP_GUIDE.md#troubleshooting)

**Deployment errors**
- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for platform-specific issues
- Review [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for backend problems

**3D features not working**
- Verify Hunyuan3D setup in [HUNYUAN3D_COMPLETE_GUIDE.md](./HUNYUAN3D_COMPLETE_GUIDE.md)
- Check Python environment configuration

**Git/Repository issues**
- Follow [CHANGE_REPO_GUIDE.md](./CHANGE_REPO_GUIDE.md)

## 📞 Getting Help

1. **Check this documentation** - Most answers are here
2. **Search the docs** - Use Ctrl+F to search within files
3. **Check the main README** - Go back to [../README.md](../README.md)
4. **GitHub Issues** - Report bugs or request features
5. **Community Discussions** - Ask questions and share ideas

## 🔄 Keeping Documentation Updated

When adding new features or making changes:

1. Update relevant documentation files
2. Add entry to this README.md if it's a new guide
3. Update the main [../README.md](../README.md) if needed
4. Keep examples and screenshots current

## 📝 Documentation Standards

All documentation files follow these standards:

- ✅ Clear headings and structure
- ✅ Code examples with syntax highlighting
- ✅ Step-by-step instructions
- ✅ Troubleshooting sections
- ✅ Cross-references to related docs
- ✅ Emoji for visual navigation 😊

---

**Need to add new documentation?** Follow the existing format and update this README.md index.

**Found an issue?** Please report it or submit a PR to improve the docs!

---

*Last updated: November 5, 2025*  
*Documentation Structure: Optimized & Consolidated*
