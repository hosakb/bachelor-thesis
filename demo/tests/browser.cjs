const {chromium} = require('../../dashboard/node_modules/@playwright/test');
const {launch} = require('./launch.cjs');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const out = path.join(__dirname,'../qa');
async function main() {
  fs.mkdirSync(out,{recursive:true});
  const run = await launch();
  const results = {cases:[],errors:[]};
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
    for (const width of [1440,834,390]) for (const role of ['admin','startup','fund','stakeholder']) {
      const context = await browser.newContext({viewport:{width,height:1000}});
      await context.route('**/*',route => {
        if(new URL(route.request().url()).origin !== run.base) {results.errors.push('External request '+route.request().url());return route.abort();}
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror',error=>results.errors.push(error.message));
      page.on('console',message=>{if(message.type()==='error')results.errors.push(message.text());});
      page.on('response',response=>{if(response.status()>=400)results.errors.push(`${response.status()} ${response.url()}`);});
      await page.goto(run.base);
      await page.selectOption('#role',role);
      await Promise.all([page.waitForURL(run.base+(role==='admin'?'/admin':role==='startup'?'/startup':'/fund')),page.locator('button[type=submit]').click()]);
      if(role === 'startup') {
        await page.waitForFunction(()=>window.Chart && Chart.getChart('burn-rate-chart'));
        const values = await page.evaluate(()=>Chart.getChart('burn-rate-chart').data.datasets[0].data);
        assert.deepEqual(values,[0,10000,18999.5]);
        assert.equal(await page.locator('#gantt .bar-wrapper').count(),4);
        await page.goto(run.base+'/startup/submit');
        await page.goBack();
        await page.reload();
        await page.waitForFunction(()=>window.Chart && Chart.getChart('burn-rate-chart'));
        assert.deepEqual(await page.evaluate(()=>Chart.getChart('burn-rate-chart').data.datasets[0].data),values);
      } else if(role === 'fund' || role === 'stakeholder') {
        await page.waitForSelector('#table .ag-center-cols-container .ag-row');
        assert.equal(await page.locator('#table .ag-center-cols-container .ag-row').count(),role==='fund'?3:2);
        await page.reload();
      } else await page.reload();
      if(role === 'startup') await page.getByText('Year',{exact:true}).click();
      // Chart.js animates for one second. Capture the final values, not a frame
      // between the initial zero line and the real imported series.
      await page.waitForTimeout(1300);
      await page.screenshot({path:path.join(out,`${role}-${width}.png`),fullPage:true});
      await page.goto(run.base+'/logout');
      assert.equal(new URL(page.url()).pathname,'/');
      results.cases.push({role,width,passed:true});
      await context.close();
    }
    assert.deepEqual(results.errors,[]);
    console.log(JSON.stringify(results,null,2));
  } finally {
    if(browser) await browser.close();
    await run.stop();
    fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(results,null,2)+'\n');
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
