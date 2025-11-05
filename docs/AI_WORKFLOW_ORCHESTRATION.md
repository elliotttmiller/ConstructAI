# AI Workflow Orchestration System

## Overview

The AI Workflow Orchestration System provides end-to-end integration of AI-powered logic across the ConstructAI platform. It automatically coordinates multi-agent workflows, processes data through appropriate AI services, and generates actionable insights.

## Architecture

### Core Components

#### 1. AI Workflow Orchestrator (`src/lib/ai-workflow-orchestrator.ts`)

The central orchestration service that manages all AI-powered workflows:

- **Document Upload Workflow**: Analyzes uploaded documents using AI
- **BIM Analysis Workflow**: Processes 3D models and detects clashes
- **Project Creation Workflow**: Generates project insights and recommendations
- **Task Auto-Assignment Workflow**: Intelligently assigns tasks to team members
- **Compliance Check Workflow**: Validates building code compliance

#### 2. API Integration Points

All major API endpoints are integrated with the workflow orchestrator:

- `/api/upload` - Document uploads trigger AI analysis
- `/api/projects` - Project creation triggers AI insights
- `/api/bim` - BIM uploads trigger model analysis
- `/api/tasks` - Task creation can trigger auto-assignment
- `/api/compliance` - On-demand compliance checking
- `/api/ai-workflow` - Direct workflow orchestration endpoint

#### 3. Real-time Communication

Socket.io integration provides live workflow updates:

- Workflow start notifications
- Progress updates
- Completion notifications
- Error handling and recovery

## Workflows

### 1. Document Upload Workflow

**Trigger**: Document uploaded via `/api/upload`

**Process**:
1. Document is saved to storage
2. OCR processing (if applicable)
3. AI document analysis using Document Processor agent
4. Insights extraction
5. Metadata enrichment
6. Follow-up action generation

**AI Integration**:
- Uses `ConstructionAIService.getDocumentAnalysis()`
- Checks for safety concerns → triggers Safety Monitor
- Checks for compliance mentions → triggers Compliance Checker

**Example**:
```typescript
const orchestrator = AIWorkflowOrchestrator.getInstance();
const result = await orchestrator.handleDocumentUpload(documentId, {
  userId: 'user_123',
  projectId: 'project_456',
  documentId: documentId
});
```

### 2. BIM Analysis Workflow

**Trigger**: BIM model uploaded via `/api/bim`

**Process**:
1. Model metadata is stored
2. AI BIM analysis using BIM Analyzer agent
3. Clash detection processing
4. Structural analysis
5. Action generation for critical issues

**AI Integration**:
- Uses `ConstructionAIService.analyzeBIMModel()`
- Generates tasks for detected clashes
- Provides optimization recommendations

### 3. Project Creation Workflow

**Trigger**: New project created via `/api/projects`

**Process**:
1. Project data is saved
2. AI project analysis using PM Bot agent
3. Initial insights generation
4. Recommended task creation
5. Project setup optimization

**AI Integration**:
- Uses `ConstructionAIService.getProjectInsights()`
- Analyzes timeline, budget, and resources
- Suggests initial project structure

### 4. Task Auto-Assignment Workflow

**Trigger**: Task created without assignment via `/api/tasks`

**Process**:
1. Task details are analyzed
2. Team member capabilities evaluated
3. AI suggests best assignment using Team Coordinator
4. Task is auto-assigned
5. Assignment reason is logged

**AI Integration**:
- Uses `ConstructionAIService.getSunaResponse()` with team context
- Considers role, workload, and expertise
- Provides assignment justification

### 5. Compliance Check Workflow

**Trigger**: Compliance check requested via `/api/compliance`

**Process**:
1. Project details are gathered
2. AI compliance analysis using Compliance Checker
3. Code violations identified
4. Recommendations generated
5. Critical issues flagged for action

**AI Integration**:
- Uses `ConstructionAIService.checkBuildingCodeCompliance()`
- References local building codes
- Provides specific code citations

## Usage Examples

### Triggering Workflows Automatically

Workflows trigger automatically on key events. No additional code needed in most cases.

```typescript
// Document upload automatically triggers AI workflow
const formData = new FormData();
formData.append('file', file);
formData.append('projectId', projectId);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
// AI analysis happens automatically in the background
```

### Triggering Workflows On-Demand

Use the `/api/ai-workflow` endpoint to manually trigger any workflow:

```typescript
const response = await fetch('/api/ai-workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_type: 'document_analysis',
    entity_id: documentId,
    project_id: projectId,
    context: {
      // Additional context data
    }
  })
});

const result = await response.json();
console.log('Insights:', result.insights);
console.log('Actions:', result.actions);
```

### Listening to Workflow Events

Subscribe to real-time workflow events via Socket.io:

```typescript
import socketService from '@/lib/socket';

// Listen for workflow start
socketService.on('workflow_started', (data) => {
  console.log('Workflow started:', data.workflowType);
});

// Listen for workflow completion
socketService.on('workflow_completed', (data) => {
  console.log('Workflow completed:', data.workflowType);
  console.log('Result:', data.result);
});

// Listen for workflow errors
socketService.on('workflow_error', (data) => {
  console.error('Workflow error:', data.error);
});
```

## Monitoring Workflows

### Workflow Monitor UI

Access the workflow monitor at `/workflows` to:

- View all available workflows
- Monitor recent workflow activity
- See workflow statistics
- Trigger workflows on-demand

### Agent Dashboard

View agent status and workflow distribution at `/agents`.

## Configuration

### AI Service Setup

Configure AI services in `.env.local`:

```bash
# OpenAI API Key (for GPT models)
OPENAI_API_KEY=sk-your-openai-api-key

# Google AI API Key (for Gemini models)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### Workflow Customization

Extend the orchestrator by adding new workflow methods:

```typescript
// In ai-workflow-orchestrator.ts
async handleCustomWorkflow(
  entityId: string,
  context: WorkflowContext
): Promise<WorkflowResult> {
  try {
    // 1. Fetch entity data
    // 2. Run AI analysis
    // 3. Extract insights
    // 4. Generate actions
    // 5. Log workflow
    
    return {
      success: true,
      insights: [...],
      actions: [...]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Testing

### Integration Tests

Run the integration test suite:

```bash
# Start the development server
npm run dev

# In another terminal, run integration tests
node test_ai_workflow_integration.js
```

### Manual Testing

1. **Document Upload Test**:
   - Navigate to `/documents`
   - Upload a document
   - Check `/workflows` for workflow execution
   - Verify AI insights in document metadata

2. **Project Creation Test**:
   - Navigate to `/projects`
   - Create a new project
   - Check `/workflows` for workflow execution
   - Verify AI insights in project details

3. **Task Assignment Test**:
   - Create a project with team members
   - Create a task without assignment
   - Verify task is auto-assigned
   - Check assignment reason in task metadata

## Best Practices

### 1. Error Handling

Always implement proper error handling in workflows:

```typescript
try {
  const result = await orchestrator.handleDocumentUpload(id, context);
  if (!result.success) {
    // Handle workflow failure
    console.error('Workflow failed:', result.error);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

### 2. Context Provision

Provide rich context for better AI analysis:

```typescript
const context = {
  userId: session.user.id,
  projectId: project.id,
  documentId: document.id,
  metadata: {
    documentType: 'architectural_plan',
    projectPhase: 'design',
    location: 'San Francisco, CA'
  }
};
```

### 3. Action Execution

Always execute generated actions:

```typescript
const result = await orchestrator.handleDocumentUpload(id, context);

if (result.success && result.actions) {
  await orchestrator.executeActions(result.actions, context);
}
```

### 4. Monitoring

Monitor workflow performance and success rates:

- Use the workflow monitor UI at `/workflows`
- Check agent status at `/agents`
- Review workflow logs in Supabase
- Monitor socket events for real-time issues

## Troubleshooting

### Workflows Not Triggering

1. Check if AI services are configured:
   ```bash
   # Verify environment variables
   echo $OPENAI_API_KEY
   echo $GOOGLE_AI_API_KEY
   ```

2. Check server logs for errors:
   ```bash
   npm run dev
   # Look for workflow-related errors
   ```

3. Verify database connectivity:
   - Check Supabase connection
   - Verify tables exist (documents, projects, tasks, etc.)

### AI Analysis Failing

1. Verify API keys are valid
2. Check API quotas and limits
3. Review error messages in workflow results
4. Test AI service directly via `/api/ai-chat`

### Actions Not Executing

1. Check action payload format
2. Verify user permissions
3. Review database constraints
4. Check action execution logs

## Future Enhancements

Potential improvements to the workflow system:

1. **Workflow Queue**: Implement background job queue for heavy workflows
2. **Workflow History**: Track all workflow executions in database
3. **Workflow Templates**: Pre-configured workflows for common scenarios
4. **Parallel Execution**: Run multiple workflows concurrently
5. **Workflow Retry Logic**: Automatic retry on transient failures
6. **Custom Triggers**: User-defined workflow triggers
7. **Workflow Analytics**: Detailed performance metrics and insights
8. **Workflow Scheduling**: Time-based workflow execution

## Support

For questions or issues with the AI workflow system:

1. Check this documentation
2. Review integration tests in `test_ai_workflow_integration.js`
3. Examine workflow orchestrator code in `src/lib/ai-workflow-orchestrator.ts`
4. Check API endpoints in `src/app/api/`

## Conclusion

The AI Workflow Orchestration System provides comprehensive end-to-end integration of AI capabilities across the ConstructAI platform. All major workflows are now wired up with intelligent automation, real-time monitoring, and actionable insights generation.
