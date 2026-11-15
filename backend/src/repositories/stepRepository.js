import { pool } from '../config/db.js';

const COLUMNS = 'id, activity_id, position, title, content, created_at';

export async function listByActivity(activityId) {
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} FROM activity_steps WHERE activity_id = ? ORDER BY position, id`, [activityId]);
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM activity_steps WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

// Une étape appartient à l'auteur de son activité et en suit la visibilité.
export async function findOwnership(id) {
  const [rows] = await pool.execute(
    `SELECT a.user_id AS owner_id, a.visibility, s.activity_id
     FROM activity_steps s JOIN activities a ON a.id = s.activity_id WHERE s.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function stats(activityId) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS count, COALESCE(MAX(position), 0) + 1 AS next FROM activity_steps WHERE activity_id = ?',
    [activityId]);
  return rows[0];
}

export async function create(activityId, { title, content }, position) {
  const [res] = await pool.execute(
    'INSERT INTO activity_steps (activity_id, position, title, content) VALUES (?, ?, ?, ?)',
    [activityId, position, title, content]);
  return res.insertId;
}

export async function update(id, { title = null, content = null }) {
  await pool.execute(
    'UPDATE activity_steps SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE id = ?',
    [title, content, id]);
}

export async function remove(id, db) {
  await db.execute('DELETE FROM activity_steps WHERE id = ?', [id]);
}

export async function setPosition(id, activityId, position, db) {
  await db.execute('UPDATE activity_steps SET position = ? WHERE id = ? AND activity_id = ?', [position, id, activityId]);
}
