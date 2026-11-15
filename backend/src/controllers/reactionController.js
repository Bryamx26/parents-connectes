import * as reactions from '../services/reactionService.js';

export const like = async (req, res) => res.json(await reactions.setLike(req.valid.params.id, req.user, true));
export const unlike = async (req, res) => res.json(await reactions.setLike(req.valid.params.id, req.user, false));
export const listComments = async (req, res) => res.json(await reactions.listComments(req.valid.params.id, req.user));
export const createComment = async (req, res) =>
  res.status(201).json(await reactions.createComment(req.valid.params.id, req.user, req.valid.body.content));
export async function removeComment(req, res) {
  await reactions.removeComment(req.valid.params.id);
  res.status(204).end();
}
