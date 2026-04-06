import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def check_counts():
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT category, count(*) FROM questions GROUP BY category"))
        print("DATABASE COUNTS PER CATEGORY:")
        for row in result:
            print(f"  {row[0]}: {row[1]}")
            
        # Also check for empty questions or options
        res2 = db.execute(text("SELECT count(*) FROM questions WHERE question_text IS NULL OR question_text = ''"))
        print(f"Questions with empty text: {res2.scalar()}")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_counts()
