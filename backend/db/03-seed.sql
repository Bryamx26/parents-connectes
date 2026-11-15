-- Données de test (développement uniquement, jamais en production).
-- Comptes : admin@parents-connectes.test / Admin123!
--           camille@exemple.test et karim@exemple.test / Parent123!
SET NAMES utf8mb4;

INSERT INTO users (id, name, email, password_hash, role) VALUES
  (1, 'Équipe Parents Connectés', 'admin@parents-connectes.test',
   '$argon2id$v=19$m=65536,t=3,p=4$ELHMOynpwBgNiQ5wBSgfXw$57KX1FjjWI/ipop9dnTYU6Tt009RtqppCrm3RqsCZG0', 'admin'),
  (2, 'Camille', 'camille@exemple.test',
   '$argon2id$v=19$m=65536,t=3,p=4$xCTRjNVkV6V6rqDZ54absQ$7vhGSHfm08s0aENWpAW5WwPIEhbKnt3vpzSI+ubkhs0', 'user'),
  (3, 'Karim', 'karim@exemple.test',
   '$argon2id$v=19$m=65536,t=3,p=4$xCTRjNVkV6V6rqDZ54absQ$7vhGSHfm08s0aENWpAW5WwPIEhbKnt3vpzSI+ubkhs0', 'user');

INSERT INTO activities (id, user_id, title, description, age_min_months, age_max_months, duration_minutes, material, visibility) VALUES
  (1, 1, 'Tour de blocs', 'Empilez des blocs ensemble puis laissez votre enfant les faire tomber : il découvre la cause et l''effet.', 12, 36, 15, 'Blocs en bois ou en mousse', 'public'),
  (2, 2, 'Panier aux trésors', 'Remplissez un panier d''objets du quotidien aux textures variées et laissez votre bébé explorer, sous votre regard.', 6, 12, 10, 'Panier, cuillère en bois, foulard, balle souple', 'public'),
  (3, 2, 'Lecture du soir', 'Un petit livre cartonné, toujours au même moment : un repère rassurant avant le coucher.', 0, 36, 10, 'Livre cartonné', 'private'),
  (4, 3, 'Gribouillages géants', 'Scotchez une grande feuille au sol et dessinez côte à côte avec de gros crayons.', 18, 36, 20, 'Grande feuille, crayons épais', 'public'),
  (5, 3, 'Fabriquer un bâton de pluie', 'Un instrument qui fait le bruit de la pluie, à fabriquer en 15 minutes puis à secouer ensemble.', 12, 36, 15, 'Rouleau d''essuie-tout, papier aluminium, riz, scotch, gommettes', 'public');

INSERT INTO activity_steps (activity_id, position, title, content) VALUES
  (5, 1, 'Préparer le rouleau', 'Fermez une extrémité du rouleau avec du papier et du scotch.'),
  (5, 2, 'Ajouter la spirale', 'Froissez une longue bande de papier aluminium en forme de serpentin et glissez-la dans le rouleau : c''est elle qui ralentit les grains.'),
  (5, 3, 'Remplir et décorer', 'Versez deux poignées de riz, fermez l''autre extrémité, puis laissez votre enfant décorer avec des gommettes.');

INSERT INTO publications (id, user_id, activity_id, title, content, visibility, created_at) VALUES
  (1, 1, NULL, 'Une idée d''activité sans écran', 'Remplacez 20 minutes d''écran par un dessin, un puzzle ou une construction en blocs.', 'public', NOW() - INTERVAL 2 DAY),
  (2, 1, NULL, 'Un moment calme avant le coucher', 'Privilégiez une histoire, une chanson ou un câlin avant d''aller dormir.', 'public', NOW() - INTERVAL 1 DAY),
  (3, 2, 2, 'Notre panier aux trésors', 'La cuillère en bois a eu beaucoup de succès ! Nous recommencerons demain.', 'public', NOW()),
  (4, 2, 3, 'Notes pour moi', 'Essayer le livre sur les animaux la semaine prochaine.', 'private', NOW());

INSERT INTO quizzes (id, created_by, title, description, is_published) VALUES
  (1, 1, 'Le sommeil des tout-petits', 'Trois questions pour faire le point, sans jugement.', TRUE);

INSERT INTO questions (id, quiz_id, label, position) VALUES
  (1, 1, 'Combien d''heures dort en moyenne un enfant de 1 à 2 ans par 24 h ?', 1),
  (2, 1, 'Qu''est-ce qui aide le plus à l''endormissement ?', 2),
  (3, 1, 'À partir de quel âge la plupart des enfants ne font plus qu''une sieste ?', 3);

INSERT INTO choices (question_id, label, is_correct) VALUES
  (1, '8 à 9 heures', FALSE), (1, '11 à 14 heures', TRUE), (1, '16 à 18 heures', FALSE),
  (2, 'Un rituel calme et régulier', TRUE), (2, 'Un dessin animé', FALSE), (2, 'Un jeu très animé', FALSE),
  (3, 'Vers 6 mois', FALSE), (3, 'Vers 15 à 18 mois', TRUE), (3, 'Vers 3 ans', FALSE);

INSERT INTO quiz_results (user_id, quiz_id, score) VALUES (2, 1, 2);
