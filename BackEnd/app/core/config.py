"""애플리케이션 설정"""

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """애플리케이션 설정 클래스"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "Leafline"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000","https://*.vercel.app","https://leafline.vercel.app"
                               ,"https://www.bloombee.garden/"]

    # Gemini AI
    GEMINI_API_KEY: str = "AIzaSyBMmGzEhVIuPPuh_Xv5OT7iGlWcFv6PxcQ"

    # Database (Optional)
    # DATABASE_URL: str = "sqlite:///./leafline.db"


settings = Settings()

