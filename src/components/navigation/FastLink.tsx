/**
 * Performance-optimized Link component
 * Wraps Next.js Link with aggressive prefetching and hover optimization
 */

'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

interface FastLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  // Performance options
  prefetch?: boolean; // Default: true
  prefetchOnHover?: boolean; // Default: true
  prefetchOnMount?: boolean; // Default: false
}

/**
 * Ultra-fast Link component with intelligent prefetching
 * - Prefetches on hover for instant navigation
 * - Can prefetch on mount for critical routes
 * - Supports all standard Link props
 */
export function FastLink({
  href,
  children,
  className,
  onClick,
  prefetch = true,
  prefetchOnHover = true,
  prefetchOnMount = false,
  ...linkProps
}: FastLinkProps) {
  const router = useRouter();
  const prefetchedRef = React.useRef(false);

  // Prefetch on mount if requested
  React.useEffect(() => {
    if (prefetchOnMount && prefetch && !prefetchedRef.current) {
      router.prefetch(href);
      prefetchedRef.current = true;
    }
  }, [href, prefetch, prefetchOnMount, router]);

  // Prefetch on hover for instant navigation
  const handleMouseEnter = React.useCallback(() => {
    if (prefetchOnHover && prefetch && !prefetchedRef.current) {
      router.prefetch(href);
      prefetchedRef.current = true;
    }
  }, [href, prefetch, prefetchOnHover, router]);

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      prefetch={prefetch}
      {...linkProps}
    >
      {children}
    </Link>
  );
}

/**
 * Hook to prefetch a route programmatically
 */
export function usePrefetchRoute(href: string, options?: { immediate?: boolean }) {
  const router = useRouter();
  const { immediate = false } = options || {};

  React.useEffect(() => {
    if (immediate) {
      router.prefetch(href);
    }
  }, [href, immediate, router]);

  return React.useCallback(() => {
    router.prefetch(href);
  }, [href, router]);
}

/**
 * Batch prefetch multiple routes
 */
export function useBatchPrefetch(hrefs: string[], options?: { immediate?: boolean; delay?: number }) {
  const router = useRouter();
  const { immediate = false, delay = 0 } = options || {};

  React.useEffect(() => {
    if (!immediate) return;

    const prefetch = () => {
      hrefs.forEach(href => {
        router.prefetch(href);
      });
    };

    if (delay > 0) {
      const timeout = setTimeout(prefetch, delay);
      return () => clearTimeout(timeout);
    } else {
      prefetch();
    }
  }, [hrefs, immediate, delay, router]);

  return React.useCallback(() => {
    hrefs.forEach(href => {
      router.prefetch(href);
    });
  }, [hrefs, router]);
}
