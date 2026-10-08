// Test-only in-memory PostgreSQL substitute (pg-mem).
//
// Loaded with `node --require ./tests/local-db.cjs ...`. It replaces the
// module exported by src/config/db.ts *before* any application module is
// loaded, so the dashboard never reads .env, never builds a connection string
// and never contacts a remote database or Business Central. All data below is
// fictional. State lives only for the lifetime of the process.
//
// LOCAL_DB_EXTRA_STARTUPS=<n> adds n additional portfolio startups to the
// fund (each with TRL, milestones, metrics, investors and patents) for
// larger-fixture and stress runs.
const { newDb } = require("pg-mem");
const bcrypt = require("bcryptjs");
const fs = require("node:fs");
const path = require("node:path");

require("ts-node/register");

const db = newDb();
db.public.none(`
CREATE TABLE startup (id serial PRIMARY KEY, name text, stage text DEFAULT 'Seed', invested_capital float DEFAULT 0, sector text, has_product boolean, est_time_to_market integer, product text, cap_table jsonb, questionnaire jsonb, info jsonb, created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now());
CREATE TABLE investor (id serial PRIMARY KEY, name text, investment_sector text, fund_volume float, hard_cap float, next_closing timestamp, final_closing timestamp, type text, weights jsonb, created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now());
CREATE TABLE track_record (id serial PRIMARY KEY, expertise jsonb, ventures jsonb);
CREATE TABLE users (id serial PRIMARY KEY, first_name text, last_name text, email text UNIQUE, password text, role text, startup integer REFERENCES startup(id) ON DELETE SET NULL, fund integer REFERENCES investor(id) ON DELETE SET NULL, track_record integer REFERENCES track_record(id), created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now());
CREATE TABLE investor_startup_map (fund_id integer REFERENCES investor(id) ON DELETE CASCADE, startup_id integer REFERENCES startup(id) ON DELETE CASCADE, rating float, PRIMARY KEY(fund_id,startup_id));
CREATE TABLE trl (id serial PRIMARY KEY, technology text, trl float, criticality float, startup_id integer REFERENCES startup(id) ON DELETE CASCADE);
CREATE TABLE metrics (id serial PRIMARY KEY, date timestamp, burn_rate float, cash_runway float, liquidity float, startup integer REFERENCES startup(id) ON DELETE CASCADE);
CREATE TABLE milestones (id serial PRIMARY KEY, name text, start_date timestamp, end_date timestamp, progress float, index integer, startup_id integer REFERENCES startup(id) ON DELETE CASCADE);
CREATE TABLE investors (id serial PRIMARY KEY, name text, type text, email text, number text, url text, country text, notes text, contact_date timestamp, status text DEFAULT 'contacted', startup_id integer REFERENCES startup(id) ON DELETE CASCADE);
CREATE TABLE business_central (id serial PRIMARY KEY, company text, username text, startup_id integer REFERENCES startup(id) ON DELETE CASCADE, lm_hashed_password text, nt_hashed_password text);
CREATE TABLE patents (id serial PRIMARY KEY, invention text, inventor text, status text, patent_office text, application_confirmation_date timestamp, annual_fee_date timestamp, patent_examination_notice_date timestamp, grant_date timestamp, patent_duration integer, registration_fee boolean DEFAULT false, inventor_nomination boolean DEFAULT false, examination_request boolean DEFAULT false, patent_examination_notice boolean DEFAULT false, grant_fee boolean DEFAULT false, objection boolean DEFAULT false, objection_response boolean DEFAULT false, rejection_reason text, rejection_date timestamp, startup_id integer REFERENCES startup(id) ON DELETE CASCADE, created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now());
`);

const adapter = db.adapters.createPg();
const pool = new adapter.Pool();
const dbPath = require.resolve("../src/config/db.ts");
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { __esModule: true, default: pool },
};

const questionnaireKeys = [
  ...fs
    .readFileSync(path.join(__dirname, "../src/models/startup.ts"), "utf8")
    .matchAll(/^ {2}(q\d_\d_\d+): number;/gm),
].map((m) => m[1]);
const questionnaire = Object.fromEntries(questionnaireKeys.map((k) => [k, 3]));
const json = (value) => "'" + JSON.stringify(value).replaceAll("'", "''") + "'";
const sql = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const weights = { h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, h7: 1, h8: 1, sum: 8 };
const capTable = [
  ["Founder", "Shares", "Share"],
  ["Avery", 80, 80],
  ["Aurora", 20, 20],
];

db.public.none(`
INSERT INTO investor (name,investment_sector,fund_volume,hard_cap,next_closing,final_closing,type,weights) VALUES
 ('Aurora Ventures','Deep Tech',10000000,20000000,'2026-11-01','2027-01-01','fund',${json(weights)}),
 ('Northern Incubator','Climate',2000000,4000000,'2026-12-01','2027-06-01','stakeholder',${json(weights)});
INSERT INTO track_record (expertise,ventures) VALUES ('["Engineering","Management"]','[]');
`);

// Fully onboarded portfolio startup with representative data.
function seedStartup(name, { onboarded = true, sector = "Energy" } = {}) {
  const id = db.public.one(
    `INSERT INTO startup (name,stage,invested_capital,sector,product,cap_table,questionnaire) VALUES (${sql(name)},'Seed',1000000,${sql(sector)},'Prototype',${onboarded ? json(capTable) : "NULL"},${onboarded ? json(questionnaire) : "NULL"}) RETURNING id;`
  ).id;
  if (!onboarded) return id;
  db.public.none(`
   INSERT INTO trl (technology,trl,criticality,startup_id) VALUES ('Core technology',5,3,${id});
   INSERT INTO milestones (name,start_date,end_date,progress,index,startup_id) VALUES ('Prototype','2026-01-01','2026-03-01',50,0,${id});
   INSERT INTO metrics (date,burn_rate,cash_runway,liquidity,startup) VALUES ('2026-01-01',12000,18,2.1,${id}),('2026-02-01',14000,16,1.9,${id});
   INSERT INTO investors (name,type,email,contact_date,startup_id) VALUES ('Fictional Capital','VC','contact@example.test','2026-02-01',${id});
   INSERT INTO business_central (company,username,startup_id) VALUES ('Fictional','demo',${id});
   INSERT INTO patents (invention,inventor,status,patent_office,startup_id) VALUES ('Demo invention','Avery','application-phase','DPMA',${id});`);
  return id;
}

const helio = seedStartup("HelioFusion");
const quantum = seedStartup("Quantum Forge");
const orbit = seedStartup("Orbit Labs", { sector: "Space" }); // in no portfolio
const fresh = seedStartup("Fresh Start", { onboarded: false }); // onboarding flow

db.public.none(`
INSERT INTO investor_startup_map VALUES (1,${helio},2.4),(1,${quantum},3.1),(2,${quantum},4.0);
`);

const extra = Math.max(0, parseInt(process.env.LOCAL_DB_EXTRA_STARTUPS || "0", 10) || 0);
for (let i = 1; i <= extra; i++) {
  const id = seedStartup(`Fixture Startup ${String(i).padStart(3, "0")}`);
  db.public.none(`INSERT INTO investor_startup_map VALUES (1,${id},${(1 + (i % 17)).toFixed(1)});`);
}

const hash = bcrypt.hashSync("local-demo-only", 10);
const users = [
  ["admin", "admin", null, null, 1],
  ["startup", "startup", helio, null, 1],
  ["startup2", "startup", quantum, null, 1],
  ["onboarding", "startup", fresh, null, null],
  ["fund", "fund", null, 1, 1],
  ["stakeholder", "stakeholder", null, 2, 1],
];
for (const [login, role, startup, fund, trackRecord] of users) {
  db.public.none(
    `INSERT INTO users (first_name,last_name,email,password,role,startup,fund,track_record) VALUES ('Avery','Demo','${login}@example.test','${hash}','${role}',${startup ?? "NULL"},${fund ?? "NULL"},${trackRecord ?? "NULL"});`
  );
}

module.exports = { db, pool, ids: { helio, quantum, orbit, fresh } };
