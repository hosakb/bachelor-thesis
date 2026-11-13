// Explicit demo composition. Application SQL, NTLM client, import job and
// calculations are real; pg-mem, credentials, clock and ERP records are fictional.
const path = require('node:path');
const {createMock,companies} = require('./mock-erp.cjs');
const ROOT = path.join(__dirname,'..');
async function createDemo({erpPort = 3408} = {}) {
  const Module = require('node:module');
  const load = Module._load;
  Module._load = function(name,...args) {
    if (name === 'dotenv' || name === 'pg') throw new Error('ERP demo forbids legacy config/database modules');
    return load.call(this,name,...args);
  };
  const mock = createMock();
  await new Promise((resolve,reject) => {
    mock.server.once('error',reject);
    mock.server.listen(erpPort,'127.0.0.1',resolve);
  });
  const port = mock.server.address().port;
  const net = require('node:net');
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function(...args) {
    const first = Array.isArray(args[0]) ? args[0][0] : args[0];
    const options = typeof first === 'object' ? first : {port:first,host:args[1]};
    if (options.host !== '127.0.0.1' || Number(options.port) !== port || options.path) throw new Error('ERP demo permits only its own loopback mock');
    return connect.apply(this,args);
  };
  let pool;
  const close = async () => {
    await new Promise(resolve => mock.server.close(resolve));
    if (pool) await pool.end();
    net.Socket.prototype.connect = connect;
    Module._load = load;
  };
  try {
    process.chdir(path.join(ROOT,'dashboard'));
    const fixture = require('../dashboard/tests/local-db.cjs');
    pool = fixture.pool;
    // The dashboard fixture schema predates stored ERP histories. Extend only
    // this process's fictional database, never deployment schema or settings.
    await pool.query('CREATE TABLE business_central_finance (id serial PRIMARY KEY, balance float, short_term_liabilities float, startup_id integer REFERENCES startup(id), evaluated_at timestamp DEFAULT now())');
    await pool.query('DELETE FROM metrics');
    for (const company of companies) {
      await pool.query('UPDATE business_central SET company=$1, username=$2, lm_hashed_password=$3, nt_hashed_password=$4 WHERE startup_id=$5', [company.name,'demo',Array(16).fill(1),Array(16).fill(2),fixture.ids[company.key]]);
    }
    // Empty/onboarding startups have no ERP integration, just as in the fixture.
    for (const key of ['fresh','empty']) {
      await pool.query('INSERT INTO business_central (startup_id) VALUES ($1)',[fixture.ids[key]]);
    }
    let day = 0;
    const demoPool = {async connect() {
      const client = await pool.connect();
      return {release:() => client.release(), query(sql,params) {
        if (sql.startsWith('INSERT INTO business_central_finance ')) {
          return client.query('INSERT INTO business_central_finance (balance, short_term_liabilities, startup_id, evaluated_at) VALUES ($1,$2,$3,$4)', [...params,new Date(Date.UTC(2026,10,1+day))]);
        }
        return client.query(sql,params);
      }};
    }};
    const dbPath = require.resolve('../scraper/dist/config/db.js');
    require.cache[dbPath] = {id:dbPath,filename:dbPath,loaded:true,exports:{__esModule:true,default:demoPool}};
    process.env.BUSINESS_CENTRAL = `http://127.0.0.1:${port}/ODataV4/`;
    let tick;
    const cronPath = require.resolve('../scraper/node_modules/cron');
    const oldCron = require.cache[cronPath];
    require.cache[cronPath] = {id:cronPath,filename:cronPath,loaded:true,exports:{CronJob:function(schedule,onTick) {tick=onTick;}}};
    try { require('../scraper/dist/api/job.js').startJob(); }
    finally { if (oldCron) require.cache[cronPath]=oldCron; else delete require.cache[cronPath]; }
    if (!tick) throw new Error('Scraper did not register its import callback');
    const checkedTick = async () => {
      const before = (await pool.query('SELECT id FROM business_central_finance')).rows.length;
      const metricsBefore = (await pool.query('SELECT id FROM metrics')).rows.length;
      await tick();
      const after = (await pool.query('SELECT id FROM business_central_finance')).rows.length;
      const metricsAfter = (await pool.query('SELECT id FROM metrics')).rows.length;
      if (after !== before+companies.length || metricsAfter !== metricsBefore+companies.length) throw new Error('ERP import did not persist all five companies');
    };
    for (let i=0;i<3;i++) { day=i; mock.setSnapshot(i); await checkedTick(); }
    let queue = Promise.resolve();
    const importLatest = () => {
      const result = queue.then(async () => {day++; await checkedTick();});
      queue = result.catch(() => {});
      return result;
    };
    const app = require('../dashboard/src/server.ts').default;
    app.locals.demoAccounts = fixture.demoAccounts;
    return {app,pool,ids:fixture.ids,mock,importLatest,close};
  } catch(error) { await close(); throw error; }
}
module.exports = {createDemo};
