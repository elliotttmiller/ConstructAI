/**
 * Lazy Loading Wrapper for Heavy Components
 * Optimizes initial page load by deferring heavy components
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoad({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback || <DefaultFallback />}>
      {children}
    </Suspense>
  );
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * Factory function to create lazy-loaded components with custom loading states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  const LazyWrapper = (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  LazyWrapper.displayName = 'LazyWrapper';
  
  return LazyWrapper;
}

/**
 * Intersection Observer based lazy loader
 * Only loads component when it enters viewport
 */
export function LazyLoadOnVisible({
  children,
  fallback,
  rootMargin = '100px',
}: LazyLoadProps & { rootMargin?: string }) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={fallback || <DefaultFallback />}>
          {children}
        </Suspense>
      ) : (
        fallback || <DefaultFallback />
      )}
    </div>
  );
}

// Add React import for hooks
import * as React from 'react';
