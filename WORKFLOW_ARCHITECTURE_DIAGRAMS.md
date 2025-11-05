# ConstructAI Platform - Workflow & Architecture Diagrams

**Date**: November 5, 2025  
**Platform Version**: 13 (Production)  
**Purpose**: Visual representation of platform workflows and architecture

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                 │
│  Web Browsers • Mobile Devices • Tablets                               │
│  Chrome, Firefox, Safari, Edge (Modern Browsers)                       │
└────────────────────────────┬───────────────────────────────────────────┘
                             │ HTTPS/WSS
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER (Next.js 15)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ 3D BIM      │  │ AI Chat      │  │ Blueprint    │  │ Project     ││
│  │ Viewer      │  │ Interface    │  │ Upload       │  │ Management  ││
│  │ (Three.js)  │  │ (Suna AI)    │  │ (OCR/CV)     │  │ (Dashboard) ││
│  └─────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
│                                                                         │
│  React 18 Components • TypeScript • Tailwind CSS • Socket.IO Client   │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER (Next.js API Routes)              │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐│
│  │ Authentication│  │ File Upload  │  │ AI Services│  │ Real-time   ││
│  │ (NextAuth)    │  │ Handler      │  │ Router     │  │ WebSocket   ││
│  └───────────────┘  └──────────────┘  └────────────┘  └─────────────┘│
└──────┬─────────────────┬────────────────┬────────────────┬────────────┘
       │                 │                │                │
       ▼                 ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SUPABASE    │  │ BACKEND API  │  │ AI SERVICES  │  │ 3D SERVICE   │
│              │  │              │  │              │  │              │
│ • PostgreSQL │  │ • FastAPI    │  │ • OpenAI     │  │ • Hunyuan3D-2│
│ • Auth       │  │ • Uvicorn    │  │   GPT-4      │  │   Models     │
│ • Storage    │  │ • Python     │  │ • Google     │  │ • GPU        │
│ • Real-time  │  │ • Pydantic   │  │   Gemini     │  │   Inference  │
│ • RLS        │  │ • Async      │  │ • Tesseract  │  │ • Texture    │
│              │  │              │  │ • OpenCV     │  │   Synthesis  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 2. Blueprint Upload & Analysis Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                              │
│  User drags blueprint file onto upload zone                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND VALIDATION                               │
│  1. Check file type (JPG, PNG, PDF, DWG, DXF)                      │
│  2. Validate file size (< 50MB)                                     │
│  3. Preview image in browser                                        │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  IMAGE PREPROCESSING (Browser)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ OpenCV.js Processing:                                         │  │
│  │ • Contrast enhancement                                        │  │
│  │ • Noise reduction                                             │  │
│  │ • Line sharpening                                             │  │
│  │ • Resize to optimal dimensions (max 2048px)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PARALLEL ANALYSIS (Browser - Multi-threaded)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ OCR Analysis │  │ Line         │  │ Element Classification    │  │
│  │              │  │ Detection    │  │                          │  │
│  │ Tesseract.js │  │              │  │ • Identify walls         │  │
│  │ • Extract    │  │ Hough        │  │ • Detect doors/windows   │  │
│  │   text       │  │ Transform    │  │ • Find rooms             │  │
│  │ • Room labels│  │ • Detect     │  │ • Locate fixtures        │  │
│  │ • Dimensions │  │   lines      │  │ • Scale detection        │  │
│  │ • Notes      │  │ • Classify   │  │ • Drawing type           │  │
│  │              │  │   types      │  │                          │  │
│  │ Time: 0.5-2s │  │ Time: 1-2s   │  │ Time: 0.5-1s             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└────────┬────────────────┬────────────────┬──────────────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESULTS AGGREGATION                               │
│  Combine all analysis results:                                      │
│  • Total processing time: 1.5-3.0 seconds                           │
│  • Elements detected: 20+ types                                     │
│  • OCR confidence: 60-95%                                           │
│  • Line detection accuracy: 85%+                                    │
│  • Cache results for 10 minutes                                     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DISPLAY RESULTS                                   │
│  4-Tab Analysis Interface:                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │ Overview   │ │ Elements   │ │ Analysis   │ │ Technical  │     │
│  │            │ │            │ │            │ │            │     │
│  │ • Count    │ │ • Walls    │ │ • Complexity│ │ • Service  │     │
│  │ • Quality  │ │ • Doors    │ │ • Quality  │ │   Status   │     │
│  │ • Metrics  │ │ • Windows  │ │ • Scores   │ │ • Processing│     │
│  │            │ │ • Rooms    │ │            │ │   Details  │     │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ User clicks "Convert to 3D"
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 3D CONVERSION REQUEST                                │
│  Request sent to Hunyuan3D-2 service:                               │
│  • Blueprint image                                                   │
│  • Analysis metadata                                                 │
│  • Quality preference (fast/standard/high)                          │
│  • Style option (architectural/realistic)                           │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│           HUNYUAN3D-2 PROCESSING (GPU Server)                        │
│  1. Shape Generation (15-30 seconds)                                │
│     • Neural network inference                                      │
│     • 3D geometry generation                                        │
│     • Mesh optimization                                             │
│                                                                      │
│  2. Texture Synthesis (15-30 seconds, optional)                     │
│     • Material generation                                           │
│     • UV mapping                                                    │
│     • Texture application                                           │
│                                                                      │
│  Real-time progress updates via WebSocket                           │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   3D MODEL LOADING                                   │
│  1. Download 3D model (OBJ/GLTF format)                             │
│  2. Load into Three.js viewer                                       │
│  3. Initialize controls and camera                                  │
│  4. Enable interaction (zoom, pan, rotate)                          │
│  5. Display element properties on click                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. AI Chat & Agent Interaction Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER SENDS MESSAGE                                │
│  User types message in Suna AI chat interface                       │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION CHECK                                │
│  NextAuth.js validates user session:                                │
│  • Check JWT token validity                                         │
│  • Verify user permissions                                          │
│  • Load user context                                                │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  MESSAGE PERSISTENCE                                 │
│  Store in Supabase:                                                 │
│  • Message content                                                  │
│  • User ID and timestamp                                            │
│  • Project context (if applicable)                                  │
│  • Message role (user)                                              │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   INTENT ANALYSIS                                    │
│  Analyze message to determine:                                      │
│  • Task type (compliance, analysis, chat, etc.)                     │
│  • Required context (project data, documents)                       │
│  • Appropriate AI service                                           │
│  • Response complexity                                              │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│               AI SERVICE SELECTION                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Decision Logic:                                              │   │
│  │                                                              │   │
│  │ IF task == "code compliance" AND openai.available           │   │
│  │    → Use OpenAI GPT-4                                       │   │
│  │                                                              │   │
│  │ ELSE IF task == "document analysis" AND gemini.available    │   │
│  │    → Use Google Gemini                                      │   │
│  │                                                              │   │
│  │ ELSE IF task == "3d conversion" AND hunyuan3d.available     │   │
│  │    → Use Hunyuan3D-2                                        │   │
│  │                                                              │   │
│  │ ELSE                                                         │   │
│  │    → Use best available service with fallback              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 CONTEXT ENRICHMENT                                   │
│  Build comprehensive context:                                       │
│  • User's project history                                           │
│  • Recent chat messages                                             │
│  • Relevant documents                                               │
│  • Blueprint analysis data                                          │
│  • Building codes and regulations                                   │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AI PROCESSING                                      │
│  ┌────────────────┐         ┌────────────────┐                     │
│  │ OpenAI GPT-4   │   OR    │ Google Gemini  │                     │
│  │                │         │                │                     │
│  │ • Complex      │         │ • Document     │                     │
│  │   reasoning    │         │   analysis     │                     │
│  │ • Compliance   │         │ • Multi-modal  │                     │
│  │   checking     │         │ • Risk assess  │                     │
│  │ • Task mgmt    │         │ • Insights     │                     │
│  │                │         │                │                     │
│  │ Response time: │         │ Response time: │                     │
│  │ 2-5 seconds    │         │ 1-3 seconds    │                     │
│  └────────────────┘         └────────────────┘                     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 RESPONSE PROCESSING                                  │
│  • Parse AI response                                                │
│  • Extract actionable items                                         │
│  • Format for display                                               │
│  • Generate follow-up suggestions                                   │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 MESSAGE PERSISTENCE                                  │
│  Store AI response in Supabase:                                     │
│  • Response content                                                 │
│  • AI model used                                                    │
│  • Processing time                                                  │
│  • Message role (assistant)                                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              REAL-TIME MESSAGE DELIVERY                              │
│  Via Socket.IO / Supabase Real-time:                                │
│  • Broadcast to user's session                                      │
│  • Update UI instantly                                              │
│  • Show typing indicators                                           │
│  • Enable interactive elements                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER LOGIN REQUEST                              │
│  User enters email and password                                     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 NEXTAUTH.JS VALIDATION                               │
│  1. Check credentials against Supabase Auth                         │
│  2. Verify user exists in database                                  │
│  3. Compare password hash (bcrypt)                                  │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ├─────────── Invalid ──────────┐
                 │                              │
                 ▼ Valid                        ▼
┌────────────────────────────────┐  ┌─────────────────────────────┐
│      SESSION CREATION          │  │   LOGIN FAILED              │
│  • Generate JWT token          │  │   • Return error message    │
│  • Set secure HTTP-only cookie │  │   • Log failed attempt      │
│  • Store session in Supabase   │  │   • Apply rate limiting     │
└────────────┬───────────────────┘  └─────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LOAD USER PROFILE                                 │
│  From Supabase users table:                                         │
│  • User ID                                                          │
│  • Name, email                                                      │
│  • Role (admin, manager, architect, etc.)                           │
│  • Permissions array                                                │
│  • Department and team                                              │
└────────────┬────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               REDIRECT TO DASHBOARD                                  │
│  • Apply user theme preferences                                     │
│  • Load user's projects                                             │
│  • Initialize real-time subscriptions                               │
│  • Display personalized content                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  SUBSEQUENT API REQUESTS                             │
│                                                                      │
│  Request → Middleware → Auth Check → RLS → Response                 │
│                                                                      │
│  1. Extract JWT from cookie                                         │
│  2. Verify token signature                                          │
│  3. Check token expiration                                          │
│  4. Apply Row-Level Security (RLS)                                  │
│  5. Check user permissions                                          │
│  6. Process request if authorized                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Real-time Collaboration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MULTIPLE USERS ONLINE                             │
│  User A (Desktop) • User B (Laptop) • User C (Tablet)              │
└──────┬────────────────────────┬────────────────────────┬────────────┘
       │                        │                        │
       │ WebSocket              │ WebSocket              │ WebSocket
       │                        │                        │
       ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   SOCKET.IO SERVER (Port 3001)                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Connection Manager:                                            │  │
│  │ • Maintain active connections                                 │  │
│  │ • Handle reconnection logic                                   │  │
│  │ • Broadcast to rooms/channels                                 │  │
│  │ • Track user presence                                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│             SUPABASE REAL-TIME SUBSCRIPTIONS                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Real-time Channels:                                            │  │
│  │                                                                │  │
│  │ • projects:*              → Project updates                   │  │
│  │ • chat_messages:*         → New messages                      │  │
│  │ • documents:*             → File uploads/changes              │  │
│  │ • tasks:*                 → Task status changes               │  │
│  │ • bim_models:*            → 3D model updates                  │  │
│  │                                                                │  │
│  │ Each channel has Row-Level Security (RLS) applied             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ Events propagated to all subscribed clients
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME EVENT FLOW                              │
│                                                                      │
│  User A uploads document                                            │
│         │                                                            │
│         ▼                                                            │
│  Store in Supabase Storage                                          │
│         │                                                            │
│         ▼                                                            │
│  Insert record in documents table                                   │
│         │                                                            │
│         ▼                                                            │
│  Trigger real-time event: "documents:INSERT"                        │
│         │                                                            │
│         ├──────────────┬──────────────┐                             │
│         ▼              ▼              ▼                             │
│     User A          User B          User C                          │
│  (Confirmation)  (Notification)  (Notification)                     │
│                                                                      │
│  All users see document appear in their list instantly              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow & Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT SIDE                                 │
│  • User authentication (session stored in secure cookie)            │
│  • HTTPS encryption for all requests                                │
│  • Input validation before submission                               │
└────────────────┬────────────────────────────────────────────────────┘
                 │ TLS 1.2+ Encrypted
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
│  Security Checks:                                                   │
│  ✓ JWT token validation                                             │
│  ✓ Session verification                                             │
│  ✓ CSRF protection                                                  │
│  ✓ Rate limiting                                                    │
│  ✓ Input sanitization                                               │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ROW-LEVEL SECURITY (RLS)                           │
│  Supabase PostgreSQL Policies:                                      │
│                                                                      │
│  Example: Project Access                                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ CREATE POLICY "Users can view their projects"                 │  │
│  │ ON projects FOR SELECT                                        │  │
│  │ USING (                                                       │  │
│  │   auth.uid() = created_by                                     │  │
│  │   OR auth.uid() = ANY(team_members)                           │  │
│  │ );                                                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  This ensures users can only access data they're authorized for     │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
│  • Encrypted at rest (AES-256)                                      │
│  • Automated backups (Point-in-time recovery)                       │
│  • Connection pooling for performance                               │
│  • Query optimization and indexing                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                                │
│                                                                      │
│  1. Write code locally                                              │
│  2. Run tests (npm test)                                            │
│  3. Commit to Git branch                                            │
│  4. Create Pull Request                                             │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   CONTINUOUS INTEGRATION                             │
│  GitHub Actions / CI Pipeline:                                      │
│  • Run linters (ESLint, Biome)                                      │
│  • Type checking (TypeScript)                                       │
│  • Run unit tests                                                   │
│  • Run integration tests                                            │
│  • Security scanning                                                │
│  • Build production bundle                                          │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ All checks passed
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   MERGE TO MAIN BRANCH                               │
│  • Code review approved                                             │
│  • All CI checks passed                                             │
│  • Merge commit created                                             │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 │ Auto-trigger deployment
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 NETLIFY DEPLOYMENT                                   │
│  1. Pull latest code from Git                                       │
│  2. Install dependencies (npm install)                              │
│  3. Build application (npm run build)                               │
│  4. Deploy to CDN                                                   │
│  5. Update environment variables                                    │
│  6. Deploy Edge Functions                                           │
│  7. Run smoke tests                                                 │
│  8. Update production URL                                           │
│                                                                      │
│  Total deployment time: 2-5 minutes                                 │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 PRODUCTION MONITORING                                │
│  • Health check endpoints                                           │
│  • Error tracking (recommended: Sentry)                             │
│  • Performance monitoring                                           │
│  • User analytics                                                   │
│  • Uptime monitoring                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND SERVICE                                │
│  Next.js 15 Application (Port 3000)                                 │
│  • Server-side rendering                                            │
│  • API routes                                                       │
│  • Static asset serving                                             │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ├───────────────┬──────────────┬────────────────────┐
                 │               │              │                    │
                 ▼               ▼              ▼                    ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ BACKEND API      │  │ AI SERVICES  │  │ 3D SERVICE   │  │ DATABASE     │
│                  │  │              │  │              │  │              │
│ FastAPI Server   │  │ Multiple     │  │ Hunyuan3D-2  │  │ Supabase     │
│ (Port 8000)      │  │ Providers    │  │ Server       │  │ PostgreSQL   │
│                  │  │              │  │ (Port 8000)  │  │              │
│ • REST API       │  │ • OpenAI     │  │              │  │ • Tables     │
│ • Data validation│  │ • Google     │  │ • GPU        │  │ • RLS        │
│ • Business logic │  │ • OCR/CV     │  │   Inference  │  │ • Real-time  │
│                  │  │              │  │ • Model      │  │ • Storage    │
│                  │  │              │  │   Cache      │  │ • Auth       │
└──────────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

                      Independent Services:
                      • Can scale separately
                      • Can deploy independently
                      • Have own error handling
                      • Communicate via HTTP/REST
```

---

## 9. Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER CACHE                                 │
│  • Static assets (JS, CSS, images) - 1 year                        │
│  • Service Worker (PWA) - 24 hours                                  │
│  • localStorage for user preferences                                │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION CACHE                                │
│  • Blueprint analysis results - 10 minutes                          │
│  • User profile data - 5 minutes                                    │
│  • Project lists - 2 minutes                                        │
│  • Team member lists - 5 minutes                                    │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CDN CACHE (Netlify)                            │
│  • HTML pages - 5 minutes                                           │
│  • API responses (GET only) - 1 minute                              │
│  • Images - 1 year with versioning                                  │
│  • Fonts and icons - 1 year                                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  DATABASE QUERY CACHE                                │
│  Supabase built-in caching:                                         │
│  • Prepared statements                                              │
│  • Connection pooling                                               │
│  • Query result caching (configurable)                              │
└─────────────────────────────────────────────────────────────────────┘

Future Enhancement: Redis for distributed caching
```

---

## 10. Error Handling & Recovery

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ERROR DETECTION                                  │
│  Errors can occur at any layer:                                    │
│  • Client-side (JavaScript errors)                                  │
│  • Network errors (timeouts, connection issues)                     │
│  • API errors (validation, business logic)                          │
│  • Database errors (constraint violations)                          │
│  • AI service errors (rate limits, model issues)                    │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ERROR CLASSIFICATION                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ RECOVERABLE    │  │ DEGRADED       │  │ FATAL          │       │
│  │                │  │                │  │                │       │
│  │ • Network      │  │ • AI service   │  │ • Auth failure │       │
│  │   timeout      │  │   unavailable  │  │ • Permission   │       │
│  │ • Temp file    │  │ • GPU memory   │  │   denied       │       │
│  │   lock         │  │   full         │  │ • Corrupt data │       │
│  │                │  │                │  │                │       │
│  │ Action: Retry  │  │ Action:        │  │ Action: Error  │       │
│  │ with backoff   │  │ Use fallback   │  │ page & log     │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
└────────────────┬──────────────┬──────────────┬─────────────────────┘
                 │              │              │
                 ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RECOVERY STRATEGIES                               │
│                                                                      │
│  Automatic Retry:                                                   │
│  • Exponential backoff (1s, 2s, 4s, 8s)                            │
│  • Maximum 3 retry attempts                                         │
│  • Only for transient errors                                        │
│                                                                      │
│  Graceful Degradation:                                              │
│  • AI service down → Use fallback AI                                │
│  • 3D service down → Use simulation mode                            │
│  • Real-time down → Polling fallback                                │
│                                                                      │
│  User Notification:                                                 │
│  • Clear error messages                                             │
│  • Suggested actions                                                │
│  • Contact support option                                           │
│  • Retry buttons where applicable                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary

This document provides comprehensive visual representations of:

1. **System Architecture** - Overall platform structure
2. **Blueprint Workflow** - Upload to 3D conversion process
3. **AI Chat Flow** - Message processing and AI interaction
4. **Authentication** - Security and session management
5. **Real-time Collaboration** - Multi-user synchronization
6. **Data Security** - Multiple protection layers
7. **Deployment Pipeline** - CI/CD and production process
8. **Microservices** - Service separation and communication
9. **Caching Strategy** - Multi-layer performance optimization
10. **Error Handling** - Detection, classification, and recovery

These diagrams complement the comprehensive analysis document and provide clear visual understanding of the ConstructAI platform's architecture and workflows.

---

**Document Version**: 1.0  
**Created**: November 5, 2025  
**For**: ConstructAI Platform Study  
**Related**: PLATFORM_COMPREHENSIVE_ANALYSIS.md

---
