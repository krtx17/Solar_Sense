"""
SolarSense AI — Core Application Configuration
Supports PostgreSQL with transparent SQLite fallback, CORS, and AI keys.
"""

from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os


class Settings(BaseSettings):
    PROJECT_NAME: str = "SolarSense AI API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # Database Settings
    # Default to SQLite for immediate local testing if PostgreSQL connection string is not provided
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./solarsense.db")
    
    # CORS Origins (Allow frontend on port 3000, 3001, 5173, etc.)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://10.119.0.218:3000",
        "http://10.119.0.218:3001",
        "*"
    ]
    
    # AI Keys (Optional - fallback to deterministic rule engine if missing)
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
