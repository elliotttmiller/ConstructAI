# ConstructAI Platform - Architecture & Workflows

**Platform Version**: 13 (Production)  
**Status**: ✅ Production-Ready  
**Live URL**: https://same-e9j95ysnu3c-latest.netlify.app

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Workflows](#core-workflows)
4. [Security Architecture](#security-architecture)
5. [Deployment Architecture](#deployment-architecture)
6. [Performance & Scalability](#performance--scalability)
7. [Integration Points](#integration-points)

---

## 1. System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                          │
│  Next.js 15 Frontend • React 18 • TypeScript • Tailwind CSS           │
│  • 3D BIM Viewer (Three.js)  • AI Chat Interface                       │
│  • Document Upload           • Project Management                       │
└────────────────────────┬───────────────────────────────────────────────┘
                         │ HTTPS/WSS
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY (Next.js API Routes)                    │
│  • Authentication (NextAuth.js)  • Request Routing                     │
│  • Rate Limiting                 • Input Validation                    │
└──────┬──────────────────┬──────────────────┬─────────────────┬─────────┘
       │                  │                  │                 │
       ▼                  ▼                  ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SUPABASE   │  │ AI SERVICES  │  │ 3D SERVICE   │  │ BACKEND API  │
│             │  │              │  │              │  │              │
│ PostgreSQL  │  │ • OpenAI     │  │ • Hunyuan3D-2│  │ • FastAPI    │
│ Auth        │  │   GPT-4      │  │ • GPU        │  │ • Python     │
│ Storage     │  │ • Google     │  │   Inference  │  │ • Uvicorn    │
│ Real-time   │  │   Gemini     │  │ • Texture    │  │ • Async      │
│ RLS         │  │ • Tesseract  │  │   Synthesis  │  │              │
└─────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Component Breakdown

#### Frontend Layer
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 18 with TypeScript 5.8
- **Styling**: Tailwind CSS 3.4 + Shadcn/UI
- **3D Rendering**: Three.js 0.178 with WebGL
- **State Management**: React hooks + Context API
- **Real-time**: Socket.IO 4.8 client

#### API Gateway
- **Next.js API Routes**: Serverless endpoints
- **Authentication**: NextAuth.js with Supabase adapter
- **Validation**: Comprehensive input checking
- **Rate Limiting**: Request throttling
- **Error Handling**: Graceful fallbacks

#### Backend Services
- **Database**: Supabase (PostgreSQL 15+)
- **AI Services**: Multi-model orchestration
- **3D Service**: Hunyuan3D-2 GPU server
- **FastAPI**: Python REST API (optional)

---

## 2. Technology Stack

### Frontend Technologies
```typescript
{
  "framework": "Next.js 15.3.2",
  "runtime": "React 18.3.1",
  "language": "TypeScript 5.8.3",
  "styling": "Tailwind CSS 3.4.17",
  "ui": "Shadcn/UI + Radix UI",
  "3d": "Three.js 0.178.0",
  "realtime": "Socket.IO 4.8.1",
  "forms": "React Hook Form",
  "validation": "Zod"
}
```

### Backend Technologies
```python
{
  "database": "Supabase (PostgreSQL 15+)",
  "auth": "NextAuth.js 4.24 + Supabase Auth",
  "api": "Next.js API Routes + FastAPI (optional)",
  "cache": "In-memory + CDN",
  "storage": "Supabase Storage",
  "realtime": "Supabase Subscriptions + Socket.IO"
}
```

### AI & ML Stack
```python
{
  "chat": "OpenAI GPT-4",
  "analysis": "Google Gemini",
  "3d_conversion": "Tencent Hunyuan3D-2",
  "ocr": "Tesseract.js 6.0",
  "computer_vision": "OpenCV.js 4.9"
}
```

### Infrastructure
```yaml
deployment:
  production: "Netlify"
  alternatives: ["Vercel", "Railway", "Self-hosted"]
  
database:
  primary: "Supabase Cloud"
  type: "PostgreSQL 15+"
  features: ["RLS", "Real-time", "Storage", "Auth"]

cdn:
  provider: "Netlify Edge"
  features: ["Global", "Auto-scaling", "Edge Functions"]

monitoring:
  health_checks: true
  error_tracking: "Recommended: Sentry"
  analytics: "Recommended: Vercel Analytics"
```

---

## 3. Core Workflows

### Blueprint Upload & Analysis Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS BLUEPRINT                                       │
│    • Drag & drop interface                                      │
│    • File validation (type, size)                               │
│    • Preview generation                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. IMAGE PREPROCESSING (Browser - OpenCV.js)                    │
│    • Contrast enhancement                                       │
│    • Noise reduction                                            │
│    • Line sharpening                                            │
│    • Resize to optimal dimensions (max 2048px)                  │
│    Time: ~500ms                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. PARALLEL ANALYSIS (Browser - Multi-threaded)                 │
│    ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│    │ OCR Analysis    │  │ Line Detection  │  │ Element      ││
│    │ (Tesseract.js)  │  │ (Hough         │  │ Classification││
│    │ • Extract text  │  │  Transform)     │  │ • Walls      ││
│    │ • Room labels   │  │ • Detect lines  │  │ • Doors      ││
│    │ • Dimensions    │  │ • Classify      │  │ • Windows    ││
│    │ • Notes         │  │   types         │  │ • Rooms      ││
│    │ Time: 0.5-2s    │  │ Time: 1-2s      │  │ Time: 0.5-1s ││
│    └─────────────────┘  └─────────────────┘  └──────────────┘│
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. RESULTS AGGREGATION                                          │
│    • Combine all analysis results                               │
│    • Calculate confidence scores                                │
│    • Generate summary statistics                                │
│    • Cache results (10 minutes)                                 │
│    Total Time: 1.5-3.0 seconds                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. DISPLAY RESULTS (4-Tab Interface)                            │
│    • Overview: Counts, quality, metrics                         │
│    • Elements: Detailed element list                            │
│    • Analysis: Complexity and quality scores                    │
│    • Technical: Processing details                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ User clicks "Convert to 3D"
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. 3D CONVERSION (Hunyuan3D-2 GPU Server)                       │
│    • Request with blueprint + metadata                          │
│    • GPU inference (15-30s shape)                               │
│    • Optional texture generation (15-30s)                       │
│    • Real-time progress via WebSocket                           │
│    • Download 3D model (OBJ/GLTF)                              │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. 3D VISUALIZATION (Three.js WebGL)                            │
│    • Load model into viewer                                     │
│    • Initialize controls                                        │
│    • Enable interactions (zoom, pan, rotate)                    │
│    • Display element properties                                 │
│    • 60fps rendering                                            │
└─────────────────────────────────────────────────────────────────┘
```

### AI Chat Interaction Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER SENDS MESSAGE                                           │
│    • Type message in chat interface                             │
│    • Press send or Enter                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATION & VALIDATION                                  │
│    • Verify JWT session token                                   │
│    • Check user permissions                                     │
│    • Load user context                                          │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MESSAGE PERSISTENCE                                          │
│    • Store in Supabase chat_messages table                      │
│    • Include user ID, timestamp, content                        │
│    • Link to project context (if applicable)                    │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. INTENT ANALYSIS & SERVICE SELECTION                          │
│    • Analyze message for task type                              │
│    • Check AI service availability                              │
│    • Route to appropriate service:                              │
│      - Code compliance → OpenAI GPT-4                           │
│      - Document analysis → Google Gemini                        │
│      - 3D conversion → Hunyuan3D-2                             │
│      - General chat → Best available                            │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CONTEXT ENRICHMENT                                           │
│    • Load user's project history                                │
│    • Retrieve recent chat messages                              │
│    • Include relevant documents                                 │
│    • Add blueprint analysis data                                │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. AI PROCESSING                                                │
│    ┌─────────────────────────────────────────────────────────┐│
│    │ OpenAI GPT-4 OR Google Gemini                            ││
│    │ • Generate comprehensive response                        ││
│    │ • Apply context and history                             ││
│    │ • Format output appropriately                           ││
│    │ • Time: 1-5 seconds                                      ││
│    │ • Fallback if primary service fails                     ││
│    └─────────────────────────────────────────────────────────┘│
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. RESPONSE DELIVERY                                            │
│    • Store AI response in database                              │
│    • Broadcast via Socket.IO / Supabase Real-time              │
│    • Update UI instantly                                        │
│    • Show typing indicators                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER LOGIN REQUEST                                           │
│    • Enter email and password                                   │
│    • Submit login form                                          │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. NEXTAUTH.JS VALIDATION                                       │
│    • Check credentials against Supabase Auth                    │
│    • Verify user exists in database                             │
│    • Compare password hash (bcrypt)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │ Valid                 │ Invalid
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ SESSION CREATION         │  │ LOGIN FAILED             │
│ • Generate JWT token     │  │ • Return error message   │
│ • Set HTTP-only cookie   │  │ • Log failed attempt     │
│ • Store in Supabase      │  │ • Apply rate limiting    │
└────────┬─────────────────┘  └──────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. LOAD USER PROFILE                                            │
│    • Fetch from Supabase users table                            │
│    • Load role and permissions                                  │
│    • Get department and team info                               │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. REDIRECT TO DASHBOARD                                        │
│    • Apply user preferences                                     │
│    • Load user's projects                                       │
│    • Initialize real-time subscriptions                         │
│    • Display personalized content                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: CLIENT-SIDE SECURITY                                   │
│ • HTTPS encryption (TLS 1.2+)                                   │
│ • Input validation before submission                            │
│ • Secure cookie storage (HTTP-only, Secure, SameSite)          │
│ • Content Security Policy (CSP)                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: API GATEWAY SECURITY                                   │
│ • JWT token validation                                          │
│ • Session verification (NextAuth.js)                            │
│ • CSRF protection                                               │
│ • Rate limiting per user/IP                                     │
│ • Input sanitization                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: ROW-LEVEL SECURITY (RLS)                               │
│ • PostgreSQL RLS policies on all tables                         │
│ • User can only access their own data                           │
│ • Team members can access shared projects                       │
│ • Admins have elevated permissions                              │
│                                                                  │
│ Example Policy:                                                  │
│ CREATE POLICY "Users can view their projects"                   │
│ ON projects FOR SELECT                                          │
│ USING (auth.uid() = created_by OR                              │
│        auth.uid() = ANY(team_members));                        │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 4: DATABASE SECURITY                                      │
│ • Encrypted at rest (AES-256)                                   │
│ • Encrypted in transit (TLS)                                    │
│ • Automated backups (point-in-time recovery)                    │
│ • Connection pooling for efficiency                             │
│ • Prepared statements (SQL injection prevention)                │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication & Authorization

- **NextAuth.js**: Industry-standard authentication
- **Supabase Auth**: Built-in user management
- **JWT Sessions**: Secure, stateless tokens
- **Password Hashing**: bcrypt with salt
- **Role-Based Access Control**: Multiple user roles (admin, manager, architect, etc.)

### Environment Security

```bash
# Required Environment Variables (stored securely)
NEXT_PUBLIC_SUPABASE_URL=          # Public, safe to expose
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Public, limited permissions
SUPABASE_SERVICE_ROLE_KEY=         # Secret, server-only
NEXTAUTH_SECRET=                   # Secret, session encryption
OPENAI_API_KEY=                    # Secret, API access
GOOGLE_AI_API_KEY=                 # Secret, API access
```

---

## 5. Deployment Architecture

### Current Production Deployment (Netlify)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIT REPOSITORY (GitHub)                       │
│  • Source code                                                  │
│  • Configuration files                                          │
│  • Automatic deployments on push                                │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NETLIFY BUILD PROCESS                         │
│  1. Pull latest code                                            │
│  2. Install dependencies (npm install)                          │
│  3. Build application (npm run build)                           │
│  4. Optimize assets                                             │
│  5. Deploy to CDN                                               │
│  Time: 2-5 minutes                                              │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NETLIFY EDGE NETWORK                           │
│  • Global CDN distribution                                      │
│  • Edge Functions (serverless)                                  │
│  • SSL/TLS encryption                                           │
│  • Auto-scaling                                                 │
│  • DDoS protection                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Alternative Deployment Options

#### Vercel (Recommended for Next.js)
- Optimal Next.js performance
- Edge Functions support
- Integrated analytics
- Easy GitHub integration

#### Railway
- Simple deployment process
- Built-in PostgreSQL
- Custom domains
- Docker support

#### Self-Hosted (Docker)
```yaml
version: '3.8'
services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  
  hunyuan3d:
    image: hunyuan3d-service
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 6. Performance & Scalability

### Current Performance Metrics

```
Frontend Performance:
  - Initial Load: <3s (95th percentile)
  - 3D Rendering: 60fps
  - Blueprint Analysis: 1.5-3.0s
  - API Response: <1s (complex operations)

Backend Performance:
  - Database Queries: <1s
  - File Processing: <10s (<5MB files)
  - Real-time Latency: <100ms
  - Concurrent Users: 500+
```

### Scalability Strategy

```
Current Architecture (0-10K users):
  ✓ Netlify auto-scaling
  ✓ Supabase connection pooling
  ✓ CDN caching
  ✓ Browser-based processing

Growth Phase (10K-100K users):
  → Add Redis caching layer
  → Scale Hunyuan3D GPU instances
  → Upgrade Supabase plan
  → Implement advanced monitoring

Enterprise Scale (100K+ users):
  → Microservices architecture
  → Kubernetes orchestration
  → Multi-region deployment
  → Database sharding
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│ BROWSER CACHE                                                    │
│ • Static assets (JS, CSS): 1 year                               │
│ • Images: 1 year with versioning                                │
│ • Service Worker (PWA): 24 hours                                │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ APPLICATION CACHE                                                │
│ • Blueprint analysis results: 10 minutes                        │
│ • User profile data: 5 minutes                                  │
│ • Project lists: 2 minutes                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ CDN CACHE (Netlify Edge)                                        │
│ • HTML pages: 5 minutes                                         │
│ • API responses (GET): 1 minute                                 │
│ • Static assets: 1 year                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ DATABASE CACHE                                                   │
│ • Prepared statements                                           │
│ • Connection pooling                                            │
│ • Query result caching (configurable)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Integration Points

### External Service Integrations

```typescript
// AI Services Integration
{
  "openai": {
    "service": "OpenAI GPT-4",
    "use_cases": ["chat", "compliance", "task_creation"],
    "fallback": "google_gemini"
  },
  "google_gemini": {
    "service": "Google Gemini",
    "use_cases": ["document_analysis", "risk_assessment"],
    "fallback": "openai"
  },
  "hunyuan3d": {
    "service": "Tencent Hunyuan3D-2",
    "use_cases": ["2d_to_3d_conversion", "texture_synthesis"],
    "fallback": "simulation_mode"
  }
}
```

### Database Schema Overview

```sql
-- Core Tables
users (
  id, email, name, role, department, 
  created_at, updated_at
)

projects (
  id, name, description, status, budget,
  created_by, team_members[], created_at
)

documents (
  id, project_id, file_name, file_type, 
  file_size, storage_url, created_at
)

chat_messages (
  id, user_id, project_id, content, 
  role, ai_model, created_at
)

bim_models (
  id, project_id, blueprint_id, model_url,
  format, quality, created_at
)

-- RLS Policies applied to all tables
```

### API Endpoints

```
Authentication:
  POST   /api/auth/signin
  POST   /api/auth/signout
  GET    /api/auth/session

File Operations:
  POST   /api/upload
  GET    /api/documents/:id
  DELETE /api/documents/:id

Blueprint Analysis:
  POST   /api/blueprint/analyze
  GET    /api/blueprint/:id/results

3D Conversion:
  POST   /api/hunyuan3d/convert
  GET    /api/hunyuan3d/status/:jobId
  GET    /api/hunyuan3d/download/:jobId

AI Chat:
  POST   /api/ai-chat/message
  GET    /api/ai-chat/history

Real-time:
  WS     /api/socket (WebSocket connection)
```

---

## 📊 Architecture Highlights

### Strengths
- ✅ **Modern Tech Stack**: Latest versions, best practices
- ✅ **Scalable Design**: Ready for growth
- ✅ **Security First**: Multi-layer protection
- ✅ **Performance Optimized**: Sub-3s response times
- ✅ **Real AI Integration**: Not simulation
- ✅ **Comprehensive Documentation**: Detailed guides

### Future Enhancements
- [ ] Redis caching layer
- [ ] Advanced monitoring (Sentry, Datadog)
- [ ] Multi-region deployment
- [ ] Kubernetes orchestration
- [ ] GraphQL API option
- [ ] Native mobile apps

---

## 📞 Support & Resources

- **Main Documentation**: README.md
- **Setup Guide**: docs/ENV_SETUP_GUIDE.md
- **Deployment Guide**: docs/DEPLOYMENT_GUIDE.md
- **Live Platform**: https://same-e9j95ysnu3c-latest.netlify.app

---

*Last Updated: November 5, 2025*  
*Platform Version: 13*  
*Architecture Version: 2.0*
