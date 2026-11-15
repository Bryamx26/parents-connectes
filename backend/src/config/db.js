import mysql from 'mysql2/promise';
import { env } from './env.js';

// multipleStatements reste à false (valeur par défaut) : une requête = une instruction.
export const pool = mysql.createPool({
  ...env.db,
  charset: 'utf8mb4',
  connectionLimit: 10,
  multipleStatements: false,
  timezone: 'Z',
  // BOOLEAN = TINYINT(1) : renvoyé en true/false plutôt qu'en 1/0
  typeCast(field, next) {
    if (field.type === 'TINY' && field.length === 1) return field.string() === '1';
    return next();
  },
});

// Exécute fn(conn) dans une transaction ; annule tout en cas d'erreur.
export async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
