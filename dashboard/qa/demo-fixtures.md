# Isolated demo and fixture contract

Run `cd dashboard && npm ci && node local-demo.cjs`. The launcher binds 127.0.0.1:3307, uses pg-mem, rejects legacy database/config modules and outbound sockets, and resets all state on every restart. Never use legacy npm start or the old README remote credentials for this demo.

The login screen has four roles and one submit button. Defaults are admin@example.test, startup@example.test, fund@example.test and stakeholder@example.test. Only local-demo.cjs installs app.locals.demoAccounts. NODE_ENV, environment flags, query strings and request payloads cannot enable the bypass in the normal application. POST /demo/login accepts only an allowlisted role and session-bound hidden token, rejects cross-origin submissions, then uses the normal Passport session and existing destination/ownership guards. Reload rotates the token; successful login consumes it. Production credential UI and POST /login remain unchanged. Logout destroys the authenticated session.

All accounts and organizations below are fictional. Tests use POST /login with the fixture-only password local-demo-only for additional accounts. These are not options in the picker and are not new application roles.

Stable base startup identities, with DEMO_EXTRA_STARTUPS unset:

| ID/export | Name | Account | Sector / stage |
| --- | --- | --- | --- |
| 1/helio | HelioFusion | startup@example.test | Energy / Seed |
| 2/quantum | Quantum Forge | startup2@example.test | Computing / Seed |
| 3/orbit | Orbit Labs | startup3@example.test | Space / Pre-seed |
| 4/fresh | New Sprout | onboarding@example.test | new, incomplete |
| 5/tide | Tidal Health | startup4@example.test | Health / Growth |
| 6/cedar | Cedar Analytics | startup5@example.test | Software / Series B |
| 7/empty | Empty Meadow | emptyonboarding@example.test | Agriculture / Pre-seed, empty data |

New Sprout retains the legacy first-login fixture. Empty Meadow has no questionnaire, cap table, TRL, milestones or metrics. The five populated startups each have four milestones, with 100%, 50%, 65% and 0% progress and dates from September 2025 through April 2027; four financial history points; two TRL technologies, two patents, two investor contacts, founder accounts and a three-owner cap table. founder<ID>@example.test is a second founder on each populated startup with its own track record. IDs of original first TRL/milestone/contact/patent records are preserved. Read exports rather than hardcoding added IDs if the large-fixture switch is used.

| Investor ID | Organization | Account | Portfolio |
| --- | --- | --- | --- |
| 1 | Aurora Ventures | fund@example.test | HelioFusion, Quantum Forge, Tidal Health |
| 2 | Pioneer Incubator | stakeholder@example.test | Quantum Forge, Tidal Health |
| 3 | Meridian Capital | fund2@example.test | Tidal Health, Cedar Analytics |
| 4 | Juniper Incubator | stakeholder2@example.test | Cedar Analytics, Orbit Labs |
| 5 | Empty Horizon Fund | emptyfund@example.test | empty |

ERP task t_9ce2d6e9 should reuse dashboard/tests/local-db.cjs and its exported ids/demoAccounts, not create competing seed definitions. The optional DEMO_EXTRA_STARTUPS switch is for the existing stress test, not the isolated launcher, which strips inherited environment settings. No ERP, scraper or launch.json behavior changed here.

# Executed verification

- `node --openssl-legacy-provider --test tests/*.test.cjs`: 21/21 passed after the CSRF correction, including role rejection, production-mode behavior, ownership, expanded portfolios/milestone save/readback and 153-row large fixture (150 ms recorded smoke load). Missing, foreign, stale, malformed, replayed and cross-origin tokens are rejected.
- `npx tsc --noEmit` and `npm run lint`: passed with no lint warnings after explicit safe user-field projection.
- `CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome node tests/e2e.cjs`: 19 steps, 16 screenshots, zero issue groups. Gantt drags, TRL/milestone CRUD, contact status, upload, fund details, admin CRUD, mobile keyboard, four concurrent role sessions all passed. Multi-row assertions now select the edited row rather than assuming it stays first after date sorting; Gantt drag scrolls its target into view.
- Same CHROMIUM_PATH with `node tests/remaining-e2e.cjs`: full onboarding, admin fund/stakeholder CRUD and patent lifecycle passed. Extra onboarding accounts authenticate through the existing fixture credential endpoint; ordinary roles use the dropdown.
- Same CHROMIUM_PATH with `node tests/role-picker-e2e.cjs`: four roles at 1440x1000 and 390x844, eight checks, no console/page errors. Keyboard submission, destinations, refresh, expanded Gantt/portfolio counts, logout and rejected identity overrides passed. Actual screenshots are in qa/role-picker; existing suites refreshed qa/after and qa/remaining.

Visually inspected desktop startup charts/Gantt and mobile login. The picker fits the narrow viewport after a demo-only wrapper max-width correction. Existing chart contrast, day-mode horizontal Gantt extent and dense mobile tables are preserved for modernization task t_fbbf867c, not redesigned here. Playwright's browser installer does not support this host OS and a fallback download timed out; tests actually ran with the existing Chromium executable above.

# Review handoff

Changes are isolated on feat/demo-role-picker at published base f90709d303ab3db0ef65ef0e761f8356c6fee79d. No PR/shared branch write or merge occurred. Ben supplied the repository-local commit identity. This branch is the selected combined picker/expanded-fixture implementation: do not also layer the overlapping t_cce255ef picker onto it. Its session-bound token defense was incorporated here with an additional Origin check and explicit submitted-field allowlist. The sibling scraper/tsconfig.json build-root fix is separate and must still be retained by integration; this checkout does not contain that fix.

Follow-up read-only review inspected the corrected route, template, session declaration, launcher/server and tests, independently ran all three picker tests, and found no remaining must-fix defects in the correction. Earlier R1 login-CSRF is resolved. Parent reran all 21 regression tests, typecheck/lint and all three clean-state browser suites after the change; results above reflect that run. Visually inspected actual mobile picker and startup desktop screenshots again: picker controls fit, existing chart contrast/day-mode extent limitations remain for modernization. Publisher owns coordinated PR #1 integration; modernization must preserve this fixture contract. No live database, ERP, sandbox service restart, new PR or merge.
