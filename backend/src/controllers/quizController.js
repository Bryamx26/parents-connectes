import * as quizzes from '../services/quizService.js';
import * as results from '../services/quizResultService.js';

const noContent = (fn) => async (req, res) => {
  await fn(req.valid.params.id);
  res.status(204).end();
};

export const list = async (req, res) => res.json(await quizzes.list(req.user, req.valid.query));
export const get = async (req, res) => res.json(await quizzes.get(req.valid.params.id, req.user));
export const create = async (req, res) => res.status(201).json(await quizzes.create(req.user, req.valid.body));
export const update = async (req, res) => res.json(await quizzes.update(req.valid.params.id, req.valid.body));
export const remove = noContent(quizzes.remove);

export const createQuestion = async (req, res) =>
  res.status(201).json(await quizzes.createQuestion(req.valid.params.id, req.valid.body));
export const updateQuestion = async (req, res) => res.json(await quizzes.updateQuestion(req.valid.params.id, req.valid.body));
export const removeQuestion = noContent(quizzes.removeQuestion);

export const createChoice = async (req, res) =>
  res.status(201).json(await quizzes.createChoice(req.valid.params.id, req.valid.body));
export const updateChoice = async (req, res) => res.json(await quizzes.updateChoice(req.valid.params.id, req.valid.body));
export const removeChoice = noContent(quizzes.removeChoice);

export const submitResult = async (req, res) =>
  res.status(201).json(await results.submit(req.valid.params.id, req.user, req.valid.body));
export const listResults = async (req, res) => res.json(await results.list(req.user, req.valid.query));
export const getResult = async (req, res) => res.json(await results.get(req.valid.params.id));
export const removeResult = noContent(results.remove);
