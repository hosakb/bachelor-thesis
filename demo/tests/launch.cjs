const {spawn} = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');
async function launch() {
  const child = spawn(process.execPath,[path.join(__dirname,'../start.cjs')], {
    cwd:path.join(__dirname,'../..'),
    env:{PATH:process.env.PATH,PORT:'3417',ERP_PORT:'3418',NODE_OPTIONS:'--trace-warnings',DATABASE_URL:'postgres://invalid.invalid/never',BUSINESS_CENTRAL:'https://invalid.invalid/never',PGHOST:'invalid.invalid'},
    stdio:['pipe','pipe','pipe'],
  });
  let log = '';
  child.stdout.on('data',data => {log+=data;});
  child.stderr.on('data',data => {log+=data;});
  for (let i=0;i<150;i++) {
    if (log.includes('ERP DEMO READY')) break;
    if (child.exitCode !== null) throw new Error(log);
    await new Promise(resolve => setTimeout(resolve,100));
  }
  assert.ok(log.includes('ERP DEMO READY'),log);
  return {base:'http://127.0.0.1:3417',child,log:() => log, async stop() {
    const stopped = new Promise(resolve => child.once('exit',resolve));
    child.kill();
    await stopped;
  }};
}
module.exports = {launch};
