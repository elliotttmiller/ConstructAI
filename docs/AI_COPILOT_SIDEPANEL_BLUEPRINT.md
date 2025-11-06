# AI Copilot Sidepanel - Implementation Blueprint

## Executive Summary

Transform the current separate AI chat page into a **persistent, context-aware Autonomous AI copilot sidepanel** that is accessible throughout the entire platform. This sidepanel will leverage the newly implemented autonomous AI agent system to provide intelligent assistance that can actually execute tasks, not just respond with text.

---

## Vision & Goals

### Primary Objective
Create a seamless, omnipresent AutonomousAI assistant that understands user context and can autonomously execute actions across the platform without requiring users to leave their current workflow.

### Key Goals
- **Contextual Intelligence**: AI automatically knows what page, project, document, or model the user is viewing
- **Autonomous Execution**: AI can perform real actions (create tasks, analyze documents, trigger workflows)
- **Seamless Integration**: Sidepanel accessible from every page without disrupting user flow
- **Persistent State**: Conversation history maintained as users navigate
- **Intelligent Routing**: Automatically routes to appropriate specialized agent based on context

---

## Architecture Overview

### Component Hierarchy

```
Root Layout
├── Navigation Bar
├── Main Content Area
│   └── {Current Page Component}
├── AI Copilot Sidepanel (New)
│   ├── Toggle Button (Floating)
│   ├── Panel Container (Sliding)
│   ├── Chat Interface
│   ├── Context Display
│   └── Action Results
└── Global Context Provider (New)
```

### Data Flow

```
User Action → Context Provider Updates → AI Copilot Receives Context
                                              ↓
User Query → AI Service (with context) → Autonomous Tool Execution
                                              ↓
Real Action Performed → Result Display → UI Updates (if needed)
```

---

## Core Components

### 1. AI Copilot Sidepanel

**Core Features**:
- Smooth slide-in animation from right side of screen
- Resizable width (min 320px, max 600px, default 400px)
- Collapsible/expandable states
- Persistent across route navigation
- Proper z-index layering (above content, below modals)

**UI Structure**:

**Header Section**:
- Title: "AI Copilot" with current agent icon
- Context indicator showing active project/document
- Minimize/close buttons
- Settings dropdown for preferences

**Context Display Bar**:
- Current page context indicator
- Active resource information (project/document/model)
- Quick action buttons contextual to page

**Chat Area**:
- Message history with user/AI bubbles
- Agent type indicators (AI Assistant, Document, BIM, PM, Compliance, Risk, Upload)
- Tool execution indicators (spinner, success/error states)
- Rich content formatting (markdown, code blocks, tables)
- Expandable tool result cards

**Input Area**:
- Multiline text input
- Voice input button (future enhancement)
- Attachment button for document context
- Send button with Enter keyboard shortcut
- Agent selector dropdown
- Context injection button

**State Interface**:
```typescript
interface CopilotState {
  isOpen: boolean;
  width: number;
  messages: Message[];
  currentAgent: AgentType;
  contextAwareness: boolean;
  isProcessing: boolean;
  currentContext: PageContext;
}
```

---

### 2. Global Context Provider

**Purpose**: Track and provide real-time page/resource context to AI

**Context Data Structure**:
```typescript
interface CopilotContext {
  // Page Information
  currentPage: 'projects' | 'documents' | 'bim' | 'team' | 'workflows' | 'enterprise';
  currentRoute: string;
  
  // Resource Context
  activeProject?: {
    id: string;
    name: string;
    phase: string;
    location: string;
  };
  
  activeDocument?: {
    id: string;
    name: string;
    type: string;
    projectId: string;
  };
  
  activeBIMModel?: {
    id: string;
    name: string;
    projectId: string;
  };
  
  // User Context
  userId: string;
  userRole: string;
  teamId?: string;
  
  // Selection State
  selectedTasks?: string[];
  selectedDocuments?: string[];
  
  // Actions
  updateContext: (partial: Partial<CopilotContext>) => void;
  clearContext: () => void;
}
```

**Context Detection Logic**:
- Monitor route changes via router
- Extract resource IDs from URL parameters
- Track user selections (checkboxes, clicks)
- Detect document viewer state changes
- Monitor BIM model viewer state
- Auto-update on any context change

---

### 3. Floating Toggle Button

**Features**:
- Fixed position in bottom-right corner
- Pulsing animation when AI has suggestions
- Badge indicator for unread messages
- Keyboard shortcut activation (Cmd/Ctrl + K)
- Smooth expand animation to full panel
- Hover tooltip display

**Visual States**:
- **Default**: Static AI icon
- **Hover**: Scale up with shadow increase
- **Active**: Processing indicator
- **Notification**: Pulse animation with badge count

---

### 4. Context-Aware Agent Routing

**Purpose**: Automatically select the optimal AI agent based on current context and user intent

**Routing Strategy**:

**Priority 1 - Explicit Mentions**:
- User mentions agent name → Use that agent
- Examples: "ask suna", "compliance agent"

**Priority 2 - Page Context**:
- Documents page → Document agent
- BIM viewer → BIM agent
- Projects page → PM agent
- Team page → PM agent

**Priority 3 - Intent Keywords**:
- "compliance", "code", "regulation" → Compliance agent
- "risk", "safety", "hazard" → Risk agent
- "schedule", "task", "deadline" → PM agent
- "analyze", "review", "extract" → Document agent
- "model", "clash", "coordination" → BIM agent
- "upload", "process" → Upload agent

**Priority 4 - Default**:
- No clear match → AI Assistant orchestrator

**Routing Logic Pseudocode**:
```typescript
function selectOptimalAgent(message: string, context: CopilotContext): AgentType {
  // Check explicit mentions
  if (containsAgentName(message)) return extractAgentName(message);
  
  // Check page context
  if (context.currentPage === 'documents') return 'document';
  if (context.currentPage === 'bim') return 'bim';
  
  // Check intent keywords
  const keywords = extractKeywords(message);
  if (matchesPattern(keywords, compliancePatterns)) return 'compliance';
  if (matchesPattern(keywords, riskPatterns)) return 'risk';
  if (matchesPattern(keywords, pmPatterns)) return 'pm';
  if (matchesPattern(keywords, bimPatterns)) return 'bim';
  
  // Default orchestrator
  return 'suna';
}
```

---

### 5. Message & Interaction Components

**Message Bubble Component**:
- Distinct styling for user vs AI messages
- Agent avatar/icon display
- Timestamp on each message
- Message status indicators (sending, sent, error)
- Rich content rendering with markdown support

**Tool Execution Card Component**:
- Visual indicator when AI executes a tool
- Expandable/collapsible design
- Tool name and parameters display
- Real-time execution status (running, success, error)
- Results preview with full details option
- Retry and view details action buttons

**Context Card Component**:
- Displays current context AI is using
- Shows active project/document/model details
- Edit/remove context controls
- Visual indicator when context injected into query

**Suggested Actions Component**:
- AI-generated quick action suggestions
- Context-specific recommendations
- One-click execution
- Dismissible interface

---

## Integration Requirements

### Root Layout Integration

Wrap application with context provider and add sidepanel components:

```typescript
<CopilotContextProvider>
  <ThemeProvider>
    <AuthProvider>
      <Navbar />
      
      <main className="flex">
        <div className="flex-1">
          {children}
        </div>
        <AICopilotSidepanel />
      </main>
      
      <FloatingAIButton />
    </AuthProvider>
  </ThemeProvider>
</CopilotContextProvider>
```

### Page-Level Context Updates

Each major page should update context when user navigates or selects resources:

**Projects Page Integration**:
```typescript
const { updateContext } = useCopilotContext();

useEffect(() => {
  if (selectedProject) {
    updateContext({
      currentPage: 'projects',
      activeProject: selectedProject
    });
  }
}, [selectedProject]);
```

**Documents Page Integration**:
```typescript
useEffect(() => {
  if (openDocument) {
    updateContext({
      currentPage: 'documents',
      activeDocument: openDocument,
      activeProject: openDocument.project
    });
  }
}, [openDocument]);
```

**BIM Viewer Integration**:
```typescript
useEffect(() => {
  if (loadedModel) {
    updateContext({
      currentPage: 'bim',
      activeBIMModel: loadedModel,
      activeProject: loadedModel.project
    });
  }
}, [loadedModel]);
```

---

## AI Service Integration

### Enhanced Chat API

**New Request Structure**:
```typescript
POST /api/ai-chat
{
  message: string;
  agentType?: string;        // Optional, will auto-select if not provided
  context: CopilotContext;   // Full context object
  threadId?: string;         // For conversation continuity
  contextAwareness: boolean; // Enable/disable auto-context
}
```

**Enhanced Response Structure**:
```typescript
{
  content: string;
  model: string;
  agentType: string;
  usage?: TokenUsage;
  reasoning?: string;
  toolCalls?: ToolExecution[];
  suggestions?: SuggestedAction[];
  threadId: string;
  timestamp: string;
}
```

**API Handler Flow**:
1. Receive message with context
2. Determine optimal agent (if not specified)
3. Enrich context with additional data
4. Execute AI request with autonomous tools enabled
5. Generate suggested follow-up actions
6. Return comprehensive response

---

## State Management

### Global Copilot Store

Use Zustand for lightweight global state management:

```typescript
interface CopilotStore {
  // Panel State
  isOpen: boolean;
  width: number;
  
  // Conversation
  messages: Message[];
  currentThreadId: string | null;
  
  // Context
  context: CopilotContext;
  contextAwareness: boolean;
  
  // Agent
  currentAgent: AgentType;
  availableAgents: AgentType[];
  
  // Processing
  isProcessing: boolean;
  pendingToolExecutions: ToolExecution[];
  
  // Actions
  togglePanel: () => void;
  setWidth: (width: number) => void;
  sendMessage: (message: string, agent?: AgentType) => Promise<void>;
  updateContext: (context: Partial<CopilotContext>) => void;
  switchAgent: (agent: AgentType) => void;
  clearConversation: () => void;
  toggleContextAwareness: () => void;
}
```

### Persistence Strategy

**Local Storage**:
- `copilot_panel_state`: Open/closed state
- `copilot_panel_width`: User-adjusted width
- `copilot_messages`: Last 50 messages
- `copilot_preferences`: User settings

**Session Storage**:
- `copilot_thread_id`: Current conversation thread
- `copilot_temp_context`: Temporary context overrides

---

## User Experience Features

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Toggle copilot panel |
| `Cmd/Ctrl + Shift + K` | Open with current context |
| `Esc` | Close panel |
| `Cmd/Ctrl + L` | Clear conversation |
| `Cmd/Ctrl + /` | Focus input |
| `Enter` | Send message |
| `Shift + Enter` | New line |

### Contextual Quick Actions

**Projects Page Actions**:
- "Analyze project status"
- "Show overdue tasks"
- "Create new task"
- "Generate project report"

**Documents Page Actions**:
- "Analyze this document"
- "Check compliance"
- "Extract specifications"
- "Compare with previous"

**BIM Viewer Actions**:
- "Run clash detection"
- "Generate quantity takeoff"
- "Check coordination issues"
- "Export model report"

**Team Page Actions**:
- "Show team workload"
- "Suggest task assignments"
- "Analyze performance"

### Smart Proactive Suggestions

AI suggests actions based on:
- **Time patterns**: Morning task reviews
- **Events**: Document uploaded → suggest analysis
- **User patterns**: Regular Monday compliance checks
- **Context triggers**: Overdue tasks → suggest review

---

## Autonomous Tool Execution Display

### Tool Execution Visibility

When AI executes autonomous tools, display:

1. **Tool Identifier**
   - Tool name (e.g., "analyze_uploaded_document")
   - Tool category icon

2. **Execution Parameters**
   - Document ID, analysis type, etc.
   - Formatted for readability

3. **Status Indicator**
   - Running: Animated spinner
   - Success: Green checkmark
   - Error: Red X with error message

4. **Timing Information**
   - Start time
   - Duration
   - Completion time

5. **Results Display**
   - Quick summary preview
   - Expandable detailed results
   - Structured data visualization

### Action Confirmation System

Optional confirmation for sensitive operations:

**Requires Confirmation**:
- Task creation (preview details first)
- Bulk operations (show affected items)
- Delete/archive actions (confirm intent)

**Configuration**:
```typescript
interface ConfirmationConfig {
  requireConfirmation: boolean;
  sensitiveActions: string[];
  alwaysConfirm: boolean;
}
```

---

## Visual Design Specifications

### Panel Styling

```css
.ai-copilot-panel {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: var(--panel-width, 400px);
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  z-index: 900;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}

.ai-copilot-panel.open {
  transform: translateX(0);
}
```

### Responsive Design

**Desktop (> 1024px)**:
- Full functionality
- Default: 400px width
- Resizable: 320px - 600px range

**Tablet (768px - 1024px)**:
- Fixed width: 360px
- Non-resizable
- Overlays content

**Mobile (< 768px)**:
- Full-screen overlay
- Slide up from bottom
- Prominent close button
- Touch-optimized controls

---

## Technical Considerations

### Performance Optimization

**Lazy Loading**:
- Load copilot components only when first opened
- Defer context provider until needed
- On-demand conversation history loading

**Memoization**:
```typescript
// Memoize context enrichment
const enrichedContext = useMemo(() => 
  enrichContext(rawContext), 
  [rawContext]
);

// Memoize message list
const MessageList = memo(({ messages }) => 
  messages.map(msg => <MessageBubble key={msg.id} {...msg} />)
);
```

**Debouncing**:
- Context updates: 500ms
- Typing indicators: 300ms
- Resize events: 100ms

### Error Handling

**Network Failures**:
- Auto-retry (max 3 attempts)
- Error state with retry button
- Offline mode indicator

**AI Service Errors**:
- Friendly error messages
- Alternative action suggestions
- Manual agent override option

**Tool Execution Failures**:
- Display failed tool name
- Show error reason
- Offer retry with different params

### Security & Privacy

**Context Filtering**:
- Remove sensitive data before AI submission
- Respect user permission levels
- Sanitize all user input

**Rate Limiting**:
- Per-user request limits (e.g., 100/hour)
- Client-side throttling
- Quota display in UI

**Data Privacy**:
- Conversation encryption in storage
- Automatic conversation expiry
- User-controlled data deletion

---

## Accessibility Requirements

### Keyboard Navigation
- Full keyboard accessibility
- Focus management on open/close
- Screen reader skip links
- Logical tab order

### Screen Reader Support
- ARIA labels on all controls
- Live regions for AI responses
- Status announcements for tool execution
- Descriptive alternative text

### Visual Accessibility
- High contrast mode support
- Respect reduced motion preferences
- Minimum 14px font size
- Color-blind friendly indicators

---

## Migration Strategy

### Implementation Phases

**Phase 1: Infrastructure**
- Create context provider
- Set up global state management
- Build basic sidepanel structure
- Add floating toggle button
- Test open/close/resize/persistence

**Phase 2: Context System**
- Implement context tracking per page
- Test context updates on navigation
- Verify context accuracy
- Add context display in panel

**Phase 3: AI Integration**
- Connect panel to AI services
- Implement agent routing
- Test autonomous tool execution
- Verify context passing

**Phase 4: Enhanced Features**
- Add tool execution visibility
- Implement suggested actions
- Add keyboard shortcuts
- Polish animations

**Phase 5: Cleanup**
- Remove old chat page
- Update navigation
- Redirect old routes
- Performance optimization
- Accessibility improvements

---

## Testing Strategy

### Unit Tests
- Context provider state updates
- Agent routing logic
- Message formatting utilities
- Tool execution handlers

### Integration Tests
- Panel functionality
- Context updates across pages
- AI message flow
- Tool execution with services

### End-to-End Tests
- User sends message, receives response
- Context-aware routing verification
- Keyboard shortcuts
- Autonomous tool execution

### User Acceptance Testing
- Test with construction users
- Context detection accuracy
- Suggested actions usefulness
- Task completion improvements

---

## Monitoring & Analytics

### Key Performance Indicators

**Usage Metrics**:
- Panel open rate
- Session duration
- Messages per session
- Most used agents

**Performance Metrics**:
- AI response time
- Tool execution time
- Panel render time
- Context update latency

**Accuracy Metrics**:
- Agent selection accuracy
- Context override frequency
- Manual edits required

**Adoption Metrics**:
- Keyboard shortcut usage
- Suggested action clicks
- Context awareness on/off
- Tool execution success rate

---

## Future Enhancements

### Post-Launch Features

**Voice Integration**:
- Speech-to-text input
- Voice commands
- Multi-language support

**Proactive AI**:
- Monitor user activity
- Suggest actions before asked
- Anomaly detection
- Predictive assistance

**Collaboration**:
- Shared AI conversations
- Team-wide AI memory
- User handoff support

**Advanced Context**:
- Learn user preferences
- Remember conversation history
- Pattern recognition
- Project context memory

**Mobile Native**:
- Native mobile panel
- Push notifications
- Offline mode with sync

**Customization**:
- Custom agent creation
- Agent marketplace
- Company-specific fine-tuning

---

## Success Criteria

### Launch Requirements (Must-Have)
✅ Sidepanel on all major pages
✅ Automatic context detection
✅ Autonomous tool execution working
✅ State persistence across navigation
✅ Keyboard shortcuts functional
✅ Mobile responsive design

### Post-Launch Goals (Should-Have)
- Context-based suggested actions
- Tool execution visualization
- Conversation history persistence
- Agent routing accuracy >80%
- Average response time <5 seconds

### Future Goals (Nice-to-Have)
- Voice input capability
- Proactive suggestions
- Custom agent support
- Team collaboration features
- Advanced analytics dashboard

---

## Required Dependencies

### New Packages to Install
- `framer-motion`: Smooth panel animations
- `zustand`: Lightweight state management
- `react-use`: Utility hooks (resize, keyboard)
- `react-markdown`: Message content rendering
- `react-syntax-highlighter`: Code block formatting

### Existing Services (Already Built)
✅ AI Services with autonomous tools
✅ 8 autonomous tool definitions
✅ AI configuration system
✅ Workflow orchestrator
✅ Multi-agent routing

---

## Risk Management

### Identified Risks & Mitigations

**Risk: Panel Distraction**
- Mitigation: Default closed, remember preference, easy disable

**Risk: Context Inaccuracy**
- Mitigation: Manual editing, clear display, override controls

**Risk: Performance Impact**
- Mitigation: Lazy loading, debouncing, render optimization

**Risk: Mobile UX Issues**
- Mitigation: Full-screen overlay, touch optimization, simplified layout

---

## Conclusion

This blueprint outlines the transformation of AI from a separate feature into an **integral, omnipresent copilot** that enhances every aspect of the platform. By leveraging autonomous AI agents, users can seamlessly interact with intelligent assistance that understands their context and executes real actions without disrupting their workflow.

### Core Benefits

- **Always Available**: Never more than one click away
- **Context-Aware**: Automatically understands what user is viewing
- **Action-Oriented**: Executes real tasks, not just text responses
- **User-Controlled**: Customizable, resizable, and user-managed
- **Future-Proof**: Foundation for advanced AI features

This positions the platform as a truly **AI-native construction management tool** where artificial intelligence is fundamental to how users interact with their projects, not just an optional feature they occasionally visit.
