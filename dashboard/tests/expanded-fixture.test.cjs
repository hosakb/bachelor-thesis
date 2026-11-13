const test = require('node:test');
const assert = require('node:assert/strict');
const { pool, ids } = require('./local-db.cjs');
const request = require('supertest');
const app = require('../src/server.ts').default;
async function login(name) { const agent = request.agent(app); await agent.post('/login').send({email:name+'@example.test',password:'local-demo-only'}).expect(302); return agent; }
test('expanded deterministic portfolios and histories render with ownership isolation', async () => {
 const cases = [['fund',['HelioFusion','Quantum Forge','Tidal Health']],['stakeholder',['Quantum Forge','Tidal Health']],['fund2',['Tidal Health','Cedar Analytics']],['stakeholder2',['Cedar Analytics','Orbit Labs']],['emptyfund',[]]];
 for(const [name,names] of cases) {
  const agent=await login(name); await agent.get('/fund').expect(200);
  const table=await agent.get('/fund/table/values').expect(200);
  assert.deepEqual(table.body.map(r=>r.name).sort(),names.sort());
 }
 const agent=await login('startup4');
 const rows=(await pool.query('SELECT * FROM milestones WHERE startup_id=$1',[ids.tide])).rows;
 assert.equal(rows.length,4); assert.deepEqual(rows.map(r=>r.progress).sort((a,b)=>a-b),[0,50,65,100]);
 const page=await agent.get('/startup/submit').expect(200); assert.match(page.text,/Market launch/); assert.match(page.text,/Feasibility complete/);
 const milestone=rows.find(r=>r.name==='Pilot deployment');
 await agent.put('/startup/gantt/progress').send({taskId:milestone.id,progress:75}).expect(200);
 assert.equal((await pool.query('SELECT progress FROM milestones WHERE id=$1',[milestone.id])).rows[0].progress,75);
 await agent.get('/startup').expect(200);
 const foreign=await login('startup5');
 await foreign.put('/startup/gantt/progress').send({taskId:milestone.id,progress:10}).expect(403);
 assert.equal((await pool.query('SELECT progress FROM milestones WHERE id=$1',[milestone.id])).rows[0].progress,75);
 for(const table of ['trl','patents','investors']) assert.equal((await pool.query(`SELECT id FROM ${table} WHERE startup_id=$1`,[ids.tide])).rows.length,2);
 assert.equal((await pool.query('SELECT id FROM metrics WHERE startup=$1',[ids.tide])).rows.length,4);
 assert.equal((await pool.query('SELECT id FROM users WHERE startup=$1',[ids.tide])).rows.length,2);
 const empty=await login('emptyonboarding'); await empty.get('/onboarding/startup').expect(200);
});
