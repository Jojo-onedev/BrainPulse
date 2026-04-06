import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def check_options():
    db = SessionLocal()
    try:
        # Check questions with potentially missing options
        result = db.execute(text("SELECT id, type, category, question_text, options, correct_answers FROM questions WHERE type = 'single' ORDER BY id DESC LIMIT 10"))
        print("SAMPLE QUESTIONS DATA:")
        for row in result:
            print(f"ID: {row[0]}")
            print(f"  Type: {row[1]}")
            print(f"  Category: {row[2]}")
            print(f"  Question: {row[3]}")
            print(f"  Options: {row[4]} (Type: {type(row[4])})")
            print(f"  Correct: {row[5]} (Type: {type(row[5])})")
            print("-" * 20)
            
    finally:
        db.close()

if __name__ == "__main__":
    check_options()
