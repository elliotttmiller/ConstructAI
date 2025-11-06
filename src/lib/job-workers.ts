/**
 * Background Job Workers Registration
 * Register all worker functions for processing background jobs
 */

import { jobQueue, Job } from '@/lib/job-queue';
import { AIWorkflowOrchestrator } from '@/lib/ai-workflow-orchestrator';
import { ClashDetectionService } from '@/lib/clash-detection';
import ConstructionAIService from '@/lib/ai-services';

/**
 * Initialize all job workers
 * Call this once when the server starts
 */
export function initializeJobWorkers() {
  console.log('[Workers] Initializing job workers...');

  // Document Analysis Worker
  jobQueue.registerWorker('document-analysis', async (job: Job) => {
    console.log(`[Worker] Processing document-analysis: ${job.id}`);
    
    const orchestrator = AIWorkflowOrchestrator.getInstance();
    const { documentId, userId, projectId } = job.data;

    const result = await orchestrator.handleDocumentUpload(documentId, {
      userId,
      projectId,
      documentId,
    });

    return result;
  });

  // BIM Analysis Worker
  jobQueue.registerWorker('bim-analysis', async (job: Job) => {
    console.log(`[Worker] Processing bim-analysis: ${job.id}`);
    
    const orchestrator = AIWorkflowOrchestrator.getInstance();
    const { modelId, userId, projectId, documentId } = job.data;

    const result = await orchestrator.handleBIMAnalysis(modelId, {
      userId,
      projectId,
      documentId,
    });

    // Execute any follow-up actions
    if (result.success && result.actions && result.actions.length > 0) {
      await orchestrator.executeActions(result.actions, {
        userId,
        projectId,
        documentId,
      });
    }

    return result;
  });

  // Clash Detection Worker
  jobQueue.registerWorker('clash-detection', async (job: Job) => {
    console.log(`[Worker] Processing clash-detection: ${job.id}`);
    
    const clashService = ClashDetectionService.getInstance();
    const { modelId, elements, options } = job.data;

    const clashes = await clashService.detectClashes(modelId, elements, options);

    return { clashes, count: clashes.length };
  });

  // Compliance Check Worker
  jobQueue.registerWorker('compliance-check', async (job: Job) => {
    console.log(`[Worker] Processing compliance-check: ${job.id}`);
    
    const orchestrator = AIWorkflowOrchestrator.getInstance();
    const { projectId, userId } = job.data;

    const result = await orchestrator.handleComplianceCheck(projectId, {
      userId,
      projectId,
    });

    return result;
  });

  // Cost Estimation Worker
  jobQueue.registerWorker('cost-estimation', async (job: Job) => {
    console.log(`[Worker] Processing cost-estimation: ${job.id}`);
    
    // Use generic AI service for cost estimation
    const aiService = ConstructionAIService.getInstance();
    const { projectData, userId, projectId } = job.data;
    
    const costEstimate = await aiService.getAIAssistantResponse(
      `Analyze project cost estimation for project: ${JSON.stringify(projectData)}`,
      { projectId, ...projectData }
    );
    
    return {
      success: true,
      data: costEstimate,
      insights: ['Cost estimation completed']
    };
  });

  // Schedule Optimization Worker
  jobQueue.registerWorker('schedule-optimization', async (job: Job) => {
    console.log(`[Worker] Processing schedule-optimization: ${job.id}`);
    
    // Use generic AI service for schedule optimization
    const aiService = ConstructionAIService.getInstance();
    const { scheduleData, userId, projectId } = job.data;
    
    const scheduleOptimization = await aiService.getAIAssistantResponse(
      `Analyze and optimize project schedule: ${JSON.stringify(scheduleData)}`,
      { projectId, ...scheduleData }
    );
    
    return {
      success: true,
      data: scheduleOptimization,
      insights: ['Schedule optimization completed']
    };
  });

  console.log('[Workers] All job workers initialized successfully');
}
