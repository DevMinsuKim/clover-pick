from fastapi import FastAPI

from api.lotto.index import lotto_data_update
from api.pension.index import pension_data_update

app = FastAPI()

@app.get("/api/lotto/data/update")
def update_lotto_data():
    return lotto_data_update()

@app.get("/api/pension/data/update")
def update_pension_data():
    return pension_data_update()