import { pool } from '../config/db.js';
import { orderBy, paginate, visibleTo } from '../utils/sql.js';

const COLUMNS = `a.id, a.user_id, u.name AS author_name, a.title, a.description, a.age_min_months,
  a.age_max_months, a.duration_minutes, a.material, a.visibility, a.created_at, a.updated_at,
  -- première image, pour la carte en liste
  (SELECT i.id FROM images i WHERE i.activity_id = a.id ORDER BY i.position, i.id LIMIT 1) AS cover_image_id,
  (SELECT i.alt_text FROM images i WHERE i.activity_id = a.id ORDER BY i.position, i.id LIMIT 1) AS cover_alt`;
const FROM = 'FROM activities a JOIN users u ON u.id = a.user_id';
export const SORTS = { created_at: 'a.created_at', title: 'a.title', age_min_months: 'a.age_min_months' };

export async function list({ viewer, ageMonths, ageMin, ageMax, mine, sort, order, page, limit }) {
  const vis = visibleTo('a', viewer);
  const where = [vis.sql];
  const params = [...vis.params];
  if (mine) { where.push('a.user_id = ?'); params.push(viewer.id); }
  if (ageMonths !== undefined) {
    where.push('a.age_min_months <= ? AND a.age_max_months >= ?');
    params.push(ageMonths, ageMonths);
  }
  // chevauchement entre la tranche demandée et celle de l'activité
  if (ageMin !== undefined) { where.push('a.age_max_months >= ?'); params.push(ageMin); }
  if (ageMax !== undefined) { where.push('a.age_min_months <= ?'); params.push(ageMax); }
  const p = paginate(page, limit);
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} ${FROM} WHERE ${where.join(' AND ')} ${orderBy(SORTS, sort, order)} ${p.sql}`,
    [...params, ...p.params]);
  return rows;
}

export async function findVisibleById(id, viewer) {
  const vis = visibleTo('a', viewer);
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} ${FROM} WHERE a.id = ? AND ${vis.sql}`, [id, ...vis.params]);
  return rows[0] ?? null;
}

export async function findOwnership(id) {
  const [rows] = await pool.execute(
    'SELECT user_id AS owner_id, visibility FROM activities WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function findRaw(id) {
  const [rows] = await pool.execute('SELECT * FROM activities WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function create(userId, a) {
  const [res] = await pool.execute(
    `INSERT INTO activities (user_id, title, description, age_min_months, age_max_months,
       duration_minutes, material, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, a.title, a.description, a.age_min_months, a.age_max_months,
      a.duration_minutes ?? null, a.material ?? null, a.visibility]);
  return res.insertId;
}

export async function update(id, a) {
  await pool.execute(
    `UPDATE activities SET title = ?, description = ?, age_min_months = ?, age_max_months = ?,
       duration_minutes = ?, material = ?, visibility = ? WHERE id = ?`,
    [a.title, a.description, a.age_min_months, a.age_max_months,
      a.duration_minutes ?? null, a.material ?? null, a.visibility, id]);
}

export async function remove(id, db = pool) {
  await db.execute('DELETE FROM activities WHERE id = ?', [id]);
}
