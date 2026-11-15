// Étapes d'activité : droits, ordre, suppressions en cascade et photos (vraie base MySQL).
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';

const api = request(app);
const run = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const bearer = (who) => ({ Authorization: `Bearer ${who.token}` });
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
let alice, bob;
const data = {};

async function register(name) {
  const res = await api.post('/api/auth/register').send({ name, email: `${name}-${run}@test.local`, password: 'motdepasse1' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { id: res.body.user.id, token: res.body.token };
}

async function post(path, who, body, status = 201) {
  const res = await api.post(path).set(bearer(who)).send(body);
  assert.equal(res.status, status, `${path} ${JSON.stringify(res.body)}`);
  return res.body;
}

const activity = (visibility) => ({ title: `Tuto ${visibility}`, description: 'D', age_min_months: 12, age_max_months: 36, visibility });

async function stepImage(stepId) {
  const [res] = await pool.execute('INSERT INTO images (step_id, object_key, position) VALUES (?, ?, 1)',
    [stepId, `test/${run}/step-${stepId}-${Math.random()}.png`]);
  return res.insertId;
}

before(async () => {
  alice = await register('alice-steps');
  bob = await register('bob-steps');
  data.pub = await post('/api/activities', alice, activity('public'));
  data.priv = await post('/api/activities', alice, activity('private'));
  data.steps = [];
  for (const title of ['Un', 'Deux', 'Trois']) {
    data.steps.push(await post(`/api/activities/${data.pub.id}/steps`, alice, { title, content: `Étape ${title}` }));
  }
  data.privStep = await post(`/api/activities/${data.priv.id}/steps`, alice, { title: 'Secret', content: 'Privé' });
  data.privStepImage = await stepImage(data.privStep.id);
});

after(async () => {
  const ids = [alice?.id, bob?.id].filter(Boolean);
  if (ids.length) {
    const list = ids.map(() => '?').join(',');
    await pool.execute(`DELETE FROM images WHERE step_id IN (SELECT s.id FROM activity_steps s JOIN activities a ON a.id = s.activity_id WHERE a.user_id IN (${list}))
      OR activity_id IN (SELECT id FROM activities WHERE user_id IN (${list}))
      OR publication_id IN (SELECT id FROM publications WHERE user_id IN (${list}))`, [...ids, ...ids, ...ids]);
    await pool.execute(`DELETE FROM users WHERE id IN (${list})`, ids);
  }
  await pool.end();
});

describe('Étapes : création et ordre', () => {
  test('les étapes sont numérotées dans l’ordre et renvoyées avec l’activité', async () => {
    assert.deepEqual(data.steps.map((s) => s.position), [1, 2, 3]);
    const res = await api.get(`/api/activities/${data.pub.id}`);
    assert.deepEqual(res.body.steps.map((s) => s.title), ['Un', 'Deux', 'Trois']);
    assert.ok(res.body.steps.every((s) => Array.isArray(s.images)));
  });

  test('réordonner change les positions', async () => {
    const [a, b, c] = data.steps.map((s) => s.id);
    const res = await api.put(`/api/activities/${data.pub.id}/steps/order`).set(bearer(alice)).send({ step_ids: [c, a, b] });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.map((s) => s.id), [c, a, b]);
  });

  test('une liste incomplète, en double ou étrangère est refusée', async () => {
    const [a, b, c] = data.steps.map((s) => s.id);
    const path = `/api/activities/${data.pub.id}/steps/order`;
    for (const step_ids of [[a, b], [a, a, b], [a, b, data.privStep.id]]) {
      assert.equal((await api.put(path).set(bearer(alice)).send({ step_ids })).status, 400, JSON.stringify(step_ids));
    }
    assert.equal((await api.put(path).set(bearer(alice)).send({ step_ids: [c, a, b] })).status, 200);
  });

  test('le titre et le texte sont obligatoires', async () => {
    await post(`/api/activities/${data.pub.id}/steps`, alice, { title: '', content: 'X' }, 400);
  });
});

describe('Étapes : droits', () => {
  test('un visiteur ne peut rien écrire', async () => {
    const step = data.steps[0].id;
    assert.equal((await api.post(`/api/activities/${data.pub.id}/steps`).send({ title: 'X', content: 'X' })).status, 401);
    assert.equal((await api.patch(`/api/steps/${step}`).send({ title: 'X' })).status, 401);
    assert.equal((await api.delete(`/api/steps/${step}`)).status, 401);
    assert.equal((await api.put(`/api/activities/${data.pub.id}/steps/order`).send({ step_ids: [step] })).status, 401);
  });

  test('Bob ne peut ni créer, ni modifier, ni supprimer, ni réordonner les étapes d’Alice', async () => {
    const step = data.steps[0].id;
    await post(`/api/activities/${data.pub.id}/steps`, bob, { title: 'X', content: 'X' }, 403);
    assert.equal((await api.patch(`/api/steps/${step}`).set(bearer(bob)).send({ title: 'Piraté' })).status, 403);
    assert.equal((await api.delete(`/api/steps/${step}`).set(bearer(bob))).status, 403);
    assert.equal((await api.put(`/api/activities/${data.pub.id}/steps/order`).set(bearer(bob))
      .send({ step_ids: data.steps.map((s) => s.id) })).status, 403);
    const upload = await api.post(`/api/steps/${step}/images`).set(bearer(bob)).attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    assert.equal(upload.status, 403);
    const res = await api.get(`/api/activities/${data.pub.id}`);
    assert.ok(!res.body.steps.some((s) => s.title === 'Piraté'));
  });

  test('l’étape d’une activité privée et ses photos sont invisibles pour un tiers', async () => {
    assert.equal((await api.get(`/api/activities/${data.priv.id}`).set(bearer(bob))).status, 404);
    assert.equal((await api.patch(`/api/steps/${data.privStep.id}`).set(bearer(bob)).send({ title: 'X' })).status, 404);
    assert.equal((await api.get(`/api/images/${data.privStepImage}`).set(bearer(bob))).status, 404);
    assert.equal((await api.get(`/api/images/${data.privStepImage}`)).status, 404);
    assert.equal((await api.get(`/api/images/${data.privStepImage}`).set(bearer(alice))).status, 200);
    assert.equal((await api.delete(`/api/images/${data.privStepImage}`).set(bearer(bob))).status, 404);
  });
});

describe('Étapes : photos et suppressions', () => {
  test('une image a exactement un parent (contrainte CHECK)', async () => {
    await assert.rejects(pool.execute('INSERT INTO images (activity_id, step_id, object_key) VALUES (?, ?, ?)',
      [data.pub.id, data.steps[0].id, `test/${run}/double.png`]));
  });

  test('au-delà de 10 photos, l’ajout est refusé', async () => {
    const step = data.steps[1].id;
    for (let i = 0; i < 10; i++) await stepImage(step);
    const res = await api.post(`/api/steps/${step}/images`).set(bearer(alice)).attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    assert.equal(res.status, 409);
  });

  test('supprimer une étape supprime ses photos', async () => {
    const step = await post(`/api/activities/${data.pub.id}/steps`, alice, { title: 'Temporaire', content: 'X' });
    const image = await stepImage(step.id);
    assert.equal((await api.delete(`/api/steps/${step.id}`).set(bearer(alice))).status, 204);
    const [rows] = await pool.execute('SELECT id FROM images WHERE id = ?', [image]);
    assert.equal(rows.length, 0);
  });

  test('supprimer une activité supprime ses étapes et leurs photos', async () => {
    const act = await post('/api/activities', alice, activity('public'));
    const step = await post(`/api/activities/${act.id}/steps`, alice, { title: 'A', content: 'B' });
    await stepImage(step.id);
    assert.equal((await api.delete(`/api/activities/${act.id}`).set(bearer(alice))).status, 204);
    const [rows] = await pool.execute('SELECT id FROM activity_steps WHERE activity_id = ?', [act.id]);
    assert.equal(rows.length, 0);
  });
});

describe('Publication : activité liée', () => {
  test('le titre de l’activité liée n’est donné que si le lecteur peut la voir', async () => {
    const linked = await post('/api/activities', alice, activity('public'));
    const pub = await post('/api/publications', alice, { title: 'Fait !', content: 'Super', activity_id: linked.id });
    assert.deepEqual((await api.get(`/api/publications/${pub.id}`)).body.activity, { id: linked.id, title: linked.title });
    await api.patch(`/api/activities/${linked.id}`).set(bearer(alice)).send({ visibility: 'private' });
    assert.equal((await api.get(`/api/publications/${pub.id}`).set(bearer(bob))).body.activity, null);
    assert.equal((await api.get(`/api/publications/${pub.id}`).set(bearer(alice))).body.activity.id, linked.id);
  });
});
