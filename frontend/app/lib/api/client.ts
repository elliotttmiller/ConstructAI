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
      recommendations: unknown[];
    };
    optimization: {
      improvements: Array<{
        category: string;
        description: string;
        impact: string;
        metric_change?: string;
      }>;
      metrics_comparison: {
        original: {
          total_duration: number;
          critical_path_duration: number;
          total_cost: number;
          total_tasks: number;
          avg_task_duration: number;
        };
        optimized: {
          total_duration: number;
          critical_path_duration: number;
          total_cost: number;
          total_tasks: number;
          avg_task_duration: number;
        };
        improvements: {
          duration_reduction_days: number;
          duration_reduction_percent: number;
          cost_savings: number;
          cost_savings_percent: number;
        };
      };
      optimized_project: unknown;
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

  /**
   * 📤 STEP 1: Upload document (simple, fast, NO AI analysis)
   * Returns document_id for subsequent analysis
   */
  async uploadDocument(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{
    status: string;
    message: string;
    document_id: string;
    filename: string;
    file_size: number;
    file_type: string;
    document_type: string;
    project_id: string;
    analysis_status: string;
    next_step: string;
  }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject({
              message: "Failed to parse upload response",
              code: "PARSE_ERROR",
              details: error,
            } as APIError);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject({
              message: errorData.detail || errorData.message || `Upload failed: ${xhr.statusText}`,
              code: xhr.status.toString(),
              details: errorData,
            } as APIError);
          } catch {
            reject({
              message: `Upload failed: ${xhr.statusText}`,
              code: xhr.status.toString(),
            } as APIError);
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject({
          message: "Network error during upload",
          code: "NETWORK_ERROR",
        } as APIError);
      });

      xhr.addEventListener("abort", () => {
        reject({
          message: "Upload cancelled",
          code: "ABORTED",
        } as APIError);
      });

      // Send request
      xhr.open(
        "POST",
        `${this.baseURL}/api/projects/${projectId}/documents/upload`
      );
      xhr.send(formData);
    });
  }

  /**
   * 🗑️ Delete a document from project
   */
  async deleteDocument(
    projectId: string,
    documentId: string
  ): Promise<{
    status: string;
    message: string;
    document_id: string;
    remaining_documents: number;
  }> {
    const response = await fetch(
      `${this.baseURL}/api/projects/${projectId}/documents/${documentId}`,
      {
        method: "DELETE",
        headers: this.headers,
      }
    );
    return this.handleResponse(response);
  }

  /**
   * 🤖 STEP 2: Analyze uploaded document (AI-driven, comprehensive)
   * Triggers full AI analysis pipeline on uploaded document
   */
  async analyzeDocument(
    projectId: string,
    documentId: string
  ): Promise<{ status: string; message: string; analysis_id: string }> {
    const response = await fetch(
      `${this.baseURL}/api/projects/${projectId}/documents/${documentId}/analyze`,
      {
        method: "POST",
        headers: this.headers,
      }
    );
    return this.handleResponse(response);
  }

  /**
   * 🌊 STEP 2 (STREAMING): Analyze with real-time progress updates
   * Server-Sent Events (SSE) endpoint that streams progress during analysis
   * 
   * @param projectId - The project ID
   * @param documentId - The document ID to analyze
   * @param onProgress - Callback for progress updates (phase, message, progress %)
   * @param onInsight - Callback for intermediate insights ("Found 27 clauses")
   * @param onComplete - Callback when analysis completes with final results
   * @param onError - Callback for errors
   */
  analyzeDocumentStream(
    projectId: string,
    documentId: string,
    callbacks: {
      onProgress?: (data: {
        phase: number;
        total_phases: number;
        status: string;
        message: string;
        progress: number;
        elapsed: number;
        estimated_remaining: number;
        insights?: Record<string, unknown>;
      }) => void;
      onInsight?: (data: {
        type: string;
        value: number | string;
        message: string;
      }) => void;
      onComplete?: (data: {
        analysis_id: string;
        execution_time: number;
        quality_score: number;
        ai_decisions: number;
        recommendations: number;
        requirements: number;
        document_type: string;
      }) => void;
      onError?: (data: { error: string; phase?: string }) => void;
    }
  ): { close: () => void } {
    const eventSource = new EventSource(
      `${this.baseURL}/api/projects/${projectId}/documents/${documentId}/analyze/stream`
    );

    eventSource.addEventListener("progress", (event) => {
      if (callbacks.onProgress) {
        const data = JSON.parse(event.data);
        callbacks.onProgress(data);
      }
    });

    eventSource.addEventListener("insight", (event) => {
      if (callbacks.onInsight) {
        const data = JSON.parse(event.data);
        callbacks.onInsight(data);
      }
    });

    eventSource.addEventListener("complete", (event) => {
      if (callbacks.onComplete) {
        const data = JSON.parse(event.data);
        callbacks.onComplete(data);
      }
      eventSource.close();
    });

    eventSource.addEventListener("error", (event) => {
      const messageEvent = event as MessageEvent;
      if (callbacks.onError && messageEvent.data) {
        try {
          const data = JSON.parse(messageEvent.data);
          callbacks.onError(data);
        } catch {
          callbacks.onError({ error: "Stream connection error" });
        }
      }
      eventSource.close();
    });

    // Return control object for cancellation
    return {
      close: () => eventSource.close()
    };
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing
export { APIClient };
