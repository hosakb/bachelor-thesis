const test = require('node:test');
const assert = require('node:assert/strict');
require('./local-db.cjs');
const request = require('supertest');
const app = require('../src/server.ts').default;
const accounts = Object.freeze({ admin: 'admin@example.test', startup: 'startup@example.test', fund: 'fund@example.test', stakeholder: 'stakeholder@example.test' });
async function pickerToken(agent) {
  const page = await agent.get('/').expect(200);
  const match = page.text.match(/name="token" value="([a-f0-9]{64})"/);
  assert.ok(match, 'picker has a session-bound token');
  return match[1];
}

test('normal application never enables demo authentication from env or request', async () => {
  process.env.LOCAL_DEMO = 'true';
  process.env.NODE_ENV = 'test';
  const page = await request(app).get('/').expect(200);
  assert.match(page.text, /type="password"/);
  await request(app).post('/demo/login').send({ role: 'admin', localDemo: true }).expect(404);
  await request(app).post('/login').send({ email: 'admin@example.test', password: 'wrong' }).expect(302).expect('Location', '/');
});

test('explicit local demo uses only allowlisted fixture roles and normal sessions', async () => {
  app.locals.demoAccounts = accounts;
  try {
    const page = await request(app).get('/').expect(200);
    assert.match(page.text, /select[^>]+id="role"/);
    assert.doesNotMatch(page.text, /type="(?:password|email)"/);
    for (const role of Object.keys(accounts)) {
      const agent = request.agent(app);
      const destination = role === 'admin' ? '/admin' : role === 'startup' ? '/startup' : '/fund';
      const token = await pickerToken(agent);
      await agent.post('/demo/login').send({ role, token }).expect(302).expect('Location', destination);
      await agent.get(destination).expect(200);
      await agent.get(destination).expect(200);
      if (role !== 'admin') await agent.post('/admin/delete-user').send({ id: 1 }).expect(403);
      if (role !== 'startup') await agent.post('/startup/submit/delete-trl').send({ id: 1 }).expect(403);
      if (role === 'startup') await agent.post('/startup/submit/delete-trl').send({ id: 2 }).expect(403);
      await agent.get('/logout').expect(302).expect('Location', '/');
      await agent.get(destination).expect(302).expect('Location', '/');
    }
    for (const payload of [{}, { role: 'onboarding' }, { role: '__proto__' }, { role: 'Admin' }, { role: ['admin'] }, { role: { id: 1 } }, { role: 'admin', id: 2 }, { role: 'startup', email: 'startup2@example.test' }]) {
      const agent = request.agent(app);
      const token = await pickerToken(agent);
      await agent.post('/demo/login').send({ ...payload, token }).expect(400);
      await agent.get('/admin').expect(302).expect('Location', '/');
    }
  } finally { delete app.locals.demoAccounts; }
});

test('demo login rejects cross-origin, missing, foreign, stale and replayed tokens', async () => {
  app.locals.demoAccounts = accounts;
  try {
    const agent = request.agent(app);
    await agent.post('/demo/login').type('form').set('Origin', 'https://attacker.invalid').send({ role: 'admin' }).expect(403);
    await agent.post('/demo/login').send({ role: 'admin' }).expect(403);
    const foreign = await pickerToken(request.agent(app));
    await agent.post('/demo/login').send({ role: 'admin', token: foreign }).expect(403);
    const stale = await pickerToken(agent);
    const token = await pickerToken(agent);
    await agent.post('/demo/login').send({ role: 'admin', token: stale }).expect(403);
    await agent.post('/demo/login').send({ role: 'admin', token: [token] }).expect(403);
    await agent.post('/demo/login').set('Origin', 'https://attacker.invalid').send({ role: 'admin', token }).expect(403);
    await agent.get('/admin').expect(302).expect('Location', '/');
    await agent.post('/demo/login').send({ role: 'admin', token }).expect(302).expect('Location', '/admin');
    await agent.get('/logout').expect(302);
    await agent.post('/demo/login').send({ role: 'admin', token }).expect(403);
    await agent.get('/admin').expect(302).expect('Location', '/');
  } finally { delete app.locals.demoAccounts; }
});
