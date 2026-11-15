import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as users from '../repositories/userRepository.js';
import { forbidden, notFound, unauthorized } from '../utils/httpError.js';

// Vérifie le JWT puis relit l'utilisateur en base : le rôle vient de la base, jamais de la requête.
// optional : sans en-tête Authorization, la requête continue en visiteur (req.user absent).
export function authenticate({ optional = false } = {}) {
  return async (req, res, next) => {
    const header = req.get('authorization');
    if (!header) {
      if (optional) return next();
      throw unauthorized();
    }
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw unauthorized('Jeton invalide');
    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw unauthorized('Jeton invalide ou expiré');
    }
    const user = await users.findById(Number(payload.sub));
    if (!user) throw unauthorized('Compte introuvable');
    req.user = { id: user.id, role: user.role };
    next();
  };
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

// getOwnership(req) lit en base { owner_id, visibility } de la ressource visée, ou null.
// Un tiers reçoit 404 sur un contenu privé (son existence n'est pas révélée), 403 sinon.
export function isOwnerOrAdmin(getOwnership) {
  return async (req, res, next) => {
    if (!req.user) throw unauthorized();
    const resource = await getOwnership(req);
    if (!resource) throw notFound();
    if (req.user.role === 'admin' || resource.owner_id === req.user.id) return next();
    throw resource.visibility === 'private' ? notFound() : forbidden();
  };
}
