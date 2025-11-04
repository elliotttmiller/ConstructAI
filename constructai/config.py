"""
Configuration module for ConstructAI.

This module loads settings from environment variables.
Environment variables are automatically loaded by constructai.__init__.py
when the package is imported, so no need to call load_dotenv here.
"""

import os
from pydantic import BaseSettings, Field, field_validator
from typing import List, Optional

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Environment variables are loaded with the following priority:
    1. Shell environment variables
    2. .env.local (local overrides)
    3. .env (shared config)
    """
    APP_NAME: str = Field(default="ConstructAI")
    APP_VERSION: str = Field(default="0.2.0")
    DEBUG: bool = Field(default=False)
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    DATABASE_URL: str = Field(default="sqlite:///./constructai.db")
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    API_KEY_ENABLED: bool = Field(default=False)
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FILE: Optional[str] = None
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: [
        "http://localhost:3000",
        "http://localhost:8000"
    ])
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    MAX_UPLOAD_SIZE_MB: int = Field(default=50)
    AI_PRIMARY_PROVIDER: str = Field(default="openai")
    AI_FALLBACK_PROVIDERS: List[str] = Field(default_factory=lambda: ["openai"])
    
    @field_validator('AI_FALLBACK_PROVIDERS', mode='before')
    @classmethod
    def parse_fallback_providers(cls, v):
        """Parse AI_FALLBACK_PROVIDERS from comma-separated string or list."""
        if isinstance(v, str):
            return [p.strip() for p in v.split(',') if p.strip()]
        return v
    
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = Field(default="gpt-4o-mini")
    OPENAI_MAX_TOKENS: int = Field(default=4096)
    OPENAI_TEMPERATURE: float = Field(default=0.7)
    AI_RISK_PREDICTION_ENABLED: bool = Field(default=True)
    AI_COST_ESTIMATION_ENABLED: bool = Field(default=True)
    AI_RECOMMENDATIONS_ENABLED: bool = Field(default=True)

    class Config:
        # Don't specify env_file here - environment is loaded globally in __init__.py
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()

def get_settings():
    return settings

def setup_logging(log_level: str, log_file: Optional[str] = None):
    import logging
    log_format = '%(asctime)s | %(levelname)s | %(name)s | %(message)s'
    handlers = [logging.StreamHandler()]
    if log_file:
        handlers.append(logging.FileHandler(log_file))
    logging.basicConfig(level=log_level, handlers=handlers, format=log_format, force=True)
