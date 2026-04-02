import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    openweathermap_api_key: str = ""
    waqi_token: str = ""
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
