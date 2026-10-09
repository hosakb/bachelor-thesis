// Test-only Business Central contract check for the real scraper job.
//
// Run from scraper/:  npm run build && node --openssl-legacy-provider --test tests/bc-contract.test.cjs
//
// What is real: the compiled scraper (dist/api/job.js, dist/api/business-central.js,
// dist/models/*, dist/calc/finance.js) and the httpntlm NTLM handshake.
// What is replaced: dist/config/db.js (an in-process fake pool, so .env is never
// read and no database is contacted), the cron schedule (the tick is invoked
// directly) and Business Central itself (a local HTTP server on 127.0.0.1 that
// speaks the NTLM type1/type2/type3 handshake and answers the two OData queries
// the scraper sends). All values are fictional. This is not a live ERP test, and
// it is not the reusable demo mock (tracked separately).
const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");

const dist = path.join(__dirname, "..", "dist");

function fakePool(state) {
  const query = async (sql, params) => {
    state.queries.push(sql);
    if (/^SELECT id FROM startup/.test(sql)) return { rows: state.startups.map((id) => ({ id })) };
    if (/FROM business_central WHERE startup_id/.test(sql)) {
      return { rows: [state.bcUsers[params[0]] || {}] };
    }
    if (/^INSERT INTO business_central_finance/.test(sql)) {
      const [balance, shortTermLiabilities, startupId] = params;
      state.finance.push({ balance, short_term_liabilities: shortTermLiabilities, startup_id: startupId, evaluated_at: new Date(Date.UTC(2026, 0, 1 + state.finance.length)) });
      return { rows: [] };
    }
    if (/FROM business_central_finance WHERE startup_id/.test(sql)) {
      const rows = state.finance.filter((r) => r.startup_id === params[0]).sort((a, b) => b.evaluated_at - a.evaluated_at).slice(0, 30);
      return { rows };
    }
    if (/^INSERT INTO metrics/.test(sql)) {
      state.metrics.push(params);
      return { rows: [] };
    }
    throw new Error(`unexpected query: ${sql}`);
  };
  return { connect: async () => ({ query, release() {} }) };
}

// Minimal NTLM type2 challenge: signature, type 2, empty target name, flags, 8-byte challenge.
function type2() {
  const buf = Buffer.alloc(48);
  buf.write("NTLMSSP\0", 0, "latin1");
  buf.writeInt32LE(2, 8);
  buf.writeInt32LE(48, 16);
  buf.writeInt32LE(0x00000201, 20); // NTLM | Unicode
  Buffer.from("0123456789abcdef", "hex").copy(buf, 24);
  return "NTLM " + buf.toString("base64");
}

function startMock(balances, requests) {
  const server = http.createServer((req, res) => {
    const auth = req.headers.authorization || "";
    const msgType = auth.startsWith("NTLM ") ? Buffer.from(auth.slice(5), "base64").readInt32LE(8) : 0;
    requests.push({ url: decodeURIComponent(req.url), msgType });
    if (msgType === 1) {
      res.writeHead(401, { "WWW-Authenticate": type2() });
      return res.end();
    }
    if (msgType !== 3) {
      res.writeHead(401, { "WWW-Authenticate": "NTLM" });
      return res.end();
    }
    const m = decodeURIComponent(req.url).match(/Company\('([^']+)'\)\/testtest\?\$filter=(.*)$/);
    const company = m && balances[m[1]];
    if (!company) {
      res.writeHead(404);
      return res.end();
    }
    const value = /'1331'/.test(m[2])
      ? [{ No: "1331", Balance: company.next() }]
      : [{ No: "1601", Balance: company.liabilities[0] }, { No: "1602", Balance: company.liabilities[1] }];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ value }));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

test("scraper job reads Business Central over NTLM and persists metrics", async (t) => {
  const state = { startups: [1, 2], finance: [], metrics: [], queries: [], bcUsers: {
    1: { company: "Fictional Robotics", username: "demo", lm_hashed_password: Array(16).fill(1), nt_hashed_password: Array(16).fill(2) },
    2: { company: "Missing Co", username: "demo", lm_hashed_password: Array(16).fill(3), nt_hashed_password: Array(16).fill(4) },
  } };
  const seq = [100000.004, 90000, 81000.5];
  const balances = { "Fictional Robotics": { next: () => seq.shift(), liabilities: [12000.25, 8000] } };
  const requests = [];
  const server = await startMock(balances, requests);
  t.after(() => server.close());

  process.env.BUSINESS_CENTRAL = `http://127.0.0.1:${server.address().port}/ODataV4/`;
  process.env.NODE_ENV = "test";

  const dbPath = require.resolve(path.join(dist, "config", "db.js"));
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { __esModule: true, default: fakePool(state) } };
  let tick;
  const cronPath = require.resolve("cron", { paths: [dist] });
  require.cache[cronPath] = { id: cronPath, filename: cronPath, loaded: true, exports: { CronJob: function (schedule, onTick) { tick = onTick; } } };

  const logs = [];
  const orig = { info: console.info, error: console.error };
  console.info = (...a) => logs.push(a.join(" "));
  console.error = (...a) => logs.push("ERR " + a.join(" "));
  t.after(() => Object.assign(console, orig));

  require(path.join(dist, "api", "job.js")).startJob();
  assert.equal(typeof tick, "function");
  for (let i = 0; i < 3; i++) await tick();

  // Handshake and contract: type1 then type3 per OData call; two calls per run.
  const authed = requests.filter((r) => r.msgType === 3 && r.url.includes("Fictional Robotics"));
  assert.equal(authed.length, 6);
  assert.ok(authed.some((r) => r.url.endsWith("$filter=No eq '1331'")));
  assert.ok(authed.some((r) => r.url.endsWith("$filter=No eq '1601' or No eq '1602'")));
  assert.ok(requests.every((r) => r.msgType === 1 || r.msgType === 3));

  // Rounded financial rows stored for the reachable company only.
  assert.deepEqual(state.finance.map((r) => [r.balance, r.short_term_liabilities, r.startup_id]), [
    [100000, 20000.25, 1],
    [90000, 20000.25, 1],
    [81000.5, 20000.25, 1],
  ]);

  // Metrics come from the unchanged calculateMetrics (newest vs. oldest row).
  const last = state.metrics.at(-1);
  assert.equal(last[4], 1);
  assert.equal(last[1], 100000 - 81000.5); // burn rate
  assert.equal(last[2], 81000.5 / (100000 - 81000.5)); // cash runway
  assert.equal(last[3], 81000.5 / 20000.25); // liquidity

  // The unreachable company is logged, not fatal.
  assert.ok(logs.some((l) => l.startsWith("ERR") && l.includes("Missing Co")));
});
