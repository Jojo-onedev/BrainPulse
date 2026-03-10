from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.all_models import Question

router = APIRouter()

@router.get("/categories")
async def get_categories(db: Session = Depends(get_db)):
    # Mock categories for now
    return {
        "categories": [
            {"id": "histoire", "name": "Histoire Africaine", "icon": "📚", "question_count": 150},
            {"id": "culture", "name": "Culture & Traditions", "icon": "🌍", "question_count": 200},
            {"id": "sport", "name": "Sport Africain", "icon": "⚽", "question_count": 80}
        ]
    }

@router.get("/questions")
async def get_questions(category: str = None, limit: int = 10, db: Session = Depends(get_db)):
    query = db.query(Question)
    if category:
        query = query.filter(Question.category == category)
    
    questions = query.limit(limit).all()
    return {"questions": questions}

@router.post("/competition/unlock")
async def unlock_competition(user_id: str, amount: int):
    if amount < 1999:
        raise HTTPException(status_code=400, detail="Montant insuffisant pour débloquer le mode compétition")
    return {"status": "success", "message": "Mode compétition débloqué"}
