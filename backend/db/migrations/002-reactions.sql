-- Ajoute les J'aime et commentaires (table reactions) à une base existante, sans effacer les données.
-- À lancer une seule fois, en root (l'utilisateur de l'appli n'a pas les droits DDL) :
--   docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < backend/db/migrations/002-reactions.sql
SET NAMES utf8mb4;

-- J'aime et commentaires sur une activité ou une publication (une seule des deux FK remplie, vérifié par le backend).
-- Pas de CHECK sur activity_id / publication_id : MySQL l'interdit avec ON DELETE CASCADE (erreur 3823).
CREATE TABLE reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NULL,
  publication_id INT NULL,
  type ENUM('like', 'comment') NOT NULL,
  content TEXT NULL,                          -- rempli uniquement pour un commentaire
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 1 pour un like, NULL pour un commentaire : les index uniques ci-dessous ne bloquent que les doubles likes
  is_like TINYINT AS (IF(type = 'like', 1, NULL)) VIRTUAL,
  CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_reactions_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
  CONSTRAINT fk_reactions_publication FOREIGN KEY (publication_id) REFERENCES publications (id) ON DELETE CASCADE,
  CONSTRAINT chk_reactions_content CHECK ((type = 'comment') = (content IS NOT NULL)),
  CONSTRAINT uq_reactions_like_publication UNIQUE (publication_id, user_id, is_like),
  CONSTRAINT uq_reactions_like_activity UNIQUE (activity_id, user_id, is_like),
  INDEX idx_reactions_user (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
