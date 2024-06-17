import os
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import HTTPException
import requests
import pandas as pd
from sqlalchemy import create_engine

load_dotenv('.env.development.local')

lotto_data_api_url = os.getenv('LOTTO_DATA_API_URL')
db_url = os.getenv('POSTGRES_URL_PSYCOPG2')

def lotto_data_update():
    try:
        response = requests.get(lotto_data_api_url)
        response.raise_for_status()
      
        file_content = response.content
        soup = BeautifulSoup(file_content, 'html.parser')
        table = soup.find('table', {'border': '1'})
            
        headers = ["회차", "추첨일", "1등 당첨자수", "1등 당첨금액", "2등 당첨자수", "2등 당첨금액", "3등 당첨자수", "3등 당첨금액", "4등 당첨자수", "4등 당첨금액", "5등 당첨자수", "5등 당첨금액", "당첨번호 1", "당첨번호 2", "당첨번호 3", "당첨번호 4", "당첨번호 5", "당첨번호 6", "보너스 번호"]

        rows = []
        for tr in table.find_all('tr')[2:]:
            row_data = [td.get_text(strip=True) for td in tr.find_all('td')]
            if len(row_data) == 20:
                row_data = row_data[1:]
            if row_data:
                rows.append(row_data)

        df = pd.DataFrame(rows, columns=headers)
        
        df['추첨일'] = pd.to_datetime(df['추첨일'], format='%Y.%m.%d').dt.strftime('%Y-%m-%d')
        
        money_columns = ['1등 당첨금액', '2등 당첨금액', '3등 당첨금액', '4등 당첨금액', '5등 당첨금액']
        count_columns = ['1등 당첨자수', '2등 당첨자수', '3등 당첨자수', '4등 당첨자수', '5등 당첨자수']
        
        for col in money_columns + count_columns:
            df[col] = df[col].str.replace('원', '').str.replace(',', '').astype(int)
        
        df = df.astype({
            '회차': int,
            '당첨번호 1': int,
            '당첨번호 2': int,
            '당첨번호 3': int,
            '당첨번호 4': int,
            '당첨번호 5': int,
            '당첨번호 6': int,
            '보너스 번호': int
        })

        df.columns = [
            'draw_number', 'draw_date', 'first_prize_winners', 'first_prize_amount', 
            'second_prize_winners', 'second_prize_amount', 'third_prize_winners', 'third_prize_amount', 
            'fourth_prize_winners', 'fourth_prize_amount', 'fifth_prize_winners', 'fifth_prize_amount', 
            'winning_number_1', 'winning_number_2', 'winning_number_3', 'winning_number_4', 
            'winning_number_5', 'winning_number_6', 'bonus_number'
        ]

        engine = create_engine(db_url)

        with engine.connect() as connection:
            existing_data = pd.read_sql("SELECT draw_number FROM lotto", connection)
        
        existing_draw_numbers = set(existing_data['draw_number'])

        new_data = df[~df['draw_number'].isin(existing_draw_numbers)]

        if not new_data.empty:
            new_data.to_sql('lotto', con=engine, if_exists='append', index=False)
        
        return {"message": "success"}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to download the file: {e}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
