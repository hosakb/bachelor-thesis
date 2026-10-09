// Explicit local-only demo; never use the legacy npm start command for previews.
const path = require('node:path');
const port = Number(process.env.PORT || 3307);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
process.chdir(__dirname);

// The existing NTLM hashing needs this flag on modern Node. Re-exec with an
// allowlisted environment, not inherited database/ERP credentials or NODE_OPTIONS.
if (!process.execArgv.includes('--openssl-legacy-provider')) {
  const { spawn } = require('node:child_process');
  const child = spawn(process.execPath, ['--openssl-legacy-provider', __filename], {
    cwd: __dirname,
    env: { PORT: String(port), NODE_ENV: 'test', PATH: process.env.PATH || '', ...(process.env.TMPDIR ? { TMPDIR: process.env.TMPDIR } : {}) },
    stdio: 'inherit',
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', () => { process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code || 0; });
} else {
  // Defense in depth: no sockets may be opened by this demo, even to local ERP.
  const net = require('node:net');
  net.Socket.prototype.connect = function () { throw new Error('Local demo forbids outbound connections'); };
  const Module = require('node:module');
  const load = Module._load;
  Module._load = function (name, ...args) {
    if (name === 'dotenv' || name === 'pg') throw new Error('Local demo forbids legacy DB/config modules');
    return load.call(this, name, ...args);
  };
  // Installs pg-mem in the DB module cache before importing application routes.
  // The shared fixture owns all fictional data; state resets on every launch.
  require('./tests/local-db.cjs');
  const app = require('./src/server.ts').default;
  app.locals.demoAccounts = require('./tests/local-db.cjs').demoAccounts;
  const server = app.listen(port, '127.0.0.1', () => console.log(`Fictional local demo: http://127.0.0.1:${port} (restart to reset)`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
}
