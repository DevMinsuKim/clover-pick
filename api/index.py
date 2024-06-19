from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers.lotto import router as lotto_router
from api.routers.pension import router as pension_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://lotto-website.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lotto_router, prefix="/api", tags=["lotto"])
app.include_router(pension_router, prefix="/api", tags=["pension"])