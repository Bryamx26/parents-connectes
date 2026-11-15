import { pool } from '../config/db.js';
import { orderBy, paginate, visibleTo } from '../utils/sql.js';

const COLUMNS = `p.id, p.user_id, u.name AS author_name, p.activity_id, p.title, p.content,
  p.visibility, p.created_at, p.updated_at,
  -- première image, pour la carte en liste
  (SELECT i.id FROM images i WHERE i.publication_id = p.id ORDER BY i.position, i.id LIMIT 1) AS cover_image_id,
  (SELECT i.alt_text FROM images i WHERE i.publication_id = p.id ORDER BY i.position, i.id LIMIT 1) AS cover_alt,
  (SELECT COUNT(*) FROM reactions r WHERE r.publication_id = p.id AND r.type = 'like') AS like_count,
  (SELECT COUNT(*) FROM reactions r WHERE r.publication_id = p.id AND r.type = 'comment') AS comment_count,
  -- le seul ? de COLUMNS : l'id du lecteur (0 pour un visiteur)
  EXISTS (SELECT 1 FROM reactions r WHERE r.publication_id = p.id AND r.type = 'like' AND r.user_id = ?) AS liked`;
const FROM = 'FROM publications p JOIN users u ON u.id = p.user_id';
export const SORTS = { created_at: 'p.created_at', title: 'p.title' };

export async function list({ viewer, activityId, mine, sort, order, page, limit }) {
  const vis = visibleTo('p', viewer);
  const where = [vis.sql];
  const params = [viewer?.id ?? 0, ...vis.params];
  if (mine) { where.push('p.user_id = ?'); params.push(viewer.id); }
  if (activityId !== undefined) { where.push('p.activity_id = ?'); params.push(activityId); }
  const pg = paginate(page, limit);
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} ${FROM} WHERE ${where.join(' AND ')} ${orderBy(SORTS, sort, order)} ${pg.sql}`,
    [...params, ...pg.params]);
  return rows;
}

export async function findVisibleById(id, viewer) {
  const vis = visibleTo('p', viewer);
  const [rows] = await pool.execute(
    `SELECT ${COLUMNS} ${FROM} WHERE p.id = ? AND ${vis.sql}`, [viewer?.id ?? 0, id, ...vis.params]);
  return rows[0] ?? null;
}

export async function findOwnership(id) {
  const [rows] = await pool.execute(
    'SELECT user_id AS owner_id, visibility FROM publications WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function findRaw(id) {
  const [rows] = await pool.execute('SELECT * FROM publications WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function create(userId, p) {
  const [res] = await pool.execute(
    'INSERT INTO publications (user_id, activity_id, title, content, visibility) VALUES (?, ?, ?, ?, ?)',
    [userId, p.activity_id ?? null, p.title, p.content, p.visibility]);
  return res.insertId;
}

export async function update(id, p) {
  await pool.execute(
    'UPDATE publications SET activity_id = ?, title = ?, content = ?, visibility = ? WHERE id = ?',
    [p.activity_id ?? null, p.title, p.content, p.visibility, id]);
}

export async function remove(id, db = pool) {
  await db.execute('DELETE FROM publications WHERE id = ?', [id]);
}
