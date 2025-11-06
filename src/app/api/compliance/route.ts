import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserIdFromSession } from '@/lib/supabase';
import { AIWorkflowOrchestrator } from '@/lib/ai-workflow-orchestrator';

/**
 * GET /api/compliance
 * Fetch compliance analysis for a project
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Fetch project with compliance data
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      compliance: project.metadata?.compliance_analysis || null,
      insights: project.metadata?.compliance_insights || [],
      checkedAt: project.metadata?.compliance_checked_at || null
    });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/compliance
 * Trigger compliance check for a project
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { project_id } = body;

    if (!project_id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Trigger AI compliance check workflow
    const orchestrator = AIWorkflowOrchestrator.getInstance();
    const workflowResult = await orchestrator.handleComplianceCheck(project_id, {
      userId,
      projectId: project_id
    });

    if (!workflowResult.success) {
      return NextResponse.json({ 
        error: workflowResult.error || 'Compliance check failed' 
      }, { status: 500 });
    }

    // Execute any generated actions
    if (workflowResult.actions && workflowResult.actions.length > 0) {
      await orchestrator.executeActions(workflowResult.actions, {
        userId,
        projectId: project_id
      });
    }

    return NextResponse.json({ 
      success: true,
      compliance: workflowResult.data?.complianceAnalysis?.content,
      insights: workflowResult.insights,
      actions: workflowResult.actions
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
