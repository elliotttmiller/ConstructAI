/**
 * AI Workflow Orchestrator
 * Central service for coordinating multi-agent AI workflows across the platform
 */

import ConstructionAIService, { AIResponse } from './ai-services';
import { supabaseAdmin } from './supabase';
import socketService from './socket';

export interface WorkflowContext {
  userId: string;
  projectId?: string;
  documentId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  data?: any;
  insights?: string[];
  actions?: WorkflowAction[];
  error?: string;
}

export interface WorkflowAction {
  type: 'create_task' | 'update_project' | 'send_notification' | 'trigger_analysis';
  payload: any;
  agentType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * AI Workflow Orchestrator class
 * Manages complex multi-agent workflows across the platform
 */
export class AIWorkflowOrchestrator {
  private static instance: AIWorkflowOrchestrator;
  private aiService: ConstructionAIService;

  private constructor() {
    this.aiService = ConstructionAIService.getInstance();
  }

  public static getInstance(): AIWorkflowOrchestrator {
    if (!AIWorkflowOrchestrator.instance) {
      AIWorkflowOrchestrator.instance = new AIWorkflowOrchestrator();
    }
    return AIWorkflowOrchestrator.instance;
  }

  /**
   * Document Upload Workflow
   * Orchestrates AI analysis of uploaded documents
   */
  async handleDocumentUpload(
    documentId: string,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    // Notify workflow start
    socketService.notifyWorkflowStart('document_analysis', documentId, 'document-processor');

    try {
      // 1. Fetch document details
      const { data: document, error: fetchError } = await supabaseAdmin
        .from('documents')
        .select('*, project:projects(*)')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error('Failed to fetch document details');
      }

      // 2. Run AI document analysis
      const aiAnalysis = await this.aiService.getDocumentAnalysis(
        document.extracted_text || document.name,
        document.type
      );

      // 3. Extract insights and recommendations
      const insights = this.extractInsights(aiAnalysis.content);
      
      // 4. Update document with AI analysis
      await supabaseAdmin
        .from('documents')
        .update({
          metadata: {
            ...document.metadata,
            ai_analysis: aiAnalysis.content,
            ai_insights: insights,
            analyzed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);

      // 5. Create follow-up actions
      const actions = await this.generateDocumentActions(document, aiAnalysis, context);

      // 6. Log workflow completion
      await this.logWorkflowEvent('document_analysis', documentId, context, {
        insights: insights.length,
        actions: actions.length
      });

      // Notify workflow completion
      socketService.notifyWorkflowComplete('document_analysis', documentId, 'document-processor', {
        insights: insights.length,
        actions: actions.length
      });

      return {
        success: true,
        data: { document, aiAnalysis },
        insights,
        actions
      };

    } catch (error) {
      console.error('Document upload workflow error:', error);

      // Notify workflow error
      socketService.notifyWorkflowError(
        'document_analysis',
        documentId,
        'document-processor',
        error instanceof Error ? error.message : 'Workflow failed'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  /**
   * BIM Model Analysis Workflow
   * Orchestrates AI analysis of BIM models and clash detection
   */
  async handleBIMAnalysis(
    modelId: string,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    // Notify workflow start
    socketService.notifyWorkflowStart('bim_analysis', modelId, 'bim-analyzer');

    try {
      // 1. Fetch BIM model details
      const { data: model, error: fetchError } = await supabaseAdmin
        .from('documents')
        .select('*, project:projects(*)')
        .eq('id', modelId)
        .single();

      if (fetchError || !model) {
        throw new Error('Failed to fetch BIM model details');
      }

      // 2. Run AI BIM analysis
      const modelData = {
        name: model.name,
        type: model.type,
        size: model.size,
        projectId: model.project_id
      };

      const aiAnalysis = await this.aiService.analyzeBIMModel(modelData, model.metadata?.clashes);

      // 3. Extract insights
      const insights = this.extractInsights(aiAnalysis.content);

      // 4. Update model with AI analysis
      await supabaseAdmin
        .from('documents')
        .update({
          metadata: {
            ...model.metadata,
            ai_analysis: aiAnalysis.content,
            ai_insights: insights,
            analyzed_at: new Date().toISOString()
          }
        })
        .eq('id', modelId);

      // 5. Create follow-up actions for critical issues
      const actions = await this.generateBIMActions(model, aiAnalysis, context);

      // 6. Log workflow completion
      await this.logWorkflowEvent('bim_analysis', modelId, context, {
        insights: insights.length,
        actions: actions.length
      });

      // Notify workflow completion
      socketService.notifyWorkflowComplete('bim_analysis', modelId, 'bim-analyzer', {
        insights: insights.length,
        actions: actions.length
      });

      return {
        success: true,
        data: { model, aiAnalysis },
        insights,
        actions
      };

    } catch (error) {
      console.error('BIM analysis workflow error:', error);

      // Notify workflow error
      socketService.notifyWorkflowError(
        'bim_analysis',
        modelId,
        'bim-analyzer',
        error instanceof Error ? error.message : 'Workflow failed'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  /**
   * Project Creation Workflow
   * Orchestrates AI-powered project setup and insights
   */
  async handleProjectCreation(
    projectId: string,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    // Notify workflow start
    socketService.notifyWorkflowStart('project_insights', projectId, 'pm-bot');

    try {
      // 1. Fetch project details
      const { data: project, error: fetchError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError || !project) {
        throw new Error('Failed to fetch project details');
      }

      // 2. Run AI project analysis
      const projectData = {
        name: project.name,
        description: project.description,
        location: project.location,
        budget: project.budget,
        phase: project.phase,
        startDate: project.start_date,
        endDate: project.end_date
      };

      const aiInsights = await this.aiService.getProjectInsights(projectData, []);

      // 3. Extract insights
      const insights = this.extractInsights(aiInsights.content);

      // 4. Update project with AI insights
      await supabaseAdmin
        .from('projects')
        .update({
          metadata: {
            ...project.metadata,
            ai_insights: insights,
            initial_analysis: aiInsights.content,
            analyzed_at: new Date().toISOString()
          }
        })
        .eq('id', projectId);

      // 5. Create recommended initial tasks
      const actions = await this.generateProjectActions(project, aiInsights, context);

      // 6. Log workflow completion
      await this.logWorkflowEvent('project_creation', projectId, context, {
        insights: insights.length,
        actions: actions.length
      });

      // Notify workflow completion
      socketService.notifyWorkflowComplete('project_insights', projectId, 'pm-bot', {
        insights: insights.length,
        actions: actions.length
      });

      return {
        success: true,
        data: { project, aiInsights },
        insights,
        actions
      };

    } catch (error) {
      console.error('Project creation workflow error:', error);

      // Notify workflow error
      socketService.notifyWorkflowError(
        'project_insights',
        projectId,
        'pm-bot',
        error instanceof Error ? error.message : 'Workflow failed'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  /**
   * Task Auto-Assignment Workflow
   * Uses AI to automatically assign tasks based on team capabilities
   */
  async handleTaskAutoAssignment(
    taskId: string,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    // Notify workflow start
    socketService.notifyWorkflowStart('task_assignment', taskId, 'team-coordinator');

    try {
      // 1. Fetch task and project details
      const { data: task, error: fetchError } = await supabaseAdmin
        .from('tasks')
        .select('*, project:projects(*)')
        .eq('id', taskId)
        .single();

      if (fetchError || !task) {
        throw new Error('Failed to fetch task details');
      }

      // 2. If already assigned, skip
      if (task.assigned_to) {
        return {
          success: true,
          data: { task, reason: 'already_assigned' }
        };
      }

      // 3. Fetch available team members
      const { data: teamMembers } = await supabaseAdmin
        .from('users')
        .select('*')
        .in('id', task.project.team_members || []);

      if (!teamMembers || teamMembers.length === 0) {
        return {
          success: true,
          data: { task, reason: 'no_team_members' }
        };
      }

      // 4. Use AI to suggest best assignment with enhanced reasoning
      const assignmentPrompt = `You are an expert team coordinator. Analyze this task and recommend the best team member for assignment.

# Task Details
**Title**: ${task.title}
**Description**: ${task.description}
**Priority**: ${task.priority}
**Due Date**: ${task.due_date}
**Estimated Effort**: ${task.metadata?.estimated_hours || 'Not specified'} hours

# Available Team Members
${teamMembers.map((m, i) => `${i + 1}. ${m.name}
   - Role: ${m.role || 'Member'}
   - Skills: ${m.metadata?.skills?.join(', ') || 'General construction'}
   - Current Workload: ${m.metadata?.current_tasks || 'Unknown'}
   - Availability: ${m.metadata?.availability || 'Available'}`).join('\n\n')}

# Assignment Criteria
Consider the following factors:
1. **Skill Match**: Does the member have relevant skills for this task?
2. **Experience Level**: Is their experience appropriate for the task complexity?
3. **Current Workload**: Do they have capacity to take on this task?
4. **Priority Alignment**: Can they meet the due date given their schedule?
5. **Role Appropriateness**: Is this task within their job responsibilities?

# Response Format
Provide your recommendation as:
RECOMMENDED: [Member number]
REASONING: [2-3 sentences explaining why this member is the best choice]

If no suitable member is available, respond with:
RECOMMENDED: 0
REASONING: [Explanation of constraints and suggestion for resolution]`;

      const response = await this.aiService.getSunaResponse(assignmentPrompt, { task, teamMembers });
      
      // Extract suggested member index with improved parsing
      const recommendedMatch = response.content.match(/RECOMMENDED:\s*(\d+)/i);
      const suggestedIndex = recommendedMatch ? parseInt(recommendedMatch[1]) - 1 : 0;
      
      // Validate index is within bounds
      if (suggestedIndex < 0 || suggestedIndex >= teamMembers.length) {
        return {
          success: true,
          data: { task, reason: 'no_suitable_assignment', aiResponse: response.content }
        };
      }
      
      const suggestedMember = teamMembers[suggestedIndex];

      // 5. Update task with AI assignment
      await supabaseAdmin
        .from('tasks')
        .update({
          assigned_to: suggestedMember.id,
          metadata: {
            ...task.metadata,
            ai_assigned: true,
            assignment_reason: response.content,
            assignment_date: new Date().toISOString()
          }
        })
        .eq('id', taskId);

      // 6. Log workflow completion
      await this.logWorkflowEvent('task_auto_assignment', taskId, context, {
        assigned_to: suggestedMember.id
      });

      // Notify workflow completion
      socketService.notifyWorkflowComplete('task_assignment', taskId, 'team-coordinator', {
        assignedTo: suggestedMember.name
      });

      return {
        success: true,
        data: { task, assignedTo: suggestedMember, aiReason: response.content },
        insights: [`Task assigned to ${suggestedMember.name}`]
      };

    } catch (error) {
      console.error('Task auto-assignment workflow error:', error);

      // Notify workflow error
      socketService.notifyWorkflowError(
        'task_assignment',
        taskId,
        'team-coordinator',
        error instanceof Error ? error.message : 'Workflow failed'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  /**
   * Compliance Check Workflow
   * Orchestrates building code compliance checking
   */
  async handleComplianceCheck(
    projectId: string,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    // Notify workflow start
    socketService.notifyWorkflowStart('compliance_check', projectId, 'compliance-checker');

    try {
      // 1. Fetch project details
      const { data: project, error: fetchError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError || !project) {
        throw new Error('Failed to fetch project details');
      }

      // 2. Run AI compliance check
      const projectDetails = {
        name: project.name,
        description: project.description,
        phase: project.phase,
        type: project.metadata?.type || 'commercial'
      };

      const complianceAnalysis = await this.aiService.checkBuildingCodeCompliance(
        projectDetails,
        project.location
      );

      // 3. Extract insights and issues
      const insights = this.extractInsights(complianceAnalysis.content);

      // 4. Update project with compliance analysis
      await supabaseAdmin
        .from('projects')
        .update({
          metadata: {
            ...project.metadata,
            compliance_analysis: complianceAnalysis.content,
            compliance_insights: insights,
            compliance_checked_at: new Date().toISOString()
          }
        })
        .eq('id', projectId);

      // 5. Create actions for compliance issues
      const actions = await this.generateComplianceActions(project, complianceAnalysis, context);

      // 6. Log workflow completion
      await this.logWorkflowEvent('compliance_check', projectId, context, {
        insights: insights.length,
        actions: actions.length
      });

      // Notify workflow completion
      socketService.notifyWorkflowComplete('compliance_check', projectId, 'compliance-checker', {
        insights: insights.length,
        actions: actions.length
      });

      return {
        success: true,
        data: { project, complianceAnalysis },
        insights,
        actions
      };

    } catch (error) {
      console.error('Compliance check workflow error:', error);

      // Notify workflow error
      socketService.notifyWorkflowError(
        'compliance_check',
        projectId,
        'compliance-checker',
        error instanceof Error ? error.message : 'Workflow failed'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  // Helper methods

  private extractInsights(content: string): string[] {
    // Extract bullet points and key insights from AI response
    const insights: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        insights.push(trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }

    return insights.slice(0, 10); // Limit to top 10 insights
  }

  private async generateDocumentActions(
    document: any,
    aiAnalysis: AIResponse,
    context: WorkflowContext
  ): Promise<WorkflowAction[]> {
    const actions: WorkflowAction[] = [];

    // Check if document mentions safety concerns
    if (aiAnalysis.content.toLowerCase().includes('safety')) {
      actions.push({
        type: 'trigger_analysis',
        payload: { documentId: document.id, analysisType: 'safety' },
        agentType: 'safety-monitor',
        priority: 'high'
      });
    }

    // Check if document mentions compliance
    if (aiAnalysis.content.toLowerCase().includes('compliance') || 
        aiAnalysis.content.toLowerCase().includes('code')) {
      actions.push({
        type: 'trigger_analysis',
        payload: { projectId: document.project_id, analysisType: 'compliance' },
        agentType: 'compliance-checker',
        priority: 'medium'
      });
    }

    return actions;
  }

  private async generateBIMActions(
    model: any,
    aiAnalysis: AIResponse,
    context: WorkflowContext
  ): Promise<WorkflowAction[]> {
    const actions: WorkflowAction[] = [];

    // Check for clash or conflict mentions
    if (aiAnalysis.content.toLowerCase().includes('clash') || 
        aiAnalysis.content.toLowerCase().includes('conflict')) {
      actions.push({
        type: 'create_task',
        payload: {
          title: 'Review BIM Model Clashes',
          description: `AI detected potential clashes in ${model.name}. Review and resolve conflicts.`,
          priority: 'high',
          projectId: model.project_id
        },
        agentType: 'bim-analyzer',
        priority: 'high'
      });
    }

    return actions;
  }

  private async generateProjectActions(
    project: any,
    aiInsights: AIResponse,
    context: WorkflowContext
  ): Promise<WorkflowAction[]> {
    const actions: WorkflowAction[] = [];

    // Suggest initial project setup tasks
    actions.push({
      type: 'create_task',
      payload: {
        title: 'Initial Project Setup',
        description: 'Complete project setup based on AI recommendations',
        priority: 'high',
        projectId: project.id
      },
      agentType: 'pm-bot',
      priority: 'high'
    });

    return actions;
  }

  private async generateComplianceActions(
    project: any,
    complianceAnalysis: AIResponse,
    context: WorkflowContext
  ): Promise<WorkflowAction[]> {
    const actions: WorkflowAction[] = [];

    // Check for compliance issues
    if (complianceAnalysis.content.toLowerCase().includes('violation') ||
        complianceAnalysis.content.toLowerCase().includes('non-compliant')) {
      actions.push({
        type: 'create_task',
        payload: {
          title: 'Address Compliance Issues',
          description: 'Review and address compliance issues identified by AI analysis',
          priority: 'critical',
          projectId: project.id
        },
        agentType: 'compliance-checker',
        priority: 'critical'
      });
    }

    return actions;
  }

  private async logWorkflowEvent(
    workflowType: string,
    entityId: string,
    context: WorkflowContext,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await supabaseAdmin.from('chat_messages').insert({
        content: `Workflow completed: ${workflowType}`,
        role: 'system',
        agent_type: 'orchestrator',
        user_id: context.userId,
        project_id: context.projectId,
        metadata: {
          workflow_type: workflowType,
          entity_id: entityId,
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log workflow event:', error);
    }
  }

  /**
   * Execute workflow actions
   */
  async executeActions(actions: WorkflowAction[], context: WorkflowContext): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'create_task':
            await this.createTask(action.payload, context);
            break;
          case 'update_project':
            await this.updateProject(action.payload, context);
            break;
          case 'trigger_analysis':
            await this.triggerAnalysis(action.payload, context);
            break;
          case 'send_notification':
            await this.sendNotification(action.payload, context);
            break;
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  private async createTask(payload: any, context: WorkflowContext): Promise<void> {
    await supabaseAdmin.from('tasks').insert({
      ...payload,
      created_by: context.userId,
      status: 'pending'
    });
  }

  private async updateProject(payload: any, context: WorkflowContext): Promise<void> {
    await supabaseAdmin
      .from('projects')
      .update(payload.updates)
      .eq('id', payload.projectId);
  }

  private async triggerAnalysis(payload: any, context: WorkflowContext): Promise<void> {
    // Queue analysis for background processing
    console.log('Analysis triggered:', payload.analysisType);
  }

  private async sendNotification(payload: any, context: WorkflowContext): Promise<void> {
    // Send notification (would integrate with notification service)
    console.log('Notification sent:', payload.message);
  }
}

export default AIWorkflowOrchestrator;
