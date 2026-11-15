-- Schéma de Parents Connectés, d'après le MLD (base_de_donnees_parents-connectes_corrige.excalidraw).
-- Joué par MySQL au premier démarrage (volume vide), dans la base créée par MYSQL_DATABASE.
SET NAMES utf8mb4;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,           -- NULL pour un compte Google
  google_id VARCHAR(255) NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_google_id UNIQUE (google_id),
  CONSTRAINT chk_users_auth CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  age_min_months TINYINT UNSIGNED NOT NULL,
  age_max_months TINYINT UNSIGNED NOT NULL,
  duration_minutes SMALLINT UNSIGNED NULL,
  material TEXT NULL,
  visibility ENUM('public', 'private') NOT NULL DEFAULT 'public',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_activities_ages CHECK (age_min_months <= age_max_months AND age_max_months <= 36),
  INDEX idx_activities_user (user_id),
  INDEX idx_activities_ages (age_min_months, age_max_months)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_id INT NULL,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  visibility ENUM('public', 'private') NOT NULL DEFAULT 'public',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_publications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  -- l'activité supprimée, la publication reste sans lien
  CONSTRAINT fk_publications_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE SET NULL,
  INDEX idx_publications_user (user_id),
  INDEX idx_publications_activity (activity_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Étapes d'un tutoriel d'activité, dans l'ordre de position.
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

-- MySQL interdit ON DELETE CASCADE / SET NULL sur une colonne utilisée dans un CHECK (erreur 3823) :
-- les FK d'images sont donc en RESTRICT et le backend supprime les images (et leurs objets MinIO)
-- avant leur activité, leur étape, leur publication ou leur utilisateur, dans une transaction.
CREATE TABLE images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NULL,
  publication_id INT NULL,
  step_id INT NULL,
  object_key VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255) NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_images_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE RESTRICT,
  CONSTRAINT fk_images_publication FOREIGN KEY (publication_id) REFERENCES publications (id) ON DELETE RESTRICT,
  CONSTRAINT fk_images_step FOREIGN KEY (step_id) REFERENCES activity_steps (id) ON DELETE RESTRICT,
  CONSTRAINT uq_images_object_key UNIQUE (object_key),
  -- une activité, une publication ou une étape : exactement une des trois
  CONSTRAINT chk_images_parent CHECK ((activity_id IS NOT NULL) + (publication_id IS NOT NULL) + (step_id IS NOT NULL) = 1),
  INDEX idx_images_activity (activity_id),
  INDEX idx_images_publication (publication_id),
  INDEX idx_images_step (step_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_by INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- un admin qui a créé des quiz ne peut pas être supprimé tant qu'ils existent
  CONSTRAINT fk_quizzes_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
  INDEX idx_quizzes_created_by (created_by)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
  INDEX idx_questions_quiz (quiz_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE choices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_choices_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
  INDEX idx_choices_question (question_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Pas de UNIQUE (user_id, quiz_id) : une ligne par tentative.
CREATE TABLE quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score SMALLINT UNSIGNED NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_results_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_results_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE,
  INDEX idx_quiz_results_user (user_id),
  INDEX idx_quiz_results_quiz (quiz_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

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
