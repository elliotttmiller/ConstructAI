/**
 * Request Deduplication Utility
 * Prevents duplicate simultaneous requests to the same endpoint
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private requestTimeout = 30000; // 30 seconds

  private constructor() {
    // Cleanup old requests every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  public static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  /**
   * Execute a request with deduplication
   * If the same request is already in-flight, returns the existing promise
   */
  async fetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      timeout?: number;
      force?: boolean; // Force new request even if one exists
    } = {}
  ): Promise<T> {
    const { timeout = this.requestTimeout, force = false } = options;

    // If force is true, remove any existing request
    if (force) {
      this.pendingRequests.delete(key);
    }

    // Check if request is already pending
    const existing = this.pendingRequests.get(key);
    if (existing) {
      // Check if request hasn't timed out
      if (Date.now() - existing.timestamp < timeout) {
        console.log(`[Dedup] Reusing pending request: ${key}`);
        return existing.promise;
      } else {
        // Request timed out, remove it
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    console.log(`[Dedup] Creating new request: ${key}`);
    const promise = fetchFn()
      .then((result) => {
        // Remove from pending after completion
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // Remove from pending after error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Generate a cache key from URL and options
   */
  generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Clear a specific pending request
   */
  clear(key: string): void {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }

  /**
   * Cleanup timed out requests
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.requestTimeout) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Get statistics about pending requests
   */
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      requests: Array.from(this.pendingRequests.keys()),
    };
  }
}

// Singleton instance
export const requestDeduplicator = RequestDeduplicator.getInstance();

/**
 * Wrapper for fetch with automatic deduplication
 */
export async function deduplicatedFetch<T>(
  url: string,
  options?: RequestInit & { skipDedup?: boolean }
): Promise<T> {
  const { skipDedup, ...fetchOptions } = options || {};

  if (skipDedup) {
    // Skip deduplication, make direct request
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  const key = requestDeduplicator.generateKey(url, fetchOptions);

  return requestDeduplicator.fetch(key, async () => {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

export default requestDeduplicator;
