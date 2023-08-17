import json
import queue
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from lotto.lotto_LSTM_training import generate_lotto, preprocessing
from lotto.lotto import get_round_number, get_round_number_all

from sse_starlette import EventSourceResponse

from keras.callbacks import Callback
from pension.pension import get_round_number_all_pension, get_round_number_pension

from pension.pension_LSTM_training import generate_pension, preprocessing_pension

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
            q.put({'epoch': epoch})

    def fit_model(model, X_train, y_train):
        try:
            model.fit(X_train, y_train, epochs=epochs, verbose=0, callbacks=[Callbacks()])
            model.save('./lotto/lotto_model.keras')
            lotto_results = generate_lotto()
            q.put({'epoch': None, 'lotto_results': lotto_results})
        except Exception as e:
            print(f"Error during model fitting: {e}")
            q.put({'epoch': None, 'error': str(e)})

    model, X_train, y_train = await preprocessing_pension()

    def generator():
        yield f"{json.dumps({'percent': 10, 'numbers': {}})}\n\n"
        threading.Thread(target=fit_model, args=(model, X_train, y_train)).start()

        last_percent = 0
        while True:
            try:
                # Queue에서 epoch 값을 가져옵니다. 값이 없을 때는 1초 동안 대기합니다.
                data = q.get(timeout=1)
                epoch = data.get('epoch')
                
                if epoch is None:
                    if 'error' in data:
                        print(f"Error during model fitting: {data['error']}")
                        break
                    lotto_results = data.get('lotto_results')
                    yield f"{json.dumps({'percent': 100, 'numbers': lotto_results})}\n\n"
                    break
                
                percent = (epoch / epochs) * 100
                if 20 <= percent <= 90 and percent // 10 > last_percent:
                    last_percent = percent // 10
                    yield f"{json.dumps({'percent': percent, 'numbers': {}})}\n\n"
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


@app.get("/api/pension")
async def read_root():
    epochs = 200
    q = queue.Queue()

    class Callbacks(Callback):
        def on_epoch_end(self, epoch, logs=None):
            q.put({'epoch': epoch})

    def fit_model(model, X_train, y_train):
        try:
            model.fit(X_train, y_train, epochs=epochs, verbose=0, callbacks=[Callbacks()])
            model.save('./pension/pension_model.keras')
            pension_results = generate_pension()
            q.put({'epoch': None, 'pension_results': pension_results})
        except Exception as e:
            print(f"Error during model fitting: {e}")
            q.put({'epoch': None, 'error': str(e)})

    model, X_train, y_train = await preprocessing()

    def generator():
        yield f"{json.dumps({'percent': 10, 'numbers': {}})}\n\n"
        threading.Thread(target=fit_model, args=(model, X_train, y_train)).start()

        last_percent = 0
        while True:
            try:
                # Queue에서 epoch 값을 가져옵니다. 값이 없을 때는 1초 동안 대기합니다.
                data = q.get(timeout=1)
                epoch = data.get('epoch')
                
                if epoch is None:
                    if 'error' in data:
                        print(f"Error during model fitting: {data['error']}")
                        break
                    pension_results = data.get('pension_results')
                    yield f"{json.dumps({'percent': 100, 'numbers': pension_results})}\n\n"
                    break
                
                percent = (epoch / epochs) * 100
                if 20 <= percent <= 90 and percent // 10 > last_percent:
                    last_percent = percent // 10
                    yield f"{json.dumps({'percent': percent, 'numbers': {}})}\n\n"
            except queue.Empty:
                # Queue가 비어있을 때는 이번 루프를 건너뛰고 다음 루프로 진행합니다.
                continue

    return EventSourceResponse(generator())



@app.get("/api/pension/{round_number}")
def read_root(round_number:int):
    return get_round_number_pension(round_number)

@app.get("/api/pension/all")
def read_root():
    return get_round_number_all_pension()