import argon2 from 'argon2';
import { transaction } from '../config/db.js';
import * as users from '../repositories/userRepository.js';
import * as images from '../repositories/imageRepository.js';
import * as storage from './storageService.js';
import { hashPassword } from './authService.js';
import { badRequest, notFound } from '../utils/httpError.js';

export const list = (query) => users.list(query);

export async function get(id) {
  const user = await users.findById(id);
  if (!user) throw notFound();
  return user;
}

export async function update(id, body, requester) {
  let passwordHash = null;
  if (body.password) {
    // Le titulaire doit confirmer son mot de passe actuel ; l'admin peut le réinitialiser.
    const current = await users.findPasswordHash(id);
    if (requester.id === id && current) {
      if (!body.current_password || !(await argon2.verify(current, body.current_password))) {
        throw badRequest('Mot de passe actuel incorrect');
      }
    }
    passwordHash = await hashPassword(body.password);
  }
  await users.update(id, { name: body.name, email: body.email, passwordHash });
  return get(id);
}

export async function setRole(id, role) {
  await get(id);
  await users.setRole(id, role);
  return get(id);
}

// Activités, publications et résultats partent en cascade ; les images sont supprimées à la main
// (FK en RESTRICT, voir 01-schema.sql). Un admin auteur de quiz est refusé (409, FK RESTRICT).
export async function remove(id) {
  await get(id);
  const keys = await transaction(async (conn) => {
    const removed = await images.removeByUser(id, conn);
    await users.remove(id, conn);
    return removed;
  });
  await storage.removeMany(keys);
}
