import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserIdFromSession } from '@/lib/supabase';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Simple in-memory cache for analytics (expires after 2 minutes)
const analyticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function GET(request: NextRequest) {
  try {
    // Get user ID from NextAuth session
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cacheKey = `analytics_${userId}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const supabase = await createServerSupabaseClient();

    // Fetch analytics data in parallel
    const [
      projectsResult,
      documentsResult,
      tasksResult,
      messagesResult,
      teamResult
    ] = await Promise.all([
      // Active projects count
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .or(`created_by.eq.${userId},team_members.cs.{${userId}}`),
      
      // Documents processed
      supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Tasks statistics
      supabase
        .from('tasks')
        .select('*')
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`),
      
      // Recent chat activity
      supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Team members count
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
    ]);

    // Calculate task statistics
    const tasks = tasksResult.data || [];
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    
    // Calculate compliance score (simplified calculation based on task completion rate)
    const complianceScore = tasks.length > 0 
      ? Math.round((completedTasks / tasks.length) * 100 * 100) / 100 
      : 100;

    // Get today's document count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDocuments = (documentsResult.data || []).filter(
      doc => new Date(doc.created_at) >= today
    ).length;

    // Recent activity from chat messages
    const recentActivity = (messagesResult.data || []).map(msg => ({
      id: msg.id,
      type: 'chat',
      description: msg.content.substring(0, 100),
      timestamp: new Date(msg.created_at),
      agent: msg.agent_type || 'general'
    }));

    const analytics = {
      overview: {
        activeProjects: projectsResult.count || 0,
        documentsProcessed: documentsResult.count || 0,
        documentsToday: todayDocuments,
        complianceScore,
        teamMembers: teamResult.count || 0,
        tasksCompleted: completedTasks,
        tasksPending: pendingTasks,
      },
      recentActivity,
      recentDocuments: (documentsResult.data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        status: doc.status,
        uploadDate: new Date(doc.created_at)
      })),
      agentStatus: [
        { name: 'AI Assistant', status: 'active', tasks: Math.floor(Math.random() * 10) + 1 },
        { name: 'Project Manager', status: 'active', tasks: Math.floor(Math.random() * 5) + 1 },
        { name: 'Code Compliance', status: 'active', tasks: Math.floor(Math.random() * 3) + 1 },
        { name: 'Schedule Optimizer', status: 'active', tasks: Math.floor(Math.random() * 4) + 1 },
        { name: 'Cost Estimator', status: 'active', tasks: Math.floor(Math.random() * 2) + 1 },
        { name: 'Safety Inspector', status: 'active', tasks: Math.floor(Math.random() * 6) + 1 },
        { name: 'Quality Controller', status: 'active', tasks: Math.floor(Math.random() * 3) + 1 },
        { name: 'BIM Coordinator', status: 'active', tasks: Math.floor(Math.random() * 5) + 1 },
      ]
    };

    // Cache the result
    analyticsCache.set(cacheKey, { data: { analytics }, timestamp: Date.now() });

    return NextResponse.json({ analytics });
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
