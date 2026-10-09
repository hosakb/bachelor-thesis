// Validate exact totals and assemble a side-by-side evidence index.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.join(__dirname, "../qa/layout-corrections");
const before = JSON.parse(
  fs.readFileSync(path.join(root, "before/results.json"))
);
const after = JSON.parse(
  fs.readFileSync(path.join(root, "after/results.json"))
);
const runs = JSON.parse(fs.readFileSync(path.join(root, "verification.json")));
for (const data of [before, after]) {
  assert.equal(data.cases.length, 159);
  assert.equal(new Set(data.cases.map((c) => c.state)).size, 53);
  assert.equal(
    new Set(data.cases.map((c) => c.state + ":" + c.viewport)).size,
    159
  );
  for (const viewport of ["desktop", "tablet", "mobile"])
    assert.equal(data.cases.filter((c) => c.viewport === viewport).length, 53);
}
assert.equal(after.failures.length, 0);
assert.ok(runs.every((r) => r.exit_code === 0));
const stats = (data) => {
  const counts = {};
  for (const c of data.cases)
    for (const d of new Set(c.defects.map((d) => d.split(":").pop())))
      counts[d] = (counts[d] || 0) + 1;
  return {
    cases: data.cases.length,
    failing_cases: data.failures.length,
    browser_error_count: data.cases.reduce((n, c) => n + c.problems.length, 0),
    defect_case_counts: counts,
  };
};
const paired = [];
for (const c of after.cases) {
  const b = before.cases.find(
    (b) => b.state === c.state && b.viewport === c.viewport
  );
  for (const [dir, file] of [
    ["before", b.file],
    ["after", c.file],
  ])
    assert.ok(fs.existsSync(path.join(root, dir, file)));
  paired.push({
    state: c.state,
    viewport: c.viewport,
    before: "before/" + b.file,
    after: "after/" + c.file,
  });
}
const summary = {
  before: stats(before),
  after: stats(after),
  screenshot_pairs: paired.length,
  screenshots: paired.length * 2,
  distinct_routes: new Set(after.cases.map((c) => c.url)).size,
  commands: runs,
};
fs.writeFileSync(
  path.join(root, "summary.json"),
  JSON.stringify(summary, null, 2)
);
fs.writeFileSync(
  path.join(root, "screenshot-pairs.json"),
  JSON.stringify(paired, null, 2)
);
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
fs.writeFileSync(
  path.join(root, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>PR3 local corrections: 159 cases</title><style>body{font:16px system-ui;background:#252b38;color:white;margin:24px}section{margin:32px 0}figure{display:inline-block;vertical-align:top;width:46%;margin:0 2% 0 0}img{max-width:100%;border:1px solid gray}a{color:#fff}summary{cursor:pointer;padding:10px}figcaption{padding:12px}</style><h1>PR3 local correction evidence</h1><p>53 distinct page/UI states × 3 viewports = 159 cases, not 53 distinct route URLs. Before: frozen pre-correction CSS with current semantic login labels. After: final local source. Original palette retained. Horizontal Gantt/table scrolling is intentional.</p>${paired
    .map(
      (p) =>
        `<section><details><summary>${escape(p.state)} / ${
          p.viewport
        }</summary><figure><figcaption>Before</figcaption><a href="${
          p.before
        }"><img loading="lazy" src="${
          p.before
        }"></a></figure><figure><figcaption>After</figcaption><a href="${
          p.after
        }"><img loading="lazy" src="${
          p.after
        }"></a></figure></details></section>`
    )
    .join("")}`
);
console.log(JSON.stringify(summary, null, 2));
