import * as Post from '../models/postModel.js';

export async function list(req, res, next) {
  try {
    res.json(await Post.findAll());
  } catch (err) {
    next(err);
  }
}
