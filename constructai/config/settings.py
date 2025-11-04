"""
Application settings and configuration.

Environment variables are automatically loaded by constructai.__init__.py
when the package is imported.
"""

import os
from typing import Optional, List, Union
from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Environment variables are loaded with the following priority:
    1. Shell environment variables
    2. .env.local (local overrides)
    3. .env (shared config)
    """
    
    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        case_sensitive=True,
        # Disable automatic JSON parsing - we handle it manually
        json_schema_extra={}
    )
    
    # Application
    APP_NAME: str = "ConstructAI"
    APP_VERSION: str = "0.2.0"
    DEBUG: bool = Field(default=False)
    
    # Server
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./constructai.db")
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    API_KEY_ENABLED: bool = Field(default=False)
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FILE: Optional[str] = Field(default=None)
    
    # CORS - accepts comma-separated string or list
    CORS_ORIGINS: Union[str, List[str]] = Field(
        default="http://localhost:3000,http://localhost:8000"
    )
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # File Upload
    MAX_UPLOAD_SIZE_MB: int = Field(default=50)
    ALLOWED_EXTENSIONS: Union[str, List[str]] = Field(
        default=".pdf,.docx,.xlsx,.txt,.csv"
    )
    
    @field_validator('ALLOWED_EXTENSIONS', mode='before')
    @classmethod
    def parse_allowed_extensions(cls, v):
        """Parse ALLOWED_EXTENSIONS from comma-separated string or list."""
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(',') if ext.strip()]
        return v
    
    # AI/ML
    AI_MODEL_PATH: Optional[str] = Field(default=None)
    ENABLE_GPU: bool = Field(default=False)
    
    # AI Provider Configuration
    AI_PRIMARY_PROVIDER: str = Field(default="openai")
    AI_FALLBACK_PROVIDERS: Union[str, List[str]] = Field(default="openai")
    
    @field_validator('AI_FALLBACK_PROVIDERS', mode='before')
    @classmethod
    def parse_fallback_providers(cls, v):
        """Parse AI_FALLBACK_PROVIDERS from comma-separated string or list."""
        if isinstance(v, str):
            return [p.strip() for p in v.split(',') if p.strip()]
        return v
    
    # OpenAI Settings
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    OPENAI_MODEL: str = Field(default="gpt-4o-mini")
    OPENAI_MAX_TOKENS: int = Field(default=4096)
    OPENAI_TEMPERATURE: float = Field(default=0.7)
    OPENAI_API_BASE: Optional[str] = Field(default=None)
    OPENAI_API_VERSION: Optional[str] = Field(default=None)
    
    # AI Features
    AI_RISK_PREDICTION_ENABLED: bool = Field(default=True)
    AI_COST_ESTIMATION_ENABLED: bool = Field(default=True)
    AI_RECOMMENDATIONS_ENABLED: bool = Field(default=True)
    
    # LM Studio Settings (for custom trained models)
    LMSTUDIO_ENABLED: bool = Field(default=False)
    LMSTUDIO_API_BASE: Optional[str] = Field(default=None)
    LMSTUDIO_MODEL: Optional[str] = Field(default=None)
    LMSTUDIO_MAX_TOKENS: int = Field(default=4096)
    LMSTUDIO_TEMPERATURE: float = Field(default=0.7)


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """
    Get application settings (singleton pattern).
    
    Returns:
        Settings instance
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
