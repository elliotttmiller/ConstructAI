"""
Logging middleware for request/response tracking.
"""

import time
import logging
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from typing import Callable

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests and responses.
    Adds request ID for tracing and tracks response times.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log information.
        
        Args:
            request: Incoming request
            call_next: Next middleware/handler
            
        Returns:
            Response object
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timer
        start_time = time.time()
        
        # Enhanced debug logging for ALL requests
        logger.debug("="*60)
        logger.debug(f"INCOMING REQUEST: {request.method} {request.url.path}")
        logger.debug(f"Request ID: {request_id}")
        logger.debug(f"Client: {request.client.host if request.client else 'Unknown'}")
        logger.debug(f"Query params: {dict(request.query_params)}")
        logger.debug(f"Headers: {dict(request.headers)}")
        
        # Special attention to streaming endpoint
        if 'analyze/stream' in request.url.path:
            logger.info("🌊 STREAMING ENDPOINT REQUEST DETECTED")
            logger.info(f"Full URL: {request.url}")
            logger.info(f"Method: {request.method}")
            logger.info(f"Path: {request.url.path}")
        
        logger.debug("="*60)
        
        # Log request
        logger.info(
            f"[{request_id}] {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "client_host": request.client.host if request.client else None,
            }
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Enhanced debug logging for response
            logger.debug(f"RESPONSE: {response.status_code} for {request.url.path}")
            logger.debug(f"Duration: {duration_ms:.2f}ms")
            
            # Special attention to 404s on streaming endpoint
            if 'analyze/stream' in request.url.path and response.status_code == 404:
                logger.error("❌ 404 ON STREAMING ENDPOINT!")
                logger.error(f"Request method: {request.method}")
                logger.error(f"Request path: {request.url.path}")
                logger.error(f"This route should be registered - check route matching!")
            
            # Log response
            logger.info(
                f"[{request_id}] {response.status_code} - {duration_ms:.2f}ms",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                }
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Enhanced error logging
            logger.error("="*60)
            logger.error(f"EXCEPTION IN REQUEST PROCESSING")
            logger.error(f"Request: {request.method} {request.url.path}")
            logger.error(f"Request ID: {request_id}")
            logger.error(f"Exception type: {type(e).__name__}")
            logger.error(f"Exception message: {str(e)}")
            logger.error(f"Duration before error: {duration_ms:.2f}ms")
            logger.error("="*60)
            
            # Log error
            logger.error(
                f"[{request_id}] Error processing request: {str(e)}",
                extra={
                    "request_id": request_id,
                    "error": str(e),
                    "duration_ms": duration_ms,
                },
                exc_info=True
            )
            raise
