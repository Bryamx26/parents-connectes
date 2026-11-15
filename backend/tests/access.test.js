// Tests des règles d'accès, contre une vraie base MySQL (schéma 01-schema.sql chargé).
// Chaque exécution crée ses propres comptes et données, puis les supprime.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';
import { hashPassword } from '../src/services/authService.js';

const api = request(app);
const run = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const bearer = (who) => ({ Authorization: `Bearer ${who.token}` });
const ids = (res) => res.body.map((r) => r.id);

const activity = (over = {}) => ({
  title: 'Activité test', description: 'Description', age_min_months: 6, age_max_months: 12, visibility: 'public', ...over,
});

let alice, bob, admin;
const data = {};

async function register(name) {
  const res = await api.post('/api/auth/register')
    .send({ name, email: `${name}-${run}@test.local`, password: 'motdepasse1', role: 'admin' });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return { id: res.body.user.id, token: res.body.token, user: res.body.user };
}

async function insertImage(column, parentId) {
  const [res] = await pool.execute(
    `INSERT INTO images (${column}, object_key, position) VALUES (?, ?, 1)`, [parentId, `test/${run}/${column}-${parentId}.png`]);
  return res.insertId;
}

before(async () => {
  alice = await register('alice');
  bob = await register('bob');
  // L'inscription ne crée que des « user » : l'admin de test est créé en base.
  const email = `admin-${run}@test.local`;
  await pool.execute("INSERT INTO users (name, email, password_hash, role) VALUES ('Admin test', ?, ?, 'admin')",
    [email, await hashPassword('motdepasse1')]);
  const login = await api.post('/api/auth/login').send({ email, password: 'motdepasse1' });
  admin = { id: login.body.user.id, token: login.body.token };

  const post = (path, who, body) => api.post(path).set(bearer(who)).send(body).then((r) => {
    assert.equal(r.status, 201, JSON.stringify(r.body));
    return r.body;
  });
  data.publicActivity = await post('/api/activities', alice, activity({ title: 'Publique' }));
  data.privateActivity = await post('/api/activities', alice, activity({ title: 'Privée', visibility: 'private' }));
  data.publicPublication = await post('/api/publications', alice, { title: 'Publique', content: 'Texte' });
  data.privatePublication = await post('/api/publications', alice, { title: 'Privée', content: 'Texte', visibility: 'private' });
  data.publicImage = await insertImage('activity_id', data.publicActivity.id);
  data.privateImage = await insertImage('activity_id', data.privateActivity.id);
  data.privatePubImage = await insertImage('publication_id', data.privatePublication.id);

  data.quiz = await post('/api/quizzes', admin, { title: 'Quiz test', is_published: true });
  data.question = await post(`/api/quizzes/${data.quiz.id}/questions`, admin, { label: 'Question ?' });
  data.good = await post(`/api/questions/${data.question.id}/choices`, admin, { label: 'Bonne', is_correct: true });
  data.bad = await post(`/api/questions/${data.question.id}/choices`, admin, { label: 'Mauvaise' });
  data.aliceResult = await post(`/api/quizzes/${data.quiz.id}/results`, alice,
    { answers: [{ question_id: data.question.id, choice_id: data.good.id }] });
});

after(async () => {
  const users = [alice?.id, bob?.id, admin?.id].filter(Boolean);
  if (users.length) {
    const list = users.map(() => '?').join(',');
    await pool.execute(`DELETE FROM images WHERE activity_id IN (SELECT id FROM activities WHERE user_id IN (${list}))
      OR publication_id IN (SELECT id FROM publications WHERE user_id IN (${list}))`, [...users, ...users]);
    await pool.execute(`DELETE FROM quizzes WHERE created_by IN (${list})`, users);
    await pool.execute(`DELETE FROM users WHERE id IN (${list})`, users);
  }
  await pool.end();
});

describe('Un visiteur ne peut rien écrire', () => {
  const writes = () => [
    ['post', '/api/activities', activity()],
    ['patch', `/api/activities/${data.publicActivity.id}`, { title: 'X' }],
    ['delete', `/api/activities/${data.publicActivity.id}`],
    ['post', '/api/publications', { title: 'X', content: 'X' }],
    ['patch', `/api/publications/${data.publicPublication.id}`, { title: 'X' }],
    ['delete', `/api/publications/${data.publicPublication.id}`],
    ['post', `/api/activities/${data.publicActivity.id}/images`],
    ['patch', `/api/images/${data.publicImage}`, { alt_text: 'X' }],
    ['delete', `/api/images/${data.publicImage}`],
    ['post', '/api/quizzes', { title: 'X' }],
    ['post', `/api/quizzes/${data.quiz.id}/results`, { answers: [{ question_id: data.question.id, choice_id: data.good.id }] }],
    ['patch', `/api/users/${alice.id}`, { name: 'X' }],
    ['delete', `/api/users/${alice.id}`],
  ];

  test('toutes les routes d’écriture répondent 401', async () => {
    for (const [method, path, body] of writes()) {
      const res = await api[method](path).send(body);
      assert.equal(res.status, 401, `${method.toUpperCase()} ${path}`);
    }
  });

  test('un jeton falsifié est refusé', async () => {
    const res = await api.post('/api/activities').set('Authorization', 'Bearer abc.def.ghi').send(activity());
    assert.equal(res.status, 401);
  });

  test('il peut lire les contenus publics', async () => {
    assert.equal((await api.get(`/api/activities/${data.publicActivity.id}`)).status, 200);
    assert.equal((await api.get(`/api/publications/${data.publicPublication.id}`)).status, 200);
    assert.equal((await api.get(`/api/quizzes/${data.quiz.id}`)).status, 200);
  });
});

describe('Un utilisateur ne peut pas modifier la ressource d’un autre', () => {
  test('activité publique d’Alice : Bob reçoit 403 et rien ne change', async () => {
    const id = data.publicActivity.id;
    assert.equal((await api.patch(`/api/activities/${id}`).set(bearer(bob)).send({ title: 'Piraté' })).status, 403);
    assert.equal((await api.delete(`/api/activities/${id}`).set(bearer(bob))).status, 403);
    assert.equal((await api.get(`/api/activities/${id}`)).body.title, 'Publique');
  });

  test('publication, image, compte et résultat d’Alice sont protégés', async () => {
    assert.equal((await api.patch(`/api/publications/${data.publicPublication.id}`).set(bearer(bob)).send({ title: 'X' })).status, 403);
    assert.equal((await api.delete(`/api/publications/${data.publicPublication.id}`).set(bearer(bob))).status, 403);
    assert.equal((await api.patch(`/api/images/${data.publicImage}`).set(bearer(bob)).send({ alt_text: 'X' })).status, 403);
    assert.equal((await api.delete(`/api/images/${data.publicImage}`).set(bearer(bob))).status, 403);
    assert.equal((await api.patch(`/api/users/${alice.id}`).set(bearer(bob)).send({ name: 'X' })).status, 403);
    assert.equal((await api.delete(`/api/users/${alice.id}`).set(bearer(bob))).status, 403);
    assert.equal((await api.get(`/api/users/${alice.id}`).set(bearer(bob))).status, 403);
    assert.equal((await api.get(`/api/quiz-results/${data.aliceResult.id}`).set(bearer(bob))).status, 404);
    assert.equal((await api.delete(`/api/quiz-results/${data.aliceResult.id}`).set(bearer(bob))).status, 404);
  });

  test('Bob ne peut pas ajouter une image à l’activité d’Alice', async () => {
    const res = await api.post(`/api/activities/${data.publicActivity.id}/images`).set(bearer(bob))
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), { filename: 'a.png', contentType: 'image/png' });
    assert.equal(res.status, 403);
  });

  test('les actions réservées à l’admin répondent 403 à un utilisateur', async () => {
    assert.equal((await api.post('/api/quizzes').set(bearer(bob)).send({ title: 'X' })).status, 403);
    assert.equal((await api.delete(`/api/choices/${data.good.id}`).set(bearer(bob))).status, 403);
    assert.equal((await api.get('/api/users').set(bearer(bob))).status, 403);
    assert.equal((await api.patch(`/api/users/${bob.id}/role`).set(bearer(bob)).send({ role: 'admin' })).status, 403);
  });

  test('le rôle envoyé à l’inscription est ignoré', () => {
    assert.equal(bob.user.role, 'user');
  });

  test('chacun gère ses ressources, l’admin gère tout', async () => {
    assert.equal((await api.patch(`/api/activities/${data.publicActivity.id}`).set(bearer(alice)).send({ duration_minutes: 20 })).status, 200);
    const res = await api.patch(`/api/activities/${data.publicActivity.id}`).set(bearer(admin)).send({ title: 'Modérée' });
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Modérée');
    await api.patch(`/api/activities/${data.publicActivity.id}`).set(bearer(admin)).send({ title: 'Publique' });
  });
});

describe('Un contenu privé n’est pas lisible par un tiers', () => {
  test('activité privée : 404 pour le visiteur et Bob, visible pour Alice et l’admin', async () => {
    const path = `/api/activities/${data.privateActivity.id}`;
    assert.equal((await api.get(path)).status, 404);
    assert.equal((await api.get(path).set(bearer(bob))).status, 404);
    assert.equal((await api.get(path).set(bearer(alice))).status, 200);
    assert.equal((await api.get(path).set(bearer(admin))).status, 200);
  });

  test('publication privée : même règle', async () => {
    const path = `/api/publications/${data.privatePublication.id}`;
    assert.equal((await api.get(path)).status, 404);
    assert.equal((await api.get(path).set(bearer(bob))).status, 404);
    assert.equal((await api.get(path).set(bearer(alice))).status, 200);
  });

  test('les listes ne contiennent pas les contenus privés des autres', async () => {
    for (const who of [null, bob]) {
      const req = (p) => (who ? api.get(p).set(bearer(who)) : api.get(p));
      const acts = await req('/api/activities?limit=50');
      assert.ok(!ids(acts).includes(data.privateActivity.id));
      const pubs = await req('/api/publications?limit=50');
      assert.ok(!ids(pubs).includes(data.privatePublication.id));
    }
    const mine = await api.get('/api/activities?mine=true&limit=50').set(bearer(alice));
    assert.ok(ids(mine).includes(data.privateActivity.id));
  });

  test('les images d’un contenu privé sont aussi cachées', async () => {
    for (const img of [data.privateImage, data.privatePubImage]) {
      assert.equal((await api.get(`/api/images/${img}`)).status, 404);
      assert.equal((await api.get(`/api/images/${img}`).set(bearer(bob))).status, 404);
      assert.equal((await api.get(`/api/images/${img}/file`).set(bearer(bob))).status, 404);
      assert.equal((await api.get(`/api/images/${img}`).set(bearer(alice))).status, 200);
    }
  });

  test('modifier le contenu privé d’un autre répond 404, pas 403', async () => {
    assert.equal((await api.patch(`/api/activities/${data.privateActivity.id}`).set(bearer(bob)).send({ title: 'X' })).status, 404);
    assert.equal((await api.delete(`/api/images/${data.privateImage}`).set(bearer(bob))).status, 404);
  });

  test('on ne peut pas lier sa publication à l’activité privée d’un autre', async () => {
    const res = await api.post('/api/publications').set(bearer(bob))
      .send({ title: 'X', content: 'X', activity_id: data.privateActivity.id });
    assert.equal(res.status, 400);
  });
});

describe('Sécurité des entrées et des réponses', () => {
  test('aucun mot de passe ni hash dans les réponses', async () => {
    const res = await api.get('/api/users?limit=50').set(bearer(admin));
    assert.equal(res.status, 200);
    for (const body of [res.body, alice.user, (await api.get('/api/auth/me').set(bearer(alice))).body]) {
      const text = JSON.stringify(body);
      assert.ok(!text.includes('password') && !text.includes('$argon2'), text.slice(0, 200));
    }
  });

  test('un tri hors liste blanche est refusé', async () => {
    const res = await api.get('/api/activities').query({ sort: 'title; DROP TABLE users' });
    assert.equal(res.status, 400);
  });

  test('une valeur malveillante dans un filtre reste une simple donnée', async () => {
    assert.equal((await api.get('/api/activities').query({ age_months: "1 OR 1=1" })).status, 400);
    assert.equal((await api.post('/api/auth/login').send({ email: "' OR 1=1 --@x.fr", password: 'x' })).status, 400);
  });

  test('les erreurs ne renvoient ni stack trace ni détail SQL', async () => {
    const res = await api.post('/api/activities').set(bearer(alice)).set('Content-Type', 'application/json').send('{oups');
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(res.body), ['error']);
  });

  test('un fichier qui n’est pas une image est refusé', async () => {
    const path = `/api/activities/${data.publicActivity.id}/images`;
    const fake = await api.post(path).set(bearer(alice))
      .attach('image', Buffer.from('<?php echo 1; ?>'), { filename: 'a.png', contentType: 'image/png' });
    assert.equal(fake.status, 400);
    const text = await api.post(path).set(bearer(alice))
      .attach('image', Buffer.from('bonjour'), { filename: 'a.txt', contentType: 'text/plain' });
    assert.equal(text.status, 400);
  });

  test('recherche par tranche d’âge', async () => {
    const in6 = await api.get('/api/activities?mine=true&age_months=6&limit=50').set(bearer(alice));
    assert.ok(ids(in6).includes(data.publicActivity.id));
    const in24 = await api.get('/api/activities?mine=true&age_months=24&limit=50').set(bearer(alice));
    assert.ok(!ids(in24).includes(data.publicActivity.id));
    const bad = await api.post('/api/activities').set(bearer(alice)).send(activity({ age_min_months: 20, age_max_months: 10 }));
    assert.equal(bad.status, 400);
  });

  test('quiz : bonnes réponses cachées, score calculé par le serveur', async () => {
    const asBob = await api.get(`/api/quizzes/${data.quiz.id}`).set(bearer(bob));
    assert.ok(asBob.body.questions[0].choices.every((c) => !('is_correct' in c)));
    const asAdmin = await api.get(`/api/quizzes/${data.quiz.id}`).set(bearer(admin));
    assert.ok(asAdmin.body.questions[0].choices.some((c) => c.is_correct === true));

    const res = await api.post(`/api/quizzes/${data.quiz.id}/results`).set(bearer(bob))
      .send({ score: 99, answers: [{ question_id: data.question.id, choice_id: data.bad.id }] });
    assert.equal(res.status, 201);
    assert.equal(res.body.score, 0);

    const own = await api.get(`/api/quiz-results?user_id=${alice.id}`).set(bearer(bob));
    assert.ok(own.body.every((r) => r.user_id === bob.id));
  });
});
