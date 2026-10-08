const fs = require('node:fs');
const results = JSON.parse(fs.readFileSync('qa/baseline/results.json','utf8'));
const roles = [...new Set(results.map(r=>r.role))];
const summary={pages:results.length, roles, non200:results.filter(r=>r.status!==200).length, pageErrors:results.flatMap(r=>r.errors).filter(e=>!e.includes('net::ERR_FAILED')), blockedExternalResourceErrors:results.flatMap(r=>r.errors).filter(e=>e.includes('net::ERR_FAILED')).length};
fs.writeFileSync('qa/baseline/summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
