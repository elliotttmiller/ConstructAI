import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserIdFromSession } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Fetch all users in the organization
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For each user, get their project count and recent activity
    const usersWithDetails = await Promise.all(
      (users || []).map(async (user) => {
        // Get project count
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .or(`created_by.eq.${user.id},team_members.cs.{${user.id}}`);

        // Get tasks completed count
        const { count: tasksCompleted } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .eq('status', 'completed');

        return {
          ...user,
          projectsCount: projectCount || 0,
          tasksCompleted: tasksCompleted || 0,
          joinDate: new Date(user.created_at),
          lastActive: new Date(user.updated_at),
          // Default status to 'active' - can be enhanced with real-time presence
          status: 'active' as const,
        };
      })
    );

    return NextResponse.json({ users: usersWithDetails });
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
    
    const { email, name, role, department, phone, location, permissions } = body;
    
    if (!email || !name || !role || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user (this would typically be done through auth, but for demo purposes)
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role,
        department,
        phone,
        location,
        permissions: permissions || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
