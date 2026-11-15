import { pool } from '../config/db.js';
import { paginate } from '../utils/sql.js';

const COLUMNS = 'r.id, r.user_id, r.quiz_id, q.title AS quiz_title, r.score, r.completed_at';
const FROM = 'FROM quiz_results r JOIN quizzes q ON q.id = r.quiz_id';

export async function list({ userId, quizId, page, limit }) {
  const where = ['1 = 1'];
  const params = [];
  if (userId !== undefined) { where.push('r.user_id = ?'); params.push(userId); }
  if (quizId !== undefined) { where.push('r.quiz_id = ?'); params.push(quizId); }
  const p = paginate(page, limit);
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} ${FROM} WHERE ${where.join(' AND ')} ORDER BY r.completed_at DESC, r.id DESC ${p.sql}`,
    [...params, ...p.params]);
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${COLUMNS} ${FROM} WHERE r.id = ?`, [id]);
  return rows[0] ?? null;
}

export async function findOwnership(id) {
  const [rows] = await pool.execute('SELECT user_id AS owner_id FROM quiz_results WHERE id = ?', [id]);
  return rows[0] ? { ...rows[0], visibility: 'private' } : null;
}

export async function create(userId, quizId, score) {
  const [res] = await pool.execute(
    'INSERT INTO quiz_results (user_id, quiz_id, score) VALUES (?, ?, ?)', [userId, quizId, score]);
  return res.insertId;
}

export async function remove(id) {
  await pool.execute('DELETE FROM quiz_results WHERE id = ?', [id]);
}
