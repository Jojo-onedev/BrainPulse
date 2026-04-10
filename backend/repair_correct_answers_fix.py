import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import pandas as pd
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No DB URL")
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def repair():
    db = SessionLocal()
    try:
        excel_path = r'c:\Users\batio\OneDrive\Documents\mydiffpro\Duelio\questionnaire_modele_image.xlsx'
        if not os.path.exists(excel_path):
            print("Excel file not found, exiting.")
            return

        df = pd.read_excel(excel_path)
        
        # Get all single questions from DB
        res_single = db.execute(text("SELECT id, question_text, correct_answers FROM questions WHERE type = 'single'")).fetchall()
        
        repaired_count = 0
        for row in res_single:
            q_id, q_text, db_correct_ans = row[0], row[1], row[2]
            
            # Find in Excel
            match = df[df['question'] == q_text]
            if not match.empty:
                excel_correct_raw = str(match.iloc[0].get('correct_answers', '0'))
                
                try:
                    if ';' in excel_correct_raw:
                        # Re-calculate correct answers based on Excel WITHOUT subtracting 1
                        new_correct = [int(idx.strip()) for idx in excel_correct_raw.split(';')]
                    else:
                        parsed_val = int(float(excel_correct_raw))
                        new_correct = [parsed_val]
                        
                    # Update DB if different
                    if json.dumps(new_correct) != json.dumps(db_correct_ans):
                       upd_stmt = text("UPDATE questions SET correct_answers = :correct WHERE id = :id")
                       db.execute(upd_stmt, {"correct": json.dumps(new_correct), "id": q_id})
                       repaired_count += 1
                except ValueError as e:
                   print(f"Skipping row {q_text[:20]} due to value error: {e}")
                
        print(f"Fixed correct_answers for {repaired_count} questions based on exact Excel mapping (no -1).")
        db.commit()
    except Exception as e:
        print(f"Error repairing correct answers: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair()
