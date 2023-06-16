from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from main import generateLotto

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

@app.get("/lotto")
def read_root():
    return {"numbers": generateLotto()}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}