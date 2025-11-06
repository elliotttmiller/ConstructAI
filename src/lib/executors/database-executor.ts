/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Database Executor
 * Autonomously executes database queries and operations
 */

import { TaskExecutor, ExecutionContext } from '../autonomous-executor';
import { supabaseAdmin } from '../supabase';

export class DatabaseExecutor implements TaskExecutor {
  async execute(payload: any, context: ExecutionContext): Promise<any> {
    const { action, data } = payload;

    switch (action) {
      case 'query':
        return await this.executeQuery(data, context);
      case 'aggregate':
        return await this.executeAggregation(data, context);
      case 'update_batch':
        return await this.batchUpdate(data, context);
      case 'generate_insights':
        return await this.generateDataInsights(data, context);
      default:
        throw new Error(`Unknown database action: ${action}`);
    }
  }

  /**
   * Execute a database query autonomously
   */
  private async executeQuery(data: any, context: ExecutionContext): Promise<any> {
    const { table, filters, select = '*', limit = 100 } = data;

    // Validate table is allowed
    const allowedTables = ['projects', 'tasks', 'documents', 'users', 'chat_messages'];
    if (!allowedTables.includes(table)) {
      throw new Error(`Queries to table '${table}' are not allowed`);
    }

    let query = supabaseAdmin
      .from(table)
      .select(select)
      .limit(limit);

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (typeof value === 'object' && value !== null) {
          const operator = Object.keys(value)[0];
          const operatorValue = (value as any)[operator];
          
          switch (operator) {
            case 'eq':
              query = query.eq(key, operatorValue);
              break;
            case 'gt':
              query = query.gt(key, operatorValue);
              break;
            case 'lt':
              query = query.lt(key, operatorValue);
              break;
            case 'gte':
              query = query.gte(key, operatorValue);
              break;
            case 'lte':
              query = query.lte(key, operatorValue);
              break;
            case 'like':
              query = query.like(key, operatorValue);
              break;
            case 'in':
              query = query.in(key, operatorValue);
              break;
          }
        } else {
          query = query.eq(key, value);
        }
      }
    }

    const { data: results, error } = await query;

    if (error) {
      throw new Error(`Query failed: ${error.message}`);
    }

    return {
      table,
      count: results?.length || 0,
      results: results || []
    };
  }

  /**
   * Execute aggregation queries
   */
  private async executeAggregation(data: any, context: ExecutionContext): Promise<any> {
    const { table, aggregationType, field, groupBy } = data;

    // Validate table
    const allowedTables = ['projects', 'tasks', 'documents'];
    if (!allowedTables.includes(table)) {
      throw new Error(`Aggregations on table '${table}' are not allowed`);
    }

    // Fetch all data (in production, use database aggregation functions)
    const { data: records, error } = await supabaseAdmin
      .from(table)
      .select('*');

    if (error) {
      throw new Error(`Aggregation failed: ${error.message}`);
    }

    let result: any = {};

    switch (aggregationType) {
      case 'count':
        result = {
          type: 'count',
          total: records?.length || 0
        };
        break;

      case 'sum':
        result = {
          type: 'sum',
          field,
          total: records?.reduce((sum, record) => sum + (record[field] || 0), 0) || 0
        };
        break;

      case 'avg':
        const sum = records?.reduce((s, record) => s + (record[field] || 0), 0) || 0;
        result = {
          type: 'avg',
          field,
          average: records && records.length > 0 ? sum / records.length : 0
        };
        break;

      case 'group_count':
        const grouped: any = {};
        records?.forEach(record => {
          const key = record[groupBy] || 'undefined';
          grouped[key] = (grouped[key] || 0) + 1;
        });
        result = {
          type: 'group_count',
          groupBy,
          groups: grouped
        };
        break;

      default:
        throw new Error(`Unknown aggregation type: ${aggregationType}`);
    }

    return result;
  }

  /**
   * Batch update records
   */
  private async batchUpdate(data: any, context: ExecutionContext): Promise<any> {
    const { table, filters, updates } = data;

    // Validate table
    const allowedTables = ['projects', 'tasks', 'documents'];
    if (!allowedTables.includes(table)) {
      throw new Error(`Batch updates to table '${table}' are not allowed`);
    }

    // Build query
    let query = supabaseAdmin
      .from(table)
      .update(updates);

    // Apply filters
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    const { data: results, error, count } = await query.select();

    if (error) {
      throw new Error(`Batch update failed: ${error.message}`);
    }

    return {
      table,
      updated: count || 0,
      results: results || []
    };
  }

  /**
   * Generate insights from data
   */
  private async generateDataInsights(data: any, context: ExecutionContext): Promise<any> {
    const { projectId } = data;

    // Fetch project data
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // Fetch related tasks
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    // Fetch documents
    const { data: documents } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('project_id', projectId);

    // Generate insights
    const insights = {
      project: project?.name || 'Unknown',
      summary: {
        totalTasks: tasks?.length || 0,
        completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
        pendingTasks: tasks?.filter(t => t.status === 'pending').length || 0,
        totalDocuments: documents?.length || 0,
        progress: project?.progress || 0,
        budget: project?.budget || 0,
        spent: project?.spent || 0
      },
      tasksByPriority: this.groupBy(tasks || [], 'priority'),
      tasksByStatus: this.groupBy(tasks || [], 'status'),
      documentsByCategory: this.groupBy(documents || [], 'category'),
      recommendations: this.generateRecommendations(project, tasks, documents)
    };

    return insights;
  }

  // Helper methods

  private groupBy(items: any[], key: string): Record<string, number> {
    const groups: Record<string, number> = {};
    items.forEach(item => {
      const value = item[key] || 'unassigned';
      groups[value] = (groups[value] || 0) + 1;
    });
    return groups;
  }

  private generateRecommendations(project: any, tasks: any[], documents: any[]): string[] {
    const recommendations: string[] = [];

    // Check progress
    if (project && project.progress < 25 && tasks?.length > 10) {
      recommendations.push('Project has many tasks but low progress - consider reviewing task assignments');
    }

    // Check overdue tasks
    const overdueTasks = tasks?.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date() && t.status !== 'completed';
    }).length || 0;

    if (overdueTasks > 0) {
      recommendations.push(`${overdueTasks} tasks are overdue - prioritize completion`);
    }

    // Check budget
    if (project && project.budget && project.spent > project.budget * 0.9) {
      recommendations.push('Project is approaching budget limit - review expenditures');
    }

    // Check documentation
    if (documents && documents.length < 5 && tasks && tasks.length > 20) {
      recommendations.push('Low documentation for project size - consider adding more documents');
    }

    return recommendations;
  }
}
