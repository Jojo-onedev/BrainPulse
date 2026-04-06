from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.all_models import Question
import uuid
import csv
import io
import json

# Try to import pandas/openpyxl for Excel support
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

router = APIRouter()

@router.post("/import")
async def import_questions(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Importe des questions depuis un fichier CSV ou Excel.
    """
    filename = file.filename.lower()
    content = await file.read()
    
    questions_to_add = []
    
    if filename.endswith('.csv'):
        # Lecture CSV
        stream = io.StringIO(content.decode("utf-8"))
        reader = csv.DictReader(stream)
        for row in reader:
            questions_to_add.append(process_row(row))
            
    elif filename.endswith(('.xlsx', '.xls')):
        # Lecture Excel (nécessite pandas + openpyxl)
        if not PANDAS_AVAILABLE:
            raise HTTPException(status_code=500, detail="Le support Excel n'est pas installé sur le serveur.")
        
        df = pd.read_excel(io.BytesIO(content))
        for _, row in df.iterrows():
            questions_to_add.append(process_row(row.to_dict()))
    else:
        raise HTTPException(status_code=400, detail="Format de fichier non supporté (.csv, .xlsx uniquement)")

    # Ajout à la DB
    for q_data in questions_to_add:
        new_q = Question(
            id=str(uuid.uuid4()),
            type=q_data.get('type', 'single'),
            category=q_data.get('category', 'Général'),
            question_text=q_data.get('question_text'),
            options=q_data.get('options'),
            correct_answers=q_data.get('correct_answers'),
            difficulty=q_data.get('difficulty', 'medium'),
            time_limit=int(q_data.get('time_limit', 30)),
            points=int(q_data.get('points', 10)),
            explanation=q_data.get('explanation')
        )
        db.add(new_q)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur d'importation : {str(e)}")
        
    return {"status": "success", "imported_count": len(questions_to_add)}

CATEGORY_MAP = {
    'histoire': 'history',
    'history': 'history',
    'géographie': 'geography',
    'geographie': 'geography',
    'geography': 'geography',
    'science': 'science',
    'sciences': 'science',
    'sport': 'sports',
    'sports': 'sports',
    'culture africaine': 'culture_africa',
    'culture africa': 'culture_africa',
    'culture': 'culture_africa',
    'actualité': 'news',
    'news': 'news',
    'général': 'general',
    'general': 'general',
    'culture générale': 'general'
}

def normalize_category(cat):
    if not cat:
        return 'general'
    cat_lower = str(cat).lower().strip()
    return CATEGORY_MAP.get(cat_lower, 'general')

def process_row(row):
    """
    Nettoie et formate une ligne de données.
    """
    # ... rest of the logic ...
    # Extract options (Check for both 'options' and 'option' columns)
    options_raw = row.get('options')
    if options_raw is None:
        options_raw = row.get('option', '[]')
        
    if isinstance(options_raw, str) and ';' in options_raw:
        options = [opt.strip() for opt in options_raw.split(';')]
    else:
        try:
            options = json.loads(options_raw) if isinstance(options_raw, str) else options_raw
        except:
            if isinstance(options_raw, str) and options_raw.strip():
                 options = [options_raw.strip()]
            else:
                 options = []

    correct_raw = row.get('correct_answers', '[0]')
    if isinstance(correct_raw, str) and ';' in correct_raw:
        # Si c'est une liste séparée par des points-virgules, on convertit 1-based (Excel) en 0-based(App)
        try:
            correct_answers = [int(idx.strip()) - 1 for idx in correct_raw.split(';')]
        except:
            correct_answers = [0]
    else:
        try:
            # Si c'est déjà un ID simple venant du Excel
            if isinstance(correct_raw, (int, float)):
                correct_answers = [int(correct_raw) - 1]
            else:
                parsed = json.loads(correct_raw) if isinstance(correct_raw, str) else correct_raw
                if isinstance(parsed, list):
                   # On suppose que ce json vient de l'ancien système, on garde tel quel si on sait pas
                   correct_answers = [int(p) for p in parsed] 
                else:
                   correct_answers = [int(parsed) - 1]
        except:
            correct_answers = [0]
            
    # S'assurer de ne pas avoir de nombres négatifs
    correct_answers = [max(0, ans) for ans in correct_answers]

    return {
        'type': row.get('type', 'single'),
        'category': normalize_category(row.get('category', row.get('catégorie', 'general'))),
        'question_text': row.get('question', row.get('question_text')),
        'options': options,
        'correct_answers': correct_answers,
        'difficulty': row.get('difficulty', 'medium'),
        'time_limit': row.get('time_limit', 30),
        'points': row.get('points', 10),
        'explanation': row.get('explanation', row.get('explication', ''))
    }
