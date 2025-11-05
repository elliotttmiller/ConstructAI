import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserIdFromSession } from '@/lib/supabase';
import { AIWorkflowOrchestrator } from '@/lib/ai-workflow-orchestrator';

/**
 * POST /api/ai-workflow
 * Trigger AI workflow orchestration on demand
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workflow_type, entity_id, project_id, context } = body;

    if (!workflow_type || !entity_id) {
      return NextResponse.json({ 
        error: 'Workflow type and entity ID are required' 
      }, { status: 400 });
    }

    const orchestrator = AIWorkflowOrchestrator.getInstance();
    let workflowResult;

    const workflowContext = {
      userId,
      projectId: project_id,
      ...context
    };

    // Execute the requested workflow
    switch (workflow_type) {
      case 'document_analysis':
        workflowResult = await orchestrator.handleDocumentUpload(entity_id, {
          ...workflowContext,
          documentId: entity_id
        });
        break;

      case 'bim_analysis':
        workflowResult = await orchestrator.handleBIMAnalysis(entity_id, {
          ...workflowContext,
          documentId: entity_id
        });
        break;

      case 'project_insights':
        workflowResult = await orchestrator.handleProjectCreation(entity_id, {
          ...workflowContext,
          projectId: entity_id
        });
        break;

      case 'task_assignment':
        workflowResult = await orchestrator.handleTaskAutoAssignment(entity_id, {
          ...workflowContext,
          taskId: entity_id
        });
        break;

      case 'compliance_check':
        workflowResult = await orchestrator.handleComplianceCheck(entity_id, {
          ...workflowContext,
          projectId: entity_id
        });
        break;

      default:
        return NextResponse.json({ 
          error: `Unknown workflow type: ${workflow_type}` 
        }, { status: 400 });
    }

    if (!workflowResult.success) {
      return NextResponse.json({ 
        error: workflowResult.error || 'Workflow execution failed' 
      }, { status: 500 });
    }

    // Execute any generated actions
    if (workflowResult.actions && workflowResult.actions.length > 0) {
      await orchestrator.executeActions(workflowResult.actions, workflowContext);
    }

    return NextResponse.json({ 
      success: true,
      workflow_type,
      entity_id,
      insights: workflowResult.insights,
      actions: workflowResult.actions,
      data: workflowResult.data
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('AI workflow error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/ai-workflow
 * Get available workflow types and their status
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = [
      {
        type: 'document_analysis',
        name: 'Document Analysis',
        description: 'AI-powered analysis of uploaded documents',
        agentType: 'document-processor',
        status: 'available'
      },
      {
        type: 'bim_analysis',
        name: 'BIM Model Analysis',
        description: 'AI analysis of 3D BIM models for clashes and issues',
        agentType: 'bim-analyzer',
        status: 'available'
      },
      {
        type: 'project_insights',
        name: 'Project Insights',
        description: 'AI-generated project setup and optimization insights',
        agentType: 'pm-bot',
        status: 'available'
      },
      {
        type: 'task_assignment',
        name: 'Task Auto-Assignment',
        description: 'AI-powered task assignment to team members',
        agentType: 'team-coordinator',
        status: 'available'
      },
      {
        type: 'compliance_check',
        name: 'Compliance Check',
        description: 'Building code compliance verification',
        agentType: 'compliance-checker',
        status: 'available'
      }
    ];

    return NextResponse.json({ workflows });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
