from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SimplrFlow"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://simplrflow:simplrflow@db:5432/simplrflow"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Object Storage
    S3_ENDPOINT: str = "http://minio:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "simplrflow"
    S3_USE_SSL: bool = False

    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/jpg"]

    # Image Processing
    THUMBNAIL_SIZE: tuple = (300, 300)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
