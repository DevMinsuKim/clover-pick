import math
import numpy as np
import pandas as pd
import logging
from bs4 import BeautifulSoup
from keras.models import load_model
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

def generateLotto():
    try:
        with open('./lotto_data.xls', 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        soup = BeautifulSoup(html_code, 'html.parser')
        table = soup.find_all('table')[1]  # 두 번째 테이블 선택
        rows = table.find_all('tr')

        data = []
        for row in rows[2:]:  # 첫 두 행은 제목이므로 무시합니다.
            cells = row.find_all('td')
            winning_numbers = [cell.text.strip() for cell in cells[-6:]]  # 당첨번호
            data.append(winning_numbers)

        df = pd.DataFrame(data, columns=['1번', '2번', '3번', '4번', '5번', '6번'])

        data = np.array(df)
        data[::-1]

        n_steps = 5

        # 모델 로드
        model = load_model('lotto_model.keras', compile=False)

        # 모델 컴파일
        model.compile(optimizer='adam', loss='mse')

        predictions = []  # 예측 결과를 저장할 리스트

        for i in range(5):  # 최대 5번의 예측 수행
            x_input = np.array([data[i:i+n_steps]], dtype=np.float32)
            x_input = x_input.reshape((1, n_steps, 6))

            prediction = model.predict(x_input)
            rounded_prediction = [math.floor(x) for x in prediction[0]]
            predictions.append(rounded_prediction)

        return predictions
    except Exception as e:
        logging.error("Exception occurred", exc_info=True)