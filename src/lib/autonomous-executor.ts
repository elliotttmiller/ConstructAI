/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Autonomous Task Execution Engine
 * Enables AI agents to execute tasks autonomously rather than just providing instructions
 */

import { supabaseAdmin } from './supabase';
import socketService from './socket';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type ExecutionPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AutonomousTask {
  id: string;
  type: TaskType;
  priority: ExecutionPriority;
  status: ExecutionStatus;
  payload: any;
  context: ExecutionContext;
  retryCount?: number;
  maxRetries?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

export type TaskType = 
  | 'document_upload'
  | 'document_process'
  | 'bim_analysis'
  | 'database_query'
  | 'task_create'
  | 'task_assign'
  | 'compliance_check'
  | 'safety_analysis'
  | 'generate_report'
  | 'send_notification'
  | 'service_integration';

export interface ExecutionContext {
  userId: string;
  projectId?: string;
  agentType: string;
  workflowId?: string;
  metadata?: Record<string, any>;
}

/**
 * Autonomous Execution Engine
 * Manages a queue of autonomous tasks and executes them
 */
export class AutonomousExecutor {
  private static instance: AutonomousExecutor;
  private taskQueue: Map<string, AutonomousTask> = new Map();
  private isProcessing: boolean = false;
  private executors: Map<TaskType, TaskExecutor> = new Map();

  private constructor() {
    this.initializeExecutors();
  }

  public static getInstance(): AutonomousExecutor {
    if (!AutonomousExecutor.instance) {
      AutonomousExecutor.instance = new AutonomousExecutor();
    }
    return AutonomousExecutor.instance;
  }

  private initializeExecutors() {
    // Executors will be registered here
    console.log('Autonomous executor initialized');
  }

  /**
   * Register a task executor
   */
  registerExecutor(taskType: TaskType, executor: TaskExecutor) {
    this.executors.set(taskType, executor);
    console.log(`Registered executor for task type: ${taskType}`);
  }

  /**
   * Queue a task for autonomous execution
   */
  async queueTask(
    type: TaskType,
    payload: any,
    context: ExecutionContext,
    priority: ExecutionPriority = 'medium',
    maxRetries: number = 3
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const task: AutonomousTask = {
      id: taskId,
      type,
      priority,
      status: 'pending',
      payload,
      context,
      retryCount: 0,
      maxRetries,
      createdAt: new Date()
    };

    this.taskQueue.set(taskId, task);

    // Log task creation
    await this.logTaskEvent(taskId, 'queued', 'Task queued for autonomous execution');

    // Notify via socket
    socketService.notifyWorkflowStart(type, taskId, context.agentType);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue().catch(error => {
        console.error('Queue processing error:', error);
      });
    }

    return taskId;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): AutonomousTask | undefined {
    return this.taskQueue.get(taskId);
  }

  /**
   * Cancel a pending task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.taskQueue.get(taskId);
    if (!task) return false;

    if (task.status === 'pending' || task.status === 'running') {
      task.status = 'cancelled';
      await this.logTaskEvent(taskId, 'cancelled', 'Task cancelled by user');
      socketService.notifyWorkflowError(task.type, taskId, task.context.agentType, 'Task cancelled');
      return true;
    }

    return false;
  }

  /**
   * Process the task queue
   */
  private async processQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    try {
      while (this.hasPendingTasks()) {
        const task = this.getNextTask();
        if (!task) break;

        await this.executeTask(task);
        
        // Small delay between tasks to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if there are pending tasks
   */
  private hasPendingTasks(): boolean {
    return Array.from(this.taskQueue.values()).some(
      task => task.status === 'pending'
    );
  }

  /**
   * Get next task to execute (by priority)
   */
  private getNextTask(): AutonomousTask | null {
    const priorityOrder: ExecutionPriority[] = ['critical', 'high', 'medium', 'low'];
    
    for (const priority of priorityOrder) {
      const task = Array.from(this.taskQueue.values()).find(
        t => t.status === 'pending' && t.priority === priority
      );
      if (task) return task;
    }
    
    return null;
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: AutonomousTask) {
    try {
      task.status = 'running';
      task.startedAt = new Date();

      await this.logTaskEvent(task.id, 'started', `Executing ${task.type} task`);

      // Get the appropriate executor
      const executor = this.executors.get(task.type);
      if (!executor) {
        throw new Error(`No executor registered for task type: ${task.type}`);
      }

      // Execute the task
      const result = await executor.execute(task.payload, task.context);

      // Mark as completed
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;

      await this.logTaskEvent(task.id, 'completed', 'Task completed successfully', result);
      
      socketService.notifyWorkflowComplete(
        task.type,
        task.id,
        task.context.agentType,
        { result }
      );

    } catch (error) {
      console.error(`Task execution failed: ${task.id}`, error);

      // Retry logic
      if (task.retryCount! < task.maxRetries!) {
        task.retryCount!++;
        task.status = 'pending';
        await this.logTaskEvent(
          task.id,
          'retry',
          `Task failed, retrying (${task.retryCount}/${task.maxRetries})`
        );
      } else {
        task.status = 'failed';
        task.completedAt = new Date();
        task.error = error instanceof Error ? error.message : 'Unknown error';
        
        await this.logTaskEvent(task.id, 'failed', 'Task failed after max retries', { error: task.error });
        
        socketService.notifyWorkflowError(
          task.type,
          task.id,
          task.context.agentType,
          task.error
        );
      }
    }
  }

  /**
   * Log task event to database
   */
  private async logTaskEvent(
    taskId: string,
    event: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      const task = this.taskQueue.get(taskId);
      if (!task) return;

      await supabaseAdmin.from('chat_messages').insert({
        content: message,
        role: 'system',
        agent_type: task.context.agentType,
        user_id: task.context.userId,
        project_id: task.context.projectId,
        metadata: {
          task_id: taskId,
          task_type: task.type,
          event,
          data,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log task event:', error);
    }
  }

  /**
   * Get all tasks (with optional filtering)
   */
  getAllTasks(filter?: { status?: ExecutionStatus; type?: TaskType }): AutonomousTask[] {
    let tasks = Array.from(this.taskQueue.values());

    if (filter?.status) {
      tasks = tasks.filter(t => t.status === filter.status);
    }

    if (filter?.type) {
      tasks = tasks.filter(t => t.type === filter.type);
    }

    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clear completed tasks (older than specified hours)
   */
  clearCompletedTasks(olderThanHours: number = 24) {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    for (const [taskId, task] of this.taskQueue.entries()) {
      if (
        (task.status === 'completed' || task.status === 'failed') &&
        task.completedAt &&
        task.completedAt.getTime() < cutoffTime
      ) {
        this.taskQueue.delete(taskId);
      }
    }
  }
}

/**
 * Base interface for task executors
 */
export interface TaskExecutor {
  execute(payload: any, context: ExecutionContext): Promise<any>;
}

export default AutonomousExecutor;
