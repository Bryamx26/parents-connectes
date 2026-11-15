-- Ajoute les étapes d'activité à une base créée avant leur arrivée (sans effacer les données).
-- À lancer une seule fois, en root (l'utilisateur de l'appli n'a pas les droits DDL) :
--   docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < backend/db/migrations/001-activity-steps.sql
SET NAMES utf8mb4;

CREATE TABLE activity_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_steps_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
  INDEX idx_activity_steps_activity (activity_id, position)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

ALTER TABLE images
  ADD COLUMN step_id INT NULL AFTER publication_id,
  ADD CONSTRAINT fk_images_step FOREIGN KEY (step_id) REFERENCES activity_steps (id) ON DELETE RESTRICT,
  ADD INDEX idx_images_step (step_id);

ALTER TABLE images DROP CHECK chk_images_parent;
ALTER TABLE images ADD CONSTRAINT chk_images_parent
  CHECK ((activity_id IS NOT NULL) + (publication_id IS NOT NULL) + (step_id IS NOT NULL) = 1);
