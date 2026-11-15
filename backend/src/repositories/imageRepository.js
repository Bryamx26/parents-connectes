import { pool } from '../config/db.js';

const COLUMNS = 'i.id, i.activity_id, i.publication_id, i.step_id, i.object_key, i.alt_text, i.position, i.created_at';

// L'image hérite du propriétaire et de la visibilité de son parent (une étape : de son activité).
export async function findWithParent(id) {
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS}, COALESCE(a.user_id, p.user_id, sa.user_id) AS owner_id,
       COALESCE(a.visibility, p.visibility, sa.visibility) AS visibility
     FROM images i
     LEFT JOIN activities a ON a.id = i.activity_id
     LEFT JOIN publications p ON p.id = i.publication_id
     LEFT JOIN activity_steps s ON s.id = i.step_id
     LEFT JOIN activities sa ON sa.id = s.activity_id
     WHERE i.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function listByActivity(activityId) {
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} FROM images i WHERE i.activity_id = ? ORDER BY i.position, i.id`, [activityId]);
  return rows;
}

export async function listByPublication(publicationId) {
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} FROM images i WHERE i.publication_id = ? ORDER BY i.position, i.id`, [publicationId]);
  return rows;
}

// Photos des étapes d'une activité, en une requête (regroupées ensuite par step_id).
export async function listByActivitySteps(activityId) {
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} FROM images i JOIN activity_steps s ON s.id = i.step_id
     WHERE s.activity_id = ? ORDER BY i.position, i.id`, [activityId]);
  return rows;
}

export async function create({ activityId = null, publicationId = null, stepId = null, objectKey, altText = null, position }) {
  const [res] = await pool.execute(
    `INSERT INTO images (activity_id, publication_id, step_id, object_key, alt_text, position)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [activityId, publicationId, stepId, objectKey, altText, position]);
  return res.insertId;
}

// Nombre de photos du parent et prochaine position libre.
export async function stats({ activityId = null, publicationId = null, stepId = null }) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count, COALESCE(MAX(position), 0) + 1 AS next FROM images
     WHERE activity_id <=> ? AND publication_id <=> ? AND step_id <=> ?`,
    [activityId, publicationId, stepId]);
  return rows[0];
}

export async function update(id, { altText = null, position = null }) {
  await pool.execute(
    'UPDATE images SET alt_text = COALESCE(?, alt_text), position = COALESCE(?, position) WHERE id = ?',
    [altText, position, id]);
}

export async function remove(id) {
  await pool.execute('DELETE FROM images WHERE id = ?', [id]);
}

// Suppressions en cascade faites à la main (voir 01-schema.sql) ; renvoient les clés MinIO à effacer.
// Photos de l'activité et de toutes ses étapes.
export async function removeByActivity(activityId, db) {
  const where = 'activity_id = ? OR step_id IN (SELECT id FROM activity_steps WHERE activity_id = ?)';
  const [rows] = await db.execute(`SELECT object_key FROM images WHERE ${where}`, [activityId, activityId]);
  await db.execute(`DELETE FROM images WHERE ${where}`, [activityId, activityId]);
  return rows.map((r) => r.object_key);
}

export async function removeByStep(stepId, db) {
  const [rows] = await db.execute('SELECT object_key FROM images WHERE step_id = ?', [stepId]);
  await db.execute('DELETE FROM images WHERE step_id = ?', [stepId]);
  return rows.map((r) => r.object_key);
}

export async function removeByPublication(publicationId, db) {
  const [rows] = await db.execute('SELECT object_key FROM images WHERE publication_id = ?', [publicationId]);
  await db.execute('DELETE FROM images WHERE publication_id = ?', [publicationId]);
  return rows.map((r) => r.object_key);
}

export async function removeByUser(userId, db) {
  const owned = `activity_id IN (SELECT id FROM activities WHERE user_id = ?)
    OR publication_id IN (SELECT id FROM publications WHERE user_id = ?)
    OR step_id IN (SELECT s.id FROM activity_steps s JOIN activities a ON a.id = s.activity_id WHERE a.user_id = ?)`;
  const [rows] = await db.execute(`SELECT object_key FROM images WHERE ${owned}`, [userId, userId, userId]);
  await db.execute(`DELETE FROM images WHERE ${owned}`, [userId, userId, userId]);
  return rows.map((r) => r.object_key);
}
