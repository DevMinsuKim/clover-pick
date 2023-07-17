import json
from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from lotto.LSTM_training import generate_lotto, preprocessing
from lotto.lotto import get_round_number, get_round_number_all

from sse_starlette import EventSourceResponse
from starlette.responses import StreamingResponse



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
async def read_root():
    async def generate_numbers():
        # yield {"event": "progress","data": 0,\n\n"}
        # yield {json.dumps({ "progress": 0, "data": {} }) + "\n\n"}
        yield "event: progress\ndata: 0\n\n"
        preprocessing()
        yield "event: progress\ndata: 20\n\n"
        numbers = generate_lotto()
        yield "event: progress\ndata: 60\n\n"
        # yield {"event": "numbers", "data": numbers}
    # return {"numbers": generate_lotto()}
    response = StreamingResponse(generate_numbers(), media_type="text/event-stream")
    response.headers["X-Accel-Buffering"] = "no"
    return response
    # return EventSourceResponse(generate_numbers())

@app.get("/api/lotto/{round_number}")
def read_root(round_number:int):
    return get_round_number(round_number)

@app.get("/api/lotto/all")
def read_root():
    return get_round_number_all()