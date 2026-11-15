# Image MySQL avec le schéma et les droits : la prod démarre sans le code source.
# Scripts joués seulement au premier démarrage (volume vide). Pas de 03-seed.sql (comptes de test).
FROM mysql:8.4
COPY 01-schema.sql 02-grants.sh /docker-entrypoint-initdb.d/
