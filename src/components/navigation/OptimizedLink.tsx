/**
 * Optimized Navigation Link with Prefetching
 * Preloads routes on hover for instant navigation
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent, ReactNode, useCallback } from 'react';
import { motion } from 'framer-motion';

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onNavigate?: () => void;
  animate?: boolean;
}

export function OptimizedLink({
  href,
  children,
  className,
  prefetch = true,
  onNavigate,
  animate = true,
}: OptimizedLinkProps) {
  const router = useRouter();

  const handleMouseEnter = useCallback(() => {
    if (prefetch) {
      router.prefetch(href);
    }
  }, [prefetch, href, router]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate();
        router.push(href);
      }
    },
    [onNavigate, href, router]
  );

  if (animate) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={href}
          className={className}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
        >
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

/**
 * Prefetch multiple routes at once
 * Useful for prefetching all main navigation routes on app load
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  const prefetchAll = useCallback(() => {
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [routes, router]);

  return prefetchAll;
}

/**
 * Hook to prefetch routes on idle
 * Uses requestIdleCallback to avoid blocking main thread
 */
export function useIdlePrefetch(routes: string[]) {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefetch = () => {
      routes.forEach((route) => {
        router.prefetch(route);
      });
    };

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const timeout = setTimeout(prefetch, 1000);
      return () => clearTimeout(timeout);
    }
  }, [routes, router]);
}

// Add React import
import * as React from 'react';
