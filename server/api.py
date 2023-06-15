from typing import Union

from fastapi import FastAPI

from main import generateLotto

app = FastAPI(docs_url=None, redoc_url=None)

@app.get("/lotto")
def read_root():
    return {"numbers": generateLotto()}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}