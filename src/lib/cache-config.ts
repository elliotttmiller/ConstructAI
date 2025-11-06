/**
 * Cache TTL (Time To Live) constants
 * Centralized configuration for API cache durations
 */

export const CACHE_TTL = {
  // Short cache for frequently changing data
  SHORT: 30 * 1000,        // 30 seconds (e.g., documents with processing status)
  
  // Medium cache for data that changes occasionally
  MEDIUM: 60 * 1000,       // 1 minute (e.g., analytics, BIM models)
  
  // Long cache for relatively stable data
  LONG: 120 * 1000,        // 2 minutes (e.g., projects, team members)
  
  // Very long cache for rarely changing data
  VERY_LONG: 300 * 1000,   // 5 minutes (e.g., static configuration)
} as const;

/**
 * Get a human-readable description of a TTL value
 */
export function describeTTL(ttl: number): string {
  const seconds = ttl / 1000;
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = seconds / 60;
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Cache configuration presets for common use cases
 */
export const CACHE_PRESETS = {
  // Real-time data that needs frequent updates
  REAL_TIME: {
    cacheTTL: CACHE_TTL.SHORT,
    description: 'Real-time data (30s cache)',
  },
  
  // Dashboard and analytics data
  DASHBOARD: {
    cacheTTL: CACHE_TTL.MEDIUM,
    description: 'Dashboard data (1min cache)',
  },
  
  // Project and team management data
  MANAGEMENT: {
    cacheTTL: CACHE_TTL.LONG,
    description: 'Management data (2min cache)',
  },
  
  // Static or rarely changing data
  STATIC: {
    cacheTTL: CACHE_TTL.VERY_LONG,
    description: 'Static data (5min cache)',
  },
} as const;
