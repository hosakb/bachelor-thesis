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
CREATE TABLE track_record (id serial PRIMARY KEY, expertise text, ventures jsonb);
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
   INSERT INTO patents (invention,inventor,status,patent_office,startup_id) VALUES ('Demo invention','Avery','initial-application','DPMA',${id});`);
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

// Keep original identities and first milestone IDs stable for regressions.
// Additional fixtures are deterministic and use no external services.
const tide = seedStartup('Tidal Health', { sector: 'Health' });
const cedar = seedStartup('Cedar Analytics', { sector: 'Software' });
const empty = db.public.one("INSERT INTO startup (name,stage,sector,cap_table,questionnaire) VALUES ('Empty Meadow','Pre-seed','Agriculture',NULL,NULL) RETURNING id").id;
db.public.none(`

UPDATE startup SET stage='Pre-seed' WHERE id=${orbit};
UPDATE startup SET stage='Growth' WHERE id=${tide};
UPDATE startup SET stage='Series B' WHERE id=${cedar};
INSERT INTO investor (name,investment_sector,fund_volume,hard_cap,next_closing,final_closing,type,weights) VALUES
 ('Meridian Capital','Health',15000000,30000000,'2026-10-01','2027-03-01','fund',${json(weights)}),
 ('Juniper Incubator','Software',3000000,5000000,'2026-11-15','2027-04-01','stakeholder',${json(weights)}),
 ('Empty Horizon Fund','Agriculture',1000000,2000000,'2027-01-01','2027-07-01','fund',${json(weights)});
INSERT INTO investor_startup_map VALUES (1,${tide},3.8),(2,${tide},2.6),(3,${tide},3.2),(3,${cedar},4.2),(4,${cedar},3.6),(4,${orbit},2.1);
`);
for (const [id, name] of [[helio, 'HelioFusion'], [quantum, 'Quantum Forge'], [orbit, 'Orbit Labs'], [tide, 'Tidal Health'], [cedar, 'Cedar Analytics']]) {
  const trackRecord = db.public.one(`INSERT INTO track_record (expertise,ventures) VALUES ('["Research","Product"]','[]') RETURNING id`).id;
  db.public.none(`
  INSERT INTO milestones (name,start_date,end_date,progress,index,startup_id) VALUES
   ('Feasibility complete','2025-09-01','2025-12-01',100,1,${id}),
   ('Pilot deployment','2026-06-01','2026-12-01',65,2,${id}),
   ('Market launch','2027-01-01','2027-04-01',0,3,${id});
  INSERT INTO metrics (date,burn_rate,cash_runway,liquidity,startup) VALUES ('2026-03-01',16000,14,1.8,${id}),('2026-04-01',18000,12,1.6,${id});
  INSERT INTO trl (technology,trl,criticality,startup_id) VALUES ('Integration subsystem',4,2,${id});
  INSERT INTO investors (name,type,email,country,notes,contact_date,status,startup_id) VALUES ('Meridian Demo Contacts','VC','hello@example.test','Germany','Fictional follow-up','2026-04-01','contacted',${id});
  INSERT INTO patents (invention,inventor,status,patent_office,application_confirmation_date,startup_id) VALUES ('${name} fictional component','Morgan','initial-application','EPO','2026-03-01',${id});
  INSERT INTO users (first_name,last_name,email,password,role,startup,track_record) VALUES ('Morgan','Demo','founder${id}@example.test','${hash}','startup',${id},${trackRecord});
  UPDATE startup SET cap_table=${json([['Founder','Shares','Share'],['Avery',60,60],['Morgan',20,20],['Demo Fund',20,20]])} WHERE id=${id};
  `);
}
const extraAccounts = [
 ['fund2','fund',null,3,1], ['stakeholder2','stakeholder',null,4,1], ['emptyfund','fund',null,5,1],
 ['startup3','startup',orbit,null,1], ['startup4','startup',tide,null,1], ['startup5','startup',cedar,null,1], ['emptyonboarding','startup',empty,null,null],
];
for (const [login, role, startup, fund, trackRecord] of extraAccounts) {
 const record = trackRecord === null ? null : db.public.one(`INSERT INTO track_record (expertise,ventures) VALUES ('["Engineering"]','[]') RETURNING id`).id;
 db.public.none(`INSERT INTO users (first_name,last_name,email,password,role,startup,fund,track_record) VALUES ('Avery','Demo','${login}@example.test','${hash}','${role}',${startup ?? 'NULL'},${fund ?? 'NULL'},${record ?? 'NULL'});`);
}
const demoAccounts = Object.freeze({ admin: 'admin@example.test', startup: 'startup@example.test', fund: 'fund@example.test', stakeholder: 'stakeholder@example.test' });
module.exports = { db, pool, demoAccounts, ids: { helio, quantum, orbit, fresh, tide, cedar, empty } };
