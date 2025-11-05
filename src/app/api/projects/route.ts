import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch projects where user is creator or team member
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_user:users!projects_created_by_fkey(name, email)
      `)
      .or(`created_by.eq.${session.user.id},team_members.cs.{${session.user.id}}`)
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
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        created_by: session.user.id,
        team_members: body.team_members || [session.user.id],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
