// Aides pour construire des requêtes dynamiques sans jamais interpoler une valeur du client.

// Renvoie le fragment ORDER BY à partir d'une liste blanche { nomPublic: 'colonne SQL' }.
// sort et order ont déjà été validés par zod contre ces mêmes listes ; on revérifie ici par sécurité.
export function orderBy(whitelist, sort, order) {
  const column = whitelist[sort];
  if (!column) throw new Error(`Tri non autorisé : ${sort}`);
  return `ORDER BY ${column} ${order === 'asc' ? 'ASC' : 'DESC'}, id DESC`;
}

// mysql2 + execute() exige LIMIT/OFFSET en chaînes avec MySQL 8.0.22+.
export function paginate(page, limit) {
  return { sql: 'LIMIT ? OFFSET ?', params: [String(limit), String((page - 1) * limit)] };
}

// Condition de visibilité d'un contenu pour un lecteur (visiteur, auteur ou admin).
export function visibleTo(alias, viewer) {
  return {
    sql: `(${alias}.visibility = 'public' OR ${alias}.user_id = ? OR ? = 1)`,
    params: [viewer?.id ?? 0, viewer?.role === 'admin' ? 1 : 0],
  };
}
