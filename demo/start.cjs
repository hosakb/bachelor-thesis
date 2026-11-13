// Run from the repository root: node demo/start.cjs
// No inherited database/ERP credentials, NODE_OPTIONS or .env are used.
const path = require('node:path');
const {spawn} = require('node:child_process');
const port = Number(process.env.PORT || 3407);
const erpPort = Number(process.env.ERP_PORT || 3408);
for (const value of [port,erpPort]) {
  if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error('Ports must be integers from 1 to 65535');
}
if (port === erpPort) throw new Error('PORT and ERP_PORT must differ');
if (!process.argv.includes('--isolated-child')) {
  const child = spawn(process.execPath,['--openssl-legacy-provider',__filename,'--isolated-child'], {
    cwd:path.join(__dirname,'..'),
    env:{PATH:process.env.PATH || '',NODE_ENV:'test',PORT:String(port),ERP_PORT:String(erpPort),...(process.env.TMPDIR ? {TMPDIR:process.env.TMPDIR} : {})},
    stdio:'inherit',
  });
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => child.kill(signal));
  child.on('error',error => {console.error(error.message);process.exitCode=1;});
  child.on('exit',(code,signal) => {process.exitCode=signal ? 1 : code ?? 1;});
} else {
  if (process.env.NODE_ENV !== 'test' || !process.execArgv.includes('--openssl-legacy-provider')) throw new Error('Use node demo/start.cjs');
  const {createDemo} = require('./runtime.cjs');
  const readline = require('node:readline');
  let demo,server,input;
  let closing = false;
  async function close(code=0) {
    if (closing) return;
    closing=true;
    if (input) input.close();
    if (server) await new Promise(resolve => server.close(resolve));
    if (demo) await demo.close();
    process.exit(code);
  }
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => close());
  (async () => {
    demo = await createDemo({erpPort});
    server = demo.app.listen(port,'127.0.0.1');
    await new Promise((resolve,reject) => {server.once('listening',resolve);server.once('error',reject);});
    console.log(`ERP DEMO READY http://127.0.0.1:${port} | ERP http://127.0.0.1:${erpPort}/ODataV4/`);
    console.log('Three fictional daily snapshots imported. Type import then Enter to run another real scraper import. Restart to reset all data.');
    input = readline.createInterface({input:process.stdin});
    input.on('line',line => {
      if (line.trim() === 'import') demo.importLatest().then(() => console.log('ERP IMPORT COMPLETE')).catch(error => console.error(error.message));
      else if (line.trim()) console.log('Commands: import. Stop with Ctrl+C; restart to reset.');
    });
  })().catch(async error => {console.error(error.message);await close(1);});
}
