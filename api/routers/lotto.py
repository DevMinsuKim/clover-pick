from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from api.services.lotto_service import lotto_data_update, get_lotto_numbers
from api.utils.db import get_db

router = APIRouter()

class LottoCount(BaseModel):
    count: int

@router.get("/lotto/data/update")
def update_lotto_data(db: Session = Depends(get_db)):
    return lotto_data_update(db)

@router.post("/lotto/numbers")
def lotto(lottoCount: LottoCount, db: Session = Depends(get_db)):
    return get_lotto_numbers(lottoCount.count, db)
