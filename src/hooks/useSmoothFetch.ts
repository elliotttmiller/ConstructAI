/**
 * Smooth Data Fetching Hooks
 * Provides optimistic updates, caching, and graceful error handling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSmoothFetchOptions<T> {
  initialData?: T;
  retryCount?: number;
  retryDelay?: number;
  cacheTime?: number;
  staleTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const cache = new Map<string, { data: any; timestamp: number }>();

export function useSmoothFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseSmoothFetchOptions<T> = {}
): FetchState<T> {
  const {
    initialData = null,
    retryCount = 3,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWithRetry = useCallback(
    async (attempt = 0): Promise<T> => {
      try {
        // Check cache first
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < staleTime) {
          return cached.data;
        }

        const result = await fetcher();

        // Update cache
        cache.set(key, { data: result, timestamp: Date.now() });

        // Clear old cache entries
        for (const [cacheKey, value] of cache.entries()) {
          if (Date.now() - value.timestamp > cacheTime) {
            cache.delete(cacheKey);
          }
        }

        return result;
      } catch (err) {
        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          return fetchWithRetry(attempt + 1);
        }
        throw err;
      }
    },
    [key, fetcher, retryCount, retryDelay, cacheTime, staleTime]
  );

  const fetch = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchWithRetry();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry, onSuccess, onError]);

  useEffect(() => {
    fetch();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// Optimistic update hook
export function useOptimisticUpdate<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const updateOptimistically = useCallback(
    async (
      optimisticValue: T,
      asyncUpdate: () => Promise<T>
    ) => {
      setData(optimisticValue);
      setIsOptimistic(true);

      try {
        const result = await asyncUpdate();
        setData(result);
        setIsOptimistic(false);
        return result;
      } catch (error) {
        // Rollback on error
        setData(initialData);
        setIsOptimistic(false);
        throw error;
      }
    },
    [initialData]
  );

  return { data, isOptimistic, updateOptimistically };
}

// Infinite scroll hook
export function useInfiniteScroll<T>(
  fetchPage: (page: number) => Promise<T[]>,
  options: { threshold?: number; enabled?: boolean } = {}
) {
  const { threshold = 100, enabled = true } = options;
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !enabled) return;

    setLoading(true);
    try {
      const newItems = await fetchPage(page);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setPage((p) => p + 1);
      }
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, enabled, fetchPage]);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        { rootMargin: `${threshold}px` }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, loadMore, threshold]
  );

  return { items, loading, hasMore, lastElementRef };
}
