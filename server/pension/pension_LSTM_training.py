import math
import os
import queue
import re
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
directory = "./pension/data"

# 디렉토리 내의 모든 파일 검색
files = os.listdir(directory)

# 데이터 파일 경로
data_file_path = None

q = queue.Queue()

# 데이터 파일 찾기
for file in files:
    if file.endswith(".xls"):
        data_file_path = os.path.join(directory, file)
        break

def generate_pension():
    try:
        with open(data_file_path, 'r', encoding='EUC-KR') as file:
            html_code = file.read()

        # Extract patterns using regex
        pattern = re.compile(r'(\d+)조<br/>(\d+)')
        matches = pattern.findall(html_code)
        
        # Convert the matches to individual numbers and normalize them
        formatted_matches = [f"{match[0]}조{match[1]}" for match in matches]
        sequences = [list(map(int, list(match.replace("조", "")))) for match in formatted_matches]
        sequences_normalized = [[num / 10 for num in seq] for seq in sequences]
        data = np.array(sequences_normalized)

        n_steps = 5

        # Load the model
        model = load_model('./pension/pension_model.keras', compile=False)

        # Compile the model
        model.compile(optimizer='adam', loss='mse')

        predictions = []

        # Predict using the model for 5 times
        x_input = np.array([data[-n_steps:]], dtype=np.float32)
        for _ in range(5):
            x_input = x_input.reshape((1, n_steps, 7))
            prediction = model.predict(x_input)
            
            # De-normalize the prediction
            rounded_prediction = [math.floor(x * 10) for x in prediction[0]]

            if rounded_prediction[0] > 5:
                rounded_prediction[0] = 5
            # Convert prediction to desired format
            predictions.append(rounded_prediction)
            
            # Use this prediction for the next input (shift left and append new prediction)
            x_input = np.roll(x_input, shift=-1, axis=1)
            x_input[0, -1] = prediction / 10  # normalized prediction

        print(predictions)
        return predictions

    except Exception as e:
        logging.error("Exception occurred", exc_info=True)
        return []

# 데이터 전처리
async def preprocessing_pension():
    with open(data_file_path, 'r', encoding='EUC-KR') as file:
        html_code = file.read()

    # Extract patterns using regex
    pattern = re.compile(r'(\d+)조<br/>(\d+)')
    matches = pattern.findall(html_code)
    
    # Convert the matches to individual numbers and normalize them
    formatted_matches = [f"{match[0]}조{match[1]}" for match in matches]
    sequences = [list(map(int, list(match.replace("조", "")))) for match in formatted_matches]
    sequences_normalized = [[num / 10 for num in seq] for seq in sequences]
    data = np.array(sequences_normalized)

    # Generate sequences (X: 5 sequences, y: next sequence)
    n_steps = 5 
    X, y = [], []
    for i in range(n_steps, len(data)):
        X.append(data[i-n_steps:i])
        y.append(data[i])

    # Convert to numpy arrays
    X = np.array(X)
    y = np.array(y)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Build LSTM model
    model = Sequential()
    model.add(LSTM(50, activation='tanh', input_shape=(n_steps, 7)))  # Update input shape to consider 7 numbers
    model.add(Dense(7))  # Update output layer to output 7 numbers
    model.compile(optimizer='adam', loss='mse')

    return model, X_train, y_train