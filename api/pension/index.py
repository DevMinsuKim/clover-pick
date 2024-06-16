import os
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import HTTPException
import requests
import pandas as pd
from sqlalchemy import create_engine

load_dotenv('.env.development.local')

pension_data_api_url = os.getenv('PENSION_DATA_API_URL')
db_url = os.getenv('POSTGRES_URL_PSYCOPG2')

def pension_data_update():
    try:
        response = requests.get(pension_data_api_url)
        response.raise_for_status()
      
        file_content = response.content
        soup = BeautifulSoup(file_content, 'lxml')

        for tag in soup.find_all('td', {'bgcolor': '#ccffff'}):
            tag.decompose()

        for tag in soup.find_all('td'):
            if '년도' in tag.text:
                tag.decompose()

        table = soup.find('table', {'border': '1'})
        
        rows = []
        for row in table.find_all('tr')[1:]:
            cols = row.find_all('td')
            row_data = [col.get_text(strip=True) for col in cols]
            if len(row_data) == 10:
                rows.append(row_data)

        full_headers = ["회차", "추첨일", "1등", "2등", "3등", "4등", "5등", "6등", "7등", "보너스"]
        df_full = pd.DataFrame(rows, columns=full_headers)

        df_filtered = df_full[["회차", "추첨일", "1등", "보너스"]]

        df_filtered.loc[:, '추첨일'] = pd.to_datetime(df_filtered['추첨일'], format='%Y%m%d').dt.strftime('%Y-%m-%d')

        columns = ['1등', '보너스']
        for col in columns:
            df_filtered.loc[:, col] = df_filtered[col].str.replace('조', '').astype(int)

        df_filtered = df_filtered.astype({'회차': int})

        df_filtered.columns = ['draw_number', 'draw_date', 'first_prize', 'bonus_prize']

        engine = create_engine(db_url)

        with engine.connect() as connection:
            existing_data = pd.read_sql("SELECT draw_number FROM pension", connection)

        existing_draw_numbers = set(existing_data['draw_number'])
        new_data = df_filtered[~df_filtered['draw_number'].isin(existing_draw_numbers)]

        if not new_data.empty:
            new_data.to_sql('pension', con=engine, if_exists='append', index=False)

        return({"message": "success"})

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to download the file: {e}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
