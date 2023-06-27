from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from lotto.LSTM_training import generateLotto, preprocessing


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

@app.get("/api/lotto")
def read_root():
    preprocessing()
    return {"numbers": generateLotto()}

@app.get("/api/lotto/{round_number}")
def read_root():
    return {"numbers": generateLotto()}

@app.get("/api/lotto/all")
def read_root():
    return {"numbers": generateLotto()}