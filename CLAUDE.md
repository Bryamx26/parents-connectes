# Parents Connectés

Site pour les parents d'enfants de 0 à 3 ans (fil d'actualités, conseils, défis de la semaine, quiz, activités). Contenu et interface en français.

Pour tout travail d'interface, suivre @DESIGN.md et utiliser le skill `ux-ui` (`.claude/skills/ux-ui/SKILL.md`).

## Stack

- **Frontend** : React (JavaScript, pas de TypeScript) + Vite, dans `frontend/`. Le CSS vient de `design-system/` (importé dans `src/main.jsx`), les icônes de `assets/icones/` via le composant `Icon`. Pas de framework CSS.
- **Backend** : Node.js + Express, architecture MVC dans `backend/src/` : `models/` (requêtes SQL), `controllers/` (logique), `routes/` (URL `/api/...`). La « vue » est le front React, l'API renvoie du JSON.
- **Base de données** : MySQL 8.4 via `mysql2/promise` (`backend/src/config/db.js`). Schéma et données de départ dans `backend/db/init.sql`, joué seulement au premier démarrage (volume vide).
- **Docker** :
  - Dev : `docker compose up` → front http://localhost:5173 (Vite, rechargement à chaud), API http://localhost:3000 (`node --watch`), MySQL sur 3306. Le front relaie `/api` vers le backend.
  - Prod : `cp .env.example .env` (changer les mots de passe) puis `docker compose -f docker-compose.prod.yml up -d --build` → nginx sert le front et relaie `/api` ; seule la porte `HTTP_PORT` est exposée.
  - Après une modification de `init.sql` : `docker compose down -v` pour recréer la base (efface les données).
