import * as activities from '../services/activityService.js';
import * as images from '../services/imageService.js';

export const list = async (req, res) => res.json(await activities.list(req.user, req.valid.query));
export const get = async (req, res) => res.json(await activities.get(req.valid.params.id, req.user));
export const create = async (req, res) => res.status(201).json(await activities.create(req.user, req.valid.body));
export const update = async (req, res) => res.json(await activities.update(req.valid.params.id, req.valid.body, req.user));
export async function remove(req, res) {
  await activities.remove(req.valid.params.id);
  res.status(204).end();
}
export const addImage = async (req, res) =>
  res.status(201).json(await images.upload({ type: 'activity', id: req.valid.params.id }, req.file, req.valid.body));
