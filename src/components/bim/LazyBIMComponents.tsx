/**
 * Lazy-loaded BIM Viewer Components
 * Defers loading of heavy Three.js dependencies until needed
 */

'use client';

import dynamic from 'next/dynamic';
import { ViewerSkeleton } from '@/components/ui/skeletons';
import { Loader2 } from 'lucide-react';

// Lazy load the heavy UniversalModelViewerEditor with a loading state
// Increased loading timeout and disabled prefetch for better stability
export const LazyUniversalViewer = dynamic(
  () => import('@/components/bim/UniversalModelViewerEditor').then(mod => ({ 
    default: mod.UniversalModelViewerEditor 
  })),
  {
    loading: () => <ViewerSkeleton />,
    ssr: false, // Disable SSR for Three.js components
  }
);

// Lazy load ThreeViewer
export const LazyThreeViewer = dynamic(
  () => import('@/components/bim/ThreeViewer'),
  {
    loading: () => <ViewerSkeleton />,
    ssr: false,
  }
);

// Lazy load ParametricCADBuilder - only load when tab is active
export const LazyCADBuilder = dynamic(
  () => import('@/components/cad/ParametricCADBuilder').then(mod => ({
    default: mod.ParametricCADBuilder
  })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading CAD Builder...</p>
          <p className="text-xs text-muted-foreground">This may take a moment</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Lazy load LayerManager - lightweight component
export const LazyLayerManager = dynamic(
  () => import('@/components/bim/LayerManager').then(mod => ({
    default: mod.LayerManager
  })),
  {
    loading: () => (
      <div className="p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);
