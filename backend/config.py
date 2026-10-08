import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "VITALIS Health Intelligence Platform"
    VERSION: str = "4.2.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", 10000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "vitalis_clinical_ml_secret_key_change_in_production_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    
    # CORS
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    ]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vitalis.db")
    
    # ML Model
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./ml/artifacts/vit_healthnet_v4.joblib")
    FEATURE_META_PATH: str = os.getenv("FEATURE_META_PATH", "./ml/artifacts/feature_meta.json")

settings = Settings()