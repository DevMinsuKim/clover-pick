import glob
import os
import requests
import datetime
import numpy as np
import pandas as pd
import logging
from bs4 import BeautifulSoup
from logging.handlers import RotatingFileHandler


logging.basicConfig(
    filename='app.log', 
    filemode='a', 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%d-%b-%y %H:%M:%S'
)

# 로거 생성
logger = logging.getLogger('my_logger')

# 로그 레벨 설정
logger.setLevel(logging.ERROR)

# 로그 핸들러 생성
handler = RotatingFileHandler('app.log', maxBytes=2000, backupCount=5)

# 핸들러 포맷 설정
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

# 로거에 핸들러 추가
logger.addHandler(handler)

# 파일이 위치한 디렉토리 경로
directory = "./lotto/data"

# 디렉토리 내의 모든 파일 검색
files = os.listdir(directory)

# 데이터 파일 경로
data_file_path = None

# 데이터 파일 찾기
for file in files:
    if file.endswith(".xls"):
        data_file_path = os.path.join(directory, file)
        break

def data_file_update(): 
    try:
        current_datetime = datetime.datetime.now()

        filename_format = "%Y-%m-%d"

        formatted_date = current_datetime.strftime(filename_format)

        url = 'https://dhlottery.co.kr/gameResult.do?method=allWinExel&gubun=byWin&nowPage=&drwNoStart=1&drwNoEnd=100000'
        output_path = f'{directory}/lotto_data_{formatted_date}.xls'

        response = requests.get(url)
        response.raise_for_status()

        with open(output_path, 'wb') as file:
            file.write(response.content)

        files = glob.glob(os.path.join(directory, "*"))
 
        files_to_delete = [file for file in files if not file.endswith(f"lotto_data_{formatted_date}.xls")]

        for file_path in files_to_delete:
            os.remove(file_path)

    except Exception as e:
        logging.error("Exception occurred", exc_info=True)

def get_round_number(round_number):
    try:  
        with open(data_file_path, 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        soup = BeautifulSoup(html_code, 'html.parser')
        table = soup.find_all('table')[1]  # 두 번째 테이블 선택
        rows = table.find_all('tr')

        data = []
        for row in rows[2:]:  # 첫 두 행은 제목이므로 무시합니다.
            cells = row.find_all('td')
            winning_numbers = [cell.text.strip() for cell in cells[-7:-1]]  # 당첨번호
            bonus_number = cells[-1].text.strip() # 보너스 번호
            data.append(winning_numbers + bonus_number)

        print(data)

        # df = pd.DataFrame(data, columns=['1번', '2번', '3번', '4번', '5번', '6번', '보너스'])

        # data = np.array(df)

        return data
    except Exception as e:
        logging.error("Exception occurred", exc_info=True)
