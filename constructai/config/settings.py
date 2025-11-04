"""
Application settings and configuration.
"""

import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    
    # Application
    APP_NAME: str = "ConstructAI"
    APP_VERSION: str = "0.2.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./constructai.db",
        env="DATABASE_URL"
    )
    
    # Security
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        env="SECRET_KEY"
    )
    API_KEY_ENABLED: bool = Field(default=False, env="API_KEY_ENABLED")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: Optional[str] = Field(default=None, env="LOG_FILE")
    
    # CORS
    CORS_ORIGINS: list = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="CORS_ORIGINS"
    )
    
    # File Upload
    MAX_UPLOAD_SIZE_MB: int = Field(default=50, env="MAX_UPLOAD_SIZE_MB")
    ALLOWED_EXTENSIONS: list = Field(
        default=[".pdf", ".docx", ".xlsx", ".txt", ".csv"],
        env="ALLOWED_EXTENSIONS"
    )
    
    # AI/ML
    AI_MODEL_PATH: Optional[str] = Field(default=None, env="AI_MODEL_PATH")
    ENABLE_GPU: bool = Field(default=False, env="ENABLE_GPU")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


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
