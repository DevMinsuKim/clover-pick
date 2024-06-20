import json
import os
import re
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from fastapi import HTTPException, logger
from sqlalchemy import text
from api.model.lotto import Lotto
from api.utils.settings import Settings
from sqlalchemy.orm import Session
from openai import OpenAI, OpenAIError

def get_lotto_numbers(count: int, db: Session):
    if count > 5:
        raise ValueError("Invalid value: count must be 5 or less.")
    
    try:
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

    except OpenAIError as e:
        logger.logger.error(f"OpenAI API 에러: {e}")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다. 나중에 다시 시도하십시오.")

    except json.JSONDecodeError:
        logger.logger.error("OpenAI API에서 JSON 응답을 디코딩하지 못했습니다")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다. 나중에 다시 시도하십시오.")

    except Exception as e:
        logger.logger.error(f"오류가 발생했습니다: {e}")
        raise HTTPException(status_code=500, detail="예기치 않은 오류가 발생했습니다. 나중에 다시 시도하십시오.")

def lotto_data_update(db: Session):
    try:
        response = requests.get(Settings.LOTTO_DATA_API_URL)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table', {'border': '1'})

        rows = []
        for tr in table.find_all('tr')[2:]:
            row_data = [td.get_text(strip=True) for td in tr.find_all('td')]
            if len(row_data) == 20:
                row_data = row_data[1:]
            if row_data:
                rows.append(row_data)

        new_data = []
        for row in rows:
            record = {
                'draw_number': int(row[0]),
                'draw_date': datetime.strptime(row[1], '%Y.%m.%d').strftime('%Y-%m-%d'),
                'first_prize_winners': int(row[2].replace(',', '')),
                'first_prize_amount': int(re.sub(r'[^\d]', '', row[3])),
                'second_prize_winners': int(row[4].replace(',', '')),
                'second_prize_amount': int(re.sub(r'[^\d]', '', row[5])),
                'third_prize_winners': int(row[6].replace(',', '')),
                'third_prize_amount': int(re.sub(r'[^\d]', '', row[7])),
                'fourth_prize_winners': int(row[8].replace(',', '')),
                'fourth_prize_amount': int(re.sub(r'[^\d]', '', row[9])),
                'fifth_prize_winners': int(row[10].replace(',', '')),
                'fifth_prize_amount': int(re.sub(r'[^\d]', '', row[11])),
                'winning_number_1': int(row[12]),
                'winning_number_2': int(row[13]),
                'winning_number_3': int(row[14]),
                'winning_number_4': int(row[15]),
                'winning_number_5': int(row[16]),
                'winning_number_6': int(row[17]),
                'bonus_number': int(row[18])
            }
            new_data.append(record)

        existing_draw_numbers = set()
        result = db.execute(text("SELECT draw_number FROM lotto"))
        while True:
            batch = result.fetchmany(1000)
            if not batch:
                break
            for row in batch:
                existing_draw_numbers.add(row[0])

        filtered_new_data = [record for record in new_data if record['draw_number'] not in existing_draw_numbers]

        if filtered_new_data:
            db.bulk_insert_mappings(Lotto, filtered_new_data)
            db.commit()

        return {"message": "성공"}

    except requests.exceptions.RequestException as e:
        logger.logger.error(f"파일을 다운로드하는데 실패했습니다: {e}")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다. 나중에 다시 시도하십시오.")

    except Exception as e:
        logger.logger.error(f"오류가 발생했습니다: {e}")
        raise HTTPException(status_code=500, detail="예기치 않은 오류가 발생했습니다. 나중에 다시 시도하십시오.")