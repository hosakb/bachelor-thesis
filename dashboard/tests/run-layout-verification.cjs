// Durable raw command output and exit codes for publisher/reviewer handoff.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const out = path.join(root, "qa/layout-corrections/verification.txt");
const commands = [
  "node --openssl-legacy-provider --test tests/*.test.cjs",
  "node --openssl-legacy-provider --require ./tests/layout-model-fixture.cjs --test src/models/investor_startup_map.test.ts",
  "cd ../scraper && npx tsc -p tests/tsconfig-contract.json && node --openssl-legacy-provider --test tests/bc-contract.test.cjs",
  "npx tsc --noEmit",
  "npm run lint",
  "npx prettier --check public/css/theme.css public/js/chart-theme.js tests/layout-geometry.cjs tests/layout-matrix.cjs tests/layout-model-fixture.cjs tests/summarize-layout.cjs tests/run-layout-verification.cjs ../scraper/tests/tsconfig-contract.json",
  "node tests/e2e.cjs",
  "node tests/remaining-e2e.cjs",
  "node tests/role-picker-e2e.cjs",
  "VISUAL_OUT=qa/modernization/after node tests/visual-capture.cjs",
];
fs.writeFileSync(
  out,
  "Local PR3 verification; fictional DB; external browser requests blocked.\n"
);
const runs = [];
for (const command of commands) {
  const result = spawnSync(command, {
    shell: true,
    cwd: root,
    env: { ...process.env },
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  fs.appendFileSync(
    out,
    `\n$ ${command}\n${result.stdout || ""}${result.stderr || ""}\nexit_code=${
      result.status
    }\n`
  );
  runs.push({ command, exit_code: result.status });
  console.log(`${command}: ${result.status}`);
}
fs.writeFileSync(
  path.join(root, "qa/layout-corrections/verification.json"),
  JSON.stringify(runs, null, 2)
);
if (runs.some((r) => r.exit_code !== 0)) process.exitCode = 1;
