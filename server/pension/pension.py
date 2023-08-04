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
directory = "./pension/data"

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

        url = 'https://dhlottery.co.kr/gameResult.do?method=allWinPension720Exel&drwNoStart=1&drwNoEnd=100000'
        output_path = f'{directory}/pension_data_{formatted_date}.xls'

        response = requests.get(url)
        response.raise_for_status()

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        # 각 행을 순회
        for row in soup.find_all('tr'):
            cells = row.find_all('td')
            # 년도가 '2022'인 행을 찾음
            if cells and cells[0].get_text() == '2022':
                # 년도와 회차의 위치를 바꿈
                cells[0], cells[1] = cells[1], cells[0]

        # Write the modified HTML content to the file
        with open(output_path, 'w', encoding='EUC-KR') as file:
            file.write(str(soup))

        files = glob.glob(os.path.join(directory, "*"))
 
        files_to_delete = [file for file in files if not file.endswith(f"pension_data_{formatted_date}.xls")]

        for file_path in files_to_delete:
            os.remove(file_path)

    except Exception as e:
        print("Exception occurred", e)

def get_round_number(round_number):
    try:  
        with open(data_file_path, 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        soup = BeautifulSoup(html_code, 'html.parser')
        table = soup.find_all('table')[1]  # 두 번째 테이블 선택
        rows = table.find_all('tr')

        results = []
        for i, row in enumerate(rows[2:]): # 첫 두 행은 제목이므로 무시합니다.
            if i >= round_number:  # 파라미터로 전달된 숫자를 초과하면 반복문을 종료합니다.
                break
            cells = row.find_all('td')
            circuit_numbers = [cell.text.strip() for cell in cells[-19]] #회차 번호
            winning_numbers = [cell.text.strip() for cell in cells[-7:-1]]  # 당첨번호
            bonus_number = [cell.text.strip() for cell in cells[-1]]  # 보너스 번호

            result = {
                'circuit': str(circuit_numbers[0]),
                'number': winning_numbers + bonus_number
            }
            results.append(result)

        return results
    except Exception as e:
        logging.error("Exception occurred", exc_info=True)

def get_round_number_all():
    try:  
        with open(data_file_path, 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        soup = BeautifulSoup(html_code, 'html.parser')
        table = soup.find_all('table')[1]  # 두 번째 테이블 선택
        rows = table.find_all('tr')

        results = []
        for row in rows[2:]:  # 첫 두 행은 제목이므로 무시합니다.
            cells = row.find_all('td')
            circuit_numbers = [cell.text.strip() for cell in cells[-19]] #회차 번호
            winning_numbers = [cell.text.strip() for cell in cells[-7:-1]]  # 당첨번호
            bonus_number = [cell.text.strip() for cell in cells[-1]]  # 보너스 번호

            result = {
                'circuit': str(circuit_numbers[0]),
                'number': winning_numbers + bonus_number
            }
            results.append(result)
            
        return results
    except Exception as e:
        logging.error("Exception occurred", exc_info=True)


data_file_update()        