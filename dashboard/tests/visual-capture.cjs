// Captures full-page screenshots of every role's representative pages at
// desktop, tablet and mobile widths from a clean local-demo launch.
//   CHROMIUM_PATH=/path/to/chrome VISUAL_OUT=qa/modernization/after node tests/visual-capture.cjs
// Records final URL, document horizontal overflow, console/page errors and
// failed or external requests per page in <out>/results.json.
const { chromium } = require("@playwright/test");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const OUT = path.resolve(
  ROOT,
  process.env.VISUAL_OUT || "qa/modernization/after"
);
const PORT = process.env.VISUAL_PORT || "3341";
const BASE = `http://127.0.0.1:${PORT}`;
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

const FLOWS = [
  { role: "login", email: null, pages: [["login", "/"]] },
  {
    role: "admin",
    email: "admin@example.test",
    pages: [
      ["overview", "/admin"],
      ["users", "/admin/users"],
      ["startups", "/admin/startups"],
      ["funds", "/admin/funds"],
    ],
  },
  {
    role: "startup",
    email: "startup@example.test",
    pages: [
      ["overview", "/startup"],
      ["submit", "/startup/submit"],
    ],
  },
  {
    role: "fund",
    email: "fund@example.test",
    pages: [
      ["portfolio", "/fund"],
      ["detail", "select"],
      ["founders", "/fund/startup/founders"],
      ["rating", "/fund/startup/rating"],
    ],
  },
  {
    role: "stakeholder",
    email: "stakeholder@example.test",
    pages: [["portfolio", "/fund"]],
  },
  {
    role: "onboarding",
    email: "onboarding@example.test",
    pages: [
      ["startup", "/onboarding/startup"],
      ["product", "/onboarding/product"],
      ["questionnaire", "/onboarding/questionnaire"],
      ["track-record", "/onboarding/track-record"],
    ],
  },
];

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const child = spawn(process.execPath, ["local-demo.cjs"], {
    cwd: ROOT,
    env: { PATH: process.env.PATH, PORT },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (d) => (logs += d));
  child.stderr.on("data", (d) => (logs += d));
  const results = { base: BASE, viewports: VIEWPORTS, pages: [] };
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 150 && !ready; i++) {
      try {
        ready = (await fetch(BASE)).status === 200;
      } catch {}
      if (!ready) await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw new Error("demo did not start\n" + logs);
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH || undefined,
    });
    for (const vp of VIEWPORTS) {
      for (const flow of FLOWS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const problems = [];
        await context.route("**/*", (r) => {
          if (new URL(r.request().url()).origin === BASE) return r.continue();
          problems.push("external " + r.request().url());
          return r.abort();
        });
        const page = await context.newPage();
        page.on("pageerror", (e) => problems.push("pageerror " + e.message));
        page.on("console", (m) => {
          if (m.type() === "error") problems.push("console " + m.text());
        });
        page.on("requestfailed", (r) => {
          if (r.url().startsWith(BASE)) problems.push("failed " + r.url());
        });
        page.on("response", (r) => {
          if (r.status() >= 400) problems.push(`http ${r.status()} ${r.url()}`);
        });
        if (flow.email) {
          const res = await context.request.post(BASE + "/login", {
            form: { email: flow.email, password: "local-demo-only" },
          });
          if (!res.ok())
            throw new Error(`login ${flow.email} -> ${res.status()}`);
        }
        for (const [name, target] of flow.pages) {
          if (target === "select") {
            await page.goto(BASE + "/fund");
            await page.waitForSelector(
              "#table .ag-center-cols-container .ag-row"
            );
            await Promise.all([
              page.waitForURL(BASE + "/fund/startup"),
              page
                .locator("#table .ag-center-cols-container .ag-row")
                .first()
                .click(),
            ]);
          } else {
            await page.goto(BASE + target);
          }
          await page.waitForLoadState("networkidle");
          if (await page.locator("#table").count())
            await page
              .waitForSelector("#table .ag-row", { timeout: 5000 })
              .catch(() => {});
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(700);
          const metrics = await page.evaluate(() => {
            const doc = document.documentElement;
            // A control only counts as clipped when it lies outside the
            // viewport and no ancestor lets the user scroll to it.
            const scrollable = (el) => {
              for (
                let p = el.parentElement;
                p && p !== document.body;
                p = p.parentElement
              ) {
                const ox = getComputedStyle(p).overflowX;
                if (
                  (ox === "auto" || ox === "scroll") &&
                  p.scrollWidth > p.clientWidth
                )
                  return true;
              }
              return false;
            };
            const clipped = [
              ...document.querySelectorAll(
                "button, input, select, textarea, a"
              ),
            ].filter((el) => {
              const r = el.getBoundingClientRect();
              return (
                r.width > 0 &&
                (r.right > doc.clientWidth + 1 || r.left < -1) &&
                !scrollable(el)
              );
            }).length;
            return {
              overflowX: Math.max(0, doc.scrollWidth - doc.clientWidth),
              offscreenControls: clipped,
              bodyFont: getComputedStyle(document.body).fontFamily,
            };
          });
          const file = `${flow.role}-${name}-${vp.name}.png`;
          await page.screenshot({ path: path.join(OUT, file), fullPage: true });
          results.pages.push({
            viewport: vp.name,
            role: flow.role,
            page: name,
            url: new URL(page.url()).pathname,
            file,
            ...metrics,
          });
        }
        if (flow.role === "fund" && vp.name !== "tablet") {
          await page.goto(BASE + "/fund/startup");
          await page.waitForSelector("#gantt .bar-wrapper");
          await page.locator("#patent-tbody button").first().click();
          await page.waitForTimeout(400);
          const file = `fund-patent-pane-${vp.name}.png`;
          await page.screenshot({
            path: path.join(OUT, file),
            fullPage: false,
          });
          results.pages.push({
            viewport: vp.name,
            role: "fund",
            page: "patent-pane",
            url: "/fund/startup",
            file,
          });
        }
        if (flow.role === "startup") {
          await page.goto(BASE + "/startup");
          await page.waitForSelector("#gantt .bar-wrapper");
          await page.getByText("Year", { exact: true }).click();
          await page.waitForTimeout(400);
          const file = `startup-gantt-year-${vp.name}.png`;
          await page.screenshot({ path: path.join(OUT, file), fullPage: true });
          results.pages.push({
            viewport: vp.name,
            role: "startup",
            page: "gantt-year",
            url: "/startup",
            file,
          });
        }
        if (problems.length)
          results.pages.push({ viewport: vp.name, role: flow.role, problems });
        await context.close();
      }
    }
  } finally {
    fs.writeFileSync(
      path.join(OUT, "results.json"),
      JSON.stringify(results, null, 2)
    );
    if (browser) await browser.close();
    const exited = new Promise((r) => child.once("exit", r));
    child.kill();
    await exited;
  }
  const problems = results.pages.filter((p) => p.problems);
  console.log(
    JSON.stringify(
      {
        screenshots: results.pages.filter((p) => p.file).length,
        problemGroups: problems,
      },
      null,
      2
    )
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
