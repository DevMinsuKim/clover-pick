import json
import queue
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from lotto.LSTM_training import generate_lotto, preprocessing
from lotto.lotto import get_round_number, get_round_number_all

from sse_starlette import EventSourceResponse

from keras.callbacks import Callback

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
    epochs = 200
    q = queue.Queue()
    class Callbacks(Callback):
        def on_epoch_end(self, epoch, logs=None):
            q.put(epoch)

    def fit_model(model, X_train, y_train):
        model.fit(X_train, y_train, epochs=epochs, verbose=0, callbacks=[Callbacks()])
        model.save('./lotto/lotto_model.keras')
        generate_lotto()
        print('학습 끝!!!')
        q.put(None)

    model, X_train, y_train = await preprocessing()
    threading.Thread(target=fit_model, args=(model, X_train, y_train)).start()

    def generator():
        while True:
            try:
                # Queue에서 epoch 값을 가져옵니다. 값이 없을 때는 1초 동안 대기합니다.
                epoch = q.get(timeout=1)
                
                if epoch is None:
                    break
                
                yield f"data: {json.dumps({'epoch': epoch})}\n\n"
            except queue.Empty:
                # Queue가 비어있을 때는 이번 루프를 건너뛰고 다음 루프로 진행합니다.
                continue

    return EventSourceResponse(generator())

@app.get("/api/lotto/{round_number}")
def read_root(round_number:int):
    return get_round_number(round_number)

@app.get("/api/lotto/all")
def read_root():
    return get_round_number_all()