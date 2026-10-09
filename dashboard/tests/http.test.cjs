// HTTP regression tests against the real Express app with the isolated
// in-memory database (tests/local-db.cjs). Run: node --test tests/http.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const { pool, ids } = require("./local-db.cjs");
const request = require("supertest");
const app = require("../src/server.ts").default;

async function login(role) {
  const agent = request.agent(app);
  await agent
    .post("/login")
    .send({ email: role + "@example.test", password: "local-demo-only" })
    .expect(302);
  return agent;
}

const one = async (query, params) => (await pool.query(query, params)).rows[0];

test("TRL edits and deletion respond and persist", async () => {
  const agent = await login("startup");
  await agent
    .post("/startup/submit/update-trl")
    .send({ trlData: { id: 1, technology: "Edited", trl: 6, criticality: 3 } })
    .timeout(1500)
    .expect(200);
  assert.equal((await one("SELECT technology FROM trl WHERE id=1")).technology, "Edited");
  await agent.post("/startup/submit/delete-trl").send({ id: 1 }).timeout(1500).expect(200);
  assert.equal((await pool.query("SELECT id FROM trl WHERE id=1")).rows.length, 0);
});

test("Gantt updates respond and persist", async () => {
  const agent = await login("startup");
  await agent
    .put("/startup/gantt/progress")
    .send({ taskId: 1, progress: 65 })
    .timeout(1500)
    .expect(200);
  await agent
    .put("/startup/gantt/period")
    .send({ taskId: 1, start: "2026-02-01", end: "2026-04-01" })
    .timeout(1500)
    .expect(200);
  assert.equal((await one("SELECT progress FROM milestones WHERE id=1")).progress, 65);
});

test("Routers are restricted to their roles", async () => {
  const startup = await login("startup");
  await startup.get("/admin").expect(403);
  await startup.post("/admin/get-user").send({ id: 1 }).expect(403);
  await startup.post("/admin/delete-user").send({ id: 1 }).expect(403);
  await startup.get("/fund").expect(403);

  const fund = await login("fund");
  await fund.get("/admin/users").expect(403);
  await fund.get("/startup").expect(403);
  await fund.get("/onboarding/product").expect(403);

  const stakeholder = await login("stakeholder");
  await stakeholder.get("/admin").expect(403);
  await stakeholder.get("/startup/submit").expect(403);

  const admin = await login("admin");
  await admin.get("/startup").expect(403);
  await admin.get("/fund").expect(403);
  await admin.get("/admin").expect(200);

  assert.ok(await one("SELECT id FROM users WHERE id=1"));
  await request(app).get("/admin").expect(302).expect("Location", "/");
});

test("Startups cannot modify another startup's records", async () => {
  const agent = await login("startup");
  const foreign = ids.quantum;
  const trl = await one("SELECT id, technology FROM trl WHERE startup_id=$1", [foreign]);
  const milestone = await one("SELECT id, progress FROM milestones WHERE startup_id=$1", [foreign]);
  const investor = await one("SELECT id, status FROM investors WHERE startup_id=$1", [foreign]);
  const patent = await one("SELECT id, status FROM patents WHERE startup_id=$1", [foreign]);

  await agent
    .post("/startup/submit/update-trl")
    .send({ trlData: { id: trl.id, technology: "Hijacked", trl: 1, criticality: 1 } })
    .expect(403);
  await agent.post("/startup/submit/delete-trl").send({ id: trl.id }).expect(403);
  await agent.put("/startup/gantt/progress").send({ taskId: milestone.id, progress: 1 }).expect(403);
  await agent
    .put("/startup/gantt/period")
    .send({ taskId: milestone.id, start: "2020-01-01", end: "2020-02-01" })
    .expect(403);
  await agent
    .post("/startup/submit/update-investor-status")
    .send({ id: investor.id, status: "declined" })
    .expect(403);
  await agent
    .post("/startup/submit/cancel-patent")
    .send({ id: patent.id, date: "2026-01-01", status: "rejected", reason: "x" })
    .expect(403);
  await agent
    .post("/startup/submit/update-status")
    .send({ patentId: patent.id, currentPatentStatus: "application-phase", nextPhaseDate: "2026-01-01" })
    .expect(403);
  await agent.post("/startup/submit/delete-trl").send({ id: "1 OR 1=1" }).expect(403);

  assert.equal((await one("SELECT technology FROM trl WHERE id=$1", [trl.id])).technology, trl.technology);
  assert.equal((await one("SELECT progress FROM milestones WHERE id=$1", [milestone.id])).progress, milestone.progress);
  assert.equal((await one("SELECT status FROM investors WHERE id=$1", [investor.id])).status, investor.status);
  assert.equal((await one("SELECT status FROM patents WHERE id=$1", [patent.id])).status, patent.status);

  const own = await one("SELECT id FROM investors WHERE startup_id=$1", [ids.helio]);
  await agent
    .post("/startup/submit/update-investor-status")
    .send({ id: own.id, status: "accepted" })
    .expect(200);
  assert.equal((await one("SELECT status FROM investors WHERE id=$1", [own.id])).status, "accepted");
});

test("Funds and stakeholders can only open startups in their portfolio", async () => {
  const fund = await login("fund");
  await fund.post("/fund/startup").send({ id: ids.orbit }).expect(403);
  await fund.post("/fund/startup").send({ id: ids.helio }).expect(302);
  const detail = await fund.get("/fund/startup").expect(200);
  assert.match(detail.text, /HelioFusion/);

  const stakeholder = await login("stakeholder");
  await stakeholder.post("/fund/startup").send({ id: ids.helio }).expect(403);
  await stakeholder.post("/fund/startup").send({ id: ids.quantum }).expect(302);
  const rating = await stakeholder.get("/fund/startup/rating").expect(200);
  assert.match(rating.text, /Quantum Forge/);
  await stakeholder.get("/fund").expect(200);
  const table = await stakeholder.get("/fund/table/values").expect(200);
  assert.deepEqual(table.body.map((row) => row.name), ["Quantum Forge", "Tidal Health"]);
});

test("Startup detail renders when a startup has no TRL entries", async () => {
  await pool.query("DELETE FROM trl WHERE startup_id=$1", [ids.helio]);
  const fund = await login("fund");
  await fund.post("/fund/startup").send({ id: ids.helio }).expect(302);
  const detail = await fund.get("/fund/startup").timeout(1500).expect(200);
  assert.match(detail.text, /TRL\(PROD\) of Prototype/);
  assert.match(detail.text, /<h2>\s*–\s*<\/h2>/);
  assert.doesNotMatch(detail.text, /NaN/);
});

test("Fund detail pages without a selected startup redirect cleanly", async () => {
  const fund = await login("fund");
  for (const path of ["/fund/startup", "/fund/startup/founders", "/fund/startup/rating"]) {
    const res = await fund.get(path).timeout(1500).expect(302);
    assert.equal(res.headers.location, "/fund/");
  }
});

test("Login landing does not redirect to itself; logout completes before redirect", async () => {
  const agent = await login("admin");
  assert.equal((await agent.get("/").expect(302)).headers.location, "/admin");
  await agent.get("/logout").expect(302);
  await agent.get("/admin").expect(302);
});

test("TRL deletion accepts the legacy nested payload", async () => {
  const agent = await login("startup2");
  const row = await one("SELECT id FROM trl WHERE startup_id=$1", [ids.quantum]);
  await agent.post("/startup/submit/delete-trl").send({ id: { id: row.id } }).timeout(1500).expect(200);
  assert.equal((await pool.query("SELECT id FROM trl WHERE id=$1", [row.id])).rows.length, 0);
});

test("Milestone edits render as date-input values, validate and persist", async () => {
  const agent = await login("startup2");
  const page = await agent.get("/startup/submit").timeout(1500).expect(200);
  assert.match(page.text, /<td class="nowrap">\s*2026-01-01\s*<\/td>/);
  assert.doesNotMatch(page.text, /GMT/);
  const m = await one("SELECT id FROM milestones WHERE startup_id=$1", [ids.quantum]);

  const bad = [
    { name: "", start: "2026-01-01", end: "2026-02-01", progress: 10 },
    { name: "X", start: "", end: "2026-02-01", progress: 10 },
    { name: "X", start: "2026-03-01", end: "2026-02-01", progress: 10 },
    { name: "X", start: "2026-01-01", end: "2026-02-01", progress: 101 },
    { name: "X", start: "2026-01-01", end: "2026-02-01", progress: "" },
  ];
  for (const body of bad) {
    await agent.post("/startup/submit/update-milestone").send({ id: m.id, ...body }).expect(400);
  }
  await agent
    .post("/startup/submit/update-milestone")
    .send({ id: 999999, name: "X", start: "2026-01-01", end: "2026-02-01", progress: 1 })
    .expect(404);

  const name = `Pilot <b>"&'</b> ${"x".repeat(200)}`;
  await agent
    .post("/startup/submit/update-milestone")
    .send({ id: m.id, name, start: "2026-04-02", end: "2026-05-03", progress: "40" })
    .expect(200);
  const reloaded = await agent.get("/startup/submit").expect(200);
  assert.match(reloaded.text, /<td class="nowrap">\s*2026-04-02\s*<\/td>/);
  assert.match(reloaded.text, /<td class="nowrap">\s*2026-05-03\s*<\/td>/);
  assert.ok(reloaded.text.includes("Pilot &lt;b&gt;&#34;&amp;&#39;&lt;/b&gt;"));
  assert.ok(!reloaded.text.includes("<b>\"&'</b>"));
});

test("Investor status rejects unknown values", async () => {
  const agent = await login("startup2");
  const inv = await one("SELECT id, status FROM investors WHERE startup_id=$1", [ids.quantum]);
  await agent.post("/startup/submit/update-investor-status").send({ id: inv.id, status: "hacked" }).expect(400);
  assert.equal((await one("SELECT status FROM investors WHERE id=$1", [inv.id])).status, inv.status);
});

test("Icon font and stylesheet are served locally", async () => {
  const css = await request(app).get("/css/line-awesome.min.css").expect(200);
  assert.match(css.text, /\.\.\/fonts\/la-solid-900\.woff2/);
  const font = await request(app).get("/fonts/la-solid-900.woff2").expect(200);
  assert.ok(font.body.length > 1000);
  const agent = await login("startup");
  const page = await agent.get("/startup/submit").expect(200);
  assert.ok(!page.text.includes("icons8.com"));
});

test("Cap table uploads are parsed per request and never written to public/", async () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const xlsx = fs.readFileSync(path.join(__dirname, "../../VC-Cap-Table-Example.xlsx"));
  const before = await one("SELECT stage, invested_capital FROM startup WHERE id=$1", [ids.helio]);

  const agent = await login("startup");
  // Invalid file: rejected without touching the investment round.
  await agent
    .post("/startup/submit/cap-table")
    .field("nextPhase", "series-a")
    .field("investedCapital", "5000000")
    .attach("cap-table", Buffer.from("not a spreadsheet"), { filename: "x.txt", contentType: "text/plain" })
    .expect(302)
    .expect("Location", "/startup/submit?capTableError=1");
  const unchanged = await one("SELECT stage, invested_capital FROM startup WHERE id=$1", [ids.helio]);
  assert.deepEqual(unchanged, before);

  // Two concurrent uploads by different startups keep their own data.
  const other = await login("startup2");
  const tiny = Buffer.from("PK"); // not a valid xlsx, must fail independently
  const [good, bad] = await Promise.all([
    agent
      .post("/startup/submit/cap-table")
      .field("nextPhase", "series-a")
      .field("investedCapital", "5000000")
      .attach("cap-table", xlsx, {
        filename: "cap.xlsx",
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    other
      .post("/startup/submit/cap-table")
      .field("nextPhase", "series-b")
      .field("investedCapital", "1")
      .attach("cap-table", tiny, {
        filename: "cap.xlsx",
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
  ]);
  assert.equal(good.headers.location, "/startup/submit");
  assert.equal(bad.headers.location, "/startup/submit?capTableError=1");
  const updated = await one("SELECT stage, invested_capital, cap_table FROM startup WHERE id=$1", [ids.helio]);
  assert.equal(updated.stage, "series-a");
  assert.equal(updated.invested_capital, 5000000);
  assert.ok(Array.isArray(updated.cap_table) && updated.cap_table.length > 1);
  const quantum = await one("SELECT stage FROM startup WHERE id=$1", [ids.quantum]);
  assert.equal(quantum.stage, "Seed");
  assert.equal(fs.existsSync(path.join(__dirname, "../public/uploads")), false);

  const onboarding = await login("onboarding");
  const res = await onboarding
    .post("/onboarding/cap-table")
    .attach("cap-table", Buffer.from("x"), { filename: "x.txt", contentType: "text/plain" })
    .expect(400);
  assert.match(res.body.error, /valid \.xlsx/);
});

test("Failing async handlers return 500 instead of crashing the process", async () => {
  const admin = await login("admin");
  const res = await admin.post("/admin/get-user").send({ id: 999999 }).timeout(1500).expect(500);
  assert.deepEqual(res.body, { error: "Something went wrong." });
  assert.ok(!JSON.stringify(res.body).includes("No user found"));
  // The app keeps serving requests afterwards.
  await admin.get("/admin").expect(200);
});

test("Admin startup creation never leaves a startup without credentials", async () => {
  const admin = await login("admin");
  const before = (await pool.query("SELECT count(*)::int AS n FROM startup")).rows[0].n;
  const res = await admin
    .post("/admin/add-startup")
    .send({ name: "Orphan Check", bcCompany: "Fictional", bcUsername: "demo", bcPassword: "local-only" })
    .timeout(1500);
  const after = (await pool.query("SELECT count(*)::int AS n FROM startup")).rows[0].n;
  if (res.status === 200) {
    // NTLM hashing available (Node 12 / --openssl-legacy-provider).
    assert.equal(after, before + 1);
    const bc = await one(
      "SELECT b.id FROM business_central b JOIN startup s ON s.id=b.startup_id WHERE s.name='Orphan Check'"
    );
    assert.ok(bc);
  } else {
    assert.equal(res.status, 500);
    assert.equal(after, before);
  }
});
