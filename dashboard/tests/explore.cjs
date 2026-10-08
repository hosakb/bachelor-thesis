const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
 fs.mkdirSync('qa/baseline',{recursive:true});
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH});
 const results=[];
 for (const role of ['admin','startup','fund','stakeholder']) {
  const context=await browser.newContext();
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:3307');
  await page.locator('[name=email]').fill(role+'@example.test');
  await page.locator('[name=password]').fill('local-demo-only');
  await page.locator('[type=submit]').click();
  await page.waitForTimeout(700);
  const paths=role==='admin'?['/admin','/admin/users','/admin/startups','/admin/funds']:role==='startup'?['/startup','/startup/submit']:['/fund','/fund/startup','/fund/startup/founders','/fund/startup/rating'];
  if(role==='fund'||role==='stakeholder') await page.request.post('http://127.0.0.1:3307/fund/startup',{data:{id:1}});
  for(const p of paths){
   errors.length=0;
   const response=await page.goto('http://127.0.0.1:3307'+p);
   await page.waitForTimeout(500);
   const file=`qa/baseline/${role}-${p.replaceAll('/','_')}.png`;
   await page.screenshot({path:file,fullPage:true});
   results.push({role,path:p,url:page.url(),status:response.status(),errors:[...errors],text:(await page.locator('body').innerText()).slice(0,3000),screenshot:file});
  }
  await context.close();
 }
 await browser.close();
 fs.writeFileSync('qa/baseline/results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
