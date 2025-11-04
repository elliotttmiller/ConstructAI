"""
Performance Monitoring for Single-User Enterprise System.

Provides real-time performance tracking, caching intelligence,
and system health monitoring.
"""

from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
import time
import logging

logger = logging.getLogger(__name__)


@dataclass
class PerformanceMetric:
    """Performance metric data point."""
    metric_name: str
    value: float
    timestamp: datetime
    unit: str
    tags: Dict[str, str]


class PerformanceMonitor:
    """
    Performance Monitoring System for Single-User Optimization.
    
    Provides:
    - API response time tracking
    - Query performance monitoring
    - Cache hit rate analysis
    - System resource utilization
    - Performance trend analysis
    """
    
    def __init__(self):
        """Initialize performance monitor."""
        self.metrics: List[PerformanceMetric] = []
        self.operation_timings: Dict[str, List[float]] = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "total_requests": 0
        }
        
    def record_timing(
        self,
        operation: str,
        duration_ms: float,
        tags: Optional[Dict[str, str]] = None
    ):
        """
        Record operation timing.
        
        Args:
            operation: Operation name
            duration_ms: Duration in milliseconds
            tags: Optional metadata tags
        """
        metric = PerformanceMetric(
            metric_name=f"timing.{operation}",
            value=duration_ms,
            timestamp=datetime.now(),
            unit="ms",
            tags=tags or {}
        )
        
        self.metrics.append(metric)
        
        # Track in operation timings
        if operation not in self.operation_timings:
            self.operation_timings[operation] = []
        
        self.operation_timings[operation].append(duration_ms)
        
        # Keep only last 1000 timings per operation
        if len(self.operation_timings[operation]) > 1000:
            self.operation_timings[operation] = self.operation_timings[operation][-1000:]
    
    def record_cache_hit(self):
        """Record cache hit."""
        self.cache_stats["hits"] += 1
        self.cache_stats["total_requests"] += 1
    
    def record_cache_miss(self):
        """Record cache miss."""
        self.cache_stats["misses"] += 1
        self.cache_stats["total_requests"] += 1
    
    def get_operation_stats(self, operation: str) -> Dict[str, float]:
        """
        Get statistics for an operation.
        
        Args:
            operation: Operation name
            
        Returns:
            Statistics dictionary
        """
        if operation not in self.operation_timings:
            return {
                "count": 0,
                "avg_ms": 0,
                "min_ms": 0,
                "max_ms": 0,
                "p50_ms": 0,
                "p95_ms": 0,
                "p99_ms": 0
            }
        
        timings = self.operation_timings[operation]
        sorted_timings = sorted(timings)
        count = len(timings)
        
        return {
            "count": count,
            "avg_ms": sum(timings) / count,
            "min_ms": min(timings),
            "max_ms": max(timings),
            "p50_ms": sorted_timings[int(count * 0.50)] if count > 0 else 0,
            "p95_ms": sorted_timings[int(count * 0.95)] if count > 0 else 0,
            "p99_ms": sorted_timings[int(count * 0.99)] if count > 0 else 0
        }
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Cache statistics
        """
        total = self.cache_stats["total_requests"]
        hits = self.cache_stats["hits"]
        
        hit_rate = (hits / total * 100) if total > 0 else 0
        
        return {
            "total_requests": total,
            "cache_hits": hits,
            "cache_misses": self.cache_stats["misses"],
            "hit_rate_pct": round(hit_rate, 2),
            "status": "optimal" if hit_rate >= 80 else "good" if hit_rate >= 60 else "needs_improvement"
        }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """
        Get overall performance summary.
        
        Returns:
            Performance summary
        """
        # Get stats for all operations
        all_stats = {}
        for operation in self.operation_timings.keys():
            all_stats[operation] = self.get_operation_stats(operation)
        
        # Calculate overall avg
        all_timings = []
        for timings in self.operation_timings.values():
            all_timings.extend(timings)
        
        overall_avg = sum(all_timings) / len(all_timings) if all_timings else 0
        
        return {
            "timestamp": datetime.now().isoformat(),
            "overall_avg_response_ms": round(overall_avg, 2),
            "total_operations": len(all_timings),
            "operations": all_stats,
            "cache": self.get_cache_stats(),
            "health_status": "healthy" if overall_avg < 1000 else "degraded"
        }
    
    def measure(self, operation: str, tags: Optional[Dict[str, str]] = None):
        """
        Decorator to measure operation timing.
        
        Args:
            operation: Operation name
            tags: Optional metadata tags
            
        Returns:
            Decorator function
        """
        def decorator(func: Callable) -> Callable:
            def wrapper(*args, **kwargs):
                start = time.time()
                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    duration_ms = (time.time() - start) * 1000
                    self.record_timing(operation, duration_ms, tags)
            return wrapper
        return decorator


class IntelligentCache:
    """
    Intelligent Caching System optimized for single-user patterns.
    
    Provides:
    - Pattern-based cache optimization
    - TTL management
    - Cache warming
    - Memory-efficient storage
    - Hit rate optimization
    """
    
    def __init__(self, max_size: int = 1000, default_ttl_seconds: int = 300):
        """
        Initialize intelligent cache.
        
        Args:
            max_size: Maximum cache entries
            default_ttl_seconds: Default time-to-live
        """
        self.max_size = max_size
        self.default_ttl = default_ttl_seconds
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.access_counts: Dict[str, int] = {}
        self.last_access: Dict[str, datetime] = {}
        
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        
        # Check expiration
        if datetime.now() > entry["expires_at"]:
            # Expired, remove
            del self.cache[key]
            return None
        
        # Update access stats
        self.access_counts[key] = self.access_counts.get(key, 0) + 1
        self.last_access[key] = datetime.now()
        
        return entry["value"]
    
    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: Optional[int] = None
    ):
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl_seconds: Time-to-live (uses default if not specified)
        """
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        
        # Check if cache is full
        if len(self.cache) >= self.max_size and key not in self.cache:
            self._evict_lru()
        
        self.cache[key] = {
            "value": value,
            "expires_at": datetime.now() + timedelta(seconds=ttl),
            "created_at": datetime.now()
        }
        
        self.access_counts[key] = 1
        self.last_access[key] = datetime.now()
    
    def invalidate(self, key: str):
        """
        Invalidate a cache entry.
        
        Args:
            key: Cache key
        """
        if key in self.cache:
            del self.cache[key]
        if key in self.access_counts:
            del self.access_counts[key]
        if key in self.last_access:
            del self.last_access[key]
    
    def clear(self):
        """Clear entire cache."""
        self.cache.clear()
        self.access_counts.clear()
        self.last_access.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Cache statistics
        """
        total_entries = len(self.cache)
        
        # Calculate memory usage (rough estimate)
        estimated_memory_mb = total_entries * 0.001  # ~1KB per entry
        
        # Find most accessed keys
        top_keys = sorted(
            self.access_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        return {
            "total_entries": total_entries,
            "max_size": self.max_size,
            "utilization_pct": (total_entries / self.max_size * 100) if self.max_size > 0 else 0,
            "estimated_memory_mb": round(estimated_memory_mb, 2),
            "top_accessed_keys": [
                {"key": key, "access_count": count}
                for key, count in top_keys
            ]
        }
    
    def _evict_lru(self):
        """Evict least recently used entry."""
        if not self.last_access:
            return
        
        # Find LRU key
        lru_key = min(self.last_access.items(), key=lambda x: x[1])[0]
        
        # Remove it
        self.invalidate(lru_key)
        
        logger.debug(f"Evicted LRU cache entry: {lru_key}")


# Global instances
_performance_monitor: Optional[PerformanceMonitor] = None
_intelligent_cache: Optional[IntelligentCache] = None


def get_performance_monitor() -> PerformanceMonitor:
    """Get global performance monitor instance."""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = PerformanceMonitor()
    return _performance_monitor


def get_intelligent_cache() -> IntelligentCache:
    """Get global intelligent cache instance."""
    global _intelligent_cache
    if _intelligent_cache is None:
        _intelligent_cache = IntelligentCache()
    return _intelligent_cache
