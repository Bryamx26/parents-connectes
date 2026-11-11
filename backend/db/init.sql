-- Exécuté par MySQL au premier démarrage uniquement (volume vide).
SET NAMES utf8mb4;
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  theme ENUM('pink', 'sky', 'green', 'yellow', 'lavender') NOT NULL DEFAULT 'pink',
  icon VARCHAR(40) NOT NULL DEFAULT 'family',
  age_range VARCHAR(20) NOT NULL DEFAULT '0–3 ans',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET = utf8mb4;

INSERT INTO posts (title, body, theme, icon, age_range, created_at) VALUES
  ('Une idée d''activité sans écran', 'Remplacez 20 minutes d''écran par un dessin, un puzzle ou une construction en blocs.', 'green', 'puzzle', '1–3 ans', NOW() - INTERVAL 2 DAY),
  ('Attention aux écrans avant le coucher', 'Privilégiez une histoire, une chanson ou un moment calme avant d''aller dormir.', 'sky', 'moon', '0–3 ans', NOW() - INTERVAL 1 DAY),
  ('Les écrans ne remplacent pas les moments partagés', 'Entre 0 et 3 ans, votre enfant apprend en jouant, en bougeant et en échangeant avec vous.', 'pink', 'family', '0–3 ans', NOW());
