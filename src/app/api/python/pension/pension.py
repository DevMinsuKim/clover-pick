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

        # Write the modified HTML content to the file
        with open(output_path, 'w', encoding='EUC-KR') as file:
            file.write(str(soup))

        files = glob.glob(os.path.join(directory, "*"))
 
        files_to_delete = [file for file in files if not file.endswith(f"pension_data_{formatted_date}.xls")]

        for file_path in files_to_delete:
            os.remove(file_path)

    except Exception as e:
        print("Exception occurred", e)

def get_round_number_pension(round_number):
    try:
        def format_numbers(number):
            # "조" 키워드 제거
            number = number.replace("조", "")
            
            # 당첨번호를 문자로 분할
            split_numbers = list(number)
            
            return split_numbers
    
        with open(data_file_path, 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        soup = BeautifulSoup(html_code, 'html.parser')
        table = soup.find_all('table')[1]  # 두 번째 테이블 선택
        rows = table.find_all('tr')

        results = []
        for i, row in enumerate(rows[1:]): # 첫 두 행은 제목이므로 무시합니다.
            if i >= round_number:  # 파라미터로 전달된 숫자를 초과하면 반복문을 종료합니다.
                break
            cells = row.find_all('td')
            # 년도가 바뀌는 행에서는 셀 갯수가 다르므로 조건을 추가
            if len(cells) == 11:  # 정상적인 행
                circuit_numbers = [cells[1].text.strip()]  # 회차 번호
                winning_numbers = cells[3].text.strip()  # 당첨번호
            else:  # 년도가 바뀌는 행
                circuit_numbers = [cells[0].text.strip()]  # 회차 번호
                winning_numbers = cells[2].text.strip() # 당첨번호

            winning_numbers = format_numbers(winning_numbers)
            bonus_number = cells[-1].text.strip()  # 보너스 번호
            bonus_number = format_numbers(bonus_number)


            result = {
                'circuit': str(circuit_numbers[0]),
                'number': winning_numbers, 
                'bonusNumber': bonus_number
            }
            results.append(result)

        return results
    except Exception as e:
        logging.error("Exception occurred", exc_info=True)

def get_round_number_all_pension():
    try:
        def format_numbers(number):
            # "조" 키워드 제거
            number = number.replace("조", "")
            
            # 당첨번호를 문자로 분할
            split_numbers = list(number)
            
            return split_numbers
  
        with open(data_file_path, 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        soup = BeautifulSoup(html_code, 'html.parser')
        table = soup.find_all('table')[1]  # 두 번째 테이블 선택
        rows = table.find_all('tr')

        results = []
        for row in rows[1:]:  # 첫 두 행은 제목이므로 무시합니다.
            cells = row.find_all('td')
            # 년도가 바뀌는 행에서는 셀 갯수가 다르므로 조건을 추가
            if len(cells) == 11:  # 정상적인 행
                circuit_numbers = [cells[1].text.strip()]  # 회차 번호
                winning_numbers = cells[3].text.strip()  # 당첨번호
            else:  # 년도가 바뀌는 행
                circuit_numbers = [cells[0].text.strip()]  # 회차 번호
                winning_numbers = cells[2].text.strip() # 당첨번호

            winning_numbers = format_numbers(winning_numbers)
            bonus_number = cells[-1].text.strip()  # 보너스 번호
            bonus_number = format_numbers(bonus_number)
            result = {
                'circuit': str(circuit_numbers[0]),
                'number': winning_numbers, 
                'bonusNumber': bonus_number
            }
            results.append(result)
            
        print(results)
        return results
    except Exception as e:
        logging.error("Exception occurred", exc_info=True)