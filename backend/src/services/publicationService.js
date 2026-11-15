import { transaction } from '../config/db.js';
import * as publications from '../repositories/publicationRepository.js';
import * as activities from '../repositories/activityRepository.js';
import * as images from '../repositories/imageRepository.js';
import * as storage from './storageService.js';
import { format as formatImage } from './imageService.js';
import { publicationBody } from '../validators/schemas.js';
import { badRequest, notFound, unauthorized } from '../utils/httpError.js';

// Une publication ne peut citer qu'une activité que son auteur a le droit de voir.
async function checkActivity(activityId, user) {
  if (activityId && !(await activities.findVisibleById(activityId, user))) {
    throw badRequest('Activité introuvable', [{ field: 'activity_id', message: 'Activité introuvable' }]);
  }
}

export async function list(viewer, q) {
  if (q.mine && !viewer) throw unauthorized();
  return publications.list({
    viewer, activityId: q.activity_id, mine: q.mine, sort: q.sort, order: q.order, page: q.page, limit: q.limit,
  });
}

export async function get(id, viewer) {
  const publication = await publications.findVisibleById(id, viewer);
  if (!publication) throw notFound();
  // L'activité liée n'est décrite que si le lecteur a le droit de la voir.
  const activity = publication.activity_id && await activities.findVisibleById(publication.activity_id, viewer);
  return {
    ...publication,
    activity: activity ? { id: activity.id, title: activity.title } : null,
    images: (await images.listByPublication(id)).map(formatImage),
  };
}

export async function create(user, body) {
  await checkActivity(body.activity_id, user);
  return get(await publications.create(user.id, body), user);
}

export async function update(id, patch, user) {
  const existing = await publications.findRaw(id);
  const merged = publicationBody.parse({ ...existing, ...patch });
  if (merged.activity_id !== existing.activity_id) await checkActivity(merged.activity_id, user);
  await publications.update(id, merged);
  return get(id, user);
}

export async function remove(id) {
  const keys = await transaction(async (conn) => {
    const removed = await images.removeByPublication(id, conn);
    await publications.remove(id, conn);
    return removed;
  });
  await storage.removeMany(keys);
}
