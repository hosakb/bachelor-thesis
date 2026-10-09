// Large-fixture check: portfolio with many startups loads completely and fast.
// Run: LOCAL_DB_EXTRA_STARTUPS=150 node --test tests/large-fixture.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
process.env.LOCAL_DB_EXTRA_STARTUPS = process.env.LOCAL_DB_EXTRA_STARTUPS || "150";
const { pool } = require("./local-db.cjs");
const request = require("supertest");
const app = require("../src/server.ts").default;

test("fund portfolio lists every mapped startup in a large fixture", async () => {
  const expected = (
    await pool.query("SELECT count(*)::int AS n FROM investor_startup_map WHERE fund_id=1")
  ).rows[0].n;
  assert.ok(expected >= 150);
  const agent = request.agent(app);
  await agent
    .post("/login")
    .send({ email: "fund@example.test", password: "local-demo-only" })
    .expect(302);
  const started = Date.now();
  await agent.get("/fund").timeout(20000).expect(200);
  const table = await agent.get("/fund/table/values").expect(200);
  const elapsed = Date.now() - started;
  assert.equal(table.body.length, expected);
  assert.equal(new Set(table.body.map((r) => r.id)).size, expected);
  console.log(`portfolio rows=${table.body.length} load_ms=${elapsed}`);
});
