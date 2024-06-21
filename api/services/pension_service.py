import requests
from bs4 import BeautifulSoup
from fastapi import HTTPException, logger
from sqlalchemy import text
from api.model.pension import Pension
from api.utils.settings import Settings
from sqlalchemy.orm import Session
from datetime import datetime

def pension_data_update(db: Session):
    try:
        response = requests.get(Settings.PENSION_DATA_API_URL)
        response.raise_for_status()
      
        file_content = response.content
        soup = BeautifulSoup(file_content, 'html.parser')

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

        new_data = []
        for row in rows:
            record = {
                'draw_number': int(row[0]),
                'draw_date': datetime.strptime(row[1], '%Y%m%d').strftime('%Y-%m-%d'),
                'first_prize': int(row[2].replace('조', '')),
                'bonus_prize': int(row[9].replace('조', ''))
            }
            new_data.append(record)

        existing_draw_numbers = {lotto.draw_number for lotto in db.query(Pension.draw_number).all()}
        filtered_new_data = [record for record in new_data if record['draw_number'] not in existing_draw_numbers]

        if filtered_new_data:
            db.bulk_insert_mappings(Pension, filtered_new_data)
            db.commit()

        return {"message": "성공"}

    except requests.exceptions.RequestException as e:
        logger.logger.error(f"파일을 다운로드하는데 실패했습니다: {e}")
        raise HTTPException(status_code=500, detail="요청을 처리하는 동안 오류가 발생했습니다.\n나중에 다시 시도하십시오.")

    except Exception as e:
        logger.logger.error(f"오류가 발생했습니다: {e}")
        raise HTTPException(status_code=500, detail="예기치 않은 오류가 발생했습니다.\n나중에 다시 시도하십시오.")
