import os
from pydantic import BaseSettings, Field
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = Field(default="ConstructAI")
    APP_VERSION: str = Field(default="0.2.0")
    DEBUG: bool = Field(default=False)
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    DATABASE_URL: str = Field(default="sqlite:///./constructai.db")
    SECRET_KEY: str = Field(default="sk-prod-2b7e8f1c9a4d4e3b8c6f7a2e1d5c9b7a")
    API_KEY_ENABLED: bool = Field(default=False)
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FILE: Optional[str] = None
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: [
        "http://localhost:3000",
        "https://constructai.app",
        "https://www.constructai.app"
    ])
    MAX_UPLOAD_SIZE_MB: int = Field(default=50)
    AI_PRIMARY_PROVIDER: str = Field(default="openai")
    AI_FALLBACK_PROVIDERS: List[str] = Field(default_factory=lambda: ["anthropic", "openai"])
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = Field(default="gpt-4o-mini")
    OPENAI_MAX_TOKENS: int = Field(default=4096)
    OPENAI_TEMPERATURE: float = Field(default=0.7)
    AI_RISK_PREDICTION_ENABLED: bool = Field(default=True)
    AI_COST_ESTIMATION_ENABLED: bool = Field(default=True)
    AI_RECOMMENDATIONS_ENABLED: bool = Field(default=True)

    class Config:
        env_file = ".env.local"
        env_file_encoding = "utf-8"

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
