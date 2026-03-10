from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.all_models import User, Transaction
import uuid

router = APIRouter()

@router.post("/unlock")
async def unlock_competition(user_id: str, amount: int, db: Session = Depends(get_db)):
    """
    Débloque le mode compétition pour un utilisateur (1999 XOF).
    """
    if amount < 1999:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Le montant doit être de 1999 XOF minimum."
        )
    
    # 1. Vérifier si l'utilisateur existe
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Optionnel: Créer l'utilisateur s'il n'existe pas encore dans notre DB locale
        user = User(id=user_id, email=f"{user_id}@placeholder.com", display_name="Joueur")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 2. Vérifier s'il est déjà premium
    if user.is_premium:
        return {"status": "already_premium", "message": "Le mode compétition est déjà actif."}
    
    # 3. Créer une transaction
    new_transaction = Transaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type="premium_unlock",
        amount=amount,
        status="completed"
    )
    db.add(new_transaction)
    
    # 4. Mettre à jour le statut premium
    user.is_premium = True
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour : {str(e)}"
        )
    
    return {
        "status": "success", 
        "message": "Félicitations ! Le mode compétition est débloqué.",
        "user_id": user_id
    }
