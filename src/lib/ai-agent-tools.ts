/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Agent Tools - Function calling capabilities for autonomous task execution
 * Allows AI agents to actually perform actions instead of just responding with text
 */

import { createClient } from '@supabase/supabase-js';
import { AIWorkflowOrchestrator } from './ai-workflow-orchestrator';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Tool result interface
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

// Tool definition interface
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any) => Promise<ToolResult>;
}

/**
 * Available tools that AI agents can use to perform actual tasks
 */
export const AI_AGENT_TOOLS: Tool[] = [
  // Document Processing Tools
  {
    name: 'analyze_uploaded_document',
    description: 'Analyzes a document that has been uploaded to the system. Triggers real OCR and document processing workflow.',
    parameters: {
      type: 'object',
      properties: {
        document_id: {
          type: 'string',
          description: 'The ID of the document to analyze'
        },
        analysis_type: {
          type: 'string',
          enum: ['compliance', 'specifications', 'general', 'cost'],
          description: 'Type of analysis to perform'
        }
      },
      required: ['document_id']
    },
    execute: async (params) => {
      try {
        const orchestrator = AIWorkflowOrchestrator.getInstance();
        const result = await orchestrator.handleDocumentUpload(
          params.document_id,
          { 
            userId: 'ai_agent_system',
            documentId: params.document_id,
            metadata: { triggeredBy: 'ai_agent', timestamp: Date.now() }
          }
        );

        return {
          success: true,
          data: result,
          message: `Document ${params.document_id} analyzed successfully`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to analyze document'
        };
      }
    }
  },

  // Project Management Tools
  {
    name: 'get_project_documents',
    description: 'Retrieves all documents associated with a specific project',
    parameters: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to fetch documents for'
        }
      },
      required: ['project_id']
    },
    execute: async (params) => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', params.project_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          success: true,
          data: data || [],
          message: `Found ${data?.length || 0} documents for project ${params.project_id}`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to fetch project documents'
        };
      }
    }
  },

  {
    name: 'get_project_status',
    description: 'Gets the current status and details of a construction project',
    parameters: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to fetch status for'
        }
      },
      required: ['project_id']
    },
    execute: async (params) => {
      try {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', params.project_id)
          .single();

        if (projectError) throw projectError;

        // Get associated tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', params.project_id);

        if (tasksError) throw tasksError;

        // Calculate completion percentage
        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          success: true,
          data: {
            project,
            tasks,
            metrics: {
              total_tasks: totalTasks,
              completed_tasks: completedTasks,
              completion_percentage: completionPercentage.toFixed(1)
            }
          },
          message: `Project status: ${completionPercentage.toFixed(1)}% complete`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to fetch project status'
        };
      }
    }
  },

  {
    name: 'create_project_task',
    description: 'Creates a new task for a construction project',
    parameters: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to create task for'
        },
        title: {
          type: 'string',
          description: 'Task title'
        },
        description: {
          type: 'string',
          description: 'Task description'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Task priority level'
        },
        assigned_to: {
          type: 'string',
          description: 'User ID to assign task to (optional)'
        }
      },
      required: ['project_id', 'title', 'description']
    },
    execute: async (params) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            project_id: params.project_id,
            title: params.title,
            description: params.description,
            priority: params.priority || 'medium',
            status: 'pending',
            assigned_to: params.assigned_to,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          data,
          message: `Task "${params.title}" created successfully`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to create task'
        };
      }
    }
  },

  // BIM Tools
  {
    name: 'trigger_bim_analysis',
    description: 'Triggers BIM model analysis workflow for clash detection and coordination',
    parameters: {
      type: 'object',
      properties: {
        model_id: {
          type: 'string',
          description: 'The BIM model ID to analyze'
        },
        analysis_type: {
          type: 'string',
          enum: ['clash_detection', 'quantity_takeoff', 'coordination', 'full'],
          description: 'Type of BIM analysis to perform'
        }
      },
      required: ['model_id']
    },
    execute: async (params) => {
      try {
        const orchestrator = AIWorkflowOrchestrator.getInstance();
        const result = await orchestrator.handleBIMAnalysis(
          params.model_id,
          { 
            userId: 'ai_agent_system',
            metadata: { 
              triggeredBy: 'ai_agent', 
              timestamp: Date.now(),
              analysisType: params.analysis_type 
            }
          }
        );

        return {
          success: true,
          data: result,
          message: `BIM analysis completed for model ${params.model_id}`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to analyze BIM model'
        };
      }
    }
  },

  // File System Tools
  {
    name: 'list_project_files',
    description: 'Lists all files in a project directory',
    parameters: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to list files for'
        }
      },
      required: ['project_id']
    },
    execute: async (params) => {
      try {
        const projectDir = path.join(process.cwd(), 'uploads', params.project_id);
        
        try {
          const files = await fs.readdir(projectDir);
          const fileDetails = await Promise.all(
            files.map(async (file) => {
              const filePath = path.join(projectDir, file);
              const stats = await fs.stat(filePath);
              return {
                name: file,
                size: stats.size,
                modified: stats.mtime,
                type: path.extname(file)
              };
            })
          );

          return {
            success: true,
            data: fileDetails,
            message: `Found ${files.length} files in project directory`
          };
        } catch (err) {
          return {
            success: true,
            data: [],
            message: 'Project directory not found or empty'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to list project files'
        };
      }
    }
  },

  // Compliance Tools
  {
    name: 'check_code_compliance',
    description: 'Runs building code compliance check workflow for a project',
    parameters: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'The project ID to check compliance for'
        }
      },
      required: ['project_id']
    },
    execute: async (params) => {
      try {
        const orchestrator = AIWorkflowOrchestrator.getInstance();
        const result = await orchestrator.handleComplianceCheck(
          params.project_id,
          { 
            userId: 'ai_agent_system',
            projectId: params.project_id,
            metadata: { triggeredBy: 'ai_agent', timestamp: Date.now() }
          }
        );

        return {
          success: true,
          data: result,
          message: `Compliance check completed for project ${params.project_id}`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to check compliance'
        };
      }
    }
  },

  // Query Tools
  {
    name: 'search_documents',
    description: 'Searches through all project documents using text search',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query text'
        },
        project_id: {
          type: 'string',
          description: 'Optional: limit search to specific project'
        },
        document_type: {
          type: 'string',
          description: 'Optional: filter by document type (blueprint, specification, etc.)'
        }
      },
      required: ['query']
    },
    execute: async (params) => {
      try {
        let query = supabase
          .from('documents')
          .select('*')
          .or(`name.ilike.%${params.query}%,ocr_text.ilike.%${params.query}%`);

        if (params.project_id) {
          query = query.eq('project_id', params.project_id);
        }

        if (params.document_type) {
          query = query.eq('type', params.document_type);
        }

        const { data, error } = await query.limit(20);

        if (error) throw error;

        return {
          success: true,
          data: data || [],
          message: `Found ${data?.length || 0} matching documents`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to search documents'
        };
      }
    }
  }
];

/**
 * Tool executor - Calls the appropriate tool based on AI agent's decision
 */
export async function executeAgentTool(toolName: string, parameters: any): Promise<ToolResult> {
  const tool = AI_AGENT_TOOLS.find(t => t.name === toolName);
  
  if (!tool) {
    return {
      success: false,
      error: `Tool '${toolName}' not found`,
      message: `Unknown tool: ${toolName}`
    };
  }

  console.log(`🔧 Executing tool: ${toolName}`, parameters);

  try {
    const result = await tool.execute(parameters);
    console.log(`✅ Tool ${toolName} completed:`, result.message);
    return result;
  } catch (error) {
    console.error(`❌ Tool ${toolName} failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: `Tool execution failed: ${toolName}`
    };
  }
}

/**
 * Get tool definitions for AI agent context
 */
export function getToolDefinitions(): any[] {
  return AI_AGENT_TOOLS.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}
