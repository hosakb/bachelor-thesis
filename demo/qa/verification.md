# ERP demo verification

## Scope

The separate ERP follow-up adds `demo/`, the README tutorial and a scraper compiler input correction. It builds on reviewed application head `08954c0366c1dd5aa5bce50a68725498addb9a15`. No dashboard production sources, UI styles, financial calculations, authentication rules, credentials or deployment settings changed.

The mock is maintained repository code, not a full Dynamics emulator. It implements the exact OData filters consumed by the real NTLM client, accepts a structurally valid type 3 handshake without validating passwords, and serves deterministic fictional snapshots. The demo reuses the existing expanded pg-mem fixture and runs the compiled real scraper job. Only its schedule, database/clock and ERP endpoint are demo substitutes.

## Executed checks

Environment: Linux Ubuntu 26.04, Node 26.12.1, npm 12.0.2, Playwright 1.55.1 with existing Chrome for Testing 156.0.8078.4 at `/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`.

From repository root:

```sh
npm --prefix dashboard ci --ignore-scripts
npm --prefix scraper ci --ignore-scripts
npm --prefix scraper run build
node --openssl-legacy-provider --test demo/tests/mock.test.cjs demo/tests/import.test.cjs demo/tests/launcher.test.cjs
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node demo/tests/browser.cjs
```

- Four automated demo tests pass. They verify challenge/type 3 exchange, malformed auth rejection, exact filter payloads, unknown company/filter errors, three imported snapshots for five companies, finance rows, burn rate/runway/liquidity, dashboard model reads, serialized repeated imports, hostile inherited configuration, actual role login/chart responses, reload persistence, and restart/reset twice.
- The scraper build now emits `dist/api/job.js`. Before the fix, adding the `.cjs` contract test to the compiler's default input glob shifted output into `dist/src/api/job.js` despite a successful exit. Restricting input to `src/**/*` preserves the existing compiler options and expected output layout. The new build-path assertion was red before the fix.
- Twelve fresh-browser role/viewport cases pass at widths 1440, 834 and 390. `browser.json` records all cases and zero console/page/HTTP/external-request errors. Real Chart.js data for HelioFusion is exactly `[0,10000,18999.5]`. Navigation to Submit, back, reload and logout preserve the expected state. Screenshots wait for chart animation to finish and select Year for the Gantt timeline.

Existing regressions were rerun from `dashboard/`:

```sh
npm run lint
npx tsc --noEmit
node --openssl-legacy-provider --test tests/http.test.cjs tests/large-fixture.test.cjs tests/expanded-fixture.test.cjs tests/role-picker.test.cjs tests/demo-runtime.test.cjs
node --openssl-legacy-provider --require ./tests/layout-model-fixture.cjs --test src/models/investor_startup_map.test.ts
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/e2e.cjs
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/remaining-e2e.cjs
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/role-picker-e2e.cjs
```

Lint and dashboard TypeScript pass; 21 server/fixture tests and the model test pass. The original scraper NTLM contract test also passes after `npm run build`. The full browser suite reports 19 steps, 16 screenshots and zero issue groups, including four roles with five concurrent reloads each. The remaining suite passes complete onboarding, admin fund/stakeholder CRUD and patent lifecycle flows. The role-picker suite passes eight role/viewport checks with no errors. The large SQL fixture returns all 153 portfolio rows.

## Actual visual inspection

Inspected the rendered demo screenshots, not just captured them. Startup desktop/mobile charts show the settled imported values, readable legends/ticks and the original red/peach series. The Year timeline shows all four milestones on desktop. On mobile its wide timeline scrolls inside the card; labels cut at the viewport edge remain deliberately scrollable. Original navy/slate cards, orange navigation and purple milestone bars remain unchanged.

Inspected desktop/tablet fund portfolio, mobile stakeholder and desktop/mobile admin overview. Card hierarchy and chart layout are preserved. Existing tablet grid ellipsis and mobile wide-table horizontal scrolling remain, not a new design or a claim that all columns fit simultaneously. The original month/year chart labels repeat for daily snapshots; this is documented rather than changing chart semantics in an ERP-only PR.

## Independent technical review

A separate read-only gpt-6.1-sol/OpenAI Codex reviewer approved this exact scoped implementation with no must-fix findings. The reviewer independently ran the four focused tests and TypeScript/whitespace checks, inspected isolation, production-scope boundaries, mock honesty, import/persistence and reset behavior. Browser scripts were read, not independently rerun or visually approved by that reviewer. Parent execution owns the browser and visual evidence above.

Non-blocking review limitations: helper test ports are fixed; shutdown tests cover normal successful shutdown, not arbitrarily stalled requests.

## Clean-clone tutorial verification

Cloned the actual pushed `feat/erp-demo-server` branch from GitHub into a new isolated checkout at `.worktrees/t_07a4ef3c-clean-demo`, head `0246e13b61b505c8d253287abe98832a44adc800`. Followed the README install/build sequence literally: both `npm ci --ignore-scripts` commands and the normal scraper build passed without existing node_modules or developer configuration. All four demo tests and all twelve browser cases passed again in that fresh clone. The launcher test exercises the documented startup, role login, terminal import, reload and stop/restart reset twice. Browser execution used the documented `CHROMIUM_PATH` option for this host. No source changes were required after independent review; this section only records the completed check.

## Setup failures and boundaries

A model test was first invoked without its required fixture preload and failed on undefined database settings before connection. The correct isolated command above passes; no live database was contacted. Playwright's pinned installer did not recognize Ubuntu 26.04. A fallback browser download stalled and was stopped; the successful browser runs use an already-installed executable via `CHROMIUM_PATH`. No dependency, global browser, Hermes or service configuration was changed.

`npm ci` reports legacy dependency vulnerabilities: dashboard 30, scraper 10. No unrelated dependency upgrades or broad audit fix were performed. No real ERP or PostgreSQL integration, cross-browser compatibility, deployment or authentication against real NTLM passwords is claimed. There are no real customer records or legacy credential values in these new fixtures or evidence. No merge, deployment or user-service restart occurred.