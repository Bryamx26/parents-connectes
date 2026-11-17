// Compte admin issu de ADMINMAIL / ADMINPASSWORD : création, puis mise à jour du mot de passe.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';
import { ensureAdmin } from '../src/services/authService.js';

const email = `Admin-${Date.now()}@test.local`;
const login = (password) => request(app).post('/api/auth/login').send({ email, password });
after(async () => {
  await pool.execute('DELETE FROM users WHERE email = ?', [email.toLowerCase()]);
  await pool.end();
});

test('ensureAdmin crée le compte admin puis applique le nouveau mot de passe', async () => {
  assert.equal(await ensureAdmin({ email: '', password: '' }), null);
  await assert.rejects(ensureAdmin({ email, password: '' }));
  await assert.rejects(ensureAdmin({ email, password: 'court' }));

  const id = await ensureAdmin({ email, password: 'premier-mdp' });
  const first = await login('premier-mdp');
  assert.equal(first.status, 200);
  assert.equal(first.body.user.role, 'admin');

  assert.equal(await ensureAdmin({ email, password: 'second-mdp' }), id);
  assert.equal((await login('premier-mdp')).status, 401);
  assert.equal((await login('second-mdp')).status, 200);
});
