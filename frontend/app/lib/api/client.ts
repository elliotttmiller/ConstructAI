/**
 * API Client for ConstructAI Backend
 * Provides type-safe communication with FastAPI backend
 * ZERO MOCK DATA - All data comes from real API endpoints
 */

import type {
  Project,
  AuditResult,
  OptimizationResult,
  APIError,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIClient {
  private baseURL: string;
  private headers: HeadersInit;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.headers = {
      "Content-Type": "application/json",
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: APIError = {
        message: `API Error: ${response.statusText}`,
        code: response.status.toString(),
      };

      try {
        const errorData = await response.json();
        error.details = errorData;
        error.message = errorData.message || error.message;
      } catch {
        // Use default error message if parsing fails
      }

      throw error;
    }

    return response.json();
  }

  /**
   * Health check - verify API is available
   */
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${this.baseURL}/api/v2/health`);
    return this.handleResponse(response);
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${this.baseURL}/api/projects`, {
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}`, {
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Create a new project
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(project),
    });
    return this.handleResponse(response);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(project),
    });
    return this.handleResponse(response);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Duplicate a project
   */
  async duplicateProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}/duplicate`, {
      method: "POST",
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Archive a project
   */
  async archiveProject(id: string): Promise<Project> {
    const response = await fetch(`${this.baseURL}/api/projects/${id}/archive`, {
      method: "PUT",
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Audit a project
   */
  async auditProject(projectData: unknown): Promise<AuditResult> {
    const response = await fetch(`${this.baseURL}/api/v1/audit`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(projectData),
    });
    const result = await this.handleResponse<{ status: string; data: AuditResult }>(response);
    return result.data;
  }

  /**
   * Optimize a project
   */
  async optimizeProject(projectData: unknown): Promise<OptimizationResult> {
    const response = await fetch(`${this.baseURL}/api/v1/optimize`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(projectData),
    });
    const result = await this.handleResponse<{ status: string; data: OptimizationResult }>(response);
    return result.data;
  }

  /**
   * Perform full analysis on a project
   */
  async analyzeProject(projectData: unknown): Promise<{
    audit: AuditResult;
    optimization: OptimizationResult;
  }> {
    const response = await fetch(`${this.baseURL}/api/v1/analyze`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(projectData),
    });
    const result = await this.handleResponse<{
      status: string;
      data: {
        audit: AuditResult;
        optimization: OptimizationResult;
      };
    }>(response);
    return result.data;
  }

  /**
   * Analyze a specific project by ID
   */
  async analyzeProjectById(projectId: string, projectData?: unknown): Promise<{
    status: string;
    project_id: string;
    audit: {
      overall_score: number;
      risks: unknown[];
      compliance_issues: unknown[];
      bottlenecks: unknown[];
      resource_conflicts: unknown[];
    };
    optimization: {
      duration_reduction_days: number;
      cost_savings: number;
      parallel_opportunities: number;
      bottlenecks_resolved: number;
      optimizations_applied: unknown[];
    };
  }> {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/analyze`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(projectData || {}),
    });
    return this.handleResponse(response);
  }

  /**
   * Export project data
   */
  async exportProject(projectId: string, format: "json" | "pdf" | "excel" = "json"): Promise<{
    status: string;
    format: string;
    data?: unknown;
    download_url?: string;
    message?: string;
    exported_at?: string;
  }> {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/export?format=${format}`, {
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Get project configuration
   */
  async getProjectConfig(projectId: string): Promise<{
    status: string;
    project_id: string;
    config: {
      analysis_settings: {
        enable_ai_suggestions: boolean;
        risk_threshold: string;
        optimization_level: string;
      };
      notification_settings: {
        email_alerts: boolean;
        slack_integration: boolean;
      };
      export_settings: {
        default_format: string;
        include_metadata: boolean;
      };
    };
  }> {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/config`, {
      headers: this.headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Update project configuration
   */
  async updateProjectConfig(projectId: string, config: unknown): Promise<{
    status: string;
    project_id: string;
    message: string;
    config: unknown;
  }> {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/config`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(config),
    });
    return this.handleResponse(response);
  }

  /**
   * Stream AI analysis results
   * Returns a readable stream for real-time updates
   */
  async streamAnalysis(projectData: unknown): Promise<ReadableStream> {
    const response = await fetch(`${this.baseURL}/api/analysis/stream`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.statusText}`);
    }

    return response.body!;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export { APIClient };
