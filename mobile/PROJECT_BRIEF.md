# 🎯 Duelio - Brief du Projet

> **La culture africaine en duel**

## 📖 Contexte

**Duelio** est une application mobile de quiz compétitif axée sur la culture africaine. Le projet vise à promouvoir l'apprentissage ludique de l'histoire, la géographie, les traditions et la culture du continent africain à travers des défis entre joueurs.

### Vision
Créer une plateforme éducative et divertissante qui permet aux utilisateurs d'apprendre tout en s'amusant, avec un système de récompenses financières pour stimuler l'engagement.

### Équipe
- **3 Frontend Developers** (React Native/Expo)
- **2 Backend Developers** (Python/FastAPI)
- **Total : 5 personnes**

---

## 🎯 Objectifs du Projet

### Objectifs Principaux
1. **Éducation** : Diffuser la connaissance de la culture africaine de manière interactive
2. **Engagement** : Créer une expérience compétitive et addictive
3. **Monétisation** : Générer des revenus via un système de paris équitable
4. **Communauté** : Construire une base d'utilisateurs passionnés par la culture africaine

### Objectifs Techniques
- Application mobile cross-platform (iOS/Android)
- Backend scalable et performant
- Système de paiement mobile intégré
- Base de données de quiz riche et diversifiée

---

## ✅ Ce qui a déjà été fait

### Frontend (React Native + Expo)
- ✅ Configuration initiale du projet Expo
- ✅ Système d'authentification (Firebase Auth)
- ✅ Navigation (Stack + Tabs)
- ✅ Écrans principaux :
  - Authentification (Login/Signup)
  - Accueil avec catégories
  - Quiz (questions, résultats)
  - Profil utilisateur
  - Mode compétition (structure de base)
- ✅ Intégration Firebase (Auth, Firestore, Storage)
- ✅ Design system (couleurs, thème, composants)
- ✅ Logo et branding "Duelio"

### Services & Logique
- ✅ Service de gestion des défis (`challenges.ts`)
- ✅ Service de statistiques (`stats.ts`)
- ✅ Service de stockage local (`storage.ts`)
- ✅ Contexte d'authentification global
- ✅ Données mock pour les tests

---

## 🚀 Ce qui est prévu

### Phase 1 : API & Contenu (Backend)
**Responsables : Backend Developers**

#### 1.1 API Quiz (Python + FastAPI)
- [ ] Créer l'API REST pour les questions de quiz
- [ ] Base de données PostgreSQL/MongoDB pour stocker les questions
- [ ] Endpoints :
  - `GET /api/questions?category={cat}&difficulty={diff}` - Récupérer des questions
  - `POST /api/questions` - Ajouter une question (admin)
  - `GET /api/categories` - Liste des catégories
  - `POST /api/validate-answer` - Valider une réponse

#### 1.2 Structure des Questions
```json
{
  "id": "string",
  "type": "single | multiple | boolean",
  "category": "Histoire Africaine | Géographie | Culture | Sport | Musique | Politique",
  "subcategory": "string",
  "question": "string",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswers": [0],
  "difficulty": "easy | medium | hard",
  "timeLimit": 30,
  "points": 10
}
```

#### 1.3 Contenu Initial
- [ ] Minimum 500 questions réparties sur toutes les catégories
- [ ] Focus sur : Histoire, Géographie, Personnalités, Traditions, Langues

### Phase 2 : Système de Paris & Monétisation
**Responsables : Backend + Frontend**

#### 2.1 Backend - API Paiement & Portefeuille
- [ ] Système de portefeuille virtuel Duelio
- [ ] Intégration API Mobile Money (Orange Money, MTN, Moov, Wave)
- [ ] Endpoints :
  - `POST /api/wallet/deposit` - Recharger le portefeuille
  - `POST /api/wallet/withdraw` - Retirer de l'argent
  - `GET /api/wallet/balance` - Consulter le solde
  - `POST /api/bet/create` - Créer un pari
  - `POST /api/bet/accept` - Accepter un pari
  - `GET /api/transactions` - Historique des transactions

#### 2.2 Logique de Distribution des Gains
**Règle validée :**
```
Pool total = Mise Joueur 1 + Mise Joueur 2
- Gagnant : 70% du pool
- Duelio (commission) : 20% du pool
- Perdant (consolation) : 10% du pool
```

**Exemple :**
- Joueur 1 mise 500F, Joueur 2 mise 500F → Pool = 1000F
- Gagnant reçoit : 700F (gain net de +200F)
- Duelio prend : 200F
- Perdant reçoit : 100F (perte de -400F au lieu de -500F)

#### 2.3 Système de Mise Flexible (Option A)
- [ ] Le joueur qui lance le défi propose une mise (ex: 500F)
- [ ] L'adversaire peut :
  - ✅ Accepter la mise proposée
  - 🔄 Contre-proposer une mise inférieure
  - ❌ Refuser le défi
- [ ] Mise minimale : 100F
- [ ] Mise maximale : À définir (ex: 10,000F)

#### 2.4 Frontend - Interface de Paris
- [ ] Écran de création de défi avec sélection de mise
- [ ] Écran de gestion du portefeuille
- [ ] Écran de recharge (intégration Mobile Money)
- [ ] Historique des paris et transactions
- [ ] Notifications de défis reçus/acceptés

### Phase 4 : Dashboard Admin & Gestion du Contenu
**Responsables : Backend + 1 Frontend (Dashboard)**

#### 4.1 Interface Web Admin
- [ ] Créer une application web (React/Vite) dédiée à l'administration.
- [ ] Authentification sécurisée (Email Admin via Firebase ou JWT).
- [ ] Dashboard de statistiques (Nombre de questions, thématiques populaires).

#### 4.2 Gestion des Questions & Import Excel
- [ ] Formulaire d'ajout/édition de question à l'unité.
- [ ] **Importation de fichiers Excel/CSV** :
  - Upload du fichier via l'interface.
  - Parsing côté Backend (Python + Pandas/Openpyxl).
  - Validation (doublons, format, champs requis).
  - Insertion en masse dans PostgreSQL.

### Phase 5 : Fonctionnalités Avancées
**Responsables : Toute l'équipe**

- [ ] Système de classement/leaderboard
- [ ] Tournois hebdomadaires/mensuels
- [ ] Ligues par pays/région
- [ ] Récompenses quotidiennes (connexion)
- [ ] Système de parrainage
- [ ] Mode entraînement (gratuit, sans paris)
- [ ] Statistiques détaillées par joueur
- [ ] Chat entre joueurs (optionnel)

---

## 👥 Rôles & Responsabilités

### Backend Developers (2 personnes)
**Stack : Python + FastAPI + PostgreSQL/MongoDB**

#### Responsabilités
1. **Développement de l'API Quiz**
   - Créer et maintenir la base de données de questions
   - Développer les endpoints REST
   - Gérer la logique de validation des réponses
   - Système de catégories et difficultés

2. **Développement de l'API Paiement**
   - Intégration Mobile Money (Orange Money, MTN, etc.)
   - Gestion du portefeuille virtuel
   - Logique de distribution des gains
   - Sécurisation des transactions

3. **Infrastructure**
   - Déploiement de l'API (Heroku, Railway, AWS, etc.)
   - Base de données (PostgreSQL ou MongoDB)
   - Documentation API (Swagger/OpenAPI)
   - Tests unitaires et d'intégration

### Frontend Developers (3 personnes)
**Stack : React Native + Expo + TypeScript + Firebase**

#### Responsabilités
1. **Intégration API**
   - Consommer les endpoints du backend
   - Gestion des états (Context API / Redux)
   - Gestion des erreurs et loading states

2. **Développement UI/UX**
   - Écrans de paris et portefeuille
   - Amélioration du mode compétition
   - Animations et transitions
   - Design responsive

3. **Fonctionnalités**
   - Système de notifications push
   - Gestion du cache et offline mode
   - Optimisation des performances
   - Tests et debugging

#### Répartition Suggérée
- **Dev 1** : Mode compétition + Système de paris
- **Dev 2** : Portefeuille + Paiements + Transactions
- **Dev 3** : Quiz + Classements + Statistiques

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React Native (Expo SDK 54)
- **Langage** : TypeScript
- **Navigation** : React Navigation 7
- **État Global** : Context API + Firebase
- **Backend Services** : Firebase (Auth, Firestore, Storage)
- **UI** : React Native StyleSheet + Lucide Icons
- **Animations** : React Native Reanimated

### Backend
- **Framework** : FastAPI (Python)
- **Base de données** : PostgreSQL ou MongoDB
- **ORM** : SQLAlchemy (PostgreSQL) ou Motor (MongoDB)
- **Authentification** : JWT + Firebase Admin SDK
- **Paiement** : API Mobile Money (à définir selon le pays)
- **Déploiement** : Railway / Render / AWS

### DevOps
- **Versioning** : Git + GitHub
- **CI/CD** : GitHub Actions
- **Documentation** : Swagger (backend) + README (frontend)

---

## 📅 Roadmap Estimée

### Sprint 1 (2-3 semaines) - API Quiz
- Backend : Développement API questions + Base de données
- Frontend : Intégration API + Amélioration écrans quiz

### Sprint 2 (2-3 semaines) - Système de Portefeuille
- Backend : API portefeuille + Logique de paris
- Frontend : Écrans portefeuille + Recharge

### Sprint 3 (2-3 semaines) - Intégration Paiement
- Backend : Intégration Mobile Money
- Frontend : Flow complet de paris avec argent réel

### Sprint 4 (1-2 semaines) - Tests & Optimisation
- Tests end-to-end
- Corrections de bugs
- Optimisation performances

### Sprint 5 (1 semaine) - Lancement MVP
- Déploiement production
- Marketing initial
- Monitoring et feedback

---

## ⚠️ Points d'Attention

### Légal & Conformité
- [ ] Vérifier la légalité des paris en ligne dans les pays cibles
- [ ] Conditions générales d'utilisation (CGU)
- [ ] Politique de confidentialité (RGPD si applicable)
- [ ] Licence de jeu d'argent (si nécessaire)

### Sécurité
- [ ] Chiffrement des transactions
- [ ] Protection contre la fraude
- [ ] Validation côté serveur (jamais côté client)
- [ ] Rate limiting sur l'API
- [ ] Logs d'audit pour les transactions

### Performance
- [ ] Cache des questions fréquentes
- [ ] Optimisation des requêtes DB
- [ ] CDN pour les assets
- [ ] Monitoring (Sentry, LogRocket)

---

## 📞 Communication & Coordination

### Outils Recommandés
- **Communication** : Slack / Discord / WhatsApp
- **Gestion de projet** : Trello / Notion / GitHub Projects
- **Documentation** : Notion / Google Docs
- **Design** : Figma (si besoin de maquettes)

### Réunions
- **Daily Standup** : 15 min/jour (optionnel)
- **Sprint Planning** : Début de chaque sprint
- **Sprint Review** : Fin de chaque sprint
- **Rétrospective** : Après chaque sprint

---

## 🎯 KPIs de Succès

### Techniques
- API response time < 200ms
- App crash rate < 1%
- 99.9% uptime de l'API

### Business
- 1000 utilisateurs inscrits (3 premiers mois)
- 100 paris/jour
- Taux de rétention > 40% (J30)
- Note App Store/Play Store > 4.0

---

## 📚 Ressources

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase Docs](https://firebase.google.com/docs)

### Inspiration Contenu
- Wikipedia (Histoire africaine)
- Sites éducatifs africains
- Livres de culture générale africaine
- Chaînes YouTube éducatives

---

**Dernière mise à jour** : 16 février 2026  
**Version** : 1.0
