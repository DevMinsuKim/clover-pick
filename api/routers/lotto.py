from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.model.lotto import LottoCount
from api.services.lotto_service import lotto, lotto_data_update, lotto_generator
from api.utils.db import get_db

router = APIRouter()

@router.get("/lotto")
def lotto_(db: Session = Depends(get_db)):
    return lotto(db)

@router.get("/lotto/data/update")
def lotto_data_update_(db: Session = Depends(get_db)):
    return lotto_data_update(db)

@router.post("/lotto/generator")
def lotto_generator_(lottoCount: LottoCount, db: Session = Depends(get_db)):
    return lotto_generator(lottoCount.count, db)
