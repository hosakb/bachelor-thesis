const fs = require("node:fs");
for (const dir of process.argv.slice(2)) {
  const d = JSON.parse(fs.readFileSync(dir + "/results.json"));
  const counts = {};
  for (const c of d.cases)
    for (const defect of new Set(c.defects.map((x) => x.split(":").pop())))
      counts[defect] = (counts[defect] || 0) + 1;
  console.log(
    JSON.stringify(
      {
        dir,
        cases: d.cases.length,
        failures: d.failures.length,
        counts,
        errors: d.failures.filter((f) => f.error || f.problems.length),
        last: d.cases.at(-1),
        sample: d.cases[5],
      },
      null,
      2
    )
  );
}
