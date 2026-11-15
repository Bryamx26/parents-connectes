import { transaction } from '../config/db.js';
import * as steps from '../repositories/stepRepository.js';
import * as images from '../repositories/imageRepository.js';
import * as storage from './storageService.js';
import { format as formatImage } from './imageService.js';
import { badRequest } from '../utils/httpError.js';

export const MAX_STEPS = 50;

async function withImages(id) {
  const step = await steps.findById(id);
  const all = await images.listByActivitySteps(step.activity_id);
  return { ...step, images: all.filter((i) => i.step_id === id).map(formatImage) };
}

export async function create(activityId, body) {
  const { count, next } = await steps.stats(activityId);
  if (count >= MAX_STEPS) throw badRequest(`${MAX_STEPS} étapes maximum par activité`);
  return withImages(await steps.create(activityId, body, next));
}

export async function update(id, patch) {
  await steps.update(id, patch);
  return withImages(id);
}

export async function remove(id) {
  const keys = await transaction(async (conn) => {
    const removed = await images.removeByStep(id, conn);
    await steps.remove(id, conn);
    return removed;
  });
  await storage.removeMany(keys);
}

// stepIds doit contenir exactement toutes les étapes de l'activité, chacune une fois.
export async function reorder(activityId, stepIds) {
  const current = (await steps.listByActivity(activityId)).map((s) => s.id);
  const given = new Set(stepIds);
  if (given.size !== stepIds.length || given.size !== current.length || current.some((id) => !given.has(id))) {
    throw badRequest("La liste doit contenir chaque étape de l'activité une seule fois");
  }
  await transaction(async (conn) => {
    for (const [index, id] of stepIds.entries()) await steps.setPosition(id, activityId, index + 1, conn);
  });
  return steps.listByActivity(activityId);
}
