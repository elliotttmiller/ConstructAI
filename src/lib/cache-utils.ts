/**
 * Client-side caching utilities for API responses
 * Prevents redundant network requests and speeds up navigation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get data from cache if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL (time to live in milliseconds)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * Check if key exists and is valid in cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const apiCache = new APICache();

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 5 * 60 * 1000);
}

/**
 * Fetch with cache support
 * Uses cache-first strategy for GET requests
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { cacheTTL?: number; skipCache?: boolean }
): Promise<T> {
  const { cacheTTL, skipCache, ...fetchOptions } = options || {};
  const method = fetchOptions.method || 'GET';
  
  // Only cache GET requests
  if (method === 'GET' && !skipCache) {
    const cached = apiCache.get<T>(url);
    if (cached) {
      return cached;
    }
  }

  // Fetch from network
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache the response for GET requests
  if (method === 'GET' && !skipCache) {
    apiCache.set(url, data, cacheTTL);
  }

  return data;
}

/**
 * Prefetch and cache a URL
 */
export async function prefetchAndCache(url: string, ttl?: number): Promise<void> {
  try {
    await cachedFetch(url, { cacheTTL: ttl });
  } catch (error) {
    console.warn('Prefetch failed:', url, error);
  }
}

/**
 * Hook for using cached fetch in React components
 */
export function useCachedFetch<T>(
  url: string | null,
  options?: RequestInit & { cacheTTL?: number; skipCache?: boolean }
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await cachedFetch<T>(url, options);
        
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Fetch failed'));
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, options]);

  return { data, loading, error };
}

// Add React import
import * as React from 'react';
