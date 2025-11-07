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
    description: 'Analyzes a document that has been uploaded to the system. Triggers real OCR and document processing workflow with VISION AI support for blueprints and visual documents. IMPORTANT: Use the document UUID (e.g., "7d9f45cd-abd1-4a5a-b2c9-caeb6c738f6d"), NOT the filename. Use get_recent_documents to find the document ID first if you only know the filename. Automatically uses GPT-4 Vision for image-based documents (PDFs, blueprints, photos).',
    parameters: {
      type: 'object',
      properties: {
        document_id: {
          type: 'string',
          description: 'The UUID of the document to analyze (not the filename)'
        },
        analysis_type: {
          type: 'string',
          enum: ['compliance', 'specifications', 'general', 'cost', 'vision', 'multimodal'],
          description: 'Type of analysis to perform. Use "vision" for blueprint/image analysis, "multimodal" for combined vision+text'
        },
        use_vision: {
          type: 'boolean',
          description: 'Whether to use GPT-4 Vision for image analysis (recommended for blueprints, plans, photos)',
          default: true
        }
      },
      required: ['document_id']
    },
    execute: async (params) => {
      try {
        // Fetch document details from database
        const { data: document, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', params.document_id)
          .single();

        if (docError || !document) {
          return {
            success: false,
            error: 'Document not found',
            message: `Could not find document with ID: ${params.document_id}. Use get_recent_documents to find the correct document ID.`
          };
        }

        console.log(`📄 Analyzing document: ${document.name} (${document.type})`);

        // Determine if vision analysis is appropriate
        const isImageDocument = ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'dxf'].includes(
          document.type?.toLowerCase() || ''
        );
        const shouldUseVision = (params.use_vision !== false && isImageDocument) || 
                                params.analysis_type === 'vision' || 
                                params.analysis_type === 'multimodal';

        // Use the AI service for intelligent analysis
        const aiClient = (await import('@/lib/ai-services')).default;
        
        let analysisResult;

        if (shouldUseVision && document.url) {
          console.log('🔬 Using intelligent AI analysis with vision support');
          
          // Get extracted text if available (for multi-modal)
          // Database field is 'extracted_text' from OCR processing
          const extractedText = document.extracted_text || '';

          // Use multi-modal if we have both image and text, otherwise vision-only
          if (extractedText && extractedText.length > 0) {
            analysisResult = await aiClient.analyzeDocumentMultiModal(
              document.url,
              extractedText,
              document.category || 'construction document'
            );
          } else {
            analysisResult = await aiClient.analyzeDocumentWithVision(
              document.url,
              document.category || 'construction document'
            );
          }
        } else if (document.extracted_text) {
          console.log('📝 Using text-only analysis');
          const textContent = document.extracted_text || '';
          
          analysisResult = await aiClient.getDocumentAnalysis(
            textContent,
            document.category || 'general'
          );
        } else {
          // Trigger workflow orchestrator for extraction
          const orchestrator = AIWorkflowOrchestrator.getInstance();
          const result = await orchestrator.handleDocumentUpload(
            params.document_id,
            { 
              userId: 'ai_agent_system',
              documentId: params.document_id,
              metadata: { 
                triggeredBy: 'ai_agent', 
                timestamp: Date.now(),
                analysisType: params.analysis_type,
                useVision: shouldUseVision
              }
            }
          );

          return {
            success: true,
            data: result,
            message: `Document ${document.name} processed successfully with workflow orchestration`
          };
        }

        // Update document with analysis results
        await supabase
          .from('documents')
          .update({
            ai_analysis: analysisResult.content,
            analysis_model: analysisResult.model,
            status: 'analyzed',
            updated_at: new Date().toISOString()
          })
          .eq('id', params.document_id);

        return {
          success: true,
          data: {
            document_id: params.document_id,
            document_name: document.name,
            analysis: analysisResult.content,
            model: analysisResult.model,
            analysis_method: shouldUseVision ? 'vision-enhanced' : 'text-only',
            usage: analysisResult.usage
          },
          message: `✅ Successfully analyzed "${document.name}" using ${shouldUseVision ? 'GPT-4 Vision (advanced)' : 'text analysis'}\n\nModel: ${analysisResult.model}\n\n${analysisResult.content.substring(0, 500)}...`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to analyze document. Please check the document ID and try again.'
        };
      }
    }
  },

  {
    name: 'get_recent_documents',
    description: 'Retrieves the most recently uploaded documents with their IDs and names. Use this to find document UUIDs when you only know the filename.',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of documents to return (default: 10)',
          default: 10
        }
      },
      required: []
    },
    execute: async (params) => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, name, type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(params.limit || 10);

        if (error) throw error;

        return {
          success: true,
          data: data || [],
          message: `Found ${data?.length || 0} recent documents`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to fetch recent documents'
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
          .or(`name.ilike.%${params.query}%,extracted_text.ilike.%${params.query}%`);

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
  },

  // =============================================================================
  // PARAMETRIC CAD GENERATION TOOLS - Build123d Integration
  // =============================================================================
  
  {
    name: 'generate_structural_column',
    description: 'Generates a parametric 3D model of a structural column with base plate, capital, and bolt holes. Returns STEP (for CAD software), STL (for 3D printing), and GLTF (for web viewing) exports. Use this when users request structural columns, supports, pillars, or load-bearing elements.',
    parameters: {
      type: 'object',
      properties: {
        height: {
          type: 'number',
          description: 'Column height in millimeters (e.g., 3000 for 3 meters)',
          minimum: 100,
          maximum: 20000
        },
        shaft_diameter: {
          type: 'number',
          description: 'Diameter of the column shaft in millimeters (e.g., 300)',
          minimum: 50,
          maximum: 2000
        },
        base_size: {
          type: 'number',
          description: 'Size of the base plate in millimeters (e.g., 500 for 500x500mm plate)',
          minimum: 100,
          maximum: 3000
        },
        hole_count: {
          type: 'number',
          description: 'Number of bolt holes in base and capital (3-12)',
          minimum: 3,
          maximum: 12,
          default: 4
        },
        hole_diameter: {
          type: 'number',
          description: 'Diameter of bolt holes in millimeters',
          minimum: 5,
          maximum: 100,
          default: 20
        },
        material: {
          type: 'string',
          enum: ['steel', 'aluminum', 'concrete', 'timber'],
          description: 'Material type for mass calculation',
          default: 'steel'
        },
        add_capital: {
          type: 'boolean',
          description: 'Whether to add a capital (top plate) to the column',
          default: true
        }
      },
      required: ['height', 'shaft_diameter', 'base_size']
    },
    execute: async (params) => {
      try {
        // Call the CAD service to generate the column
        const response = await fetch(`${process.env.CAD_SERVICE_URL || 'http://localhost:8001'}/api/cad/column/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'CAD generation failed');
        }

        const result = await response.json();

        // Also save the model to the database for persistence
        try {
          await fetch('/api/cad/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model_id: result.model_id,
              model_type: 'column',
              name: `AI-Generated Column ${new Date().toLocaleString()}`,
              description: `Parametric structural column: ${params.height}mm height, ${params.shaft_diameter}mm diameter, ${params.material}`,
              parameters: params,
              properties: result.properties,
              exports: result.exports,
              material: result.material
            })
          });
        } catch (dbError) {
          console.warn('Failed to save model to database:', dbError);
          // Non-fatal - model generation succeeded
        }

        return {
          success: true,
          data: {
            model_id: result.model_id,
            exports: result.exports,
            properties: result.properties,
            material: result.material,
            download_links: {
              step_cad: `/api/cad/export/${result.model_id}/step`,
              stl_3d_print: `/api/cad/export/${result.model_id}/stl`,
              gltf_web: `/api/cad/export/${result.model_id}/gltf`
            }
          },
          message: `✅ Successfully generated ${params.material} structural column:\n` +
                   `- Height: ${params.height}mm (${(params.height/1000).toFixed(1)}m)\n` +
                   `- Diameter: ${params.shaft_diameter}mm\n` +
                   `- Volume: ${(result.properties.volume / 1000000).toFixed(2)} cm³\n` +
                   `- Mass: ${result.material.mass_kg.toFixed(2)} kg\n` +
                   `- Exports: STEP (CAD), STL (3D print), GLTF (web viewer)\n` +
                   `- Model ID: ${result.model_id}`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to generate structural column. Please check CAD service connection.'
        };
      }
    }
  },

  {
    name: 'generate_box_enclosure',
    description: 'Generates a parametric 3D model of a box/enclosure with custom dimensions, wall thickness, optional lid, corner fillets, and mounting holes. Use this for equipment enclosures, storage boxes, housings, or any rectangular container needs.',
    parameters: {
      type: 'object',
      properties: {
        width: {
          type: 'number',
          description: 'Box width in millimeters',
          minimum: 10,
          maximum: 10000
        },
        height: {
          type: 'number',
          description: 'Box height in millimeters',
          minimum: 10,
          maximum: 10000
        },
        depth: {
          type: 'number',
          description: 'Box depth in millimeters',
          minimum: 10,
          maximum: 10000
        },
        wall_thickness: {
          type: 'number',
          description: 'Wall thickness in millimeters (creates hollow interior)',
          minimum: 1,
          maximum: 50,
          default: 5
        },
        has_lid: {
          type: 'boolean',
          description: 'Whether the box includes a lid/cover',
          default: true
        },
        corner_radius: {
          type: 'number',
          description: 'Corner fillet radius in millimeters (0 for sharp corners)',
          minimum: 0,
          maximum: 100,
          default: 5
        },
        mounting_holes: {
          type: 'boolean',
          description: 'Whether to add mounting holes in the base',
          default: false
        }
      },
      required: ['width', 'height', 'depth']
    },
    execute: async (params) => {
      try {
        const requestBody = {
          dimensions: {
            width: params.width,
            height: params.height,
            depth: params.depth
          },
          wall_thickness: params.wall_thickness || 5,
          has_lid: params.has_lid !== false,
          corner_radius: params.corner_radius || 5,
          mounting_holes: params.mounting_holes || false
        };

        const response = await fetch(`${process.env.CAD_SERVICE_URL || 'http://localhost:8001'}/api/cad/box/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'CAD generation failed');
        }

        const result = await response.json();

        // Save to database
        try {
          await fetch('/api/cad/models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model_id: result.model_id,
              model_type: 'box',
              name: `AI-Generated Box ${new Date().toLocaleString()}`,
              description: `Parametric box/enclosure: ${params.width}×${params.height}×${params.depth}mm`,
              parameters: requestBody,
              properties: result.properties,
              exports: result.exports
            })
          });
        } catch (dbError) {
          console.warn('Failed to save model to database:', dbError);
        }

        return {
          success: true,
          data: {
            model_id: result.model_id,
            exports: result.exports,
            properties: result.properties,
            download_links: {
              step_cad: `/api/cad/export/${result.model_id}/step`,
              stl_3d_print: `/api/cad/export/${result.model_id}/stl`,
              gltf_web: `/api/cad/export/${result.model_id}/gltf`
            }
          },
          message: `✅ Successfully generated box/enclosure:\n` +
                   `- Dimensions: ${params.width}×${params.height}×${params.depth}mm\n` +
                   `- Wall thickness: ${requestBody.wall_thickness}mm\n` +
                   `- Volume: ${(result.properties.volume / 1000000).toFixed(2)} cm³\n` +
                   `- Lid: ${requestBody.has_lid ? 'Yes' : 'No'}\n` +
                   `- Corner radius: ${requestBody.corner_radius}mm\n` +
                   `- Exports: STEP (CAD), STL (3D print), GLTF (web viewer)\n` +
                   `- Model ID: ${result.model_id}`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to generate box/enclosure. Please check CAD service connection.'
        };
      }
    }
  },

  {
    name: 'apply_cad_template',
    description: 'Applies a pre-built CAD template (standard columns, boxes, etc.) and generates the 3D model. Use this for quick generation of common structural elements.',
    parameters: {
      type: 'object',
      properties: {
        template_category: {
          type: 'string',
          enum: ['structural', 'mechanical', 'architectural'],
          description: 'Category of template to use'
        },
        template_name: {
          type: 'string',
          description: 'Name of the template (e.g., "Standard Steel Column", "Small Equipment Box")'
        }
      },
      required: ['template_category']
    },
    execute: async (params) => {
      try {
        // Fetch available templates
        const templatesResponse = await fetch(`/api/cad/templates?category=${params.template_category}`);
        if (!templatesResponse.ok) {
          throw new Error('Failed to fetch templates');
        }

        const { templates } = await templatesResponse.json();
        
        if (!templates || templates.length === 0) {
          return {
            success: false,
            message: `No templates found in category: ${params.template_category}`
          };
        }

        // Find matching template by name or use first one
        let template = templates[0];
        if (params.template_name) {
          const match = templates.find((t: any) => 
            t.name.toLowerCase().includes(params.template_name.toLowerCase())
          );
          if (match) template = match;
        }

        // Generate model using template parameters
        const modelType = template.model_type;
        const endpoint = modelType === 'column' ? '/api/cad/column/generate' : '/api/cad/box/generate';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template.default_parameters)
        });

        if (!response.ok) {
          throw new Error('Failed to generate model from template');
        }

        const result = await response.json();

        // Increment template usage count
        await fetch('/api/cad/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: template.id })
        });

        return {
          success: true,
          data: {
            template_used: template.name,
            model_id: result.model_id,
            exports: result.exports,
            properties: result.properties,
            download_links: {
              step_cad: `/api/cad/export/${result.model_id}/step`,
              stl_3d_print: `/api/cad/export/${result.model_id}/stl`,
              gltf_web: `/api/cad/export/${result.model_id}/gltf`
            }
          },
          message: `✅ Successfully generated model from template "${template.name}":\n` +
                   `- Category: ${template.category}\n` +
                   `- Type: ${template.model_type}\n` +
                   `- Description: ${template.description}\n` +
                   `- Model ID: ${result.model_id}\n` +
                   `- Exports available: STEP, STL, GLTF`
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to apply CAD template'
        };
      }
    }
  },

  {
    name: 'list_cad_templates',
    description: 'Lists all available CAD templates organized by category. Use this to show users what pre-built options are available.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['structural', 'mechanical', 'architectural', 'all'],
          description: 'Filter by category (optional)',
          default: 'all'
        }
      },
      required: []
    },
    execute: async (params) => {
      try {
        const url = params.category && params.category !== 'all' 
          ? `/api/cad/templates?category=${params.category}`
          : '/api/cad/templates';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }

        const { templates } = await response.json();

        // Organize by category
        const organized: Record<string, any[]> = {};
        templates.forEach((template: any) => {
          if (!organized[template.category]) {
            organized[template.category] = [];
          }
          organized[template.category].push(template);
        });

        let message = '📚 Available CAD Templates:\n\n';
        Object.keys(organized).forEach(category => {
          message += `**${category.toUpperCase()}:**\n`;
          organized[category].forEach(t => {
            message += `  • ${t.name}: ${t.description}\n`;
            message += `    Tags: ${t.tags.join(', ')}\n`;
          });
          message += '\n';
        });

        return {
          success: true,
          data: { templates, organized },
          message
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to list CAD templates'
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
