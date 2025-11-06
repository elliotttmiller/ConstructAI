# 🏗️ ConstructAI Platform

**Revolutionary AI-Powered Construction Management Platform**

A comprehensive Next.js application that integrates Revit API with intelligent agent orchestration, featuring real-time chat, 3D BIM visualization, document processing, and seamless project coordination.

![ConstructAI Platform](https://img.shields.io/badge/Built%20with-Next.js%2014-000000?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Three.js](https://img.shields.io/badge/3D-Three.js-000000?style=for-the-badge&logo=three.js)

## ✨ Features

### 🤖 Autonomous AI Execution System ⭐ NEW
- **True Autonomous Agents** - AI agents don't just respond, they **execute tasks autonomously**
- **Autonomous Document Processing** - Auto-upload, OCR, analysis, and classification
- **Autonomous BIM Workflows** - Automated model analysis, clash detection, report generation
- **Autonomous Task Management** - AI creates, assigns, and manages tasks automatically
- **Autonomous Database Operations** - Complex queries and data insights executed in background
- **Real-time Workflow Monitoring** - Live dashboard showing all autonomous executions
- **Priority-Based Queue System** - Critical tasks execute first with automatic retry logic
- **Suna AI Chat Interface** - Central conversational hub with autonomous action detection
- **Multi-Agent Dashboard** - Coordinate Data Upload Bot, PM Bot, Design Converter
- **Real-time WebSocket** - Live agent interactions and status updates
- **Task Routing** - Intelligent distribution of work across specialized agents

### 🏢 3D BIM Visualization
- **Interactive 3D Viewer** - Three.js WebGL rendering with sample building model
- **Clash Detection** - Real-time conflict identification with severity levels
- **Element Selection** - Click any building component to view properties
- **Navigation Controls** - Zoom, pan, rotate, and section views

### 📁 Document Processing
- **Drag & Drop Upload** - Support for CAD, PDF, images, spreadsheets (up to 500MB)
- **OCR Processing** - Real Tesseract.js text extraction with confidence scoring
- **Smart Classification** - Automatic document categorization
- **Progress Tracking** - Live upload and processing status
- **AI-Powered Analysis** - Automatic document analysis with insights extraction
- **Follow-up Actions** - AI-generated tasks and recommendations based on document content

### 👥 Project Management
- **Multiple Views** - Grid, List, Timeline, and Kanban project views
- **Team Directory** - Role-based user management with permissions
- **Task Assignment** - Natural language task creation and tracking
- **Budget Monitoring** - Real-time project financial tracking

### 🔐 Enterprise Security
- **NextAuth.js** - Role-based authentication with demo users
- **Supabase RLS** - Row-level security for project data
- **JWT Sessions** - Secure session management
- **Data Encryption** - TLS 1.2+ and AES-256 protection

## 🚀 Quick Start

### User Authentication
The platform uses Supabase Authentication for secure user management:

1. **Create users via Supabase Dashboard:**
   - Go to Authentication > Users in your Supabase project
   - Add users with email and password
   - Assign roles and permissions in the `users` table

2. **Or enable Supabase Auth signup:**
   - Users can register via the signup page
   - Configure email templates in Supabase dashboard

**Note:** Demo users with hardcoded passwords have been removed for security. All authentication now goes through Supabase.

### Local Development

#### Quick Start (Recommended)
```bash
# Clone the repository
git clone https://github.com/elliotttmiller/ConstructAI.git
cd ConstructAI

# Install Python dependencies (for start.py)
pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and other secrets

# Start the application
python start.py
```

The `start.py` script will:
- ✅ Load environment variables from .env and .env.local
- ✅ Validate all required configuration is present
- ✅ Kill any existing processes on port 3000
- ✅ Verify all dependencies are installed
- ✅ Start Next.js application (frontend + API routes)
- ✅ Perform health checks on the application
- ✅ Monitor the process with auto-reload enabled

**Access the platform:**
- Application: [http://localhost:3000](http://localhost:3000)
- API Routes: [http://localhost:3000/api/*](http://localhost:3000/api/)

## 🏗️ Architecture

### Modern Full-Stack Next.js
ConstructAI uses **Next.js 15** with integrated API routes - no separate backend server needed:

- **Frontend:** React 18 components with Server-Side Rendering
- **API Routes:** Built-in Next.js API routes at `/api/*`
- **Database:** Supabase (PostgreSQL) with real-time subscriptions  
- **Authentication:** NextAuth.js with Supabase adapter
- **Deployment:** Can deploy to any Node.js hosting platform

## 📦 Deployment Options

### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Other Platforms

- **Next.js:** Deploy to any Node.js hosting (Vercel, Railway, Render, etc.)
- **Database:** Supabase (PostgreSQL) or any PostgreSQL instance
- **Configuration:** Set environment variables in your deployment platform

📖 **Complete Instructions**: See [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md)

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript 5.8** - Type-safe development  
- **React 18** - Modern React with Server Components
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library
- **Three.js** - 3D visualization and WebGL

### Backend (Integrated)
- **Next.js API Routes** - Serverless API endpoints at `/api/*`
- **NextAuth.js** - Authentication and session management
- **Supabase Client** - Database and real-time subscriptions

### Infrastructure  
- **Supabase** - PostgreSQL database with Auth, Storage, Real-time
- **Vercel/Railway** - Node.js hosting platforms
- **Socket.IO** - Real-time bidirectional communication (optional)

### AI & Processing
- **OpenAI API** - GPT models for intelligent responses
- **Google AI** - Gemini models for enhanced capabilities
- **Tesseract.js** - Client-side OCR processing
- **Hunyuan3D** - 2D to 3D conversion service (optional)

### Development Tools
- **start.py** - Unified startup script with environment validation
- **python-dotenv** - Environment variable management  
- **psutil** - Process monitoring and management
- **TypeScript** - Static type checking
- **ESLint & Biome** - Code linting and formatting

## 📋 Project Structure

```
ConstructAI/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Authentication pages  
│   │   ├── api/             # API routes (integrated backend)
│   │   │   ├── auth/        # NextAuth endpoints
│   │   │   ├── ai-chat/     # AI chat endpoints
│   │   │   ├── upload/      # File upload handling
│   │   │   └── hunyuan3d/   # 3D conversion endpoints
│   │   ├── bim/             # 3D BIM viewer
│   │   ├── chat/            # Suna AI chat interface
│   │   ├── projects/        # Project management
│   │   └── team/            # Team directory
│   ├── components/          # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   ├── bim/             # 3D viewer components
│   │   ├── documents/       # File upload components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utility libraries
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── supabase.ts      # Supabase client setup
│   │   └── socket.ts        # Socket.IO configuration
│   └── types/               # TypeScript type definitions
├── supabase-schema.sql      # Complete database schema
├── DEPLOYMENT_GUIDE.md      # Detailed deployment instructions
└── deploy.sh                # Automated deployment script
```

## 🎯 Core Capabilities

### Real-time Collaboration
- Live chat with AI agents and team members
- Real-time project updates and notifications
- Collaborative 3D model viewing and annotation
- Instant file processing and sharing

### Advanced Document Processing
- Multi-format file support (DWG, DXF, PDF, XLSX, CSV, Images)
- Intelligent OCR with confidence scoring
- Automatic document classification and tagging
- Version control and revision tracking

### 3D BIM Integration
- Interactive building model visualization
- Automated clash detection and reporting
- Element property inspection and editing
- Construction phase timeline visualization

### Project Intelligence
- AI-powered project insights and recommendations
- Automated task assignment and scheduling
- Budget tracking and cost analysis
- Building code compliance checking

## 🔧 Configuration

### Environment Variables

**Quick Setup:**
```powershell
# 1. Copy the example file
Copy-Item .env.example .env.local

# 2. Edit .env.local with your actual values

# 3. Verify your setup
.\verify-env.ps1
```

**📖 For detailed instructions, see [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)**

**Required Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXTAUTH_SECRET=your-secret-key
```

**Optional Variables:**
```bash
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
NEXT_PUBLIC_HUNYUAN3D_URL=http://localhost:8000
DEMO_PASSWORD=your-demo-password
```

**See `.env.example` for all available options.**

## 📚 Documentation

**📖 Complete Documentation Index**: [PLATFORM_DOCUMENTATION_INDEX.md](./PLATFORM_DOCUMENTATION_INDEX.md)  
**🏗️ Architecture & Workflows**: [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md)

Comprehensive guides are available in the [`/docs`](./docs) folder:

### Setup & Configuration
- **[Environment Setup Guide](./docs/ENV_SETUP_GUIDE.md)** - Complete environment variable configuration
- **[Environment Migration](./docs/ENVIRONMENT_MIGRATION.md)** - Security improvements and changes
- **[Change Repository Guide](./docs/CHANGE_REPO_GUIDE.md)** - How to move to your own Git repository

### Deployment
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Supabase deployment instructions
- **[Supabase Deployment](./docs/SUPABASE_DEPLOYMENT.md)** - Database-specific setup
- **[Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md)** - Production environment guide

### Features & Integrations
- **[🤖 Autonomous AI System](./docs/AUTONOMOUS_AI_SYSTEM.md)** - ⭐ Complete guide to autonomous AI workflow execution
- **[AI Workflow Orchestration](./docs/AI_WORKFLOW_ORCHESTRATION.md)** - End-to-end AI workflow integration guide
- **[Hunyuan3D Complete Guide](./docs/HUNYUAN3D_COMPLETE_GUIDE.md)** - Complete 2D to 3D conversion setup and deployment
- **[Blueprint Recognition](./docs/BLUEPRINT_RECOGNITION_ENHANCEMENTS.md)** - AI-powered blueprint processing
- **[Enhancement Summary](./docs/ENHANCEMENT_SUMMARY.md)** - Platform improvements overview

### Database Setup
The platform includes a complete SQL schema with:
- User management and role-based permissions
- Project data with team assignments
- Document storage and processing tracking
- Chat message history and agent logs
- BIM model metadata and clash detection results

## 📊 Performance & Scalability

### Optimizations
- **Server-side Rendering** - Fast initial page loads
- **Static Generation** - Optimized build output
- **Image Optimization** - Automatic image compression
- **Code Splitting** - Lazy loading of components
- **Edge Functions** - Global distribution

### Production Metrics
- **Response Time**: <3 seconds for 95% of requests
- **Concurrent Users**: 500+ simultaneous users supported
- **File Processing**: <10 seconds for files under 5MB
- **3D Rendering**: 60fps performance on modern devices
- **Database Queries**: <1 second for complex operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Complete guides in [`/docs`](./docs) folder
- **Environment Setup**: See [`docs/ENV_SETUP_GUIDE.md`](./docs/ENV_SETUP_GUIDE.md)
- **Deployment**: Check [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md)
- **Issues**: Report bugs and feature requests in GitHub Issues
- **Discussions**: Join community discussions for help and ideas

---

**Built with ❤️ for the construction industry** | **Powered by Supabase + Vercel** 🚀
