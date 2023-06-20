import numpy as np
import pandas as pd
import requests
import logging
from bs4 import BeautifulSoup
from keras.models import Sequential
from keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split
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


url = 'https://dhlottery.co.kr/gameResult.do?method=allWinExel&gubun=byWin&nowPage=&drwNoStart=1&drwNoEnd=100000'
output_path = './lotto_data.xls'

# 데이터 전처리
def preprocessing():
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

    # 문자열을 숫자로 변환
    data = data.astype(float)

    # 시퀀스 생성 (X: 5회 당첨 번호, y: 다음 회 당첨 번호)
    n_steps = 5 
    X, y = [], []
    for i in range(n_steps, len(data)):
        X.append(data[i-n_steps:i])
        y.append(data[i])

    # numpy 배열로 변환
    X = np.array(X)
    y = np.array(y)

    # 학습 데이터와 테스트 데이터로 분할
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # LSTM 모델 구성
    model = Sequential()
    model.add(LSTM(50, activation='relu', input_shape=(n_steps, 6)))
    model.add(Dense(6))
    model.compile(optimizer='adam', loss='mse')

    # 모델 학습
    model.fit(X_train, y_train, epochs=20, verbose=1)

    # 모델 저장
    model.save('lotto_model.keras')

try:
    # response = requests.get(url)
    # response.raise_for_status()  # 오류 발생 시 예외 처리

    # with open(output_path, 'wb') as file:
    #     file.write(response.content)

    preprocessing()

except Exception as e:
    logging.error("Exception occurred", exc_info=True)


