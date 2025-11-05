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

    // Fetch projects where user is creator or team member
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_user:users!projects_created_by_fkey(name, email)
      `)
      .or(`created_by.eq.${userId},team_members.cs.{${userId}}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include additional calculated fields
    const transformedProjects = projects?.map(project => ({
      ...project,
      teamMembersCount: project.team_members?.length || 0,
      startDate: new Date(project.start_date),
      endDate: new Date(project.end_date),
    }));

    return NextResponse.json({ projects: transformedProjects || [] });
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
    
    // Validate required fields
    const { name, description, location, phase, start_date, end_date, budget } = body;
    
    if (!name || !description || !location || !phase || !start_date || !end_date || !budget) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        location,
        phase,
        start_date,
        end_date,
        budget,
        status: body.status || 'planning',
        progress: body.progress || 0,
        spent: body.spent || 0,
        created_by: userId,
        team_members: body.team_members || [userId],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger AI workflow orchestration for new project
    const orchestrator = AIWorkflowOrchestrator.getInstance();
    orchestrator.handleProjectCreation(project.id, {
      userId,
      projectId: project.id
    }).then(async (workflowResult) => {
      if (workflowResult.success && workflowResult.actions && workflowResult.actions.length > 0) {
        await orchestrator.executeActions(workflowResult.actions, {
          userId,
          projectId: project.id
        });
      }
    }).catch((error) => {
      console.error('AI workflow orchestration failed:', error);
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
