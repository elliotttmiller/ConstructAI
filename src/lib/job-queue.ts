/**
 * Background Job Queue System
 * Processes heavy AI workflows asynchronously without blocking API responses
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type JobType = 
  | 'document-analysis'
  | 'bim-analysis'
  | 'clash-detection'
  | 'cost-estimation'
  | 'schedule-optimization'
  | 'compliance-check';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress?: number; // 0-100
}

export interface JobOptions {
  priority?: Job['priority'];
  maxAttempts?: number;
  timeout?: number; // milliseconds
  metadata?: Record<string, any>;
}

/**
 * Simple in-memory job queue
 * In production, replace with Redis-backed queue (BullMQ, Bee-Queue, etc.)
 */
class JobQueue {
  private static instance: JobQueue;
  private jobs: Map<string, Job> = new Map();
  private workers: Map<JobType, (job: Job) => Promise<any>> = new Map();
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startProcessing();
  }

  public static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    type: JobType,
    data: any,
    options: JobOptions = {}
  ): Promise<string> {
    const {
      priority = 'medium',
      maxAttempts = 3,
      metadata = {},
    } = options;

    const jobId = `job_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const job: Job = {
      id: jobId,
      type,
      status: 'pending',
      priority,
      data: { ...data, metadata },
      attempts: 0,
      maxAttempts,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);

    console.log(`[JobQueue] Added job: ${jobId} (${type})`);

    // Trigger immediate processing check
    this.processNextJob();

    return jobId;
  }

  /**
   * Register a worker function for a job type
   */
  registerWorker(type: JobType, worker: (job: Job) => Promise<any>): void {
    this.workers.set(type, worker);
    console.log(`[JobQueue] Registered worker for: ${type}`);
  }

  /**
   * Get job status
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs (filtered by status/type)
   */
  getJobs(filters?: { status?: JobStatus; type?: JobType }): Job[] {
    let jobs = Array.from(this.jobs.values());

    if (filters?.status) {
      jobs = jobs.filter((j) => j.status === filters.status);
    }
    if (filters?.type) {
      jobs = jobs.filter((j) => j.type === filters.type);
    }

    return jobs.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation time
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'processing') {
      // Can't cancel already processing job
      return false;
    }

    this.jobs.delete(jobId);
    console.log(`[JobQueue] Cancelled job: ${jobId}`);
    return true;
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    if (this.processingInterval) return;

    // Check for jobs every 2 seconds
    this.processingInterval = setInterval(() => {
      this.processNextJob();
    }, 2000);

    console.log('[JobQueue] Started processing');
  }

  /**
   * Process the next pending job
   */
  private async processNextJob(): Promise<void> {
    if (this.processing) return;

    const pendingJobs = this.getJobs({ status: 'pending' });
    if (pendingJobs.length === 0) return;

    const job = pendingJobs[0];
    const worker = this.workers.get(job.type);

    if (!worker) {
      console.warn(`[JobQueue] No worker registered for job type: ${job.type}`);
      return;
    }

    this.processing = true;
    job.status = 'processing';
    job.startedAt = new Date();
    job.attempts += 1;

    console.log(`[JobQueue] Processing job: ${job.id} (${job.type}), attempt ${job.attempts}/${job.maxAttempts}`);

    try {
      const result = await worker(job);

      job.status = 'completed';
      job.result = result;
      job.completedAt = new Date();
      job.progress = 100;

      console.log(`[JobQueue] Completed job: ${job.id}`);
    } catch (error) {
      console.error(`[JobQueue] Job failed: ${job.id}`, error);

      job.error = error instanceof Error ? error.message : 'Unknown error';

      // Retry if attempts remaining
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        console.log(`[JobQueue] Retrying job: ${job.id}`);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
        console.log(`[JobQueue] Job failed permanently: ${job.id}`);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Stop processing jobs
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log('[JobQueue] Stopped processing');
  }

  /**
   * Get queue statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
      workers: Array.from(this.workers.keys()),
    };
  }

  /**
   * Clean up old completed/failed jobs
   */
  cleanup(olderThanMs = 3600000): void {
    // Default: 1 hour
    const cutoff = Date.now() - olderThanMs;
    let removed = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.completedAt &&
        job.completedAt.getTime() < cutoff
      ) {
        this.jobs.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[JobQueue] Cleaned up ${removed} old jobs`);
    }
  }
}

// Singleton instance
export const jobQueue = JobQueue.getInstance();

// Auto-cleanup every 30 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    jobQueue.cleanup();
  }, 30 * 60 * 1000);
}

export default jobQueue;
