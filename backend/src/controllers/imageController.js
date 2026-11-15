import * as images from '../services/imageService.js';

export const get = async (req, res) => res.json(images.format(await images.getVisible(req.valid.params.id, req.user)));
export async function file(req, res) {
  const { body, contentType, length } = await images.file(req.valid.params.id, req.user);
  res.set({ 'Content-Type': contentType, 'Cache-Control': 'private, max-age=300' });
  if (length) res.set('Content-Length', String(length));
  body.pipe(res);
}
export const update = async (req, res) => res.json(await images.update(req.valid.params.id, req.valid.body));
export async function remove(req, res) {
  await images.remove(req.valid.params.id);
  res.status(204).end();
}
