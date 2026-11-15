import * as steps from '../services/stepService.js';
import * as images from '../services/imageService.js';

export const create = async (req, res) => res.status(201).json(await steps.create(req.valid.params.id, req.valid.body));
export const update = async (req, res) => res.json(await steps.update(req.valid.params.id, req.valid.body));
export async function remove(req, res) {
  await steps.remove(req.valid.params.id);
  res.status(204).end();
}
export const reorder = async (req, res) => res.json(await steps.reorder(req.valid.params.id, req.valid.body.step_ids));
export const addImage = async (req, res) =>
  res.status(201).json(await images.upload({ type: 'step', id: req.valid.params.id }, req.file, req.valid.body));
