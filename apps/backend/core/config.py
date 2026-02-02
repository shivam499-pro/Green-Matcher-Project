"""
Green Matchers - Core Configuration
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = Field(default="mariadb+pymysql://green_user:password@localhost/green_matchers")
    
    # JWT Authentication
    JWT_SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI/ML Settings
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    EMBEDDING_DIM: int = 768
    
    # CORS Settings
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"]
    )
    
    # Application Settings
    APP_NAME: str = "Green Matchers API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-native green-jobs platform for India"
    
    # Environment
    ENVIRONMENT: str = Field(default="development")
    
    # Google Translate API (optional)
    GOOGLE_TRANSLATE_API_KEY: str = Field(default="", validate_default=True)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance for easy import
settings = get_settings()
