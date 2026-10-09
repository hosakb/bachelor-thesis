# UI-readiness QA report (dashboard)

Branch `fix/ui-readiness`. All verification below ran against an isolated in-memory database with fictional data. No `.env` was read, no remote database or Business Central instance was contacted, and no legacy credentials were used.

## Reproduce locally

Run from `dashboard/` (Node 26 used here; README targets Node 12):

```
npm exec tsc -- --noEmit
npm run lint
node --require ./tests/local-db.cjs --test ./src/models/investor_startup_map.test.ts
node --test tests/http.test.cjs
node --openssl-legacy-provider --test tests/http.test.cjs
node --test tests/large-fixture.test.cjs                     # LOCAL_DB_EXTRA_STARTUPS=150 by default
CHROMIUM_PATH=/path/to/chromium node tests/e2e.cjs           # starts its own server on :3317
node --test tests/demo-runtime.test.cjs                     # hostile-env boot/login/reset
CHROMIUM_PATH=/path/to/chromium node tests/remaining-e2e.cjs # clean sandbox-runtime flows on :3331
PORT=3307 node local-demo.cjs                               # safe loopback-only manual demo
```

Scraper, run from `scraper/`:

```
npm run build
node --openssl-legacy-provider --test tests/bc-contract.test.cjs
```

`tests/bc-contract.test.cjs` runs the compiled scraper job (unchanged cron tick, NTLM client, models and `calculateMetrics`) against a local HTTP server on 127.0.0.1 that performs the NTLM type1/type2/type3 handshake and answers the two OData queries the scraper sends (account `1331` balance; `1601`/`1602` short-term liabilities). The database module is swapped for an in-process fake before load, so `.env` is never read. The test checks the handshake, the exact filters, the rounded rows written to `business_central_finance`, the burn rate, cash runway and liquidity written to `metrics` across three ticks, and that an unreachable company is logged without stopping the job. A deliberate change to the liquidity formula made it fail (mutation check). `npm run build` rewrites two tracked files in `scraper/dist`; they are not part of this change.

`tests/local-db.cjs` replaces `src/config/db.ts` with pg-mem before the app loads. It seeds two investors (fund and stakeholder type), four startups (two in the fund portfolio, one only in the stakeholder portfolio, and one fresh onboarding startup outside every portfolio) and six logins `{admin,startup,startup2,onboarding,fund,stakeholder}@example.test` with password `local-demo-only`. State lasts for one process. It is not a production migration.

Install dashboard dependencies with `npm ci` (include dev dependencies), then run the manual demo command above and open http://127.0.0.1:3307. Stop with Ctrl-C; restart resets all fictional data. `.local-app-sandbox/launch.json` provides the node-web sandbox launch contract. The opt-in `local-demo.cjs` rejects outbound socket connections and loading `pg`/`dotenv`, preloads the fixture before application routes, and binds only 127.0.0.1. Its modern-Node legacy-crypto child uses an allowlisted environment, not inherited DB/ERP credentials or NODE_OPTIONS. Tests used Node 26.7.0 on Linux. Do not use the legacy `npm start` or committed `.env` for this demo. Hosting project discovery remains the sandbox owner's responsibility; this PR does not deploy it.

On Node 17 and later, Business Central password hashing (NTLM: MD4/DES via httpntlm) needs `--openssl-legacy-provider`. The crypto itself was not changed.

## Fixed issues (each reproduced before the fix, with a regression test)

| # | Issue | Fix | Test |
|---|---|---|---|
| 1 | Fund portfolio could render zero rows (async `forEach` returned early) | awaited loop | unit, large-fixture |
| 2 | TRL edit and delete, plus Gantt period/progress requests, never responded | send status, read the correct payload | http |
| 3 | Authenticated `/` redirected to itself; logout redirected before the session was cleared | role destination; redirect in callback | http |
| 4 | **Security (approved by Ben):** any logged-in role could use `/admin`, `/startup`, `/fund` and `/onboarding` | `requireRole` per router; session entity bound to the user's own startup/fund | http |
| 5 | **Security (approved):** a startup could edit or delete another startup's TRL, milestones, investors and patents by id; a fund or stakeholder could open startups outside its portfolio | ownership checks (`models/ownership.ts`), 403 | http, e2e |
| 6 | Any exception in an async route crashed the whole server (shown: admin `get-user` for a missing id ended the process) | async errors forwarded to Express; generic 500 handler | http |
| 7 | A startup with no TRL rows broke the fund startup detail page (redirect) and showed NaN | LEFT JOIN; "–" placeholder | http |
| 8 | Milestone dates rendered as full timestamp strings, so the inline date inputs loaded empty | YYYY-MM-DD values; server and client validation (name, date order, 0–100) | http, e2e |
| 9 | Gantt drag never worked: page exception `reading '$bar'` (number ids vs. string `data-id`) | string task ids | e2e |
| 10 | Each Gantt drag stacked another Ok/Cancel listener, so N drags sent N stale requests | single listener, pending-change map | e2e (3 drags → 1 PUT) |
| 11 | Gantt Ok/Cancel and Day/Week/Month/Year buttons were covered by the next card row; Cash Runway chart overflowed its card | grid rows sized by content | screenshot review, e2e click |
| 12 | Icons blank offline (stylesheet loaded from icons8 CDN) | local `line-awesome` CSS and fonts | http, e2e font check |
| 13 | Cap-table upload wrote every user's file to the same name in `public/uploads` (cross-user overwrite and exposure); an invalid file still changed the investment phase and capital | in-memory per-request parsing, 5 MB limit, parse before writing, user feedback | http (incl. concurrent), e2e |
| 14 | Client handlers ignored failed responses and edited the DOM optimistically (TRL, milestones, investor status, admin CRUD); "declined" read the wrong cell; admin edit compared against the wrong email field | check `response.ok`, reload on success, alert on failure, disable during request | e2e |
| 15 | Rows reordered after edits (no ORDER BY) | stable ordering for TRL, milestones, investors, patents, metrics | e2e |
| 16 | Admin add/update startup inserted the startup before hashing failed, leaving orphans | hash first | http |
| 17 | Long unbroken input pushed table columns out of the card; dates wrapped at hyphens | `overflow-wrap`, nowrap date cells | screenshot review |
| 18 | Icon-only buttons had no accessible name | `aria-label` and `title` | e2e keyboard step |
| 19 | Admin fund edit did not restore selected startup checkboxes (number/string IDs) and retained stale checks when switching investors | compare IDs as strings and set every checkbox | remaining-e2e fund/stakeholder CRUD |
| 20 | Freshly onboarded startup overview crashed in Frappe Gantt with no milestones | existing card displays a small empty-state message; view-mode clicks are safe | remaining-e2e full onboarding/re-login |
| 21 | Questionnaire page requested a nonexistent script, causing 404/MIME console errors | remove unused script reference; native form retained | remaining-e2e questionnaire completion |
| 22 | Patent granted pane repeated "granted for" in its heading (found visually) | remove duplicate wording, preserve layout | remaining-e2e exact heading assertion |

## Results (actual runs)

- TypeScript `tsc --noEmit`: pass. ESLint (repo config, `.ts`): pass.
- Unit: 1/1. HTTP: 15/15 without the legacy provider and 15/15 with it.
- Large fixture: 152 portfolio rows, all unique, `/fund` and the table API answered in 146 ms total.
- Scraper Business Central contract: 1/1 with `--openssl-legacy-provider`. Without the flag it fails on Node 26 with `digital envelope routines::unsupported` (the MD4 limitation above).
- Browser E2E (`tests/e2e.cjs`, headless Chromium build 1243): 19 steps passed, 16 screenshots, 0 console errors, 0 page exceptions, 0 failed local requests, 0 external requests. Covered: invalid and valid login, anonymous redirect, startup Gantt drag and save plus reload, TRL add/edit/validation with special characters, milestone add/edit/delete/validation with long input and repeated clicks, investor status, invalid and valid cap-table upload, logout, cross-role 403, fund portfolio → detail/founders/rating plus reload, foreign-startup 403, stakeholder portfolio isolation without fund figures, admin user create/duplicate email/edit/delete, admin startup create, onboarding entry, 390 px mobile layout (0 px horizontal overflow), keyboard reachability of labelled icon buttons, and 4 concurrent role sessions × 5 reload rounds.
- Latest rerun: model unit 1/1; dashboard HTTP, large-fixture and demo-runtime suites 17/17 together with the legacy provider. Dashboard TypeScript and repository ESLint pass. Scraper build and TypeScript pass; scraper has no lint script/config, so an ESLint 10 probe could not run and is not a pass.
- Latest large fixture rerun: 152 portfolio rows, all unique; reported load_ms=164. This is a local smoke load, not a capacity benchmark.
- `tests/remaining-e2e.cjs`: 3 additional complete browser flows, 3 screenshots, zero console/page errors and external requests. Covered full onboarding (cap-table upload, product/TRL, every questionnaire field, founder submission, reload and logout/re-login), admin fund and stakeholder create/edit/delete/cancel-deletion and selection reset, patent initial application/disclosure/examination/objection/granted transitions with concrete deadline assertions, cancellation and reload. The previously wrong fixture expertise JSON column is now text, matching the real app's string input; demo seed patent status uses the application's supported initial-application state.
- Sandbox-runtime regression: boots twice with deliberately hostile DATABASE_URL/PGHOST, logs loopback URL, authenticates fictional startup and shows fixture data each launch; 1/1. The actual browser flows above run through the sandbox entrypoint, not a substitute app.
- Screenshots: `qa/baseline/` (before UI changes), `qa/after/`, and `qa/remaining/`. Visually reviewed baseline vs. updated submit page, startup overview, mobile submit and patent pane. Original dark cards, colors, typography, sidebar/navigation and two-column desktop structure are preserved. Offline icons now appear and dates are compact; long text wraps inside cards. Narrow tables use horizontal scrolling; not a claim that every column fits simultaneously on a phone.
- Independent read-only review inspected the main-to-working-tree application diff, guards, uploads, fixture/runtime and scraper contract test. No blocking new security/logic/regression findings. Reviewer requested excluding the agent-only task DB diagnostic helper: removed. Pre-existing hardening suggestions were recorded separately (t_d3e72791), pending Ben authorization; no scope expansion here.

## Limitations, not verified

- Business Central: only checked against the test-only contract server above, which is shaped by what the scraper code requests, not by a recorded live response. A reusable ERP demo mock and tutorial are the separate follow-up task t_9ce2d6e9. No live Business Central was contacted.
- Browser coverage is a deterministic regression/stress suite, not exhaustive fuzzing of every possible input, patent branch or browser. Founder completion used an engineering expertise/no-prior-ventures path; only desktop Chromium and a 390 px mobile viewport were exercised.
- Not tested: Firefox, Windows (the README's reference platform), real PostgreSQL, live ERP.
- Not in scope and unchanged: the hard-coded session secret `"12345"` in `server.ts`, the committed `.env` credentials referenced by the README, the NTLM hashing scheme, and a commented credential-like string in `scraper/src/api/business-central.js`. These need a separate security decision from Ben.
