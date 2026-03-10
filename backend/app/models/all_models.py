from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Float
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    wallet_balance = Column(Integer, default=0)
    total_games = Column(Integer, default=0)
    total_wins = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    best_category = Column(String, nullable=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False) # single, multiple, boolean
    category = Column(String, index=True, nullable=False)
    question_text = Column(String, nullable=False)
    options = Column(JSON, nullable=False)
    correct_answers = Column(JSON, nullable=False) # Array of indices
    difficulty = Column(String, default="medium")
    time_limit = Column(Integer, default=30)
    points = Column(Integer, default=10)
    explanation = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    type = Column(String) # deposit, withdrawal, bet_win, bet_loss, premium_unlock
    amount = Column(Integer)
    status = Column(String) # pending, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
