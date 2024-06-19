import requests
from bs4 import BeautifulSoup
import pandas as pd
from sqlalchemy import create_engine
from fastapi import HTTPException
from api.utils.settings import Settings
from sqlalchemy.orm import Session

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

        full_headers = ["회차", "추첨일", "1등", "2등", "3등", "4등", "5등", "6등", "7등", "보너스"]
        df_full = pd.DataFrame(rows, columns=full_headers)

        df_filtered = df_full[["회차", "추첨일", "1등", "보너스"]]

        df_filtered.loc[:, '추첨일'] = pd.to_datetime(df_filtered['추첨일'], format='%Y%m%d').dt.strftime('%Y-%m-%d')

        columns = ['1등', '보너스']
        for col in columns:
            df_filtered.loc[:, col] = df_filtered[col].str.replace('조', '').astype(int)

        df_filtered = df_filtered.astype({'회차': int})

        df_filtered.columns = ['draw_number', 'draw_date', 'first_prize', 'bonus_prize']

        existing_data = pd.read_sql("SELECT draw_number FROM pension", db.connection())
        existing_draw_numbers = set(existing_data['draw_number'])
        new_data = df_filtered[~df_filtered['draw_number'].isin(existing_draw_numbers)]

        if not new_data.empty:
            new_data.to_sql('pension', con=db.connection(), if_exists='append', index=False)
            db.commit()

        return {"message": "성공적으로 업데이트 되었습니다."}

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"파일을 다운로드하는데 실패했습니다: {e}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"오류가 발생했습니다: {e}")
