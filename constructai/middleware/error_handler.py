"""
Global error handler middleware.
"""

import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from typing import Callable

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Middleware to catch and handle all unhandled exceptions.
    Returns proper JSON error responses.
    """
    
    async def dispatch(self, request: Request, call_next: Callable):
        """
        Process request and handle any errors.
        
        Args:
            request: Incoming request
            call_next: Next middleware/handler
            
        Returns:
            Response object
        """
        try:
            response = await call_next(request)
            return response
            
        except ValueError as e:
            # Validation errors
            logger.warning(f"Validation error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "error": "Validation Error",
                    "message": str(e),
                    "request_id": getattr(request.state, "request_id", None),
                }
            )
            
        except PermissionError as e:
            # Permission errors
            logger.warning(f"Permission error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "Forbidden",
                    "message": "You don't have permission to access this resource",
                    "request_id": getattr(request.state, "request_id", None),
                }
            )
            
        except FileNotFoundError as e:
            # Not found errors
            logger.warning(f"Resource not found: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "error": "Not Found",
                    "message": str(e),
                    "request_id": getattr(request.state, "request_id", None),
                }
            )
            
        except Exception as e:
            # All other errors
            logger.error(
                f"Unhandled exception: {str(e)}",
                exc_info=True,
                extra={
                    "request_id": getattr(request.state, "request_id", None),
                    "path": request.url.path,
                    "method": request.method,
                }
            )
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred. Please try again later.",
                    "request_id": getattr(request.state, "request_id", None),
                }
            )
