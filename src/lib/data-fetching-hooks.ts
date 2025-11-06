/**
 * Optimized data fetching hooks with built-in caching
 * Provides a consistent pattern for all API calls in the app
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedFetch, apiCache } from './cache-utils';

interface UseDataFetchOptions<T> {
  cacheTTL?: number;
  skipCache?: boolean;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refetchOnMount?: boolean;
}

/**
 * Hook for fetching data with automatic caching and loading states
 */
export function useDataFetch<T>(
  url: string | null,
  options: UseDataFetchOptions<T> = {}
) {
  const {
    cacheTTL = 60000, // Default 1 minute cache
    skipCache = false,
    enabled = true,
    onSuccess,
    onError,
    refetchOnMount = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) {
      setLoading(false);
      return;
    }

    const fetchId = ++fetchCountRef.current;

    try {
      setLoading(true);
      setError(null);

      const result = await cachedFetch<T>(url, { cacheTTL, skipCache });

      // Only update state if this is the latest fetch and component is still mounted
      if (isMountedRef.current && fetchId === fetchCountRef.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMountedRef.current && fetchId === fetchCountRef.current) {
        const error = err instanceof Error ? err : new Error('Fetch failed');
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    }
  }, [url, enabled, cacheTTL, skipCache, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    
    if (url && enabled) {
      fetchData();
    } else {
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [url, enabled, fetchData, refetchOnMount]);

  // Manual refetch function
  const refetch = useCallback(() => {
    if (url) {
      apiCache.delete(url); // Clear cache for this URL
      fetchData();
    }
  }, [url, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * Automatically invalidates related cache entries
 */
export function useMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateCache?: string[]; // URLs to invalidate from cache
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { onSuccess, onError, invalidateCache = [] } = options;

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);

        const result = await mutationFn(variables);

        // Invalidate related cache entries
        invalidateCache.forEach(url => {
          apiCache.delete(url);
        });

        setLoading(false);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');
        setError(error);
        setLoading(false);
        onError?.(error);
        throw error;
      }
    },
    [mutationFn, onSuccess, onError, invalidateCache]
  );

  return {
    mutate,
    loading,
    error,
    isLoading: loading,
    isError: error !== null,
  };
}

/**
 * Hook for prefetching data
 * Loads data in the background without showing loading state
 */
export function usePrefetch(urls: string[], options: { cacheTTL?: number } = {}) {
  const { cacheTTL = 60000 } = options;

  useEffect(() => {
    const prefetch = async () => {
      // Prefetch on idle to not block main thread
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          urls.forEach(async url => {
            try {
              await cachedFetch(url, { cacheTTL });
            } catch (err) {
              // Silently fail - it's just a prefetch
              console.debug('Prefetch failed for:', url);
            }
          });
        });
      } else {
        setTimeout(() => {
          urls.forEach(async url => {
            try {
              await cachedFetch(url, { cacheTTL });
            } catch (err) {
              console.debug('Prefetch failed for:', url);
            }
          });
        }, 100);
      }
    };

    prefetch();
  }, [urls, cacheTTL]);
}

/**
 * Hook for optimistic updates
 * Updates UI immediately while the actual request happens in background
 */
export function useOptimisticMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error, rollback: () => void) => void;
    optimisticUpdate?: (variables: TVariables) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { onSuccess, onError, optimisticUpdate } = options;
  const rollbackFnRef = useRef<(() => void) | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        setLoading(true);
        setError(null);

        // Apply optimistic update immediately
        if (optimisticUpdate) {
          optimisticUpdate(variables);
        }

        const result = await mutationFn(variables);

        setLoading(false);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');
        setError(error);
        setLoading(false);

        // Call rollback if error occurs
        const rollback = rollbackFnRef.current || (() => {});
        onError?.(error, rollback);
        throw error;
      }
    },
    [mutationFn, onSuccess, onError, optimisticUpdate]
  );

  return {
    mutate,
    loading,
    error,
    isLoading: loading,
    isError: error !== null,
    setRollback: (fn: () => void) => {
      rollbackFnRef.current = fn;
    },
  };
}
