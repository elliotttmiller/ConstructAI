/**
 * Performance Optimization Utilities
 * World-class techniques for smooth, responsive UI
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Debounce function for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll/resize handlers
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Request Animation Frame wrapper for smooth animations
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (rafId !== null) return;
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Prefetch helper for next navigation
export function prefetchRoute(href: string) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// Image preloader
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch DOM updates with requestIdleCallback
export function scheduleIdleTask(
  task: () => void,
  options?: IdleRequestOptions
) {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task, options);
  } else {
    setTimeout(task, 1);
  }
}

// Virtual scrolling helper
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 3
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
}

// Optimized scroll handler
export function createOptimizedScrollHandler(
  callback: (scrollTop: number) => void
) {
  let rafId: number | null = null;
  let lastScrollTop = 0;
  
  return (event: Event) => {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    
    // Skip if scroll hasn't changed
    if (scrollTop === lastScrollTop) return;
    lastScrollTop = scrollTop;
    
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      callback(scrollTop);
      rafId = null;
    });
  };
}

// Memory-efficient array chunking
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Smooth scroll to element
export function smoothScrollTo(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
) {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options,
  });
}

// Get GPU acceleration style
export function getGPUAcceleration(): React.CSSProperties {
  return {
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    perspective: 1000,
  };
}

// Measure render performance
export function measureRenderTime(componentName: string) {
  if (typeof window === 'undefined') return;
  
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Slower than 60fps
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
  };
}
