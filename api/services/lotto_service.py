import json
import os
import random
import re
import requests
from datetime import datetime, timedelta, timezone
from bs4 import BeautifulSoup
from fastapi import HTTPException, logger
from sqlalchemy import desc
from api.model.created_lotto import CreatedLotto
from api.model.lotto import Lotto
from api.utils.settings import Settings
from sqlalchemy.orm import Session
from openai import OpenAI, OpenAIError

def lotto(db: Session):
    try:
        if random.choice([True, False]):
            raise Exception("강제 오류 발생")

        recent_draw = db.query(Lotto).order_by(desc(Lotto.draw_number)).first()
        recent_draw_number = recent_draw.draw_number if recent_draw else 0
        new_draw_number = recent_draw_number + 1

        return {
            "draw_number": new_draw_number
        }
    except Exception as e:
            logger.logger.error(f"오류가 발생했습니다: {e}")
            raise HTTPException(status_code=502, detail="예기치 않은 오류가 발생했습니다.\n나중에 다시 시도하십시오.")

def lotto_generator(count: int, db: Session):
    if count > 5:
        logger.logger.error(f"요청된 로또 번호 수가 5개를 초과했습니다: {count}")
        raise HTTPException(status_code=400, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")
    
    KST = timezone(timedelta(hours=9))
    
    now = datetime.now(KST)
    saturday_8pm = now.replace(hour=20, minute=0, second=0, microsecond=0)
    sunday_6am = now.replace(hour=6, minute=0, second=0, microsecond=0)
    
    if now.weekday() == 5 and now >= saturday_8pm:
        logger.logger.error(f"로또 판매 기간 동안 POST 요청은 차단됩니다: {count}")
        raise HTTPException(status_code=403, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")
    if now.weekday() == 6 and now < sunday_6am:
        raise HTTPException(status_code=403, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")
    
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

        response_data['winning_numbers'] = [sorted(numbers) for numbers in response_data['winning_numbers']]

        recent_draw = db.query(Lotto).order_by(desc(Lotto.draw_number)).first()
        recent_draw_number = recent_draw.draw_number if recent_draw else 0
        new_draw_number = recent_draw_number + 1

        records = []
        for numbers in response_data['winning_numbers']:
            if len(numbers) == 6:
                records.append({
                    'draw_number': new_draw_number,
                    'winning_number1': numbers[0],
                    'winning_number2': numbers[1],
                    'winning_number3': numbers[2],
                    'winning_number4': numbers[3],
                    'winning_number5': numbers[4],
                    'winning_number6': numbers[5]
                })

        if records:
            db.bulk_insert_mappings(CreatedLotto, records)
            db.commit()

        return response_data

    except OpenAIError as e:
        logger.logger.error(f"OpenAI API 에러: {e}")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")

    except json.JSONDecodeError:
        logger.logger.error("OpenAI API에서 JSON 응답을 디코딩하지 못했습니다")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")

    except Exception as e:
        logger.logger.error(f"오류가 발생했습니다: {e}")
        raise HTTPException(status_code=500, detail="예기치 않은 오류가 발생했습니다.\n나중에 다시 시도하십시오.")

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

        existing_draw_numbers = {lotto.draw_number for lotto in db.query(Lotto.draw_number).all()}
        filtered_new_data = [record for record in new_data if record['draw_number'] not in existing_draw_numbers]

        if filtered_new_data:
            db.bulk_insert_mappings(Lotto, filtered_new_data)
            db.commit()

        return {"message": "성공"}

    except requests.exceptions.RequestException as e:
        logger.logger.error(f"파일을 다운로드하는데 실패했습니다: {e}")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")

    except Exception as e:
        logger.logger.error(f"오류가 발생했습니다: {e}")
        raise HTTPException(status_code=500, detail="예기치 않은 오류가 발생했습니다.\n나중에 다시 시도하십시오.")