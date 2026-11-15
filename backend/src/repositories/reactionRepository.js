import { pool } from '../config/db.js';

// Réactions d'une publication. La table accepte aussi les activités ; l'API ne les expose pas encore.

export async function like(publicationId, userId) {
  // IGNORE : un second like bute sur uq_reactions_like_publication et ne fait rien
  await pool.execute(
    "INSERT IGNORE INTO reactions (user_id, publication_id, type) VALUES (?, ?, 'like')", [userId, publicationId]);
}

export async function unlike(publicationId, userId) {
  await pool.execute(
    "DELETE FROM reactions WHERE publication_id = ? AND user_id = ? AND type = 'like'", [publicationId, userId]);
}

export async function likeCount(publicationId) {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS n FROM reactions WHERE publication_id = ? AND type = 'like'", [publicationId]);
  return rows[0].n;
}

const COMMENT = `SELECT r.id, r.user_id, u.name AS author_name, r.publication_id, r.content, r.created_at
  FROM reactions r JOIN users u ON u.id = r.user_id`;

export async function listComments(publicationId) {
  const [rows] = await pool.execute(
    `${COMMENT} WHERE r.publication_id = ? AND r.type = 'comment' ORDER BY r.created_at, r.id`, [publicationId]);
  return rows;
}

export async function findComment(id) {
  const [rows] = await pool.execute(`${COMMENT} WHERE r.id = ? AND r.type = 'comment'`, [id]);
  return rows[0] ?? null;
}

export async function createComment(publicationId, userId, content) {
  const [res] = await pool.execute(
    "INSERT INTO reactions (user_id, publication_id, type, content) VALUES (?, ?, 'comment', ?)",
    [userId, publicationId, content]);
  return res.insertId;
}

// Un commentaire appartient à son auteur ; il suit la visibilité de sa publication.
export async function findOwnership(id) {
  const [rows] = await pool.execute(
    `SELECT r.user_id AS owner_id, p.visibility FROM reactions r JOIN publications p ON p.id = r.publication_id
     WHERE r.id = ? AND r.type = 'comment'`, [id]);
  return rows[0] ?? null;
}

export async function remove(id) {
  await pool.execute('DELETE FROM reactions WHERE id = ?', [id]);
}
