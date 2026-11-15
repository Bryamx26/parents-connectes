import * as users from '../services/userService.js';

export const list = async (req, res) => res.json(await users.list(req.valid.query));
export const get = async (req, res) => res.json(await users.get(req.valid.params.id));
export const update = async (req, res) => res.json(await users.update(req.valid.params.id, req.valid.body, req.user));
export const setRole = async (req, res) => res.json(await users.setRole(req.valid.params.id, req.valid.body.role));
export async function remove(req, res) {
  await users.remove(req.valid.params.id);
  res.status(204).end();
}
