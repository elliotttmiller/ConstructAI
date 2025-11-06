import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getUserIdFromSession } from '@/lib/supabase';
import { AutonomousExecutor } from '@/lib/autonomous-executor';
import { DocumentExecutor, BIMExecutor, DatabaseExecutor, TaskAutomationExecutor } from '@/lib/executors';

// Initialize executor and register handlers
const executor = AutonomousExecutor.getInstance();

// Register all executors
executor.registerExecutor('document_upload', new DocumentExecutor());
executor.registerExecutor('document_process', new DocumentExecutor());
executor.registerExecutor('bim_analysis', new BIMExecutor());
executor.registerExecutor('database_query', new DatabaseExecutor());
executor.registerExecutor('task_create', new TaskAutomationExecutor());
executor.registerExecutor('task_assign', new TaskAutomationExecutor());

/**
 * POST /api/autonomous-workflow
 * Queue an autonomous task for execution
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      taskType,
      action,
      data,
      priority = 'medium',
      agentType = 'autonomous-agent',
      projectId,
      maxRetries = 3
    } = body;

    if (!taskType || !action) {
      return NextResponse.json({
        error: 'taskType and action are required'
      }, { status: 400 });
    }

    // Queue the task
    const taskId = await executor.queueTask(
      taskType,
      { action, data },
      {
        userId,
        projectId,
        agentType,
        workflowId: `workflow_${Date.now()}`
      },
      priority,
      maxRetries
    );

    return NextResponse.json({
      success: true,
      taskId,
      status: 'queued',
      message: 'Task queued for autonomous execution'
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Autonomous workflow error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/autonomous-workflow
 * Get status of autonomous tasks
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const status = searchParams.get('status') as any;
    const type = searchParams.get('type') as any;

    if (taskId) {
      // Get specific task
      const task = executor.getTaskStatus(taskId);
      
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json({ task });
    }

    // Get all tasks with optional filtering
    const tasks = executor.getAllTasks({
      status,
      type
    });

    return NextResponse.json({
      tasks,
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(t => t.status === 'pending').length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length
      }
    });

  } catch (error: unknown) {
    console.error('Get autonomous workflow error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/autonomous-workflow
 * Cancel a pending task
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const cancelled = await executor.cancelTask(taskId);

    if (!cancelled) {
      return NextResponse.json({
        error: 'Task cannot be cancelled (not found or already completed)'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task cancelled successfully'
    });

  } catch (error: unknown) {
    console.error('Cancel autonomous workflow error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/autonomous-workflow
 * Trigger cleanup of old completed tasks
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, olderThanHours = 24 } = body;

    if (action === 'cleanup') {
      executor.clearCompletedTasks(olderThanHours);
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up completed tasks older than ${olderThanHours} hours`
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error: unknown) {
    console.error('Autonomous workflow cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
