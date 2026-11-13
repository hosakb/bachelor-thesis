// Missing feature coverage, using the actual safe sandbox runtime and clean data.
const { chromium, expect } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'qa', 'remaining');
const BASE = 'http://127.0.0.1:3331';
const XLSX = path.join(ROOT, '..', 'VC-Cap-Table-Example.xlsx');
const results = { steps: [], errors: [], external: [], screenshots: [] };
const step = name => { results.steps.push(name); console.log('ok - ' + name); };
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, ['local-demo.cjs'], { cwd: ROOT, env: { PATH: process.env.PATH, PORT: '3331' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  server.stdout.on('data', d => log += d); server.stderr.on('data', d => log += d);
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { if ((await fetch(BASE)).status === 200) { ready = true; break; } } catch {}
      await new Promise(r => setTimeout(r, 100));
    }
    assert.ok(ready, log);
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
    async function session(email) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage();
      page.on('pageerror', e => results.errors.push(e.stack));
      page.on('console', m => { if (m.type() === 'error') results.errors.push(m.text()); });
      page.on('response', r => { if (r.status() >= 400) results.errors.push(`${r.status()} ${r.url()}`); });
      await context.route('**/*', route => {
        if (new URL(route.request().url()).origin === BASE) return route.continue();
        results.external.push(route.request().url()); return route.abort();
      });
      page.on('dialog', d => d.accept());
      await page.goto(BASE);
      if (email === 'onboarding') {
        await context.request.post(BASE + '/login', { form: { email: 'onboarding@example.test', password: 'local-demo-only' } });
        await page.goto(BASE + '/onboarding/startup');
      } else {
        await page.selectOption('#role', email);
        await Promise.all([page.waitForNavigation(), page.click('[type=submit]')]);
      }
      return { page, context };
    }
    async function save(page, selector) { await Promise.all([page.waitForNavigation(), page.click(selector)]); }
    async function shot(page, name) { const file = path.join(OUT, name + '.png'); await page.screenshot({ path: file, fullPage: true }); results.screenshots.push(path.relative(ROOT, file)); }

    if (!process.env.ONLY || process.env.ONLY === 'onboarding') {
      const { page, context } = await session('onboarding');
      await page.fill('#sector', 'Energy');
      await page.selectOption('#phase', { label: 'Seed' });
      await page.selectOption('#product-to-market', 'yes');
      await page.fill('#invested-capital', '1');
      await page.setInputFiles('[type=file]', XLSX);
      await page.click('button[onclick="submitCapTable()"]');
      await expect(page.locator('#cap-table tr')).not.toHaveCount(0);
      await save(page, 'button[onclick="submitStartupData()"]');
      await expect(page).toHaveURL(BASE + '/onboarding/product');
      await page.fill('#core-technology', 'Thermal core');
      await page.fill('#technology', 'Thermal <core> & storage');
      await page.selectOption('#trl', '5'); await page.selectOption('#criticality', '3');
      await page.click('#add-technology-btn');
      await save(page, '#submit-technolgies-btn');
      await expect(page).toHaveURL(BASE + '/onboarding/questionnaire');
      for (const input of await page.locator('select').all()) {
        const value = await input.locator('option').evaluateAll(options => options.find(o => o.value === '3')?.value || options.find(o => o.value)?.value);
        if (value) await input.selectOption(value);
      }
      for (const input of await page.locator('input[type=number],input[type=text]').all()) await input.fill('3');
      const radioNames = await page.locator('input[type=radio]').evaluateAll(inputs => [...new Set(inputs.map(i => i.name))]);
      for (const name of radioNames) await page.locator(`input[type=radio][name="${name}"]`).first().check();
      await save(page, 'input[type=submit]');
      await expect(page).toHaveURL(BASE + '/onboarding/track-record');
      await page.selectOption('#expertise', { label: 'Engineering' });
      await save(page, '#submit-track-record-btn');
      await expect(page).toHaveURL(BASE + '/startup');
      await page.reload();
      await page.goto(BASE + '/startup/submit');
      await expect(page.locator('#trl-tbody')).toContainText('Thermal <core> & storage');
      await shot(page, 'onboarding-completed');
      await page.goto(BASE + '/logout');
      await context.request.post(BASE + '/login', { form: { email: 'onboarding@example.test', password: 'local-demo-only' } });
      await page.goto(BASE + '/startup');
      await expect(page).toHaveURL(BASE + '/startup');
      step('full onboarding: cap table, product/TRL, questionnaire, founder; reload and re-login');
      await context.close();
    }
    if (!process.env.ONLY || process.env.ONLY === 'funds') {
      const { page, context } = await session('admin');
      await page.goto(BASE + '/admin/funds');
      await page.selectOption('#select-fund-stakeholder', 'fund');
      await page.fill('#name', 'Demo Fund'); await page.fill('#sector', 'Climate');
      await page.fill('#hard-cap', '20'); await page.fill('#fund-volume', '10');
      await page.fill('#next-closing', '2026-11-01'); await page.fill('#final-closing', '2027-01-01');
      await page.locator('#startups-list input[value="1"]').check();
      await save(page, 'button[onclick="registerFund()"]');
      const id = await page.locator('#funds option', { hasText: 'Demo Fund' }).getAttribute('value');
      await page.selectOption('#funds', id); await expect(page.locator('#new-fund')).toBeVisible();
      await expect(page.locator('#new-startups-list input[value="1"]')).toBeChecked();
      await page.fill('#new-name', 'Demo Fund edited');
      await save(page, '#submit-edited-fund');
      await expect(page.locator('#funds')).toContainText('Demo Fund edited');
      await page.selectOption('#funds', '2'); await expect(page.locator('#new-name')).toHaveValue('Northern Incubator');
      await expect(page.locator('#new-startups-list input[value="1"]')).not.toBeChecked();
      await expect(page.locator('#new-startups-list input[value="2"]')).toBeChecked();
      await shot(page, 'admin-fund-edit');
      await page.selectOption('#select-delete-fund', id); await page.click('#delete-btn');
      await page.click('#dont-delete'); await expect(page.locator('#funds option[value="' + id + '"]')).toHaveCount(1);
      await page.click('#delete-btn'); await save(page, '#yes-delete-btn');
      await expect(page.locator('#funds option[value="' + id + '"]')).toHaveCount(0);
      await page.selectOption('#select-fund-stakeholder', 'stakeholder');
      await page.fill('#stakeholder-name', 'Demo Incubator'); await page.locator('#startups-list-stakeholder input[value="3"]').check();
      await save(page, 'button[onclick="registerStakeholder()"]');
      const sid = await page.locator('#funds option', { hasText: 'Demo Incubator' }).getAttribute('value');
      await page.selectOption('#funds', sid); await expect(page.locator('#new-name')).toHaveValue('Demo Incubator');
      await page.fill('#new-name', 'Demo Incubator edited'); await save(page, '#submit-edited-stakeholder');
      await expect(page.locator('#funds')).toContainText('Demo Incubator edited');
      await page.selectOption('#select-delete-fund', sid); await page.click('#delete-btn'); await save(page, '#yes-delete-btn');
      await expect(page.locator('#funds option[value="' + sid + '"]')).toHaveCount(0);
      step('admin fund/stakeholder create, edit, selection reset, cancel deletion and delete');
      await context.close();
    }
    if (!process.env.ONLY || process.env.ONLY === 'patents') {
      const { page, context } = await session('startup');
      await page.goto(BASE + '/startup/submit');
      const title = 'Thermal patent';
      await page.click('#new-patent-btn'); await page.fill('#invention', title); await page.fill('[name=newInventor]', 'Avery');
      await save(page, '#new-patent-pane input[type=submit]');
      const row = () => page.locator('#patent-tbody tr', { hasText: title });
      const open = async () => { await row().locator('button').first().click(); await expect(page.locator('#patent-info-pane')).toHaveClass(/show/); };
      await expect(row()).toContainText('initial-application');
      await open(); await page.fill('#confirmation-date', '2026-01-01'); await save(page, '#initial-application input[type=submit]');
      await expect(row()).toContainText('disclosure-phase'); await open();
      await expect(page.locator('#submission-fee-deadline')).toHaveText('1.2.2026');
      await expect(page.locator('#research-result-deadline')).toHaveText('1.7.2026');
      await page.check('#submission-fee-deadline-checkbox'); await page.check('#inventor-nomination-deadline-checkbox'); await page.check('#examination-request-deadline-checkbox');
      await save(page, '#submit-disclosure-phase'); await open();
      await page.fill('#examination-notice-date-received-input', '2026-07-01'); await save(page, '#examination-notice-received-date-form input[type=submit]');
      await expect(row()).toContainText('examination-phase'); await open();
      await page.check('#examination-notice-deadline-checkbox'); await save(page, '#submit-examination-phase'); await open();
      await page.fill('#patent-grant-form [name=nextPhaseDate]', '2026-11-01'); await page.fill('#patent-grant-duration-input', '20');
      await save(page, '#patent-grant-form input[type=submit]');
      await expect(row()).toContainText('objection-phase'); await open();
      await page.check('#grant-fee-deadline-checkbox'); await page.check('#objection-filing-deadline-checkbox'); await page.check('#objection-response-deadline-checkbox');
      await save(page, '#objection-examination-phase'); await open();
      await save(page, '#objection-resolved-form input[type=submit]');
      await expect(row()).toContainText('granted'); await page.reload(); await open();
      await expect(page.locator('#granted-duration')).toHaveText('20 Years'); await expect(page.locator('#granted h3')).toHaveText('The patent has been granted for:'); await shot(page, 'patent-granted');
      await page.click('#exit-patent-info');
      await page.click('#new-patent-btn'); await page.fill('#invention', 'Canceled patent'); await page.fill('[name=newInventor]', 'Avery');
      await save(page, '#new-patent-pane input[type=submit]');
      await page.locator('#patent-tbody tr', { hasText: 'Canceled patent' }).locator('button').nth(1).click();
      await page.fill('#cancel-patent-pane [name=date]', '2026-10-09'); await page.fill('#cancel-patent-pane [name=reason]', 'Demo cancellation');
      await save(page, '#cancel-patent-pane input[type=submit]');
      await expect(page.locator('#patent-tbody tr', { hasText: 'Canceled patent' })).toContainText('canceled');
      step('patent initial application -> disclosure/deadlines -> examination -> objection -> granted; cancellation and reload');
      await context.close();
    }
    assert.deepEqual(results.errors, []); assert.deepEqual(results.external, []);
  } finally {
    if (browser) await browser.close();
    const exited = new Promise(r => server.once('exit', r)); server.kill(); await exited;
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
    fs.writeFileSync(path.join(OUT, 'server.log'), log);
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
