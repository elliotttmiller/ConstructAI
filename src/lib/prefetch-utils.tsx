/**
 * Global route prefetching system
 * Aggressively prefetches all major routes for instant navigation
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// All main application routes that should be prefetched
const MAIN_ROUTES = [
  '/',
  '/agents',
  '/documents',
  '/bim',
  '/projects',
  '/team',
  '/workflows',
  '/enterprise',
  '/settings',
];

/**
 * Hook to prefetch all main routes on app load
 * Uses intelligent timing to not block initial render
 */
export function useGlobalPrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth routes
    if (pathname?.startsWith('/auth/')) {
      return;
    }

    // Prefetch current route's neighbors first (most likely to be visited)
    const currentIndex = MAIN_ROUTES.indexOf(pathname || '/');
    const priorityRoutes: string[] = [];
    
    if (currentIndex !== -1) {
      // Add adjacent routes
      if (currentIndex > 0) priorityRoutes.push(MAIN_ROUTES[currentIndex - 1]);
      if (currentIndex < MAIN_ROUTES.length - 1) priorityRoutes.push(MAIN_ROUTES[currentIndex + 1]);
    }
    
    // Prefetch priority routes immediately
    priorityRoutes.forEach(route => {
      if (route && route !== pathname) {
        router.prefetch(route);
      }
    });

    // Prefetch remaining routes on idle
    const prefetchRemaining = () => {
      MAIN_ROUTES.forEach(route => {
        if (route !== pathname && !priorityRoutes.includes(route)) {
          router.prefetch(route);
        }
      });
    };

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchRemaining, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      const timeout = setTimeout(prefetchRemaining, 1000);
      return () => clearTimeout(timeout);
    }
  }, [router, pathname]);
}

/**
 * Prefetch routes related to current route
 * More intelligent than global prefetch - only prefetches likely next destinations
 */
export function usePrefetchRelated(relatedRoutes: string[]) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth routes
    if (pathname?.startsWith('/auth/')) {
      return;
    }

    // Prefetch immediately
    relatedRoutes.forEach(route => {
      if (route !== pathname) {
        router.prefetch(route);
      }
    });
  }, [router, pathname, relatedRoutes]);
}

/**
 * Hook to prefetch on hover
 * More responsive than Next.js default Link prefetch
 */
export function usePrefetchOnHover(href: string) {
  const router = useRouter();

  const handleMouseEnter = () => {
    router.prefetch(href);
  };

  return { onMouseEnter: handleMouseEnter };
}

/**
 * Prefetch API endpoints for faster data loading
 * Warms up the cache before navigation
 */
export async function prefetchAPIData(endpoints: string[]) {
  // Use low-priority fetch to not block navigation
  const promises = endpoints.map(endpoint => 
    fetch(endpoint, { 
      method: 'GET',
      priority: 'low' as RequestPriority,
    }).catch(err => {
      console.warn('Failed to prefetch API:', endpoint, err);
    })
  );

  await Promise.allSettled(promises);
}

/**
 * Component that handles global prefetching
 * Add this to your root layout or ClientBody
 */
export function GlobalPrefetchProvider({ children }: { children: React.ReactNode }) {
  useGlobalPrefetch();
  return <>{children}</>;
}
