from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost/duelio"
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase-credentials.json"
    COMPETITION_FEE: int = 1999
    
    class Config:
        env_file = ".env"

settings = Settings()
