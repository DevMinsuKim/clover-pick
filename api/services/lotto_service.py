import json
import os
import openai
import requests
from bs4 import BeautifulSoup
import pandas as pd
from fastapi import HTTPException
from sqlalchemy import text
from api.utils.settings import Settings
from sqlalchemy.orm import Session
from openai import OpenAI

def get_lotto_numbers(count: int, db: Session):
    if count > 5:
        raise ValueError("Invalid value")
    
    client = OpenAI(
        api_key=os.environ['OPENAI_API_KEY'],
    )

    prompt = f"Predict {count} sets of 6 winning numbers from 1 to 45 in JSON format with key 'winning_numbers'."
    response = client.chat.completions.create(
        model="gpt-3.5-turbo-0125",
        response_format={ "type": "json_object" },
        messages=[
            {"role": "system", "content": "You are a useful secretary designed to analyze lotto numbers and print them out in JSON."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=150
    )

    response_data = json.loads(response.choices[0].message.content)

    if count == 1 and isinstance(response_data['winning_numbers'], list):
        response_data['winning_numbers'] = [response_data['winning_numbers']]

    for numbers in response_data['winning_numbers']:
        if len(numbers) == 6:
            query = text("""
                INSERT INTO created_lotto (winning_number1, winning_number2, winning_number3, winning_number4, winning_number5, winning_number6)
                VALUES (:number1, :number2, :number3, :number4, :number5, :number6)
            """)
            db.execute(query, {
                'number1': numbers[0],
                'number2': numbers[1],
                'number3': numbers[2],
                'number4': numbers[3],
                'number5': numbers[4],
                'number6': numbers[5]
            })
    
    db.commit()

    return response_data

def lotto_data_update(db: Session):
    try:
        response = requests.get(Settings.LOTTO_DATA_API_URL)
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

        existing_data = pd.read_sql("SELECT draw_number FROM lotto", db.connection())
        existing_draw_numbers = set(existing_data['draw_number'])

        new_data = df[~df['draw_number'].isin(existing_draw_numbers)]

        if not new_data.empty:
            new_data.to_sql('lotto', con=db.connection(), if_exists='append', index=False)
            db.commit() 
        
        return {"message": "성공적으로 업데이트 되었습니다."}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"파일을 다운로드하는데 실패했습니다: {e}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"오류가 발생했습니다: {e}")
