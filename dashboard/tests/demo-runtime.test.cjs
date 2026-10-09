const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

test('sandbox demo boots with hostile legacy env, binds loopback and resets fictional data', async () => {
  const port = 3329;
  const root = path.join(__dirname, '..');
  async function boot() {
    const child = spawn(process.execPath, ['local-demo.cjs'], {
      cwd: root,
      env: { PATH: process.env.PATH, PORT: String(port), DATABASE_URL: 'postgres://invalid.invalid/no', PGHOST: 'invalid.invalid', NODE_ENV: 'development' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let logs = '';
    child.stdout.on('data', d => logs += d);
    child.stderr.on('data', d => logs += d);
    try {
      for (let i = 0; i < 100; i++) {
        if (child.exitCode !== null) throw new Error(logs);
        try {
          const response = await fetch(`http://127.0.0.1:${port}/`);
          if (response.status === 200) return { child, logs: () => logs };
        } catch {}
        await new Promise(r => setTimeout(r, 100));
      }
      throw new Error('Not ready: ' + logs);
    } catch (e) { child.kill(); throw e; }
  }
  async function stop(child) {
    const exit = new Promise(resolve => child.once('exit', resolve));
    child.kill();
    await exit;
  }
  for (let run = 0; run < 2; run++) {
    const server = await boot();
    try {
      const response = await fetch(`http://127.0.0.1:${port}/login`, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'email=startup%40example.test&password=local-demo-only' });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), '/startup');
      const cookie = response.headers.get('set-cookie').split(';')[0];
      const page = await fetch(`http://127.0.0.1:${port}/startup`, { headers: { cookie } });
      assert.equal(page.status, 200);
      assert.match(await page.text(), /HelioFusion/);
      assert.match(server.logs(), /127\.0\.0\.1/);
    } finally { await stop(server.child); }
  }
});
