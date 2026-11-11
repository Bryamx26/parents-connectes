import { pool } from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, title, body, theme, icon, age_range AS ageRange, created_at AS createdAt FROM posts ORDER BY created_at DESC LIMIT 20'
  );
  return rows;
}
