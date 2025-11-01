# ConstructAI Frontend

Enterprise-grade Next.js frontend for the ConstructAI platform - AI-powered construction workflow optimization and specification analysis.

## 🚀 Features

- **Zero Mock Data Policy**: All data comes from real backend API
- **Two-Panel Layout**: Projects Sidebar + AI Studio workspace
- **Premium Design System**: Inter font, professional color palette, intelligent spacing
- **Real-time AI Streaming**: Live updates during analysis and optimization
- **Professional States**: Loading skeletons, empty states, error boundaries
- **Type-Safe**: Full TypeScript implementation with strict types
- **Performance Optimized**: Next.js 16+ App Router, React Query, optimized bundles
- **Accessible**: WCAG 2.1 AAA compliance with keyboard navigation and ARIA labels

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- ConstructAI backend running (Python FastAPI)

## 🔧 Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your backend API URL
```

## 🎯 Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

The application will connect to the backend API at the URL specified in `NEXT_PUBLIC_API_URL` (default: http://localhost:8000).

## 🏗️ Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
app/
├── layout.tsx              # Root layout with Inter font
├── page.tsx                # Main two-panel interface
├── loading.tsx             # Professional loading states
├── error.tsx               # Error boundaries
├── providers.tsx           # React Query provider
├── globals.css             # Design system CSS variables
├── components/
│   ├── data/               # Real data components
│   │   ├── project-card.tsx
│   │   └── metric-card.tsx
│   ├── ui/                 # Design system components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── skeleton.tsx
│   │   ├── empty-state.tsx
│   │   └── error-boundary.tsx
│   └── layout/             # Layout components
│       ├── top-bar.tsx
│       ├── projects-sidebar.tsx
│       └── ai-studio.tsx
└── lib/
    ├── api/                # API client
    │   └── client.ts
    ├── types/              # TypeScript types
    │   └── index.ts
    └── utils/              # Utility functions
        └── index.ts
```

## 🎨 Design System

### Colors
- Primary Background: `#fafbfc`
- Surface: `#ffffff`
- Primary Accent: `#4f46e5` (Indigo)
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`

### Typography
- Font Family: Inter
- Weights: 300, 400, 500, 600, 700
- Scale: 10px to 48px

### Spacing
- Base unit: 4px
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px

## 🔌 API Integration

All data is fetched from the ConstructAI FastAPI backend. No mock data is used.

### Endpoints Used
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/v1/audit` - Audit project
- `POST /api/v1/optimize` - Optimize project
- `POST /api/v1/analyze` - Full analysis

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## 🚀 Performance

- Optimized with Next.js App Router
- Server-side rendering for initial load
- Client-side navigation for instant transitions
- Code splitting for optimal bundle sizes
- Image optimization with next/image
- Font optimization with next/font

## ♿ Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Screen reader optimized
- Focus management
- High contrast support
- Color contrast ratio 7:1 (AAA)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## 🤝 Contributing

This frontend strictly follows the `frontend_plan.md` specification:
- Zero mock data policy
- Two-panel layout architecture
- Professional loading/error/empty states
- Type-safe API contracts
- Premium design system

## 📄 License

MIT License - see root LICENSE file for details
