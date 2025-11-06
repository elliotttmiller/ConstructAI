/**
 * Progressive Image Component
 * Loads images with blur-up effect for smooth UX
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  aspectRatio?: string;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderSrc,
  aspectRatio = '16/9'
}: ProgressiveImageProps) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div 
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      <img
        src={imgSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-all duration-500',
          isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
