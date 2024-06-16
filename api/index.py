from fastapi import FastAPI

from api.lotto.index import lotto_data_update

app = FastAPI()

@app.get("/api/lotto/data/update")
def update_lotto_data():
    return lotto_data_update()

@app.get("/api/pension/data/update")
def pension_data_update():
    return {"message": "Hello World"}