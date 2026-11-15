import { transaction } from '../config/db.js';
import * as activities from '../repositories/activityRepository.js';
import * as images from '../repositories/imageRepository.js';
import * as steps from '../repositories/stepRepository.js';
import * as storage from './storageService.js';
import { format as formatImage } from './imageService.js';
import { activityBody } from '../validators/schemas.js';
import { notFound, unauthorized } from '../utils/httpError.js';

export async function list(viewer, q) {
  if (q.mine && !viewer) throw unauthorized();
  return activities.list({
    viewer, ageMonths: q.age_months, ageMin: q.age_min, ageMax: q.age_max,
    mine: q.mine, sort: q.sort, order: q.order, page: q.page, limit: q.limit,
  });
}

export async function get(id, viewer) {
  const activity = await activities.findVisibleById(id, viewer);
  if (!activity) throw notFound();
  const [own, stepRows, stepImages] = await Promise.all([
    images.listByActivity(id), steps.listByActivity(id), images.listByActivitySteps(id),
  ]);
  return {
    ...activity,
    images: own.map(formatImage),
    steps: stepRows.map((st) => ({ ...st, images: stepImages.filter((i) => i.step_id === st.id).map(formatImage) })),
  };
}

export async function create(user, body) {
  return get(await activities.create(user.id, body), user);
}

export async function update(id, patch, user) {
  const merged = activityBody.parse({ ...(await activities.findRaw(id)), ...patch });
  await activities.update(id, merged);
  return get(id, user);
}

export async function remove(id) {
  const keys = await transaction(async (conn) => {
    const removed = await images.removeByActivity(id, conn);
    await activities.remove(id, conn);
    return removed;
  });
  await storage.removeMany(keys);
}
