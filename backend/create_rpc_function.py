import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

SQL = """
CREATE OR REPLACE FUNCTION get_random_questions(cat_id TEXT, cat_label TEXT, lim INTEGER)
RETURNS SETOF questions AS $$
BEGIN
    RETURN QUERY 
    SELECT * FROM questions 
    WHERE category = cat_id OR category = cat_label 
    ORDER BY random() 
    LIMIT lim;
END;
$$ LANGUAGE plpgsql;
"""

def create_function():
    with engine.connect() as conn:
        conn.execute(text(SQL))
        conn.commit()
        print("SQL function get_random_questions created successfully!")

if __name__ == "__main__":
    create_function()
