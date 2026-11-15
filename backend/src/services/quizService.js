import * as quizzes from '../repositories/quizRepository.js';
import { notFound } from '../utils/httpError.js';

const isAdmin = (viewer) => viewer?.role === 'admin';

export const list = (viewer, q) =>
  quizzes.listQuizzes({ includeUnpublished: isAdmin(viewer), page: q.page, limit: q.limit });

// Quiz publié (ou admin), sinon 404.
export async function findVisible(id, viewer) {
  const quiz = await quizzes.findQuiz(id);
  if (!quiz || (!quiz.is_published && !isAdmin(viewer))) throw notFound();
  return quiz;
}

// is_correct n'est envoyé qu'à l'admin : les réponses ne doivent pas fuiter.
export async function get(id, viewer) {
  const quiz = await findVisible(id, viewer);
  const choices = await quizzes.listChoicesOfQuiz(id);
  const questions = (await quizzes.listQuestions(id)).map((q) => ({
    ...q,
    choices: choices.filter((c) => c.question_id === q.id)
      .map(({ is_correct, ...c }) => (isAdmin(viewer) ? { ...c, is_correct } : c)),
  }));
  return { ...quiz, questions };
}

async function mustExist(find, id) {
  const row = await find(id);
  if (!row) throw notFound();
  return row;
}

export async function create(user, body) {
  return quizzes.findQuiz(await quizzes.createQuiz(user.id, body));
}

export async function update(id, patch) {
  await mustExist(quizzes.findQuiz, id);
  await quizzes.updateQuiz(id, patch);
  return quizzes.findQuiz(id);
}

export async function remove(id) {
  await mustExist(quizzes.findQuiz, id);
  await quizzes.removeQuiz(id);
}

export async function createQuestion(quizId, body) {
  await mustExist(quizzes.findQuiz, quizId);
  const position = body.position ?? await quizzes.nextQuestionPosition(quizId);
  return quizzes.findQuestion(await quizzes.createQuestion(quizId, { ...body, position }));
}

export async function updateQuestion(id, patch) {
  await mustExist(quizzes.findQuestion, id);
  await quizzes.updateQuestion(id, patch);
  return quizzes.findQuestion(id);
}

export async function removeQuestion(id) {
  await mustExist(quizzes.findQuestion, id);
  await quizzes.removeQuestion(id);
}

export async function createChoice(questionId, body) {
  await mustExist(quizzes.findQuestion, questionId);
  return quizzes.findChoice(await quizzes.createChoice(questionId, body));
}

export async function updateChoice(id, patch) {
  await mustExist(quizzes.findChoice, id);
  await quizzes.updateChoice(id, patch);
  return quizzes.findChoice(id);
}

export async function removeChoice(id) {
  await mustExist(quizzes.findChoice, id);
  await quizzes.removeChoice(id);
}
