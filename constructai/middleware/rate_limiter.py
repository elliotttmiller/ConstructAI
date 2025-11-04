"""
Rate limiting middleware for API protection.
"""

import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from typing import Callable, Dict
from collections import defaultdict, deque

logger = logging.getLogger(__name__)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter middleware.
    Limits requests per client IP address.
    
    For production, consider using Redis-based rate limiting.
    """
    
    def __init__(self, app, requests_per_minute: int = 60):
        """
        Initialize rate limiter.
        
        Args:
            app: FastAPI application
            requests_per_minute: Maximum requests allowed per minute per IP
        """
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
        
        # Store request timestamps per IP
        self.request_history: Dict[str, deque] = defaultdict(deque)
    
    def _clean_old_requests(self, client_ip: str, current_time: float):
        """Remove requests older than the time window."""
        cutoff_time = current_time - self.window_seconds
        
        while self.request_history[client_ip] and self.request_history[client_ip][0] < cutoff_time:
            self.request_history[client_ip].popleft()
    
    def _is_rate_limited(self, client_ip: str) -> bool:
        """
        Check if client has exceeded rate limit.
        
        Args:
            client_ip: Client IP address
            
        Returns:
            True if rate limited, False otherwise
        """
        current_time = time.time()
        
        # Clean old requests
        self._clean_old_requests(client_ip, current_time)
        
        # Check if limit exceeded
        if len(self.request_history[client_ip]) >= self.requests_per_minute:
            return True
        
        # Add current request
        self.request_history[client_ip].append(current_time)
        return False
    
    async def dispatch(self, request: Request, call_next: Callable):
        """
        Process request and check rate limit.
        
        Args:
            request: Incoming request
            call_next: Next middleware/handler
            
        Returns:
            Response object
        """
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Skip rate limiting for health check endpoints
        if request.url.path in ["/", "/health", "/api/v2/health"]:
            return await call_next(request)
        
        # Check rate limit
        if self._is_rate_limited(client_ip):
            logger.warning(
                f"Rate limit exceeded for IP: {client_ip}",
                extra={
                    "client_ip": client_ip,
                    "path": request.url.path,
                    "request_id": getattr(request.state, "request_id", None),
                }
            )
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Too Many Requests",
                    "message": f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute allowed.",
                    "retry_after": 60,
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = self.requests_per_minute - len(self.request_history[client_ip])
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
        
        return response
