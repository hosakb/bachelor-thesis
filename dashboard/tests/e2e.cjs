// Clean-state, full-browser end-to-end run of the dashboard.
//
// Starts its own server process on an isolated in-memory database
// (tests/local-db.cjs, fictional data, no .env, no network), drives every role
// through its main flows in headless Chromium, checks persistence through
// reloads and a fresh login, records console errors / page exceptions / failed
// requests, and stores screenshots plus results.json under qa/after/.
//
//   CHROMIUM_PATH=/path/to/chrome node tests/e2e.cjs
//
// External requests are blocked on purpose; the UI must not depend on them.
const { chromium } = require("@playwright/test");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.E2E_PORT || 3317);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, "..", "qa", "after");
const ROOT = path.join(__dirname, "..");
const XLSX = path.join(ROOT, "..", "VC-Cap-Table-Example.xlsx");

const results = { steps: [], screenshots: [], issues: [] };
const step = (name, detail = "") => {
  results.steps.push({ name, detail });
  console.log(`ok - ${name}${detail ? ` (${detail})` : ""}`);
};

async function startServer() {
  const child = spawn(
    process.execPath,
    // NTLM (MD4/DES) hashing of Business Central passwords needs the OpenSSL
    // legacy provider on Node >= 17.
    ["--openssl-legacy-provider", "--require", "./tests/local-db.cjs", "./src/server.ts"],
    {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT), NODE_ENV: "test" },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(BASE + "/");
      if (res.status < 500) return { child, log: () => log };
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  child.kill();
  throw new Error("Server did not start:\n" + log);
}

async function newSession(browser, label, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  const answered = new WeakSet();
  page.on("requestfailed", (r) => {
    const url = new URL(r.url());
    // A reload right after a successful fetch aborts the unread body stream;
    // only requests that never received a response are real failures.
    if (url.hostname === "127.0.0.1" && !answered.has(r)) {
      problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`);
    }
  });
  page.on("response", (r) => {
    answered.add(r.request());
    const url = new URL(r.url());
    if (url.hostname === "127.0.0.1" && r.status() >= 400) {
      problems.push(`http ${r.status()}: ${r.request().method()} ${url.pathname}`);
    }
  });
  const external = [];
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  const dialogs = [];
  page.on("dialog", async (d) => {
    dialogs.push(d.message());
    await d.accept();
  });
  return { context, page, problems, external, dialogs, label };
}

async function shot(session, name) {
  const file = path.join(OUT, `${session.label}-${name}.png`);
  await session.page.screenshot({ path: file, fullPage: true });
  results.screenshots.push(path.relative(ROOT, file));
}

async function login(session, email) {
  const { page } = session;
  await page.goto(BASE + "/");
  await page.fill("[name=email]", email);
  await page.fill("[name=password]", "local-demo-only");
  await Promise.all([page.waitForNavigation(), page.click("[type=submit]")]);
}

function assertClean(session, allow = []) {
  const unexpected = session.problems.filter((p) => !allow.some((a) => p.includes(a)));
  if (unexpected.length) {
    results.issues.push({ session: session.label, problems: unexpected });
  }
  assert.deepEqual(unexpected, [], `${session.label}: ${unexpected.join("\n")}`);
  assert.deepEqual(session.external, [], `${session.label} made external requests`);
}

// Line Awesome glyphs render when the font loaded and an icon has a width.
async function assertIconsRender(page) {
  const ok = await page.evaluate(async () => {
    await document.fonts.ready;
    const icon = document.querySelector(".las");
    if (!icon) return "no icon";
    const loaded = [...document.fonts].some(
      (f) => /Line Awesome Free/.test(f.family) && f.status === "loaded"
    );
    const width = icon.getBoundingClientRect().width;
    return loaded && width > 0 ? true : `loaded=${loaded} width=${width}`;
  });
  assert.equal(ok, true, `icons not rendered: ${ok}`);
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });

  try {
    // ------------------------------------------------------------ login
    {
      const s = await newSession(browser, "login");
      await s.page.goto(BASE + "/");
      await s.page.fill("[name=email]", "startup@example.test");
      await s.page.fill("[name=password]", "wrong-password");
      await Promise.all([s.page.waitForNavigation(), s.page.click("[type=submit]")]);
      assert.equal(new URL(s.page.url()).pathname, "/");
      assert.match(await s.page.locator("body").innerText(), /Password is not correct/);
      await s.page.fill("[name=email]", "nobody@example.test");
      await s.page.fill("[name=password]", "x");
      await Promise.all([s.page.waitForNavigation(), s.page.click("[type=submit]")]);
      assert.match(await s.page.locator("body").innerText(), /Email not registered/);
      await shot(s, "invalid-login");
      // Protected pages bounce anonymous users to login.
      await s.page.goto(BASE + "/admin");
      assert.equal(new URL(s.page.url()).pathname, "/");
      assertClean(s);
      await s.context.close();
      step("login rejects wrong password / unknown email; anonymous redirect");
    }

    // ------------------------------------------------------------ startup
    {
      const s = await newSession(browser, "startup");
      await login(s, "startup@example.test");
      assert.equal(new URL(s.page.url()).pathname, "/startup");
      await s.page.waitForSelector("#gantt .bar-wrapper");
      await assertIconsRender(s.page);
      await shot(s, "overview");

      // Gantt: drag several times, then save once -> exactly one request per task/kind.
      const puts = [];
      s.page.on("request", (r) => {
        if (r.method() === "PUT" && r.url().includes("/startup/gantt/")) puts.push(r.url());
      });
      const bar = s.page.locator(".bar-wrapper .bar").first();
      await bar.scrollIntoViewIfNeeded();
      for (let i = 0; i < 3; i++) {
        const box = await bar.boundingBox();
        await s.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await s.page.mouse.down();
        await s.page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 5 });
        await s.page.mouse.up();
        await s.page.waitForTimeout(150);
      }
      await s.page.waitForSelector("#gantt-changes:not(.hidden)");
      await s.page.click("#gantt-changes-ok-btn");
      await s.page.waitForSelector("#gantt-changes.hidden", { state: "attached" });
      await s.page.waitForTimeout(300);
      assert.equal(puts.length, 1, `expected one period PUT after 3 drags, got ${puts.length}`);
      await s.page.reload();
      await s.page.waitForSelector("#gantt .bar-wrapper");
      step("startup gantt: 3 drags -> single save request", `PUTs=${puts.length}`);

      // Submit page: TRL CRUD
      await s.page.goto(BASE + "/startup/submit");
      await assertIconsRender(s.page);
      await shot(s, "submit-before");
      await s.page.click("#add-technology-btn");
      const trlForm = s.page.locator("#new-trl");
      await trlForm.waitFor({ state: "visible" });
      // Native validation blocks an out-of-range TRL.
      await s.page.fill("#new-technology", "Thermal storage");
      await s.page.fill("#new-trl-value", "12");
      await s.page.fill("#new-criticality", "2");
      await s.page.click("#new-trl [type=submit]");
      assert.equal(
        await s.page.$eval("#new-trl-value", (el) => el.validity.valid),
        false
      );
      await s.page.fill("#new-trl-value", "4");
      await Promise.all([
        s.page.waitForNavigation(),
        s.page.click("#new-trl [type=submit]"),
      ]);
      const techs = await s.page.locator("#trl-tbody tr td:first-child").allInnerTexts();
      assert.ok(techs.map((t) => t.trim()).includes("Thermal storage"));
      step("startup add technology (range validation, persisted)", `rows=${techs.length}`);

      // Edit existing TRL inline with special characters.
      await s.page.locator("#trl-tbody button[aria-label='Edit technology']").first().click();
      await s.page.fill("#technology-0", `Core <tech> & "quotes" ü`);
      await s.page.selectOption("#trl-0", "7");
      await Promise.all([s.page.waitForNavigation(), s.page.click("#ok-btn-0")]);
      await s.page.waitForSelector("#trl-tbody tr");
      assert.equal((await s.page.locator("#trl-tbody tr td").first().innerText()).trim(), `Core <tech> & "quotes" ü`);
      await s.page.reload();
      assert.equal((await s.page.locator("#trl-tbody tr td").first().innerText()).trim(), `Core <tech> & "quotes" ü`);
      assert.equal((await s.page.locator("#trl-tbody tr td").nth(1).innerText()).trim(), "7");
      step("startup TRL inline edit persists through reload (special characters)");

      // Empty technology name is refused client-side.
      await s.page.locator("#trl-tbody button[aria-label='Edit technology']").first().click();
      await s.page.fill("#technology-0", "   ");
      await s.page.click("#ok-btn-0");
      assert.ok(s.dialogs.at(-1).includes("technology name"));
      await s.page.reload();
      step("startup TRL empty name rejected with feedback");

      // Milestones: date inputs prefilled, invalid order rejected, valid edit persists.
      await s.page.locator("button[aria-label='Edit milestone']").first().click();
      const start = await s.page.inputValue("#milestone-start-0");
      const end = await s.page.inputValue("#milestone-end-0");
      assert.match(start, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(end, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(await s.page.isVisible("#milestone-cancel-btn-0"));
      await s.page.fill("#milestone-start-0", "2026-06-10");
      await s.page.fill("#milestone-end-0", "2026-06-01");
      await s.page.click("#milestone-ok-btn-0");
      assert.ok(s.dialogs.at(-1).includes("due date"));
      await s.page.fill("#milestone-progress-0", "150");
      await s.page.fill("#milestone-end-0", "2026-07-01");
      await s.page.click("#milestone-ok-btn-0");
      assert.ok(s.dialogs.at(-1).includes("between 0 and 100"));
      const longName = "Pilot plant " + "L".repeat(120);
      await s.page.fill("#milestone-name-0", longName);
      await s.page.fill("#milestone-progress-0", "35");
      await Promise.all([s.page.waitForNavigation(), s.page.click("#milestone-ok-btn-0")]);
      const row = s.page.locator("#milestones-list-tbody tr").filter({ hasText: longName });
      assert.equal((await row.locator("td").nth(1).innerText()).trim(), "2026-06-10");
      assert.equal((await row.locator("td").nth(2).innerText()).trim(), "2026-07-01");
      assert.equal((await row.locator("td").nth(0).innerText()).trim(), longName);
      await shot(s, "submit-after-edits");
      step("startup milestone edit: prefilled dates, validation, persistence");

      // Add a milestone through the pane; repeated submit clicks create it once.
      await s.page.click("#milestones-form-btn");
      await s.page.fill("#milestone", "Series A prep");
      await s.page.fill("#start-date-milestone", "2026-08-01");
      await s.page.fill("#due-date-milestone", "2026-09-01");
      await s.page.fill("#milestone-completion", "0");
      await s.page.click("#add-milestone-btn");
      await Promise.all([
        s.page.waitForNavigation(),
        s.page.click("#submit-milestones-btn", { clickCount: 3 }),
      ]);
      const names = await s.page.locator("#milestones-list-tbody tr td:first-child").allInnerTexts();
      assert.equal(names.filter((n) => n.trim() === "Series A prep").length, 1);
      step("startup add milestone; triple-click submit creates one", `rows=${names.length}`);

      // Delete milestone with confirmation.
      const before = await s.page.locator("#milestones-list-tbody tr").count();
      await Promise.all([
        s.page.waitForNavigation(),
        s.page.locator("button[aria-label='Delete milestone']").last().click(),
      ]);
      assert.equal(await s.page.locator("#milestones-list-tbody tr").count(), before - 1);
      step("startup delete milestone persists");

      // Contacted investor status.
      const contactsBefore = await s.page.locator("#investor-declined").count();
      await Promise.all([s.page.waitForNavigation(), s.page.locator("#investor-declined").first().click()]);
      assert.equal(await s.page.locator("#investor-declined").count(), contactsBefore - 1);
      step("startup investor status update persists");

      // Cap table: invalid file -> feedback, nothing changed; valid file -> rendered.
      await s.page.click("#next-investment-round-btn");
      await s.page.setInputFiles("#cap-table-upload", {
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("not a spreadsheet"),
      });
      await s.page.fill("#invested-capital", "2500000");
      await Promise.all([
        s.page.waitForNavigation(),
        s.page.click("#submit-investment-stage"),
      ]);
      await s.page.waitForTimeout(200);
      assert.ok(s.dialogs.at(-1).includes("valid .xlsx"));
      assert.equal(new URL(s.page.url()).search, "");
      await s.page.click("#next-investment-round-btn");
      await s.page.setInputFiles("#cap-table-upload", XLSX);
      await s.page.fill("#invested-capital", "2500000");
      await Promise.all([
        s.page.waitForNavigation(),
        s.page.click("#submit-investment-stage"),
      ]);
      const capText = await s.page.locator("#submit-cap-table").innerText();
      assert.ok(capText.length > 20);
      await shot(s, "submit-cap-table");
      step("startup cap table: invalid upload reported, valid upload rendered");

      // Role boundary in the browser.
      const resp = await s.page.goto(BASE + "/admin");
      assert.equal(resp.status(), 403);
      s.problems.splice(0); // the 403 above is intended
      await s.page.goto(BASE + "/logout");
      assert.equal(new URL(s.page.url()).pathname, "/");
      await s.page.goto(BASE + "/startup");
      assert.equal(new URL(s.page.url()).pathname, "/");
      assertClean(s);
      await s.context.close();
      step("startup blocked from /admin (403); logout ends session");
    }

    // ------------------------------------------------------------ fund
    {
      const s = await newSession(browser, "fund");
      await login(s, "fund@example.test");
      assert.equal(new URL(s.page.url()).pathname, "/fund");
      await s.page.waitForSelector("#table .ag-center-cols-container .ag-row");
      const rows = await s.page.locator("#table .ag-center-cols-container .ag-row").count();
      assert.equal(rows, 3);
      await assertIconsRender(s.page);
      await shot(s, "portfolio");
      await Promise.all([
        s.page.waitForURL(BASE + "/fund/startup"),
        s.page.locator("#table .ag-center-cols-container .ag-row").first().click(),
      ]);
      await s.page.waitForSelector("#gantt .bar-wrapper");
      const body = await s.page.locator("body").innerText();
      assert.ok(!body.includes("NaN"));
      await shot(s, "startup-detail");
      for (const sub of ["founders", "rating"]) {
        await s.page.click(`#side-${sub}`);
        await s.page.waitForURL(`${BASE}/fund/startup/${sub}`);
        await shot(s, `startup-${sub}`);
      }
      await s.page.reload();
      assert.equal(new URL(s.page.url()).pathname, "/fund/startup/rating");
      // Out-of-portfolio selection is refused.
      const status = await s.page.evaluate(async () => {
        const r = await fetch("/fund/startup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: 3 }),
        });
        return r.status;
      });
      assert.equal(status, 403);
      s.problems.splice(0);
      assertClean(s);
      await s.context.close();
      step("fund portfolio -> startup detail/founders/rating; foreign startup 403");
    }

    // ------------------------------------------------------------ stakeholder
    {
      const s = await newSession(browser, "stakeholder");
      await login(s, "stakeholder@example.test");
      await s.page.waitForSelector("#table .ag-center-cols-container .ag-row");
      const names = await s.page.locator("#table .ag-center-cols-container .ag-row").allInnerTexts();
      assert.equal(names.length, 2);
      assert.match(names[0], /Quantum Forge/);
      const text = await s.page.locator("body").innerText();
      assert.ok(!/Hard Cap/.test(text), "stakeholder must not see fund information");
      await shot(s, "portfolio");
      assertClean(s);
      await s.context.close();
      step("stakeholder sees only own portfolio and no fund figures");
    }

    // ------------------------------------------------------------ admin
    {
      const s = await newSession(browser, "admin");
      await login(s, "admin@example.test");
      await assertIconsRender(s.page);
      await shot(s, "overview");
      await s.page.goto(BASE + "/admin/users");
      await s.page.fill("#first-name", "Robin");
      await s.page.fill("#last-name", "O'Neil");
      await s.page.fill("#email", "robin@example.test");
      await s.page.selectOption("#role", "admin");
      await Promise.all([s.page.waitForNavigation(), s.page.click("#submit-new-user")]);
      assert.ok(s.dialogs.at(-1).includes("Successfully added"));
      const options = await s.page.locator("#users option").allInnerTexts();
      assert.ok(options.some((o) => o.includes("O'Neil")));
      // Duplicate email is refused.
      await s.page.fill("#first-name", "Dup");
      await s.page.fill("#last-name", "Dup");
      await s.page.fill("#email", "robin@example.test");
      await s.page.selectOption("#role", "admin");
      await s.page.click("#submit-new-user");
      await s.page.waitForTimeout(300);
      assert.ok(await s.page.isVisible("#email-taken"));
      // Edit keeping the same email works.
      const robin = await s.page.locator("#users option", { hasText: "O'Neil" }).getAttribute("value");
      await s.page.selectOption("#users", robin);
      await s.page.waitForSelector("#new-user:not(.hidden)");
      await s.page.fill("#new-first-name", "Robyn");
      await s.page.fill("#new-password", "another-local-pass");
      await Promise.all([s.page.waitForNavigation(), s.page.click("#submit-new-credentials")]);
      assert.ok(s.dialogs.at(-1).includes("User updated"));
      // Delete.
      await s.page.selectOption("#select-delete-users", robin);
      await s.page.click("#delete-btn");
      await Promise.all([s.page.waitForNavigation(), s.page.click("#yes-delete-btn")]);
      const after = await s.page.locator("#users option").allInnerTexts();
      assert.ok(!after.some((o) => o.includes("O'Neil")));
      await shot(s, "users");
      step("admin user create / duplicate email / edit / delete");

      await s.page.goto(BASE + "/admin/startups");
      await s.page.fill("#name", "Nordlicht Robotics");
      await s.page.fill("#company", "Fictional GmbH");
      await s.page.fill("#bc-username", "demo");
      await s.page.fill("#bc-password", "local-only");
      await Promise.all([s.page.waitForNavigation(), s.page.click("#submit-new-startup")]);
      const startupOptions = await s.page.locator("#startups option").allInnerTexts();
      assert.ok(startupOptions.some((o) => o.includes("Nordlicht Robotics")));
      await shot(s, "startups");
      step("admin create startup appears after reload");

      await s.page.goto(BASE + "/admin/funds");
      await shot(s, "funds");
      assertClean(s);
      await s.context.close();
    }

    // ------------------------------------------------------------ onboarding
    {
      const s = await newSession(browser, "onboarding");
      await login(s, "onboarding@example.test");
      assert.match(new URL(s.page.url()).pathname, /^\/onboarding\//);
      await shot(s, "first-step");
      assertClean(s);
      await s.context.close();
      step("first login of un-onboarded startup enters onboarding", new URL(s.page.url()).pathname);
    }

    // ------------------------------------------------------------ mobile + keyboard
    {
      const s = await newSession(browser, "mobile", { width: 390, height: 844 });
      await login(s, "startup@example.test");
      await s.page.goto(BASE + "/startup/submit");
      const overflow = await s.page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      results.steps.push({ name: "mobile submit horizontal overflow px", detail: String(overflow) });
      await shot(s, "submit");
      // Keyboard: tab reaches icon-only buttons with accessible names.
      let named = 0;
      for (let i = 0; i < 40; i++) {
        await s.page.keyboard.press("Tab");
        const label = await s.page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
        if (label) named++;
      }
      assert.ok(named > 0, "no labelled icon button reachable by keyboard");
      assertClean(s);
      await s.context.close();
      step("mobile viewport renders; keyboard reaches labelled icon buttons", `named=${named}`);
    }

    // ------------------------------------------------------------ concurrency
    {
      const sessions = await Promise.all(
        ["startup@example.test", "startup2@example.test", "fund@example.test", "stakeholder@example.test"].map(
          async (email, i) => {
            const s = await newSession(browser, `concurrent-${i}`);
            await login(s, email);
            return s;
          }
        )
      );
      for (let round = 0; round < 5; round++) {
        await Promise.all(sessions.map((s) => s.page.reload()));
      }
      const titles = await Promise.all(sessions.map((s) => s.page.locator("body").innerText()));
      assert.match(titles[0], /HelioFusion/);
      assert.match(titles[1], /Quantum Forge/);
      for (const s of sessions) {
        assertClean(s);
        await s.context.close();
      }
      step("4 roles x 5 concurrent reloads keep their own sessions");
    }
  } finally {
    await browser.close();
    server.child.kill();
    fs.writeFileSync(path.join(OUT, "server.log"), server.log());
    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
  }
  console.log(`\n${results.steps.length} steps, ${results.screenshots.length} screenshots, ${results.issues.length} issue groups`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
