from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import admin, quiz, competition, questions_admin
from .database import engine, Base
from .models import all_models

# Création des tables au démarrage (SQLite local par défaut)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Duelio API", version="1.0.0")

# Configuration CORS pour le Dashboard Admin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Duelio", "status": "online"}

# Inclusion des routers
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(quiz.router, prefix="/api", tags=["Quiz"])
app.include_router(competition.router, prefix="/api/competition", tags=["Competition"])
app.include_router(questions_admin.router, prefix="/api/admin/questions", tags=["Admin Questions"])
