const test=require('node:test');
const assert=require('node:assert/strict');
test('Gantt HTML encodes text fields and preserves ordinary names',()=>{
  const {escape,popup}=require('../public/js/gantt-content.js');
  assert.equal(escape('R&D <test> "yes" \'ok\''),'R&amp;D &lt;test&gt; &quot;yes&quot; &#39;ok&#39;');
  const html=popup({plainName:'<img src=x onerror=alert(1)>',end:'<svg onload=alert(2)>',progress:'<img src=x>'});
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<svg'));
  assert.ok(html.includes('&lt;img'));
});
