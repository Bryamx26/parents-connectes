import * as quizzes from '../repositories/quizRepository.js';
import * as results from '../repositories/quizResultRepository.js';
import { findVisible } from './quizService.js';
import { badRequest } from '../utils/httpError.js';

// Score calculé ici : une réponse par question, 1 point par choix correct.
export function computeScore(questions, choices, answers) {
  const questionIds = new Set(questions.map((q) => q.id));
  const answered = new Set(answers.map((a) => a.question_id));
  if (!questions.length) throw badRequest('Ce quiz ne contient pas encore de question');
  if (answers.length !== questions.length || answered.size !== questions.length
    || [...answered].some((id) => !questionIds.has(id))) {
    throw badRequest('Répondez une fois à chaque question du quiz');
  }
  const byId = new Map(choices.map((c) => [c.id, c]));
  let score = 0;
  for (const { question_id, choice_id } of answers) {
    const choice = byId.get(choice_id);
    if (!choice || choice.question_id !== question_id) throw badRequest('Choix invalide pour une question');
    if (choice.is_correct) score += 1;
  }
  return score;
}

export async function submit(quizId, user, { answers }) {
  await findVisible(quizId, user);
  const questions = await quizzes.listQuestions(quizId);
  const score = computeScore(questions, await quizzes.listChoicesOfQuiz(quizId), answers);
  const id = await results.create(user.id, quizId, score);
  return { ...(await results.findById(id)), total: questions.length };
}

// Un utilisateur ne voit que ses résultats, quel que soit le filtre demandé.
export function list(user, q) {
  const userId = user.role === 'admin' ? q.user_id : user.id;
  return results.list({ userId, quizId: q.quiz_id, page: q.page, limit: q.limit });
}

export const get = (id) => results.findById(id);
export const remove = (id) => results.remove(id);
