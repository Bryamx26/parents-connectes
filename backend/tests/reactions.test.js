// J'aime et commentaires sur les publications, contre la base MySQL de dev.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';

const api = request(app);
const run = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const bearer = (who) => ({ Authorization: `Bearer ${who.token}` });
let alice, bob, pub, priv;

async function register(name) {
  const res = await api.post('/api/auth/register').send({ name, email: `${name}-r${run}@test.local`, password: 'motdepasse1' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { id: res.body.user.id, token: res.body.token };
}

before(async () => {
  alice = await register('alice');
  bob = await register('bob');
  pub = (await api.post('/api/publications').set(bearer(alice)).send({ title: 'Publique', content: 'Texte' })).body;
  priv = (await api.post('/api/publications').set(bearer(alice)).send({ title: 'Privée', content: 'T', visibility: 'private' })).body;
});

after(async () => {
  // les réactions partent en cascade avec les comptes et leurs publications
  await pool.execute('DELETE FROM users WHERE id IN (?, ?)', [alice.id, bob.id]);
  await pool.end();
});

test('un like par utilisateur, retirable, compté dans la publication', async () => {
  const url = `/api/publications/${pub.id}/like`;
  assert.equal((await api.put(url)).status, 401);
  await api.put(url).set(bearer(bob)).expect(200);
  const twice = await api.put(url).set(bearer(bob)).expect(200);
  assert.deepEqual(twice.body, { liked: true, like_count: 1 });

  const seen = await api.get(`/api/publications/${pub.id}`).set(bearer(bob)).expect(200);
  assert.equal(seen.body.like_count, 1);
  assert.equal(seen.body.liked, 1);
  assert.equal((await api.get(`/api/publications/${pub.id}`)).body.liked, 0);

  const off = await api.delete(url).set(bearer(bob)).expect(200);
  assert.deepEqual(off.body, { liked: false, like_count: 0 });
});

test('commentaires : création, liste, suppression par l’auteur seulement', async () => {
  const url = `/api/publications/${pub.id}/comments`;
  assert.equal((await api.post(url).send({ content: 'Coucou' })).status, 401);
  await api.post(url).set(bearer(bob)).send({ content: '   ' }).expect(400);
  const c = await api.post(url).set(bearer(bob)).send({ content: 'Merci pour l’idée !' }).expect(201);
  assert.equal(c.body.author_name, 'bob');

  const list = await api.get(url).expect(200);
  assert.deepEqual(list.body.map((x) => x.id), [c.body.id]);
  assert.equal((await api.get(`/api/publications/${pub.id}`)).body.comment_count, 1);

  await api.delete(`/api/comments/${c.body.id}`).set(bearer(alice)).expect(403);
  await api.delete(`/api/comments/${c.body.id}`).set(bearer(bob)).expect(204);
  assert.equal((await api.get(url)).body.length, 0);
});

test('publication privée d’un autre : 404 pour liker ou commenter', async () => {
  await api.put(`/api/publications/${priv.id}/like`).set(bearer(bob)).expect(404);
  await api.get(`/api/publications/${priv.id}/comments`).set(bearer(bob)).expect(404);
  await api.post(`/api/publications/${priv.id}/comments`).set(bearer(bob)).send({ content: 'x' }).expect(404);
  await api.put(`/api/publications/${priv.id}/like`).set(bearer(alice)).expect(200);
});
