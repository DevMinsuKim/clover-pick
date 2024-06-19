# app/utils/settings.py
import os
from dotenv import load_dotenv

load_dotenv('.env.development.local')

class Settings:
    LOTTO_DATA_API_URL = os.getenv('LOTTO_DATA_API_URL')
    PENSION_DATA_API_URL: str = os.getenv('PENSION_DATA_API_URL')
    DATABASE_URL: str = os.getenv('POSTGRES_URL_PSYCOPG2')
    OPENAI_API_KEY: str = os.getenv('OPENAI_API_KEY')

settings = Settings()
