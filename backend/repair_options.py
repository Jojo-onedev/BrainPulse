import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import pandas as pd
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def repair_options():
    db = SessionLocal()
    try:
        # 1. Fix Boolean Questions
        stmt_bool = text("""
            UPDATE questions 
            SET options = '["Vrai", "Faux"]'::json 
            WHERE type = 'boolean' AND (options::text = '[]' OR options IS NULL)
        """)
        res_bool = db.execute(stmt_bool)
        print(f"Repaired {res_bool.rowcount} boolean questions with Vrai/Faux.")

        # 2. Try to recover options from Excel file for 'single' questions if they are empty
        excel_path = '../questionnaire_modele_image.xlsx'
        if os.path.exists(excel_path):
            df = pd.read_excel(excel_path)
            
            # Find questions in DB with empty options
            res_single = db.execute(text("""
                SELECT id, question_text FROM questions 
                WHERE type = 'single' AND (options::text = '[]' OR options IS NULL)
            """)).fetchall()
            
            repaired_count = 0
            for row in res_single:
                q_id, q_text = row[0], row[1]
                
                # Try to find this question in the excel file (approximate match)
                match = df[df['question'] == q_text]
                if not match.empty:
                    opts_raw = str(match.iloc[0].get('option', ''))
                    
                    if opts_raw and ';' in opts_raw:
                        new_options = [o.strip() for o in opts_raw.split(';')]
                        
                        # Update DB
                        upd_stmt = text("UPDATE questions SET options = :opts WHERE id = :id")
                        db.execute(upd_stmt, {"opts": json.dumps(new_options), "id": q_id})
                        repaired_count += 1
                        
            print(f"Recovered {repaired_count} options from Excel file.")
            
        else:
            print("Excel file not found, skipping recovery.")

        db.commit()
    except Exception as e:
        print(f"Error repairing options: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair_options()
