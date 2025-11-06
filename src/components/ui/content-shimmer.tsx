/**
 * Content Shimmer Component
 * Provides smooth skeleton loading with shimmer effect
 */

import { cn } from '@/lib/utils';

interface ContentShimmerProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  animate?: boolean;
}

export function ContentShimmer({
  className,
  lines = 3,
  avatar = false,
  animate = true,
}: ContentShimmerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {avatar && (
        <div
          className={cn(
            'h-12 w-12 rounded-full bg-muted',
            animate && 'animate-pulse'
          )}
        />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-muted rounded',
              animate && 'animate-pulse',
              i === lines - 1 ? 'w-4/5' : 'w-full'
            )}
            style={{
              animationDelay: animate ? `${i * 150}ms` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ShimmerPlaceholder({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  );
}
