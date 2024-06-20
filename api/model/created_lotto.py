from sqlalchemy import TIMESTAMP, Column, Integer, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class CreatedLotto(Base):
    __tablename__ = 'created_lotto'

    id = Column(Integer, primary_key=True, index=True)
    draw_number = Column(Integer, nullable=False)
    winning_number1 = Column(Integer, nullable=False)
    winning_number2 = Column(Integer, nullable=False)
    winning_number3 = Column(Integer, nullable=False)
    winning_number4 = Column(Integer, nullable=False)
    winning_number5 = Column(Integer, nullable=False)
    winning_number6 = Column(Integer, nullable=False)
    created = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())
