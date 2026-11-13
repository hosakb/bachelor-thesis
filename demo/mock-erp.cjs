// Fictional fixtures for the five populated startups in tests/local-db.cjs.
// Snapshot selection is explicit, so concurrent requests never advance time.
const http = require('node:http');
const companies = Object.freeze([
  { key:'helio', name:'Demo HelioFusion', balances:[100000,90000,81000.5], liabilities:[12000.25,8000] },
  { key:'quantum', name:'Demo Quantum Forge', balances:[220000,210000,195000], liabilities:[20000,10000] },
  { key:'orbit', name:'Demo Orbit Labs', balances:[300000,280000,260000], liabilities:[30000,10000] },
  { key:'tide', name:'Demo Tidal Health', balances:[180000,170000,155000], liabilities:[10000,15000] },
  { key:'cedar', name:'Demo Cedar Analytics', balances:[400000,390000,375000], liabilities:[25000,25000] },
]);
function challenge() {
  const buf = Buffer.alloc(48);
  buf.write('NTLMSSP\0', 0, 'latin1');
  buf.writeInt32LE(2, 8);
  buf.writeInt32LE(48, 16);
  buf.writeInt32LE(0x00000201, 20);
  Buffer.from('0123456789abcdef','hex').copy(buf,24);
  return 'NTLM '+buf.toString('base64');
}
function messageType(header = '') {
  if (!/^NTLM [A-Za-z0-9+/]+=*$/.test(header)) return 0;
  const buf = Buffer.from(header.slice(5),'base64');
  if (buf.length < 12 || buf.toString('latin1',0,8) !== 'NTLMSSP\0') return 0;
  const type = buf.readUInt32LE(8);
  return type === 1 && buf.length >= 32 || type === 3 && buf.length >= 64 ? type : 0;
}
function createMock() {
  let snapshot = 0;
  // Only aggregate handshake diagnostics, never Authorization header contents.
  const requests = [];
  const server = http.createServer((req,res) => {
    const reply = (status, data, headers = {}) => {
      res.writeHead(status, {'Content-Type':'application/json', ...headers});
      res.end(JSON.stringify(data));
    };
    const url = new URL(req.url,'http://127.0.0.1');
    if (req.method !== 'GET') return reply(405,{error:'GET only'});
    if (url.pathname === '/health') return reply(200,{mock:true,snapshot});
    const type = messageType(req.headers.authorization);
    if (requests.length < 10000) requests.push({type});
    if (type !== 3) return reply(401,{error:'Mock NTLM handshake required'}, {'WWW-Authenticate':type === 1 ? challenge() : 'NTLM'});
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return reply(400,{error:'Invalid path'}); }
    const match = pathname.match(/^\/ODataV4\/Company\('([^']+)'\)\/testtest$/);
    const company = match && companies.find(c => c.name === match[1]);
    if (!company) return reply(404,{error:'Unknown mock company or endpoint'});
    const filter = url.searchParams.get('$filter');
    if ([...url.searchParams.keys()].some(key => key !== '$filter')) return reply(400,{error:'Unsupported query'});
    if (filter === "No eq '1331'") return reply(200,{value:[{No:'1331',Balance:company.balances[snapshot]}]});
    if (filter === "No eq '1601' or No eq '1602'") return reply(200,{value:company.liabilities.map((Balance,i) => ({No:String(1601+i),Balance}))});
    return reply(400,{error:'Unsupported filter'});
  });
  return {server,requests,setSnapshot(value) {
    if (!Number.isInteger(value) || value < 0 || value > 2) throw new Error('Snapshot must be 0, 1 or 2');
    snapshot = value;
  }};
}
module.exports = {createMock,companies};
if (require.main === module) {
  const port = Number(process.env.ERP_PORT || 3408);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid ERP_PORT');
  const mock = createMock();
  mock.server.listen(port,'127.0.0.1',() => console.log(`Fictional ERP mock: http://127.0.0.1:${port}/ODataV4/`));
  for (const signal of ['SIGINT','SIGTERM']) process.on(signal,() => mock.server.close(() => process.exit(0)));
}
