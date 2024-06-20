from sqlalchemy import Column, Integer, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Pension(Base):
    __tablename__ = 'pension'

    draw_number = Column(Integer, primary_key=True, index=True)
    draw_date = Column(Date, nullable=False)
    first_prize = Column(Integer, nullable=False)
    bonus_prize = Column(Integer, nullable=False)