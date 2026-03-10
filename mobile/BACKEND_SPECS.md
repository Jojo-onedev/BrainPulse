# 🔧 Spécifications Backend - Duelio API

## Stack Technique
- **Framework** : FastAPI (Python 3.10+)
- **Base de données** : PostgreSQL (recommandé) ou MongoDB
- **Authentification** : JWT + Firebase Admin SDK
- **Déploiement** : Railway / Render / AWS

---

## 📋 API Endpoints

### 1. Quiz & Questions

#### `GET /api/categories`
Récupère la liste des catégories disponibles.

**Response:**
```json
{
  "categories": [
    {
      "id": "histoire",
      "name": "Histoire Africaine",
      "icon": "📚",
      "question_count": 150
    }
  ]
}
```

#### `GET /api/questions`
Récupère des questions selon les filtres.

**Query Parameters:**
- `category` (optional): ID de la catégorie
- `difficulty` (optional): easy | medium | hard
- `limit` (default: 10): Nombre de questions
- `region` (optional): Région africaine

**Response:**
```json
{
  "questions": [
    {
      "id": "q_001",
      "type": "single",
      "category": "histoire",
      "question": "Quel empire africain était connu pour sa richesse en or ?",
      "options": ["Empire du Mali", "Empire Songhaï", "Royaume du Kongo", "Empire Éthiopien"],
      "correctAnswers": [0],
      "difficulty": "medium",
      "timeLimit": 30,
      "points": 10
    }
  ]
}
```

#### `POST /api/validate-answer`
Valide une réponse et retourne le résultat.

**Request Body:**
```json
{
  "question_id": "q_001",
  "user_answer": 0,
  "user_id": "user_123"
}
```

**Response:**
```json
{
  "correct": true,
  "correctAnswers": [0],
  "points_earned": 10
}
```

---

### 2. Portefeuille & Transactions

#### `GET /api/wallet/balance`
Récupère le solde du portefeuille utilisateur.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user_id": "user_123",
  "balance": 5000,
  "currency": "XOF",
  "pending_withdrawals": 0
}
```

#### `POST /api/wallet/deposit`
Recharge le portefeuille via Mobile Money.

**Request Body:**
```json
{
  "amount": 1000,
  "payment_method": "orange_money",
  "phone_number": "+221771234567"
}
```

**Response:**
```json
{
  "transaction_id": "tx_001",
  "status": "pending",
  "payment_url": "https://payment.orangemoney.com/...",
  "expires_at": "2026-02-16T13:00:00Z"
}
```

#### `POST /api/wallet/withdraw`
Retrait d'argent vers Mobile Money.

**Request Body:**
```json
{
  "amount": 2000,
  "payment_method": "orange_money",
  "phone_number": "+221771234567"
}
```

**Response:**
```json
{
  "transaction_id": "tx_002",
  "status": "processing",
  "estimated_completion": "2026-02-16T14:00:00Z"
}
```

#### `GET /api/transactions`
Historique des transactions.

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)
- `type` (optional): deposit | withdrawal | bet_win | bet_loss

**Response:**
```json
{
  "transactions": [
    {
      "id": "tx_001",
      "type": "deposit",
      "amount": 1000,
      "status": "completed",
      "created_at": "2026-02-16T12:00:00Z"
    }
  ],
  "total": 45
}
```

---

### 3. Paris & Compétition (Freemium)

Le mode compétition est accessible via un paiement unique ou abonnement de **1999 XOF**. Le système de paris individuels est maintenu.

#### `POST /api/competition/unlock`
Débloque le mode compétition pour l'utilisateur.

**Request Body:**
```json
{
  "user_id": "user_123",
  "payment_method": "orange_money",
  "amount": 1999
}
```

#### `POST /api/bet/create`
Créer un défi avec mise.

**Request Body:**
```json
{
  "opponent_id": "user_456",
  "bet_amount": 500,
  "category": "histoire",
  "difficulty": "medium",
  "question_count": 5
}
```

**Response:**
```json
{
  "bet_id": "bet_001",
  "status": "pending",
  "expires_at": "2026-02-16T13:00:00Z"
}
```

#### `POST /api/bet/accept`
Accepter ou contre-proposer un pari.

**Request Body:**
```json
{
  "bet_id": "bet_001",
  "action": "accept",
  "counter_amount": null
}
```

**Response:**
```json
{
  "bet_id": "bet_001",
  "status": "active",
  "match_id": "match_001",
  "questions": [...]
}
```

#### `POST /api/bet/complete`
Finaliser un pari et distribuer les gains.

**Request Body:**
```json
{
  "match_id": "match_001",
  "player1_score": 4,
  "player2_score": 3
}
```

**Response:**
```json
{
  "winner_id": "user_123",
  "loser_id": "user_456",
  "distribution": {
    "winner_gain": 700,
    "loser_consolation": 100,
    "platform_fee": 200
  }
}
```

---

### 4. Administration & Import (Nouveau)

#### `POST /api/admin/questions/import`
Importe une liste de questions depuis un fichier Excel ou CSV.

**Request:** `Multipart/form-data` (file: .xlsx or .csv)

**Response:**
```json
{
  "total_processed": 100,
  "successfully_imported": 95,
  "errors": [
    {"line": 12, "reason": "Option correcte manquante"},
    {"line": 45, "reason": "Catégorie invalide"}
  ]
}
```

#### `GET /api/admin/stats`
Statistiques pour le dashboard.

**Response:**
```json
{
  "total_questions": 1250,
  "questions_by_category": {"Histoire": 450, "Culture": 800},
  "active_users_24h": 120
}
```

---

## 🗄️ Schéma de Base de Données

### Table: `users`
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    wallet_balance INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `questions`
```sql
CREATE TABLE questions (
    id VARCHAR(255) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(100),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answers JSONB NOT NULL,
    type VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    time_limit INTEGER DEFAULT 30,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `bets`
```sql
CREATE TABLE bets (
    id VARCHAR(255) PRIMARY KEY,
    creator_id VARCHAR(255) REFERENCES users(id),
    opponent_id VARCHAR(255) REFERENCES users(id),
    bet_amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

### Table: `transactions`
```sql
CREATE TABLE transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Authentification

Utiliser Firebase Admin SDK pour vérifier les tokens JWT.

**Middleware FastAPI:**
```python
from fastapi import Depends, HTTPException
from firebase_admin import auth

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 📦 Structure du Projet

```
backend/
├── app/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── config.py            # Configuration
│   ├── database.py          # Connexion DB
│   ├── models/              # Modèles SQLAlchemy
│   │   ├── user.py
│   │   ├── question.py
│   │   ├── bet.py
│   │   └── transaction.py
│   ├── routers/             # Routes API
│   │   ├── quiz.py
│   │   ├── wallet.py
│   │   └── bets.py
│   ├── services/            # Logique métier
│   │   ├── payment.py
│   │   ├── bet_logic.py
│   │   └── quiz_logic.py
│   └── utils/
│       ├── auth.py
│       └── helpers.py
├── requirements.txt
├── .env
└── README.md
```

---

## 🚀 Démarrage Rapide

```bash
# Installation
pip install -r requirements.txt

# Variables d'environnement
cp .env.example .env

# Lancer le serveur
uvicorn app.main:app --reload
```

**requirements.txt:**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
firebase-admin==6.4.0
pydantic==2.5.3
python-jose[cryptography]==3.3.0
```
