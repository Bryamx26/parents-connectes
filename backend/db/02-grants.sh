# Lancé (sourcé) par l'entrypoint MySQL au premier démarrage, après la création de MYSQL_USER.
# L'image lui donne ALL PRIVILEGES sur la base : on les réduit au strict nécessaire (pas de DDL).
docker_process_sql --database=mysql <<-EOSQL
	REVOKE ALL PRIVILEGES, GRANT OPTION FROM '${MYSQL_USER}'@'%';
	GRANT SELECT, INSERT, UPDATE, DELETE ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
	FLUSH PRIVILEGES;
EOSQL
