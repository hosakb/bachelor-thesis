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
PORT=3307 NODE_ENV=test node --openssl-legacy-provider --require ./tests/local-db.cjs ./src/server.ts   # manual run
```

`tests/local-db.cjs` replaces `src/config/db.ts` with pg-mem before the app loads. It seeds two funds (fund and stakeholder type), four startups (two in the fund portfolio, one only in the stakeholder portfolio, one outside every portfolio, one not yet onboarded) and six logins `{admin,startup,startup2,onboarding,fund,stakeholder}@example.test` with password `local-demo-only`. State lasts for one process. It is not a production migration.

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

## Results (actual runs)

- TypeScript `tsc --noEmit`: pass. ESLint (repo config, `.ts`): pass.
- Unit: 1/1. HTTP: 15/15 without the legacy provider and 15/15 with it.
- Large fixture: 152 portfolio rows, all unique, `/fund` and the table API answered in 146 ms total.
- Browser E2E (`tests/e2e.cjs`, headless Chromium build 1243): 19 steps passed, 16 screenshots, 0 console errors, 0 page exceptions, 0 failed local requests, 0 external requests. Covered: invalid and valid login, anonymous redirect, startup Gantt drag and save plus reload, TRL add/edit/validation with special characters, milestone add/edit/delete/validation with long input and repeated clicks, investor status, invalid and valid cap-table upload, logout, cross-role 403, fund portfolio → detail/founders/rating plus reload, foreign-startup 403, stakeholder portfolio isolation without fund figures, admin user create/duplicate email/edit/delete, admin startup create, onboarding entry, 390 px mobile layout (0 px horizontal overflow), keyboard reachability of labelled icon buttons, and 4 concurrent role sessions × 5 reload rounds.
- Screenshots: `qa/baseline/` (before UI changes) and `qa/after/`. Reviewed by eye: startup overview, submit page before and after edits, mobile submit.

## Limitations, not verified

- Scraper against a Business Central mock: not run. Only `npm run build` passed. A reusable ERP mock is the separate follow-up task t_9ce2d6e9.
- Full onboarding walkthrough (all questionnaire steps), patent lifecycle transitions and admin fund edit/delete were not driven in the browser. Only the first onboarding step and admin page rendering were checked for those areas.
- Not tested: Firefox, Windows (the README's reference platform), real PostgreSQL, live ERP.
- Not in scope and unchanged: the hard-coded session secret `"12345"` in `server.ts`, the committed `.env` credentials referenced by the README, and the NTLM hashing scheme. These need a separate security decision from Ben.
