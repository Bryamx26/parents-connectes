import * as auth from '../services/authService.js';
import * as users from '../services/userService.js';

export const register = async (req, res) => res.status(201).json(await auth.register(req.valid.body));
export const login = async (req, res) => res.json(await auth.login(req.valid.body));
export const google = async (req, res) => res.json(await auth.loginWithGoogle(req.valid.body));
export const me = async (req, res) => res.json(await users.get(req.user.id));
