"""
Rate Limiting and API Key Authentication Middleware
"""
import os
from fastapi import HTTPException, Request, Security
from fastapi.security import APIKeyHeader
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# --- Rate Limiter Setup ---
limiter = Limiter(key_func=get_remote_address)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors."""
    return {
        "error": {
            "code": "RATE_LIMITED",
            "message": "Rate limit exceeded. Please try again later.",
            "details": {
                "limit": str(exc.detail)
            }
        }
    }


# --- API Key Authentication ---
API_KEY = os.environ.get("VG_API_KEY", "")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_api_key(api_key: str = Security(api_key_header)):
    """
    Verify API key for admin endpoints.
    If VG_API_KEY is not set, skip verification (development mode).
    """
    if not API_KEY:
        # API Key not configured - skip verification
        return None
    
    if not api_key or api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "Invalid or missing API Key"
                }
            }
        )
    return api_key
