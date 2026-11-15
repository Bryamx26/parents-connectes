import { pool } from '../config/db.js';
import { orderBy, paginate } from '../utils/sql.js';

// password_hash et google_id ne sortent jamais par ces colonnes.
const PUBLIC = 'id, name, email, role, created_at';
export const SORTS = { created_at: 'created_at', name: 'name', email: 'email' };

export async function findById(id, db = pool) {
  const [rows] = await db.execute(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function findCredentialsByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC}, password_hash, google_id FROM users WHERE email = ?`, [email]);
  return rows[0] ?? null;
}

export async function findPasswordHash(id) {
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [id]);
  return rows[0]?.password_hash ?? null;
}

export async function findByGoogleId(googleId) {
  const [rows] = await pool.execute(`SELECT ${PUBLIC} FROM users WHERE google_id = ?`, [googleId]);
  return rows[0] ?? null;
}

export async function list({ page, limit, sort, order }) {
  const p = paginate(page, limit);
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC} FROM users ${orderBy(SORTS, sort, order)} ${p.sql}`, p.params);
  return rows;
}

export async function create({ name, email, passwordHash = null, googleId = null }) {
  const [res] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, google_id) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, googleId]);
  return res.insertId;
}

// Champ à null = inchangé.
export async function update(id, { name = null, email = null, passwordHash = null }) {
  await pool.execute(
    `UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email),
       password_hash = COALESCE(?, password_hash) WHERE id = ?`,
    [name, email, passwordHash, id]);
}

export async function setGoogleId(id, googleId) {
  await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, id]);
}

export async function setRole(id, role) {
  await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}

export async function remove(id, db = pool) {
  await db.execute('DELETE FROM users WHERE id = ?', [id]);
}
