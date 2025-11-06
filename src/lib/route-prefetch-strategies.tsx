/**
 * Route-specific prefetching strategies
 * Defines intelligent prefetch relationships between pages
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define route relationships - which routes to prefetch from each page
const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  '/': [
    '/projects',
    '/documents',
    '/agents',
    '/bim',
  ],
  '/projects': [
    '/',
    '/documents',
    '/team',
    '/bim',
  ],
  '/documents': [
    '/',
    '/projects',
    '/bim',
  ],
  '/bim': [
    '/documents',
    '/projects',
  ],
  '/team': [
    '/projects',
    '/',
  ],
  '/agents': [
    '/',
    '/workflows',
  ],
  '/workflows': [
    '/agents',
    '/',
  ],
  '/enterprise': [
    '/',
    '/bim',
    '/documents',
  ],
};

// API endpoints to prefetch for each route
const ROUTE_API_PREFETCH_MAP: Record<string, string[]> = {
  '/': [
    '/api/analytics',
  ],
  '/projects': [
    '/api/projects',
  ],
  '/documents': [
    '/api/documents',
  ],
  '/bim': [
    '/api/bim',
  ],
  '/team': [
    '/api/team',
  ],
};

/**
 * Hook to implement route-specific prefetching
 * Prefetches related routes and API endpoints based on current location
 */
export function useRouteSpecificPrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Skip auth routes
    if (pathname.startsWith('/auth/')) return;

    // Get routes to prefetch for current page
    const routesToPrefetch = ROUTE_PREFETCH_MAP[pathname] || [];
    const apisToPrefetch = ROUTE_API_PREFETCH_MAP[pathname] || [];

    // Prefetch related routes immediately (high priority)
    routesToPrefetch.forEach(route => {
      router.prefetch(route);
    });

    // Prefetch API endpoints on idle (lower priority)
    if (apisToPrefetch.length > 0) {
      const prefetchAPIs = () => {
        apisToPrefetch.forEach(async (endpoint) => {
          try {
            // Use low priority fetch if supported, otherwise normal fetch
            const fetchOptions: RequestInit = {
              method: 'GET',
            };
            
            // Only add priority if supported
            if ('priority' in Request.prototype) {
              (fetchOptions as any).priority = 'low';
            }
            
            await fetch(endpoint, fetchOptions);
          } catch (err) {
            // Silently fail - it's just a prefetch
            console.debug('API prefetch failed:', endpoint);
          }
        });
      };

      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(prefetchAPIs, { timeout: 2000 });
        return () => cancelIdleCallback(id);
      } else {
        const timeout = setTimeout(prefetchAPIs, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [router, pathname]);
}

/**
 * Get related routes for a specific path
 */
export function getRelatedRoutes(pathname: string): string[] {
  return ROUTE_PREFETCH_MAP[pathname] || [];
}

/**
 * Get API endpoints to prefetch for a specific path
 */
export function getAPIsToPrefetch(pathname: string): string[] {
  return ROUTE_API_PREFETCH_MAP[pathname] || [];
}

/**
 * Prefetch a specific route and its related routes
 */
export function prefetchRouteWithRelated(router: ReturnType<typeof useRouter>, pathname: string) {
  // Prefetch the route itself
  router.prefetch(pathname);

  // Prefetch related routes
  const relatedRoutes = getRelatedRoutes(pathname);
  relatedRoutes.forEach(route => {
    router.prefetch(route);
  });
}
