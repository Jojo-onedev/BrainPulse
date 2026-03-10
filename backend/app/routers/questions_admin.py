from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import import_service
from ..models.all_models import Question
import os

router = APIRouter()

@router.get("/template")
async def get_template():
    """ Retourne le fichier template Excel. """
    path = "template_questions.xlsx"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Template non trouvé")
    return FileResponse(path, filename="duelio_template_questions.xlsx")

@router.post("/import")
async def import_questions(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await import_service.import_questions(file, db)

@router.get("/")
async def list_questions(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(Question).offset(skip).limit(limit).all()

@router.delete("/{question_id}")
async def delete_question(question_id: str, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question non trouvée")
    db.delete(question)
    db.commit()
    return {"message": "Question supprimée"}
