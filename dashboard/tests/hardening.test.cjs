const test = require('node:test');
const assert = require('node:assert/strict');
const {pool} = require('./local-db.cjs');
const request = require('supertest');
const app = require('../src/server.ts').default;
async function login() {
  const agent=request.agent(app);
  await agent.post('/login').send({email:'startup@example.test',password:'local-demo-only'}).expect(302);
  return agent;
}
async function snapshot() {
  return JSON.stringify({milestones:(await pool.query('SELECT * FROM milestones ORDER BY id')).rows,trl:(await pool.query('SELECT * FROM trl ORDER BY id')).rows});
}
test('Gantt numeric/date validation rejects malformed values without writes',async()=>{
  const agent=await login();
  const before=await snapshot();
  for(const progress of [-1,101,'',null,true,[],{},'NaN','Infinity']) await agent.put('/startup/gantt/progress').send({taskId:1,progress}).expect(400);
  for(const [start,end] of [['2026-02-30','2026-03-01'],['2026-03-03','2026-03-01'],[null,'2026-03-01'],['2026-01-01T00:00:00Z','2026-03-01']]) await agent.put('/startup/gantt/period').send({taskId:1,start,end}).expect(400);
  assert.equal(await snapshot(),before);
  await agent.put('/startup/gantt/progress').send({taskId:1,progress:'0'}).expect(200);
  await agent.put('/startup/gantt/progress').send({taskId:1,progress:100}).expect(200);
  await agent.put('/startup/gantt/period').send({taskId:1,start:'2028-02-29',end:'2028-02-29'}).expect(200);
});
test('milestone add/update rejects the entire malformed batch before destructive persistence',async()=>{
  const agent=await login();const before=await snapshot();
  const valid={name:'Valid',start:'2026-01-01',end:'2026-02-01',progress:50};
  for(const milestones of [null,{},[],[null],[valid,{...valid,start:'2026-02-30'}],[{...valid,progress:null}],[{...valid,name:'  '}]]) await agent.post('/startup/submit/add-milestone').send({milestones}).expect(400);
  for(const progress of [null,true,[],{},'']) await agent.post('/startup/submit/update-milestone').send({id:1,...valid,progress}).expect(400);
  assert.equal(await snapshot(),before);
  await agent.post('/startup/submit/add-milestone').send({milestones:[{...valid,name:'R&D <prototype> "quoted"'}]}).expect(200);
  assert.ok((await pool.query('SELECT name FROM milestones')).rows.some(row=>row.name==='R&D <prototype> "quoted"'));
});
test('onboarding rejects malformed TRL JSON and invalid batches before any writes',async()=>{
  const agent=await login();const before=await snapshot();
  for(const trlData of ['not-json','null','{}',JSON.stringify([{technology:'First valid',trl:3,criticality:2},{technology:'Bad',trl:100,criticality:1}])]) {
    await agent.post('/onboarding/trl').send({trlData,coreTechnology:'Unchanged'}).expect(400);
  }
  assert.equal(await snapshot(),before);
});

test('TRL add/edit enforces the existing UI ranges and scalar types',async()=>{
  const agent=await login();const before=await snapshot();
  for(const [trl,criticality] of [[0,1],[10,1],[1,0],[1,4],[null,1],[true,1],[[],1],['',1],[1.5,1],[1,1.5]]) {
    await agent.post('/startup/submit/add-trl').send({newTechnology:'Bad',newTrlValue:trl,newCriticality:criticality}).expect(400);
    await agent.post('/startup/submit/update-trl').send({trlData:{id:1,technology:'Bad',trl,criticality}}).expect(400);
  }
  await agent.post('/startup/submit/add-trl').send({newTechnology:' ',newTrlValue:1,newCriticality:1}).expect(400);
  assert.equal(await snapshot(),before);
  await agent.post('/startup/submit/add-trl').send({newTechnology:'Valid',newTrlValue:'9',newCriticality:'3'}).expect(302);
});
