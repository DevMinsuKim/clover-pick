from bs4 import BeautifulSoup
import pandas as pd
import requests

url = 'https://dhlottery.co.kr/gameResult.do?method=allWinExel&gubun=byWin&nowPage=&drwNoStart=1&drwNoEnd=100000'
output_path = './lotto_data.xls'

# 데이터 전처리
def preprocessing():
     data = pd.read_excel('lotto_data.xls', engine='xlrd')
     print(data)

try:
    # response = requests.get(url)
    # response.raise_for_status()  # 오류 발생 시 예외 처리

    # with open(output_path, 'wb') as file:
    #     file.write(response.content)

    # print('파일 다운로드 완료')

    # preprocessing()

    with open('lotto_data.xls', 'r', encoding='EUC-KR') as file:
        html_code = file.read()

    soup = BeautifulSoup(html_code, 'html.parser', from_encoding='EUC-KR')
    table = soup.find_all('table')[1]  # 두 번째 테이블 선택
    rows = table.find_all('tr')

    data = []
    for row in rows:
        cells = row.find_all('td')
        row_data = [cell.text.strip() for cell in cells]
        data.append(row_data)

    df = pd.DataFrame(data)

    print(df)


except requests.exceptions.RequestException as e:
    print('파일을 다운로드하는 동안 오류가 발생했습니다:', e)


