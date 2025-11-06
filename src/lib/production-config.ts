/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Production Configuration for ConstructAI Platform
 * Manages feature flags, performance settings, and production optimizations
 */

export interface ProductionConfig {
  // Feature Flags
  features: {
    blueprintAnalysis: boolean;
    realTimeOCR: boolean;
    advancedCV: boolean;
    hunyuan3D: boolean;
    progressiveEnhancement: boolean;
  };

  // Performance Settings
  performance: {
    maxFileSize: number; // bytes
    maxImageSize: number; // pixels
    ocrTimeout: number; // milliseconds
    analysisTimeout: number; // milliseconds
    workerCount: number;
    enableCaching: boolean;
    lazyLoading: boolean;
  };

  // Quality Settings
  quality: {
    minImageClarity: number; // percentage
    minOCRConfidence: number; // percentage
    fallbackThreshold: number; // percentage
    retryAttempts: number;
  };

  // Error Handling
  errorHandling: {
    enableDetailedErrors: boolean;
    enableErrorReporting: boolean;
    maxRetries: number;
    retryDelay: number; // milliseconds
  };

  // UI/UX Settings
  ui: {
    enableProgressIndicators: boolean;
    showQualityMetrics: boolean;
    enableDebugMode: boolean;
    animationDuration: number; // milliseconds
  };
}

// Production configuration
export const PRODUCTION_CONFIG: ProductionConfig = {
  features: {
    blueprintAnalysis: true,
    realTimeOCR: true,
    advancedCV: true,
    hunyuan3D: true,
    progressiveEnhancement: true
  },

  performance: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxImageSize: 2048, // 2048px max dimension
    ocrTimeout: 30000, // 30 seconds
    analysisTimeout: 60000, // 60 seconds
    workerCount: 1,
    enableCaching: true,
    lazyLoading: true
  },

  quality: {
    minImageClarity: 40,
    minOCRConfidence: 30,
    fallbackThreshold: 25,
    retryAttempts: 2
  },

  errorHandling: {
    enableDetailedErrors: process.env.NODE_ENV === 'development',
    enableErrorReporting: process.env.NODE_ENV === 'production',
    maxRetries: 3,
    retryDelay: 1000
  },

  ui: {
    enableProgressIndicators: true,
    showQualityMetrics: true,
    enableDebugMode: process.env.NODE_ENV === 'development',
    animationDuration: 300
  }
};

// Development overrides
export const DEVELOPMENT_CONFIG: Partial<ProductionConfig> = {
  performance: {
    ...PRODUCTION_CONFIG.performance,
    ocrTimeout: 60000, // Longer timeout for debugging
    analysisTimeout: 120000
  },

  errorHandling: {
    ...PRODUCTION_CONFIG.errorHandling,
    enableDetailedErrors: true,
    enableErrorReporting: false
  },

  ui: {
    ...PRODUCTION_CONFIG.ui,
    enableDebugMode: true,
    showQualityMetrics: true
  }
};

// Get current configuration based on environment
export function getConfig(): ProductionConfig {
  if (process.env.NODE_ENV === 'development') {
    return {
      ...PRODUCTION_CONFIG,
      ...DEVELOPMENT_CONFIG
    };
  }
  return PRODUCTION_CONFIG;
}

// Feature flag helpers
export function isFeatureEnabled(feature: keyof ProductionConfig['features']): boolean {
  const config = getConfig();
  return config.features[feature];
}

export function getPerformanceSetting<K extends keyof ProductionConfig['performance']>(
  setting: K
): ProductionConfig['performance'][K] {
  const config = getConfig();
  return config.performance[setting];
}

export function getQualitySetting<K extends keyof ProductionConfig['quality']>(
  setting: K
): ProductionConfig['quality'][K] {
  const config = getConfig();
  return config.quality[setting];
}

// Performance monitoring
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  public static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  public static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    const config = getConfig();
    if (config.ui.enableDebugMode) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  public static logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    const config = getConfig();

    if (config.ui.enableDebugMode) {
      console.log(`📊 Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...metadata
      });
    }
  }
}

// Error tracking
export class ErrorTracker {
  private static errorCounts = new Map<string, number>();

  public static trackError(category: string, error: Error, context?: Record<string, unknown>): void {
    const config = getConfig();

    // Increment error count
    const currentCount = this.errorCounts.get(category) || 0;
    this.errorCounts.set(category, currentCount + 1);

    if (config.errorHandling.enableDetailedErrors) {
      console.error(`❌ ${category}:`, error.message, context);
    }

    if (config.errorHandling.enableErrorReporting) {
      // In production, you would send this to an error tracking service
      this.reportError(category, error, context);
    }
  }

  private static reportError(category: string, error: Error, context?: Record<string, unknown>): void {
    // Placeholder for error reporting service integration
    // e.g., Sentry, LogRocket, or custom analytics
    console.log('Error reported:', { category, error: error.message, context });
  }

  public static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
}

// Cache management
export class CacheManager {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  public static set(key: string, data: unknown, ttl = 300000): void { // 5 minutes default
    const config = getConfig();
    if (!config.performance.enableCaching) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  public static get<T>(key: string): T | null {
    const config = getConfig();
    if (!config.performance.enableCaching) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public static clear(): void {
    this.cache.clear();
  }

  public static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Resource management
export class ResourceManager {
  private static activeWorkers = new Set<Worker>();
  private static memoryUsage = { peak: 0, current: 0 };

  public static registerWorker(worker: Worker): void {
    this.activeWorkers.add(worker);
  }

  public static unregisterWorker(worker: Worker): void {
    this.activeWorkers.delete(worker);
  }

  public static cleanupWorkers(): void {
    this.activeWorkers.forEach(worker => {
      try {
        worker.terminate();
      } catch (error) {
        console.warn('Worker cleanup error:', error);
      }
    });
    this.activeWorkers.clear();
  }

  public static updateMemoryUsage(): void {
    if ('memory' in performance && (performance as any).memory) {
      const current = (performance as any).memory.usedJSHeapSize;
      this.memoryUsage.current = current;
      this.memoryUsage.peak = Math.max(this.memoryUsage.peak, current);
    }
  }

  public static getResourceStats(): { workers: number; memory: typeof ResourceManager.memoryUsage } {
    this.updateMemoryUsage();
    return {
      workers: this.activeWorkers.size,
      memory: { ...this.memoryUsage }
    };
  }
}

// Browser compatibility check
export function checkBrowserCompatibility(): {
  compatible: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check for required APIs
  if (!window.File) missing.push('File API');
  if (!window.FileReader) missing.push('FileReader API');
  if (!window.URL?.createObjectURL) missing.push('URL.createObjectURL');
  if (!window.Worker) missing.push('Web Workers');
  if (!window.OffscreenCanvas && !document.createElement('canvas')) missing.push('Canvas API');

  // Check for performance APIs
  if (!window.performance) warnings.push('Performance API not available');
  if (!('memory' in performance)) warnings.push('Memory monitoring not available');

  // Check for modern features
  if (!window.fetch) warnings.push('Fetch API not available');
  if (!window.Promise) missing.push('Promise support');

  return {
    compatible: missing.length === 0,
    missing,
    warnings
  };
}

// Initialize production systems
export function initializeProduction(): void {
  const config = getConfig();

  // Only log in development mode to reduce overhead
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Initializing ConstructAI Production Environment');
    console.log('📊 Configuration:', {
      environment: process.env.NODE_ENV,
      features: Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      performance: {
        maxFileSize: `${(config.performance.maxFileSize / 1024 / 1024).toFixed(0)}MB`,
        maxImageSize: `${config.performance.maxImageSize}px`,
        caching: config.performance.enableCaching ? 'enabled' : 'disabled'
      }
    });
  }

  // Skip browser compatibility check in production for faster load
  if (config.ui.enableDebugMode && process.env.NODE_ENV === 'development') {
    const compatibility = checkBrowserCompatibility();
    if (!compatibility.compatible) {
      console.error('❌ Browser compatibility issues:', compatibility.missing);
    }
    if (compatibility.warnings.length > 0) {
      console.warn('⚠️ Browser warnings:', compatibility.warnings);
    }
  }

  // Setup cleanup on page unload (lightweight)
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      ResourceManager.cleanupWorkers();
      CacheManager.clear();
    }, { once: true });

    // Memory monitoring only in debug mode and less frequently
    if (config.ui.enableDebugMode && process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const stats = ResourceManager.getResourceStats();
        if (stats.memory.current > 100 * 1024 * 1024) { // Increased threshold to 100MB
          console.warn('⚠️ High memory usage:', {
            current: `${(stats.memory.current / 1024 / 1024).toFixed(2)}MB`,
            peak: `${(stats.memory.peak / 1024 / 1024).toFixed(2)}MB`,
            workers: stats.workers
          });
        }
      }, 60000); // Check every 60 seconds instead of 30
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Production environment initialized successfully');
  }
}

// Configuration and utilities are already exported above
