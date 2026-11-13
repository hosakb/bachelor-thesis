const { chromium } = require('@playwright/test');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'qa', 'role-picker');
const BASE = 'http://127.0.0.1:3335';
async function main() {
 fs.mkdirSync(OUT, { recursive: true });
 const child = spawn(process.execPath, ['local-demo.cjs'], { cwd: ROOT, env: { PATH: process.env.PATH, PORT: '3335' }, stdio: ['ignore','pipe','pipe'] });
 let logs = ''; child.stdout.on('data', d => logs += d); child.stderr.on('data', d => logs += d);
 let browser; const results = { checks: [], errors: [] };
 try {
  let ready = false;
  for (let i=0; i<100; i++) { try { if ((await fetch(BASE)).status === 200) { ready = true; break; } } catch {} await new Promise(r => setTimeout(r,100)); }
  assert.ok(ready, logs);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
   for (const role of ['admin','startup','fund','stakeholder']) {
    const context = await browser.newContext({viewport});
    await context.route('**/*', r => new URL(r.request().url()).origin === BASE ? r.continue() : r.abort());
    const page = await context.newPage();
    page.on('pageerror', e => results.errors.push(e.message));
    page.on('console', m => { if(m.type() === 'error') results.errors.push(m.text()); });
    await page.goto(BASE);
    assert.equal(await page.locator('input[type=password],input[type=email]').count(), 0);
    assert.equal(await page.locator('#role option').count(), 4);
    await page.selectOption('#role',role);
    await page.locator('#role').focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('button[type=submit]').evaluate(el => el === document.activeElement), true);
    if(role === 'admin') await page.screenshot({path:path.join(OUT,`login-${viewport.width}.png`),fullPage:true});
    const destination = role === 'admin' ? '/admin' : role === 'startup' ? '/startup' : '/fund';
    await Promise.all([page.waitForURL(BASE+destination),page.keyboard.press('Enter')]);
    await page.reload(); assert.equal(new URL(page.url()).pathname,destination);
    if(role === 'startup') assert.equal(await page.locator('#gantt .bar-wrapper').count(),4);
    if(role === 'fund' || role === 'stakeholder') {
     await page.waitForSelector('#table .ag-center-cols-container .ag-row');
     assert.equal(await page.locator('#table .ag-center-cols-container .ag-row').count(),role === 'fund' ? 3 : 2);
    }
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(OUT,`${role}-${viewport.width}.png`),fullPage:true});
    if (role === 'startup') {
     await page.getByText('Year', { exact: true }).click();
     await page.screenshot({path:path.join(OUT,`milestones-year-${viewport.width}.png`),fullPage:true});
    }
    await page.goto(BASE+'/logout'); assert.equal(new URL(page.url()).pathname,'/');
    const token = await page.locator('input[name=token]').inputValue();
    const crossOrigin = await context.request.post(BASE+'/demo/login',{headers:{Origin:'https://attacker.invalid'},form:{role:'admin'}}); assert.equal(crossOrigin.status(),403);
    const bad = await context.request.post(BASE+'/demo/login',{data:{role:'startup',id:3,token}}); assert.equal(bad.status(),400);
    await page.goto(BASE+destination); assert.equal(new URL(page.url()).pathname,'/');
    results.checks.push(`${role} ${viewport.width}: keyboard, destination, reload, populated fixtures, logout, tampering`);
    await context.close();
   }
  }
  assert.deepEqual(results.errors,[]);
  console.log(JSON.stringify(results,null,2));
 } finally {
  fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(results,null,2));
  if(browser) await browser.close();
  const exited = new Promise(r=>child.once('exit',r)); child.kill(); await exited;
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
