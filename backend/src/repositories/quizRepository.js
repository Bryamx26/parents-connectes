import { pool } from '../config/db.js';
import { paginate } from '../utils/sql.js';

const QUIZ = 'id, created_by, title, description, is_published, created_at';

export async function listQuizzes({ includeUnpublished, page, limit }) {
  const p = paginate(page, limit);
  const [rows] = await pool.execute(
    `SELECT ${QUIZ} FROM quizzes WHERE (is_published = TRUE OR ? = 1)
     ORDER BY created_at DESC, id DESC ${p.sql}`, [includeUnpublished ? 1 : 0, ...p.params]);
  return rows;
}

export async function findQuiz(id) {
  const [rows] = await pool.execute(`SELECT ${QUIZ} FROM quizzes WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function createQuiz(userId, q) {
  const [res] = await pool.execute(
    'INSERT INTO quizzes (created_by, title, description, is_published) VALUES (?, ?, ?, ?)',
    [userId, q.title, q.description ?? null, q.is_published ?? false]);
  return res.insertId;
}

export async function updateQuiz(id, q) {
  await pool.execute(
    `UPDATE quizzes SET title = COALESCE(?, title), description = COALESCE(?, description),
       is_published = COALESCE(?, is_published) WHERE id = ?`,
    [q.title ?? null, q.description ?? null, q.is_published ?? null, id]);
}

export async function removeQuiz(id) {
  await pool.execute('DELETE FROM quizzes WHERE id = ?', [id]);
}

export async function listQuestions(quizId) {
  const [rows] = await pool.execute(
    'SELECT id, quiz_id, label, position FROM questions WHERE quiz_id = ? ORDER BY position, id', [quizId]);
  return rows;
}

export async function listChoicesOfQuiz(quizId) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.question_id, c.label, c.is_correct FROM choices c
     JOIN questions q ON q.id = c.question_id WHERE q.quiz_id = ? ORDER BY c.id`, [quizId]);
  return rows;
}

export async function findQuestion(id) {
  const [rows] = await pool.execute('SELECT id, quiz_id, label, position FROM questions WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function createQuestion(quizId, q) {
  const [res] = await pool.execute(
    'INSERT INTO questions (quiz_id, label, position) VALUES (?, ?, ?)', [quizId, q.label, q.position]);
  return res.insertId;
}

export async function nextQuestionPosition(quizId) {
  const [rows] = await pool.execute(
    'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM questions WHERE quiz_id = ?', [quizId]);
  return rows[0].next;
}

export async function updateQuestion(id, q) {
  await pool.execute(
    'UPDATE questions SET label = COALESCE(?, label), position = COALESCE(?, position) WHERE id = ?',
    [q.label ?? null, q.position ?? null, id]);
}

export async function removeQuestion(id) {
  await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
}

export async function findChoice(id) {
  const [rows] = await pool.execute('SELECT id, question_id, label, is_correct FROM choices WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function createChoice(questionId, c) {
  const [res] = await pool.execute(
    'INSERT INTO choices (question_id, label, is_correct) VALUES (?, ?, ?)',
    [questionId, c.label, c.is_correct ?? false]);
  return res.insertId;
}

export async function updateChoice(id, c) {
  await pool.execute(
    'UPDATE choices SET label = COALESCE(?, label), is_correct = COALESCE(?, is_correct) WHERE id = ?',
    [c.label ?? null, c.is_correct ?? null, id]);
}

export async function removeChoice(id) {
  await pool.execute('DELETE FROM choices WHERE id = ?', [id]);
}
