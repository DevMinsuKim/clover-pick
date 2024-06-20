from sqlalchemy import TIMESTAMP, Column, Integer, BigInteger, Date, func
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

# /lotto/generator 모델
class LottoCount(BaseModel):
    count: int

# 테이블 모델
class Lotto(Base):
    __tablename__ = 'lotto'

    draw_number = Column(Integer, primary_key=True, index=True)
    draw_date = Column(Date, nullable=False)
    first_prize_winners = Column(Integer, nullable=False)
    first_prize_amount = Column(BigInteger, nullable=False)
    second_prize_winners = Column(Integer, nullable=False)
    second_prize_amount = Column(BigInteger, nullable=False)
    third_prize_winners = Column(Integer, nullable=False)
    third_prize_amount = Column(BigInteger, nullable=False)
    fourth_prize_winners = Column(Integer, nullable=False)
    fourth_prize_amount = Column(BigInteger, nullable=False)
    fifth_prize_winners = Column(Integer, nullable=False)
    fifth_prize_amount = Column(BigInteger, nullable=False)
    winning_number_1 = Column(Integer, nullable=False)
    winning_number_2 = Column(Integer, nullable=False)
    winning_number_3 = Column(Integer, nullable=False)
    winning_number_4 = Column(Integer, nullable=False)
    winning_number_5 = Column(Integer, nullable=False)
    winning_number_6 = Column(Integer, nullable=False)
    bonus_number = Column(Integer, nullable=False)
    created = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())