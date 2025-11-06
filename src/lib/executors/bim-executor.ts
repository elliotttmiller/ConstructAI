/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * BIM Executor
 * Autonomously runs BIM analysis workflows
 */

import { TaskExecutor, ExecutionContext } from '../autonomous-executor';
import { supabaseAdmin } from '../supabase';
import ConstructionAIService from '../ai-services';

export class BIMExecutor implements TaskExecutor {
  private aiService: ConstructionAIService;

  constructor() {
    this.aiService = ConstructionAIService.getInstance();
  }

  async execute(payload: any, context: ExecutionContext): Promise<any> {
    const { action, data } = payload;

    switch (action) {
      case 'analyze_model':
        return await this.analyzeModel(data, context);
      case 'detect_clashes':
        return await this.detectClashes(data, context);
      case 'validate_structure':
        return await this.validateStructure(data, context);
      case 'generate_report':
        return await this.generateReport(data, context);
      default:
        throw new Error(`Unknown BIM action: ${action}`);
    }
  }

  /**
   * Analyze BIM model
   */
  private async analyzeModel(data: any, context: ExecutionContext): Promise<any> {
    const { modelId } = data;

    // Fetch model data
    const { data: model, error } = await supabaseAdmin
      .from('documents')
      .select('*, project:projects(*)')
      .eq('id', modelId)
      .single();

    if (error || !model) {
      throw new Error(`BIM model not found: ${modelId}`);
    }

    // Prepare model data for analysis
    const modelData = {
      name: model.name,
      type: model.type,
      size: model.size,
      projectId: model.project_id,
      elements: model.metadata?.elements || []
    };

    // Run AI analysis
    const analysis = await this.aiService.analyzeBIMModel(modelData, model.metadata?.clashes);

    // Extract insights
    const insights = this.extractInsights(analysis.content);
    const issues = this.extractIssues(analysis.content);

    // Update model with analysis
    await supabaseAdmin
      .from('documents')
      .update({
        metadata: {
          ...model.metadata,
          ai_analysis: analysis.content,
          ai_insights: insights,
          detected_issues: issues,
          analyzed_at: new Date().toISOString()
        }
      })
      .eq('id', modelId);

    // Auto-create tasks for critical issues
    if (issues.critical && issues.critical.length > 0) {
      await this.createIssuesTasks(issues.critical, model.project_id, context);
    }

    return {
      modelId,
      insights,
      issues,
      tasksCreated: issues.critical?.length || 0
    };
  }

  /**
   * Detect clashes in BIM model
   */
  private async detectClashes(data: any, context: ExecutionContext): Promise<any> {
    const { modelId, elements } = data;

    // Simple clash detection logic (in real implementation, this would be more sophisticated)
    const clashes = [];

    // Simulate clash detection
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (this.checkCollision(elements[i], elements[j])) {
          clashes.push({
            element1: elements[i].id,
            element2: elements[j].id,
            severity: this.calculateSeverity(elements[i], elements[j]),
            location: this.calculateClashLocation(elements[i], elements[j])
          });
        }
      }
    }

    // Update model with clash data
    await supabaseAdmin
      .from('documents')
      .update({
        metadata: {
          clashes,
          clash_count: clashes.length,
          last_clash_detection: new Date().toISOString()
        }
      })
      .eq('id', modelId);

    return {
      modelId,
      clashCount: clashes.length,
      clashes: clashes.slice(0, 10) // Return top 10 clashes
    };
  }

  /**
   * Validate structural integrity
   */
  private async validateStructure(data: any, context: ExecutionContext): Promise<any> {
    const { modelId } = data;

    const prompt = `As a structural engineer, validate this BIM model for:
1. Load distribution
2. Support adequacy
3. Material specifications
4. Code compliance
5. Safety factors

Provide a structured validation report with any concerns.`;

    const response = await this.aiService.getSunaResponse(prompt, { modelId });

    const validationResult = {
      passed: !response.content.toLowerCase().includes('fail'),
      concerns: this.extractConcerns(response.content),
      recommendations: this.extractRecommendations(response.content),
      validatedAt: new Date().toISOString()
    };

    // Update model
    await supabaseAdmin
      .from('documents')
      .update({
        metadata: {
          structural_validation: validationResult
        }
      })
      .eq('id', modelId);

    return validationResult;
  }

  /**
   * Generate BIM analysis report
   */
  private async generateReport(data: any, context: ExecutionContext): Promise<any> {
    const { modelId } = data;

    // Fetch model and analysis data
    const { data: model } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', modelId)
      .single();

    const report = {
      modelName: model?.name,
      generatedAt: new Date().toISOString(),
      summary: model?.metadata?.ai_analysis || 'No analysis available',
      insights: model?.metadata?.ai_insights || [],
      clashes: model?.metadata?.clashes || [],
      issues: model?.metadata?.detected_issues || {},
      recommendations: model?.metadata?.structural_validation?.recommendations || []
    };

    // Store report
    await supabaseAdmin
      .from('documents')
      .insert({
        name: `BIM Analysis Report - ${model?.name}`,
        type: 'application/json',
        project_id: model?.project_id,
        uploaded_by: context.userId,
        status: 'completed',
        metadata: {
          report_type: 'bim_analysis',
          source_model: modelId,
          report_data: report
        }
      });

    return report;
  }

  // Helper methods

  private extractInsights(content: string): string[] {
    const insights: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        insights.push(trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }

    return insights.slice(0, 10);
  }

  private extractIssues(content: string): any {
    const issues: any = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    const lowerContent = content.toLowerCase();

    // Look for severity keywords
    if (lowerContent.includes('critical') || lowerContent.includes('severe')) {
      issues.critical.push('Critical issues detected - review required');
    }
    if (lowerContent.includes('clash') || lowerContent.includes('conflict')) {
      issues.high.push('Clashes or conflicts detected');
    }
    if (lowerContent.includes('warning') || lowerContent.includes('concern')) {
      issues.medium.push('Warnings or concerns identified');
    }

    return issues;
  }

  private checkCollision(elem1: any, elem2: any): boolean {
    // Simplified collision detection - would use actual geometry in production
    if (!elem1?.bounds || !elem2?.bounds) return false;
    
    const b1 = elem1.bounds;
    const b2 = elem2.bounds;
    
    // Validate all required properties exist
    if (!b1.min || !b1.max || !b2.min || !b2.max) return false;

    const overlaps = (
      b1.min.x < b2.max.x &&
      b1.max.x > b2.min.x &&
      b1.min.y < b2.max.y &&
      b1.max.y > b2.min.y &&
      b1.min.z < b2.max.z &&
      b1.max.z > b2.min.z
    );

    return overlaps;
  }

  private calculateSeverity(elem1: any, elem2: any): 'critical' | 'high' | 'medium' | 'low' {
    // Structural elements clashing = critical
    if (elem1.category === 'structural' || elem2.category === 'structural') {
      return 'critical';
    }
    // MEP clashes = high
    if (elem1.category === 'mep' || elem2.category === 'mep') {
      return 'high';
    }
    return 'medium';
  }

  private calculateClashLocation(elem1: any, elem2: any): any {
    // Validate bounds exist before accessing
    if (!elem1?.bounds?.min || !elem2?.bounds?.min) {
      return { x: 0, y: 0, z: 0 };
    }
    
    return {
      x: (elem1.bounds.min.x + elem2.bounds.min.x) / 2,
      y: (elem1.bounds.min.y + elem2.bounds.min.y) / 2,
      z: (elem1.bounds.min.z + elem2.bounds.min.z) / 2
    };
  }

  private extractConcerns(content: string): string[] {
    const concerns: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('concern') || line.toLowerCase().includes('issue')) {
        concerns.push(line.trim());
      }
    }

    return concerns;
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('should')) {
        recommendations.push(line.trim());
      }
    }

    return recommendations;
  }

  private async createIssuesTasks(issues: string[], projectId: string, context: ExecutionContext) {
    for (const issue of issues) {
      await supabaseAdmin
        .from('tasks')
        .insert({
          title: `Resolve BIM Issue: ${issue.substring(0, 50)}`,
          description: issue,
          priority: 'critical',
          status: 'pending',
          project_id: projectId,
          created_by: context.userId,
          metadata: {
            auto_generated: true,
            source: 'bim_analysis',
            created_at: new Date().toISOString()
          }
        });
    }
  }
}
