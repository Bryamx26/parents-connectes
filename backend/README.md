# API Parents Connectés

API REST Node.js + Express, base MySQL 8 (InnoDB, utf8mb4), images dans MinIO (API S3). Documentation interactive sur **http://localhost:3000/api-docs** (OpenAPI 3, JSON sur `/api-docs.json`).

## Installation et lancement

Tout passe par Docker Compose, à la racine du dépôt.

```bash
# Développement : MySQL + MinIO + API (node --watch) + front (Vite)
docker compose up
```

- API : http://localhost:3000/api · docs : http://localhost:3000/api-docs
- Front : http://localhost:5173 · console MinIO : http://localhost:9001
- Comptes de test (`db/03-seed.sql`) : `admin@parents-connectes.test` / `Admin123!`, `camille@exemple.test` et `karim@exemple.test` / `Parent123!`

Les scripts de `db/` ne sont joués qu'au **premier démarrage** (volume vide). Après une modification : `docker compose down -v` (efface les données) puis `docker compose up`.

```bash
# Production : cp .env.example .env, changer toutes les valeurs, puis
docker compose -f docker-compose.prod.yml up -d --build
```

En production (Cloudflare Tunnel -> Traefik, réseau externe `cloudflare`), les données de test ne sont pas chargées et aucun port n'est publié : Traefik route `FRONT_HOST` vers nginx (qui relaie `/api`) et `API_HOST` directement vers l'API (documentation sur `https://API_HOST/api-docs`). Le compte admin se crée avec `ADMINMAIL` et `ADMINPASSWORD` dans `.env` : à chaque démarrage, l'API crée ce compte ou le repasse `admin` avec ce mot de passe.

## Scripts SQL (`db/`)

| Fichier | Rôle |
|---|---|
| `01-schema.sql` | Les 8 tables du MLD, clés, index, contraintes CHECK |
| `02-grants.sh` | Réduit l'utilisateur de l'application à `SELECT, INSERT, UPDATE, DELETE` sur la base |
| `03-seed.sql` | Données de test (dev uniquement) |
| `migrations/001-activity-steps.sql` | Ajoute les étapes d'activité à une base créée avant elles (à lancer une fois en root, la commande est en tête du fichier) |
| `migrations/002-reactions.sql` | Ajoute les J'aime et commentaires (table `reactions`) à une base existante (une fois, en root) |

Choix notables :
- Une image appartient soit à une activité, soit à une publication (`chk_images_parent`). MySQL interdit `ON DELETE CASCADE` sur une colonne utilisée dans un `CHECK` : les FK des images sont en `RESTRICT` et le backend supprime les images (et leurs fichiers MinIO) dans une transaction avant leur parent.
- Supprimer un utilisateur supprime ses activités, publications, images et résultats. Un admin auteur de quiz ne peut pas être supprimé tant que ses quiz existent (409).
- Les J'aime et commentaires (`reactions`) partent avec leur publication, leur activité ou leur auteur. Un seul J'aime par utilisateur et par contenu (index unique sur la colonne virtuelle `is_like`).
- Une activité supprimée laisse ses publications, avec `activity_id` à `NULL`.
- Une activité a des étapes ordonnées (`activity_steps`, supprimées avec elle). Une image appartient à exactement une activité, une publication ou une étape. Limites : 50 étapes par activité, 10 photos par activité, publication ou étape.

## Variables d'environnement

| Variable | Obligatoire | Rôle |
|---|---|---|
| `DB_HOST`, `DB_PORT` (3306), `DB_NAME`, `DB_USER`, `DB_PASSWORD` | oui | Connexion MySQL (utilisateur limité, jamais root) |
| `JWT_SECRET` | oui | Signature des JWT (HS256), 32 caractères minimum |
| `JWT_EXPIRES_IN` | non (`1h`) | Durée de validité du jeton |
| `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | oui | Accès MinIO |
| `S3_BUCKET` (`parents-connectes`), `S3_REGION` (`us-east-1`) | non | Bucket (créé au démarrage s'il manque) |
| `GOOGLE_CLIENT_ID` | non | Active `POST /api/auth/google` (sinon 503) |
| `CORS_ORIGIN` | non | Origines autorisées, séparées par des virgules (vide = même domaine) |
| `TRUST_PROXY` | non | Proxys de confiance pour retrouver l'IP du visiteur : un nombre (`1`) ou des sous-réseaux (`loopback,linklocal,uniquelocal`, valeur de la prod) |
| `AUTH_RATE_LIMIT` | non (`20`) | Requêtes d'authentification autorisées par IP et par 15 min |
| `PORT` | non (`3000`) | Port HTTP |

Côté Compose (`.env` à la racine) : `DB_ROOT_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_IMAGE`, et en production `FRONT_HOST` / `API_HOST` (domaines routés par Traefik).

## Architecture

```
src/
  routes/index.js      URL → middlewares → contrôleur (le rôle requis se lit ici)
  middlewares/         authenticate, authorize, isOwnerOrAdmin, validate (zod), upload (multer), errorHandler
  controllers/         lecture de req.valid, code HTTP
  services/            règles métier (visibilité, score, cascades, MinIO)
  repositories/        tout le SQL, uniquement des requêtes préparées (execute + ?)
  validators/          schémas zod de chaque entrée
  docs/openapi.js      spécification servie sur /api-docs
```

## Sécurité

- Requêtes préparées partout ; tris dynamiques par liste blanche de colonnes ; `multipleStatements` désactivé.
- Mots de passe hachés avec argon2id, jamais renvoyés. Le JWT ne porte que l'identifiant : le rôle est relu en base à chaque requête.
- Un contenu `private` (et ses images) n'est visible que par son auteur et l'admin ; un tiers reçoit 404.
- Les fichiers ne sont jamais exposés directement par MinIO : `GET /api/images/:id/file` revérifie les droits à chaque lecture.
- Uploads : un fichier, 5 Mo max, JPEG/PNG/WebP vérifiés par leur signature binaire.
- helmet, CORS fermé par défaut, limite de requêtes sur `/api/auth/*`, corps JSON limité à 100 ko.
- Erreurs centralisées : le client ne reçoit jamais de stack trace ni de message SQL.

## Tests

Les tests (`tests/access.test.js`) prouvent les règles d'accès : visiteur sans droit d'écriture, ressource d'un autre non modifiable, contenu privé illisible par un tiers, plus les entrées malveillantes et le quiz. Ils tournent contre une vraie base MySQL, créent leurs propres données et les suppriment.

```bash
docker compose up -d db          # base de dev sur localhost:3306
cd backend && npm test           # configuration dans .env.test
# ou dans le conteneur : docker compose exec backend npm test
```
