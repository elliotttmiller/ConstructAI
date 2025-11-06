/**
 * Performance Monitor
 * Detects slow performance and adjusts UI accordingly
 */

'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  isSlowDevice: boolean;
  shouldReduceAnimations: boolean;
}

export function usePerformanceMonitor(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    isSlowDevice: false,
    shouldReduceAnimations: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        // Update metrics if FPS is consistently low
        if (fps < 30) {
          setMetrics({
            fps,
            isSlowDevice: true,
            shouldReduceAnimations: true,
          });
        }
      }

      rafId = requestAnimationFrame(measureFPS);
    };

    // Start measuring after a short delay
    const timeout = setTimeout(() => {
      rafId = requestAnimationFrame(measureFPS);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return metrics;
}

// Detect if user prefers reduced motion
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
