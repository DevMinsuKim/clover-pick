import os
from dotenv import load_dotenv
from fastapi import HTTPException

def get_env_variables():
    load_dotenv('.env.development.local')

    lotto_data_api_url = os.getenv('LOTTO_DATA_API_URL')
    pension_data_api_url = os.getenv('PENSION_DATA_API_URL')
    
    db_url = os.getenv('POSTGRES_URL_PSYCOPG2')

    if not lotto_data_api_url or not db_url or not pension_data_api_url:
        raise HTTPException(status_code=500, detail="The download path or database URL is not valid.")
    
    return lotto_data_api_url, pension_data_api_url, db_url
