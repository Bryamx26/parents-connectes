# Parents Connectés

Site pour les parents d'enfants de 0 à 3 ans (fil d'actualités, conseils, défis de la semaine, quiz, activités). Contenu et interface en français.

Pour tout travail d'interface, suivre @DESIGN.md et utiliser le skill `ux-ui` (`.claude/skills/ux-ui/SKILL.md`).

## Stack

- **Frontend** : React (JavaScript, pas de TypeScript) + Vite, dans `frontend/`. Le CSS vient de `design-system/` (importé dans `src/main.jsx`), les icônes de `assets/icones/` via le composant `Icon`. Pas de framework CSS. Pages dans `src/pages/` (accueil, grille des publications avec modal `/publications/:id`, activités, détail `/activites/:id`, éditeur par étapes `/activites/nouvelle` et `/activites/:id/modifier`, quiz, connexion), routeur maison dans `src/lib/router.jsx` (History API, pas de dépendance), session JWT dans `src/lib/auth.jsx`, appels via `src/lib/api.js`.
- **Backend** : Node.js + Express en couches dans `backend/src/` : `routes/` → `middlewares/` → `controllers/` → `services/` → `repositories/` (le SQL n'existe que dans les repositories, toujours `execute()` avec `?`). Entrées validées par zod (`validators/`), doc OpenAPI dans `docs/openapi.js` (servie sur `/api-docs`) à tenir à jour avec les routes. Détails et variables : `backend/README.md`.
- **Base de données** : MySQL 8.4 via `mysql2/promise` (`backend/src/config/db.js`). Scripts dans `backend/db/` (`01-schema.sql`, `02-grants.sh`, `03-seed.sql` en dev seulement), joués seulement au premier démarrage (volume vide). L'utilisateur de l'appli n'a que SELECT/INSERT/UPDATE/DELETE : pas de DDL depuis le code.
- **Images** : MinIO (API S3), seule la clé de l'objet est en base ; les fichiers passent par `GET /api/images/:id/file`.
- **Tests** : `cd backend && npm test` (node:test + supertest, base MySQL de dev requise).
- **Docker** :
  - Dev : `docker compose up` → front http://localhost:5173 (Vite, rechargement à chaud), API http://localhost:3000 (`node --watch`), MySQL sur 3306. Le front relaie `/api` vers le backend.
  - Prod : `cp .env.example .env` (changer les mots de passe) puis `docker compose -f docker-compose.prod.yml up -d --build`. Derrière Cloudflare Tunnel -> Traefik (réseau externe `cloudflare`, stack `../sandbox/cloudflare`) : site sur `FRONT_HOST` (parents-connectes.bryam.tech, nginx relaie `/api`), API directe sur `API_HOST` (api-parent-connectes.bryam.tech). Aucun port publié ; base et MinIO sur le réseau interne uniquement.
  - Base existante : appliquer les scripts de `backend/db/migrations/` en root (commande en tête de chaque fichier), sans perdre les données.
  - Après une modification des scripts de `backend/db/` : `docker compose down -v` pour recréer la base (efface les données).
