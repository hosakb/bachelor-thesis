const test = require('node:test');
const assert = require('node:assert/strict');
const {launch} = require('./launch.cjs');
async function login(base) {
  const res = await fetch(base);
  const cookie = res.headers.getSetCookie()[0].split(';')[0];
  const html = await res.text();
  const token = html.match(/name="token" value="([^"]+)"/)[1];
  const post = await fetch(base+'/demo/login',{method:'POST',redirect:'manual',headers:{Cookie:cookie,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({role:'startup',token})});
  assert.equal(post.status,302);
  return post.headers.getSetCookie()[0].split(';')[0];
}
test('documented launcher ignores hostile legacy settings, imports, reloads and resets on restart', async () => {
  for (let round=0;round<2;round++) {
    const run = await launch();
    try {
      const cookie = await login(run.base);
      const data = () => fetch(run.base+'/startup/chart/data',{headers:{Cookie:cookie}}).then(res => res.json());
      const before = await data();
      assert.equal(before.burnRate.periodData.length,3);
      assert.equal(before.burnRate.periodData[2],18999.5);
      assert.equal((await data()).burnRate.periodData.length,3);
      run.child.stdin.write('import\n');
      for(let i=0;i<100 && !run.log().includes('ERP IMPORT COMPLETE');i++) await new Promise(resolve=>setTimeout(resolve,50));
      assert.ok(run.log().includes('ERP IMPORT COMPLETE'),run.log());
      assert.equal((await data()).burnRate.periodData.length,4);
      assert.ok(!run.log().includes('invalid.invalid'));
    } finally {await run.stop();}
  }
});
