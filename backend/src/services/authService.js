import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import * as users from '../repositories/userRepository.js';
import { conflict, HttpError, unauthorized } from '../utils/httpError.js';
import { registerBody } from '../validators/schemas.js';

// Vérifié quand l'e-mail est inconnu, pour que la réponse prenne le même temps qu'un mauvais mot de passe.
const DUMMY_HASH = '$argon2id$v=19$m=65536,t=3,p=4$xCTRjNVkV6V6rqDZ54absQ$7vhGSHfm08s0aENWpAW5WwPIEhbKnt3vpzSI+ubkhs0';
const google = new OAuth2Client();

export const hashPassword = (password) => argon2.hash(password, { type: argon2.argon2id });

// Le jeton ne porte que l'identifiant : le rôle est relu en base à chaque requête.
function session(user) {
  const token = jwt.sign({ sub: String(user.id) }, env.jwtSecret, { algorithm: 'HS256', expiresIn: env.jwtExpiresIn });
  return { token, user };
}

// ADMINMAIL / ADMINPASSWORD font foi : à chaque démarrage le compte est créé, ou repasse admin avec ce mot de passe.
export async function ensureAdmin({ email, password } = env.admin) {
  if (!email && !password) return null;
  if (!email || !password) throw new Error('ADMINMAIL et ADMINPASSWORD vont ensemble');
  const admin = registerBody.safeParse({ name: 'Administrateur', email, password });
  if (!admin.success) throw new Error('ADMINMAIL doit être un e-mail et ADMINPASSWORD faire 8 à 128 caractères');
  const passwordHash = await hashPassword(admin.data.password);
  const row = await users.findCredentialsByEmail(admin.data.email);
  const id = row?.id ?? await users.create({ ...admin.data, passwordHash });
  if (row) await users.update(id, { passwordHash });
  await users.setRole(id, 'admin');
  return id;
}

export async function register({ name, email, password }) {
  if (await users.findCredentialsByEmail(email)) throw conflict('Un compte existe déjà avec cet e-mail');
  const id = await users.create({ name, email, passwordHash: await hashPassword(password) });
  return session(await users.findById(id));
}

export async function login({ email, password }) {
  const row = await users.findCredentialsByEmail(email);
  const ok = await argon2.verify(row?.password_hash ?? DUMMY_HASH, password);
  if (!row?.password_hash || !ok) throw unauthorized('E-mail ou mot de passe incorrect');
  return session(await users.findById(row.id));
}

export async function loginWithGoogle({ idToken }) {
  if (!env.googleClientId) throw new HttpError(503, 'Connexion Google non configurée');
  let payload;
  try {
    payload = (await google.verifyIdToken({ idToken, audience: env.googleClientId })).getPayload();
  } catch {
    throw unauthorized('Jeton Google invalide');
  }
  const known = await users.findByGoogleId(payload.sub);
  if (known) return session(known);
  if (!payload.email || !payload.email_verified) throw unauthorized('E-mail Google non vérifié');

  const email = payload.email.toLowerCase();
  const existing = await users.findCredentialsByEmail(email);
  if (existing) {
    if (existing.google_id) throw conflict('Ce compte est déjà lié à un autre compte Google');
    await users.setGoogleId(existing.id, payload.sub); // liaison : e-mail vérifié par Google
    return session(await users.findById(existing.id));
  }
  const name = (payload.name || email.split('@')[0]).slice(0, 100);
  const id = await users.create({ name, email, googleId: payload.sub });
  return session(await users.findById(id));
}
