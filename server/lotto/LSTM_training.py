import math
import os
import numpy as np
import pandas as pd
import logging
from bs4 import BeautifulSoup
from keras.models import Sequential
from keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split
from logging.handlers import RotatingFileHandler
from keras.models import load_model

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

def generate_lotto():
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
            data.append(winning_numbers)

        df = pd.DataFrame(data, columns=['1번', '2번', '3번', '4번', '5번', '6번'])

        data = np.array(df)

        n_steps = 5

        # 모델 로드
        model = load_model('./lotto/lotto_model.keras', compile=False)

        # 모델 컴파일
        model.compile(optimizer='adam', loss='mse')

        predictions = []  # 예측 결과를 저장할 리스트

        # 예측을 실행하고 중복 항목이 발견되면 다시 예측합니다.
        i = 0
        while len(predictions) < 5 and i < len(data) - n_steps:
            x_input = np.array([data[i:i+n_steps]], dtype=np.float32)
            x_input = x_input.reshape((1, n_steps, 6))

            prediction = model.predict(x_input)
            rounded_prediction = [math.floor(x) for x in prediction[0]]

            # 예측 결과에 중복 항목이 없는 경우에만 추가합니다.
            if len(rounded_prediction) == len(set(rounded_prediction)):
                # 예측 결과가 1~45 범위에 있는지 확인합니다.
                if all(1 <= num <= 45 for num in rounded_prediction):
                    predictions.append(sorted(rounded_prediction))  

            i += 1

        return predictions

    except Exception as e:
        logging.error("Exception occurred", exc_info=True)

# 데이터 전처리
def preprocessing():
    with open(data_file_path, 'r', encoding='EUC-KR') as file:
        html_code = file.read()

    soup = BeautifulSoup(html_code, 'html.parser')
    table = soup.find_all('table')[1]  # 두 번째 테이블 선택
    rows = table.find_all('tr')

    data = []
    for row in rows[2:]:  # 첫 두 행은 제목이므로 무시합니다.
        cells = row.find_all('td')
        winning_numbers = [cell.text.strip() for cell in cells[-7:-1]]  # 당첨번호
        data.append(winning_numbers)

    df = pd.DataFrame(data, columns=['1번', '2번', '3번', '4번', '5번', '6번'])

    data = np.array(df)

    print(data)

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
    model.fit(X_train, y_train, epochs=200, verbose=1)

    # 모델 저장
    model.save('./lotto/lotto_model.keras')