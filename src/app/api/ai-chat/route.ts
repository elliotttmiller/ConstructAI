import { NextRequest, NextResponse } from 'next/server';
import ConstructionAIService from '@/lib/ai-services';
import { AutonomousExecutor } from '@/lib/autonomous-executor';
import { DocumentExecutor, BIMExecutor, DatabaseExecutor, TaskAutomationExecutor } from '@/lib/executors';

// Initialize autonomous executor
const autonomousExecutor = AutonomousExecutor.getInstance();

// Register executors on first load
if (!autonomousExecutor.getAllTasks().length) {
  autonomousExecutor.registerExecutor('document_upload', new DocumentExecutor());
  autonomousExecutor.registerExecutor('document_process', new DocumentExecutor());
  autonomousExecutor.registerExecutor('bim_analysis', new BIMExecutor());
  autonomousExecutor.registerExecutor('database_query', new DatabaseExecutor());
  autonomousExecutor.registerExecutor('task_create', new TaskAutomationExecutor());
  autonomousExecutor.registerExecutor('task_assign', new TaskAutomationExecutor());
}

export async function POST(request: NextRequest) {
  try {
    const { message, agentType, context, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const aiService = ConstructionAIService.getInstance();

    // Check if AI services are configured
    const serviceStatus = aiService.isConfigured();

    let response;

    try {
      // Use the multi-agent conversation handler
      response = await aiService.handleMultiAgentConversation(
        [{ role: 'user', content: message, agentType }],
        agentType || 'suna',
        context
      );

      // Detect if autonomous action is needed
      const autonomousActions = detectAutonomousActions(message, response.content, context);
      
      if (autonomousActions.length > 0) {
        // Queue autonomous tasks
        const queuedTasks = [];
        for (const action of autonomousActions) {
          const taskId = await autonomousExecutor.queueTask(
            action.taskType,
            { action: action.action, data: action.data },
            {
              userId: userId || 'system',
              projectId: context?.projectId,
              agentType: agentType || 'suna',
              workflowId: `chat_workflow_${Date.now()}`
            },
            action.priority || 'medium'
          );
          queuedTasks.push({ taskId, type: action.taskType, action: action.action });
        }

        // Add autonomous actions info to response
        response.autonomousActions = queuedTasks;
        response.content += `\n\n🤖 **Autonomous Actions Queued:**\n${queuedTasks.map(t => `- ${t.type} (${t.action}): Task ${t.taskId}`).join('\n')}`;
      }

    } catch (error) {
      console.error('AI service error:', error);
      
      // Return proper error instead of fallback
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to process AI request',
          serviceStatus,
          agentType: agentType || 'suna'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...response,
      serviceStatus,
      timestamp: new Date().toISOString(),
      agentType: agentType || 'suna'
    });

  } catch (error) {
    console.error('AI chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        model: 'error-fallback',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Detect if the conversation requires autonomous actions
 */
function detectAutonomousActions(userMessage: string, aiResponse: string, context: any): any[] {
  const actions: any[] = [];
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();

  // Detect document processing requests
  if (
    lowerMessage.includes('analyze document') ||
    lowerMessage.includes('process document') ||
    lowerMessage.includes('extract text') ||
    lowerResponse.includes('i will analyze') ||
    lowerResponse.includes('i will process')
  ) {
    if (context?.documentId) {
      actions.push({
        taskType: 'document_process',
        action: 'analyze_document',
        data: { documentId: context.documentId },
        priority: 'high'
      });
    }
  }

  // Detect BIM analysis requests
  if (
    lowerMessage.includes('analyze model') ||
    lowerMessage.includes('bim analysis') ||
    lowerMessage.includes('check clashes') ||
    lowerResponse.includes('i will analyze the model')
  ) {
    if (context?.modelId) {
      actions.push({
        taskType: 'bim_analysis',
        action: 'analyze_model',
        data: { modelId: context.modelId },
        priority: 'high'
      });
    }
  }

  // Detect task creation requests
  if (
    lowerMessage.includes('create task') ||
    lowerMessage.includes('add task') ||
    lowerMessage.includes('new task') ||
    lowerResponse.includes('i will create a task')
  ) {
    // Extract task details from message
    if (context?.projectId) {
      actions.push({
        taskType: 'task_create',
        action: 'create_task',
        data: {
          title: extractTaskTitle(userMessage),
          description: userMessage,
          projectId: context.projectId,
          priority: extractPriority(userMessage)
        },
        priority: 'medium'
      });
    }
  }

  // Detect database query requests
  if (
    lowerMessage.includes('show me') ||
    lowerMessage.includes('get data') ||
    lowerMessage.includes('query') ||
    lowerMessage.includes('find')
  ) {
    if (context?.projectId) {
      actions.push({
        taskType: 'database_query',
        action: 'generate_insights',
        data: { projectId: context.projectId },
        priority: 'low'
      });
    }
  }

  return actions;
}

function extractTaskTitle(message: string): string {
  // Simple extraction - in production, use more sophisticated NLP
  const match = message.match(/task[:\s]+["']?([^"'\n]+)["']?/i);
  return match ? match[1].substring(0, 100) : message.substring(0, 50);
}

function extractPriority(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('urgent') || lowerMessage.includes('critical')) return 'critical';
  if (lowerMessage.includes('high priority') || lowerMessage.includes('important')) return 'high';
  if (lowerMessage.includes('low priority')) return 'low';
  return 'medium';
}
