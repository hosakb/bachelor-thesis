// 53 distinct page/UI states x three viewports. No live DB/ERP or external assets.
const { chromium } = require("@playwright/test");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const geometry = require("./layout-geometry.cjs");
const ROOT = path.join(__dirname, "..");
const OUT = path.resolve(
  ROOT,
  process.env.MATRIX_OUT || "qa/layout-corrections/after"
);
const PORT = String(process.env.MATRIX_PORT || 3351);
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWS = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];
const routes = [
  ["login", "/", null],
  ["admin-overview", "/admin", "admin"],
  ["admin-users", "/admin/users", "admin"],
  ["admin-startups", "/admin/startups", "admin"],
  ["admin-funds", "/admin/funds", "admin"],
  ["startup-overview", "/startup", "startup"],
  ["startup-submit", "/startup/submit", "startup"],
  ["fund-portfolio", "/fund", "fund"],
  ["fund-detail", "/fund/startup", "fund"],
  ["fund-founders", "/fund/startup/founders", "fund"],
  ["fund-rating", "/fund/startup/rating", "fund"],
  ["stakeholder-portfolio", "/fund", "stakeholder"],
  ["emptyfund-portfolio", "/fund", "emptyfund"],
  ["onboarding-startup", "/onboarding/startup", "onboarding"],
  ["onboarding-product", "/onboarding/product", "onboarding"],
  ["onboarding-questionnaire", "/onboarding/questionnaire", "onboarding"],
  ["onboarding-track-record", "/onboarding/track-record", "onboarding"],
];
const states = routes.map(([name, url, role]) => ({ name, url, role }));
for (const [name, url, role] of routes.filter((r) => r[2]))
  states.push({
    name: name + (role === "onboarding" ? "-field-focus" : "-nav-toggle"),
    url,
    role,
    action: role === "onboarding" ? "field-focus" : "nav",
  });
for (const role of ["startup", "fund"])
  for (const mode of ["Week", "Month", "Year"])
    states.push({
      name: role + "-gantt-" + mode.toLowerCase(),
      url: role === "fund" ? "/fund/startup" : "/startup",
      role,
      mode,
    });
states.push({
  name: "fund-patent-detail",
  url: "/fund/startup",
  role: "fund",
  click: "#patent-tbody button",
  pane: "#patent-info-pane",
});
states.push({
  name: "startup-technology-edit",
  url: "/startup/submit",
  role: "startup",
  click: 'button[aria-label="Edit technology"]',
});
for (const [name, click, pane] of [
  ["technology", "#add-technology-btn", "#new-trl"],
  ["investor", "#add-investor", "#add-investor-form"],
  ["milestone", "#milestones-form-btn", "#add-milestones-pane"],
  ["investment-round", "#next-investment-round-btn", "#next-investment-round"],
  ["new-patent", "#new-patent-btn", "#new-patent-pane"],
  [
    "patent-update",
    'button[onclick^="updatePatentStatus"]',
    "#patent-info-pane",
  ],
  ["patent-cancel", 'button[onclick^="cancelPatent"]', "#cancel-patent-pane"],
])
  states.push({
    name: "startup-submit-" + name,
    url: "/startup/submit",
    role: "startup",
    click,
    pane,
  });
for (const action of ["focus", "invalid", "error"])
  states.push({ name: "login-" + action, url: "/", role: null, action });
states.push({
  name: "admin-stakeholder-registration",
  url: "/admin/funds",
  role: "admin",
  action: "stakeholder",
});
states.push({
  name: "fund-rating-expanded",
  url: "/fund/startup/rating",
  role: "fund",
  action: "rating",
});
assert.equal(states.length, 53);
assert.equal(new Set(states.map((s) => s.name)).size, 53);
const selectedStates = process.env.MATRIX_STATE
  ? states.filter((s) => new RegExp(process.env.MATRIX_STATE).test(s.name))
  : states;
const selectedViews = process.env.MATRIX_VIEW
  ? VIEWS.filter((v) => v.name === process.env.MATRIX_VIEW)
  : VIEWS;
assert.ok(selectedStates.length && selectedViews.length);
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  // Credential route is the actual app route, not a screenshot mock. Fictional
  // fixture preload replaces DB/config before importing the real server.
  const child = spawn(
    process.execPath,
    [
      "--openssl-legacy-provider",
      "--require",
      "./tests/local-db.cjs",
      "./src/server.ts",
    ],
    {
      cwd: ROOT,
      env: { PATH: process.env.PATH, PORT, NODE_ENV: "test" },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  const results = { viewports: VIEWS, states, cases: [], failures: [] };
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 150; i++) {
      try {
        ready = (await fetch(BASE)).status === 200;
      } catch {}
      if (ready) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.ok(ready, log);
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH,
    });
    for (const viewport of selectedViews) {
      for (const state of selectedStates) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const problems = [];
        await context.route("**/*", (r) => {
          if (new URL(r.request().url()).origin === BASE) return r.continue();
          problems.push("external " + r.request().url());
          return r.abort();
        });
        const page = await context.newPage();
        page.setDefaultTimeout(5000);
        if (process.env.MATRIX_BASELINE_CSS)
          await page.route("**/css/theme.css", (r) =>
            r.fulfill({
              contentType: "text/css",
              body: fs.readFileSync(process.env.MATRIX_BASELINE_CSS, "utf8"),
            })
          );
        page.on("pageerror", (e) => problems.push("pageerror " + e.message));
        page.on("console", (m) => {
          if (m.type() === "error") problems.push("console " + m.text());
        });
        page.on("requestfailed", (r) => problems.push("failed " + r.url()));
        page.on("response", (r) => {
          if (r.status() >= 400)
            problems.push("http " + r.status() + " " + r.url());
        });
        try {
          if (state.role) {
            const res = await context.request.post(BASE + "/login", {
              form: {
                email: state.role + "@example.test",
                password: "local-demo-only",
              },
            });
            assert.ok(res.ok(), "fixture login");
            if (state.url.startsWith("/fund/startup")) {
              await page.goto(BASE + "/fund");
              await page
                .locator("#table .ag-center-cols-container .ag-row")
                .first()
                .click();
              await page.waitForURL(BASE + "/fund/startup");
            }
          }
          await page.goto(BASE + state.url);
          await page.waitForLoadState("networkidle");
          await page.evaluate(() => document.fonts.ready);
          if (state.mode)
            await page.getByText(state.mode, { exact: true }).click();
          if (state.click) {
            await page.locator(state.click).first().click();
            if (state.pane) await page.locator(state.pane + ".show").waitFor();
          }
          if (state.action === "nav")
            await page.locator("#nav-toggle").evaluate((el) => {
              el.checked = !el.checked;
            });
          if (state.action === "stakeholder")
            await page.selectOption("#select-fund-stakeholder", "stakeholder");
          if (state.action === "rating")
            await page.locator('[onclick="showSection(this)"]').first().click();
          if (state.action === "focus") await page.keyboard.press("Tab");
          if (state.action === "field-focus")
            await page
              .locator("main input:not([type=hidden]), main select")
              .first()
              .focus();
          if (state.action === "invalid") {
            await page.locator("[type=submit]").click();
            assert.equal(
              await page.locator("form").evaluate((f) => f.checkValidity()),
              false
            );
          }
          if (state.action === "error") {
            await context.request.post(BASE + "/login", {
              form: {
                email: "unknown@example.test",
                password: "invalid-fixture",
              },
            });
            await page.goto(BASE);
          }
          await page.waitForTimeout(500);
          const layout = await geometry(page);
          const overflowX = await page.evaluate(() =>
            Math.max(
              0,
              document.documentElement.scrollWidth -
                document.documentElement.clientWidth
            )
          );
          const file = state.name + "-" + viewport.name + ".png";
          await page.screenshot({
            path: path.join(OUT, file),
            fullPage: !state.pane,
          });
          const defects = [];
          for (const [phase, g] of Object.entries(layout)) {
            if (!g) continue;
            if (g.sidebarViewportGap > 1)
              defects.push(phase + ":sidebar-viewport-gap");
            if (g.sidebarShellGap > 1)
              defects.push(phase + ":sidebar-shell-gap");
            if (g.sidebarVisible && g.sidebarBrandTop > 1)
              defects.push(phase + ":sidebar-top-gap");
            if (
              (state.url === "/startup" || state.url === "/fund/startup") &&
              (!g.ganttBars || g.ganttTopInset === null)
            )
              defects.push(phase + ":missing-gantt");
            if (!g.sidebarLinksReachable && g.sidebarVisible)
              defects.push(phase + ":sidebar-links-unreachable");
            if (g.ganttTopInset !== null && Math.abs(g.ganttTopInset) > 2)
              defects.push(phase + ":gantt-top-inset");
            if (g.ganttGridWidth && g.ganttScrollWidth + 1 < g.ganttGridWidth)
              defects.push(phase + ":gantt-scroll-clipped");
            if (g.ganttScrollReachable === false)
              defects.push(phase + ":gantt-scroll-unreachable");
            if (!g.tableScrollReachable)
              defects.push(phase + ":table-scroll-unreachable");
          }
          if (overflowX > 1) defects.push("document-overflow");
          const result = {
            state: state.name,
            viewport: viewport.name,
            url: new URL(page.url()).pathname,
            file,
            overflowX,
            layout,
            defects,
            problems,
          };
          results.cases.push(result);
          if (defects.length || problems.length)
            results.failures.push({
              state: state.name,
              viewport: viewport.name,
              defects,
              problems,
            });
          console.log(
            `${state.name} ${viewport.name}: ${defects.length} defects, ${problems.length} browser errors`
          );
        } catch (e) {
          results.failures.push({
            state: state.name,
            viewport: viewport.name,
            error: e.stack,
            problems,
          });
        } finally {
          await context.close();
          fs.writeFileSync(
            path.join(OUT, "results.json"),
            JSON.stringify(results, null, 2)
          );
        }
      }
    }
  } finally {
    if (browser) await browser.close();
    const exited = new Promise((r) => child.once("exit", r));
    child.kill();
    await exited;
  }
  console.log(
    JSON.stringify({
      cases: results.cases.length,
      failures: results.failures.length,
    })
  );
  assert.equal(
    results.cases.length,
    selectedStates.length * selectedViews.length
  );
  if (!process.env.MATRIX_ALLOW_DEFECTS)
    assert.equal(
      results.failures.length,
      0,
      "See results.json for geometry/browser failures"
    );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
