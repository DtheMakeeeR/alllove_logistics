from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://alllove_user:alllove_password@localhost:5433/alllove_db"
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"

settings = Settings()