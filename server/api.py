from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from lotto.LSTM_training import generate_lotto, preprocessing
from lotto.lotto import get_round_number, get_round_number_all


# uvicorn api:app --reload

app = FastAPI(docs_url=None, redoc_url=None)

# CORS 설정
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/lotto")
def read_root():
    preprocessing()
    return {"numbers": generate_lotto()}

@app.get("/api/lotto/{round_number}")
def read_root(round_number:int):
    return get_round_number(round_number)

@app.get("/api/lotto/all")
def read_root():
    return get_round_number_all()