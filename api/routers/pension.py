from fastapi import APIRouter, Depends

from api.utils.db import get_db
from api.services.pension_service import pension_data_update
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/pension/data/update")
def pension_data_update_(db: Session = Depends(get_db)):
    return pension_data_update(db)
