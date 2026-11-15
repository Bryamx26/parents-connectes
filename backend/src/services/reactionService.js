import * as publications from '../repositories/publicationRepository.js';
import * as reactions from '../repositories/reactionRepository.js';
import { notFound } from '../utils/httpError.js';

// On ne réagit qu'à une publication que l'on a le droit de voir (privée d'un autre : 404).
async function checkVisible(id, viewer) {
  if (!(await publications.findVisibleById(id, viewer))) throw notFound();
}

export async function setLike(id, user, liked) {
  await checkVisible(id, user);
  await (liked ? reactions.like : reactions.unlike)(id, user.id);
  return { liked, like_count: await reactions.likeCount(id) };
}

export async function listComments(id, viewer) {
  await checkVisible(id, viewer);
  return reactions.listComments(id);
}

export async function createComment(id, user, content) {
  await checkVisible(id, user);
  return reactions.findComment(await reactions.createComment(id, user.id, content));
}

export const removeComment = (id) => reactions.remove(id);
