-- ==========================================
-- DUELIO - SUPABASE / POSTGRESQL SCHEMA
-- Copiez ce script dans l'éditeur SQL de Supabase
-- ==========================================

-- 1. Table des Utilisateurs (users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Correspond à l'UID Firebase/Supabase Auth
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    wallet_balance INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    best_category TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des Questions (questions)
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- single, multiple, boolean
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Liste des options [ "A", "B", ... ]
    correct_answers JSONB NOT NULL, -- Liste des index [0]
    difficulty TEXT DEFAULT 'medium',
    time_limit INTEGER DEFAULT 30,
    points INTEGER DEFAULT 10,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des Défis (challenges)
CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attacker_id TEXT NOT NULL REFERENCES users(id),
    attacker_name TEXT,
    attacker_photo_url TEXT,
    defender_id TEXT NOT NULL REFERENCES users(id),
    defender_name TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed
    quiz_category TEXT,
    questions JSONB,
    attacker_score INTEGER DEFAULT 0,
    defender_score INTEGER DEFAULT 0,
    winner_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des Scores / Historique (scores)
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id),
    quiz_id TEXT,
    score INTEGER NOT NULL,
    total_questions INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des Transactions (transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT, -- deposit, withdrawal, bet_win, bet_loss, premium_unlock
    amount INTEGER,
    status TEXT, -- pending, completed, failed
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_challenges_defender ON challenges(defender_id);
CREATE INDEX IF NOT EXISTS idx_challenges_attacker ON challenges(attacker_id);
CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
