const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const ROOT=process.env.HARDENING_APP_ROOT || path.join(__dirname,'..');
const BASE='http://127.0.0.1:3427';
const OUT=path.join(__dirname,'../qa/hardening');
const payload='R&D <img src=x onerror="window.__ganttXss=1"> "quoted"';
async function main(){
 fs.mkdirSync(OUT,{recursive:true});
 const child=spawn(process.execPath,['local-demo.cjs'],{cwd:ROOT,env:{PATH:process.env.PATH,PORT:'3427'},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);
 const results={checks:[],errors:[]};let browser;
 try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(BASE)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.ok(ready,logs);
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});
  for(const width of [1440,390]){
   for(const role of ['startup','fund','stakeholder']){
    const taskId=role==='stakeholder'?'2':'1';
    const context=await browser.newContext({viewport:{width,height:1000}});
    await context.route('**/*',r=>new URL(r.request().url()).origin===BASE?r.continue():r.abort());
    const page=await context.newPage();
    if(role==='stakeholder'){
     await context.request.post(BASE+'/login',{data:{email:'startup2@example.test',password:'local-demo-only'}});
     const seeded=await context.request.post(BASE+'/startup/submit/update-milestone',{data:{id:2,name:payload,start:'2026-01-01',end:'2026-03-01',progress:50}});
     assert.equal(seeded.status(),200);
     await context.request.get(BASE+'/logout');
    }
    page.on('pageerror',e=>results.errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());});
    await page.goto(BASE);await page.selectOption('#role',role);
    await Promise.all([page.waitForURL(BASE+(role==='startup'?'/startup':'/fund')),page.locator('button[type=submit]').click()]);
    if(role==='startup'){
     const response=await context.request.post(BASE+'/startup/submit/update-milestone',{data:{id:1,name:payload,start:'2026-01-01',end:'2026-03-01',progress:50}});
     assert.equal(response.status(),200);
     await page.reload();
    }else{
     await page.waitForSelector('#table .ag-center-cols-container .ag-row');
     await Promise.all([page.waitForURL(BASE+'/fund/startup'),page.getByText(role==='stakeholder'?'Quantum Forge':'HelioFusion',{exact:true}).click()]);
    }
    await page.waitForFunction(()=>window.gantt && gantt.bars.length>0);
    await page.getByText('Year',{exact:true}).click();
    const label=await page.locator(`.bar-wrapper[data-id="${taskId}"] .bar-label`).textContent();
    assert.equal(label,payload);
    // Invoke the actual Frappe popup for read-only investor charts whose whole
    // Gantt SVG deliberately disables pointer interactions.
    await page.evaluate(id=>gantt.bars.find(bar=>String(bar.task.id)===id).show_popup(),taskId);
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.popup-wrapper h5').textContent(),payload);
    assert.equal(await page.locator('#gantt img,.popup-wrapper img,#gantt image').count(),0);
    assert.equal(await page.evaluate(()=>window.__ganttXss || 0),0);
    const contained=await page.evaluate(()=>{
     const popup=document.querySelector('.popup-wrapper').getBoundingClientRect();
     const chart=document.querySelector('.overflow-chart').getBoundingClientRect();
     return popup.left>=chart.left-1 && popup.right<=chart.right+1 && popup.top>=chart.top-1 && popup.bottom<=chart.bottom+1;
    });
    assert.ok(contained,'Long popup must remain within the visible Gantt container');
    if(role==='startup'){
     await page.evaluate(()=>{const task=gantt.tasks.find(task=>task.id==='1');task.progress=73;gantt.options.on_progress_change(task,73);});
     await page.locator('#gantt-changes-ok-btn').click();
     await page.waitForFunction(()=>document.querySelector('#gantt-changes').classList.contains('hidden'));
     const saved=await context.request.get(BASE+'/startup/chart/data').then(response=>response.json());
     assert.equal(saved.milestones.find(task=>String(task.id)==='1').progress,73);
     await page.evaluate(()=>{const task=gantt.tasks.find(task=>task.id==='1');task.progress=81;gantt.options.on_progress_change(task,81);});
     await page.locator('#gantt-changes-cancel-btn').click();
     assert.equal(await page.evaluate(()=>gantt.tasks.find(task=>task.id==='1').progress),73);
     const cancelled=await context.request.get(BASE+'/startup/chart/data').then(response=>response.json());
     assert.equal(cancelled.milestones.find(task=>String(task.id)==='1').progress,73);
     await page.evaluate(()=>gantt.bars.find(bar=>bar.task.id==='1').show_popup());
     assert.equal(await page.locator('.popup-wrapper h5').textContent(),payload);
    }
    await page.waitForTimeout(1300);
    await page.screenshot({path:path.join(OUT,`${role}-${width}.png`),fullPage:true});
    await page.reload();await page.waitForFunction(()=>window.gantt && gantt.bars.length>0);
    assert.equal(await page.locator(`.bar-wrapper[data-id="${taskId}"] .bar-label`).textContent(),payload);
    assert.equal(await page.evaluate(()=>window.__ganttXss || 0),0);
    results.checks.push(`${role} ${width}: stored label and popup are literal text; reload safe${role==='startup'?'; save/cancel retain plain popup text':''}`);
    await context.close();
   }
  }
  assert.deepEqual(results.errors,[]);
  console.log(JSON.stringify(results,null,2));
 }finally{
  if(browser)await browser.close();
  const exit=new Promise(resolve=>child.once('exit',resolve));child.kill();await exit;
  fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(results,null,2)+'\n');
 }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
