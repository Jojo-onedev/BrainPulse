import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

# Fix for potential postgresql:// vs postgres:// issues
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

CATEGORY_MAP = {
    'histoire': 'history',
    'history': 'history',
    'Histoire': 'history',
    'géographie': 'geography',
    'geographie': 'geography',
    'geography': 'geography',
    'Géographie': 'geography',
    'science': 'science',
    'sciences': 'science',
    'Sciences': 'science',
    'sport': 'sports',
    'sports': 'sports',
    'Sport': 'sports',
    'culture africaine': 'culture_africa',
    'Culture Africaine': 'culture_africa',
    'culture_africa': 'culture_africa',
    'culture': 'culture_africa',
    'Culture': 'culture_africa',
    'actualité': 'news',
    'Actualité': 'news',
    'news': 'news',
    'général': 'general',
    'general': 'general',
    'Général': 'general',
    'culture générale': 'general',
    'Culture Générale': 'general'
}

def migrate_categories():
    db = SessionLocal()
    try:
        # Get all unique categories currently in DB
        result = db.execute(text("SELECT DISTINCT category FROM questions"))
        categories = [row[0] for row in result]
        
        print(f"Current categories in DB: {categories}")
        
        updated_count = 0
        for cat in categories:
            if not cat: continue
            
            target = CATEGORY_MAP.get(cat)
            if not target:
                # Try lower case
                target = CATEGORY_MAP.get(cat.lower().strip())
                
            if target and target != cat:
                print(f"Migrating category '{cat}' -> '{target}'")
                stmt = text("UPDATE questions SET category = :target WHERE category = :old")
                res = db.execute(stmt, {"target": target, "old": cat})
                updated_count += res.rowcount
        
        db.commit()
        print(f"Migration complete. Updated {updated_count} questions.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_categories()
