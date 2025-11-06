/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Task Executor
 * Autonomously creates, assigns, and manages tasks
 */

import { TaskExecutor, ExecutionContext } from '../autonomous-executor';
import { supabaseAdmin } from '../supabase';
import ConstructionAIService from '../ai-services';

export class TaskAutomationExecutor implements TaskExecutor {
  private aiService: ConstructionAIService;

  constructor() {
    this.aiService = ConstructionAIService.getInstance();
  }

  async execute(payload: any, context: ExecutionContext): Promise<any> {
    const { action, data } = payload;

    switch (action) {
      case 'create_task':
        return await this.createTask(data, context);
      case 'auto_assign':
        return await this.autoAssignTask(data, context);
      case 'bulk_create':
        return await this.bulkCreateTasks(data, context);
      case 'update_status':
        return await this.updateTaskStatus(data, context);
      case 'generate_checklist':
        return await this.generateChecklist(data, context);
      default:
        throw new Error(`Unknown task action: ${action}`);
    }
  }

  /**
   * Create a single task autonomously
   */
  private async createTask(data: any, context: ExecutionContext): Promise<any> {
    const {
      title,
      description,
      priority = 'medium',
      projectId,
      dueDate,
      assignedTo
    } = data;

    const taskData = {
      title,
      description,
      priority,
      status: 'pending',
      project_id: projectId,
      created_by: context.userId,
      assigned_to: assignedTo,
      due_date: dueDate,
      metadata: {
        auto_generated: true,
        generated_by: context.agentType,
        generated_at: new Date().toISOString()
      }
    };

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    // Auto-assign if no assignee specified
    if (!assignedTo && projectId) {
      const assignment = await this.autoAssignTask({ taskId: task.id, projectId }, context);
      return { ...task, assignment };
    }

    return task;
  }

  /**
   * Auto-assign task to best team member
   */
  private async autoAssignTask(data: any, context: ExecutionContext): Promise<any> {
    const { taskId, projectId } = data;

    // Fetch task
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Fetch project team members
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('team_members')
      .eq('id', projectId)
      .single();

    if (!project?.team_members || project.team_members.length === 0) {
      return { message: 'No team members available for assignment' };
    }

    // Fetch team member details
    const { data: teamMembers } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('id', project.team_members);

    if (!teamMembers || teamMembers.length === 0) {
      return { message: 'No team members found' };
    }

    // Use AI to determine best assignment
    const assignmentPrompt = `Analyze this task and recommend the best team member:

Task: ${task.title}
Description: ${task.description}
Priority: ${task.priority}

Team Members:
${teamMembers.map((m, i) => `${i + 1}. ${m.name} - Role: ${m.role || 'Member'} - Skills: ${m.metadata?.skills?.join(', ') || 'General'}`).join('\n')}

Respond with: RECOMMENDED: [number]`;

    const response = await this.aiService.getSunaResponse(assignmentPrompt, { task, teamMembers });
    
    // Parse recommendation
    const match = response.content.match(/RECOMMENDED:\s*(\d+)/i);
    if (!match) {
      return { message: 'Could not determine assignment' };
    }

    const memberIndex = parseInt(match[1]) - 1;
    if (memberIndex < 0 || memberIndex >= teamMembers.length) {
      return { message: 'Invalid assignment recommendation' };
    }

    const assignedMember = teamMembers[memberIndex];

    // Update task
    await supabaseAdmin
      .from('tasks')
      .update({
        assigned_to: assignedMember.id,
        metadata: {
          ...task.metadata,
          ai_assigned: true,
          assignment_reason: response.content
        }
      })
      .eq('id', taskId);

    return {
      taskId,
      assignedTo: assignedMember.id,
      assignedName: assignedMember.name,
      reason: response.content
    };
  }

  /**
   * Bulk create tasks from a list
   */
  private async bulkCreateTasks(data: any, context: ExecutionContext): Promise<any> {
    const { tasks, projectId } = data;

    const createdTasks = [];

    for (const taskData of tasks) {
      try {
        const task = await this.createTask(
          { ...taskData, projectId },
          context
        );
        createdTasks.push(task);
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    }

    return {
      total: tasks.length,
      created: createdTasks.length,
      tasks: createdTasks
    };
  }

  /**
   * Update task status
   */
  private async updateTaskStatus(data: any, context: ExecutionContext): Promise<any> {
    const { taskId, status, completedBy } = data;

    const updates: any = { status };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      if (completedBy) {
        updates.metadata = { completed_by: completedBy };
      }
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return task;
  }

  /**
   * Generate task checklist using AI
   */
  private async generateChecklist(data: any, context: ExecutionContext): Promise<any> {
    const { taskTitle, taskDescription, projectContext } = data;

    const prompt = `Generate a detailed checklist for this construction task:

Task: ${taskTitle}
Description: ${taskDescription}
${projectContext ? `Context: ${JSON.stringify(projectContext)}` : ''}

Provide a numbered checklist of specific action items needed to complete this task.`;

    const response = await this.aiService.getSunaResponse(prompt, {});

    // Parse checklist from response
    const checklist = this.parseChecklistFromResponse(response.content);

    return {
      taskTitle,
      checklist,
      generatedAt: new Date().toISOString()
    };
  }

  // Helper methods

  private parseChecklistFromResponse(content: string): string[] {
    const checklist: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // Match numbered items (1. 2. etc) or bullet points
      if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-•*]\s+/)) {
        const item = trimmed.replace(/^\d+\.\s+/, '').replace(/^[-•*]\s+/, '');
        if (item.length > 0) {
          checklist.push(item);
        }
      }
    }

    return checklist;
  }
}
