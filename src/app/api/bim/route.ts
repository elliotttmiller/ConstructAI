import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserIdFromSession } from '@/lib/supabase';
import { AIWorkflowOrchestrator } from '@/lib/ai-workflow-orchestrator';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    // Fetch BIM models from documents table where type is BIM-related
    let query = supabase
      .from('documents')
      .select(`
        *,
        project:projects(name, id)
      `)
      .in('type', ['ifc', 'obj', 'rvt', 'dwg', 'dxf', 'model/gltf-binary', 'model/gltf+json'])
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: models, error } = await query;

    if (error) {
      console.error('Error fetching BIM models:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to BIM model format
    const transformedModels = (models || []).map(model => ({
      id: model.id,
      name: model.name,
      type: model.type || 'ifc',
      status: model.status === 'processed' ? 'loaded' : model.status === 'processing' ? 'loading' : 'error',
      size: formatFileSize(model.size),
      lastModified: new Date(model.updated_at || model.created_at),
      version: model.metadata?.version || 'v1.0',
      url: model.url,
      projectId: model.project_id,
      projectName: model.project?.name
    }));

    // Mock clash detection data (in a real app, this would come from actual clash detection service)
    const clashes = [
      {
        id: '1',
        type: 'hard',
        severity: 'critical',
        description: 'HVAC duct intersects with structural beam',
        elements: ['Beam_B1_001', 'Duct_HVAC_042'],
        location: 'Level 3, Grid B-C/3-4',
        modelId: transformedModels[0]?.id
      },
      {
        id: '2',
        type: 'soft',
        severity: 'major',
        description: 'Electrical conduit clearance issue',
        elements: ['Conduit_E1_023', 'Pipe_P2_015'],
        location: 'Level 2, Grid D-E/5-6',
        modelId: transformedModels[0]?.id
      },
      {
        id: '3',
        type: 'clearance',
        severity: 'minor',
        description: 'Door swing conflicts with equipment',
        elements: ['Door_D3_008', 'Equipment_EQ_012'],
        location: 'Level 1, Room 103',
        modelId: transformedModels[0]?.id
      }
    ];

    return NextResponse.json({ 
      models: transformedModels,
      clashes: transformedModels.length > 0 ? clashes : []
    });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    const body = await request.json();
    const { name, type, url, project_id, size, metadata } = body;

    if (!name || !type || !url || !project_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create BIM model document entry
    const { data: model, error } = await supabase
      .from('documents')
      .insert({
        name,
        type,
        url,
        project_id,
        size: size || 0,
        uploaded_by: userId,
        category: 'bim',
        status: 'processing',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating BIM model:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger AI workflow orchestration for BIM analysis
    const orchestrator = AIWorkflowOrchestrator.getInstance();
    orchestrator.handleBIMAnalysis(model.id, {
      userId,
      projectId: project_id,
      documentId: model.id
    }).then(async (workflowResult) => {
      if (workflowResult.success && workflowResult.actions && workflowResult.actions.length > 0) {
        await orchestrator.executeActions(workflowResult.actions, {
          userId,
          projectId: project_id,
          documentId: model.id
        });
      }
    }).catch((error) => {
      console.error('AI workflow orchestration failed:', error);
    });

    return NextResponse.json({ model }, { status: 201 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
