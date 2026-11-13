const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

test('normal scraper build emits the job at its documented path', () => {
  assert.ok(fs.existsSync(path.join(__dirname,'../../scraper/dist/api/job.js')));
});

test('real scraper imports three snapshots into the shared SQL database and dashboard metrics', async t => {
  const {createDemo} = require('../runtime.cjs');
  const demo = await createDemo({erpPort:0});
  t.after(() => demo.close());
  const rows = (await demo.pool.query('SELECT * FROM business_central_finance ORDER BY id')).rows;
  assert.equal(rows.length,15);
  const first = rows.find(row => row.startup_id === demo.ids.helio);
  assert.equal(first.balance,100000);
  assert.equal(first.short_term_liabilities,20000.25);
  const helio = demo.ids.helio;
  const metrics = (await demo.pool.query('SELECT * FROM metrics WHERE startup=$1 ORDER BY date DESC LIMIT 1',[helio])).rows[0];
  assert.equal(metrics.burn_rate,100000-81000.5);
  assert.equal(metrics.cash_runway,81000.5/(100000-81000.5));
  assert.equal(metrics.liquidity,81000.5/20000.25);
  const model = require('../../dashboard/src/models/metrics.ts');
  const displayed = await model.getMetrics(helio);
  assert.equal(displayed.length,3);
  assert.equal(displayed[2].burnRate,metrics.burn_rate);
  assert.equal(displayed[2].cashRunway,metrics.cash_runway);
  await Promise.all([demo.importLatest(),demo.importLatest()]);
  assert.equal((await demo.pool.query('SELECT * FROM business_central_finance')).rows.length,25);
  assert.equal(demo.mock.requests.filter(r => r.type === 3).length,50);
});
