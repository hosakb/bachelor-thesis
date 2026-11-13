# Scoped dashboard hardening verification

## Changes

This separate follow-up is based on reviewed modernization head `08954c0366c1dd5aa5bce50a68725498addb9a15`. It does not repeat the ERP/tutorial PR or alter dashboard features, palette, navigation semantics or financial calculations.

- Frappe Gantt 0.6.1 uses `innerHTML` for SVG task labels and custom popups. Both Startup and Fund/Stakeholder views now encode labels and popup fields. Original text is retained separately through save/cancel, so names with ampersands, angle brackets and quotes display literally without double encoding.
- Actual mobile screenshot inspection caught a long popup clipped at the right edge. The shared renderer now wraps and confines the popup to the visible Gantt container, with bounded scrolling for very long content. Browser assertions measure all four edges, rather than relying only on screenshots.
- Gantt progress/period, milestone add/update and TRL add/edit/onboarding reject invalid scalar types, non-finite/range-invalid numbers, rolled-over calendar dates, reversed periods, blank names and malformed batches before writes. A rejected milestone batch cannot reach the existing delete-and-reinsert method. Existing ownership middleware remains in place.
- Session options require an explicit secret of at least 32 characters after trimming in production; nonproduction without a configured value gets a new random secret per process. Cookies are HttpOnly/SameSite=Lax and Secure in production. Resave is false. See `dashboard/SESSION_CONFIGURATION.md` for the operator requirements and remaining production limitations. No deployed settings or actual credentials were changed.

## Reproduced defects and test progression

New server tests failed against the original code because invalid progress/date/TRL values were accepted and the new session/HTML configuration did not exist. The stored-markup browser regression was also run against the unchanged application branch. A name containing `<img ...>` was parsed as markup rather than preserved literally in the SVG label, producing a failing text-content assertion.

The browser test initially targeted an empty pinned AG Grid row and later a company the Stakeholder account does not own. Those were test setup defects, corrected to the visible center rows and the stakeholder's actual Quantum Forge portfolio entry. No application authorization bypass was introduced to make the tests pass.

## Executed commands and results

Environment: Node 26.12.1, npm 12.0.2, Playwright 1.55.1 with Chrome for Testing 156.0.8078.4. All runtime data was fictional pg-mem data. No live database or ERP was contacted.

From `dashboard/`:

```sh
npm ci --ignore-scripts
npm run lint
npx tsc --noEmit
node --openssl-legacy-provider --test tests/http.test.cjs tests/large-fixture.test.cjs tests/expanded-fixture.test.cjs tests/role-picker.test.cjs tests/demo-runtime.test.cjs tests/hardening.test.cjs tests/session.test.cjs tests/gantt-content.test.cjs
node --openssl-legacy-provider --require ./tests/layout-model-fixture.cjs --test src/models/investor_startup_map.test.ts
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/hardening-e2e.cjs
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/e2e.cjs
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/remaining-e2e.cjs
CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome node tests/role-picker-e2e.cjs
```

- Six new hardening tests pass, alongside the existing 21 server/fixture tests and isolated model test. Lint and TypeScript pass with no new warnings.
- Six fresh browser role/viewport cases pass for Startup, Fund and Stakeholder at 1440 and 390 pixels. Stored markup remains literal in labels and popups; no image nodes or payload execution exist; save/cancel and reload retain text. Investor selection uses each role's owned portfolio. Popup geometry stays inside its visible chart container. `results.json` records zero console/page errors.
- Full existing browser suite passes 19 steps, 16 screenshots and zero issue groups, including actual repeated Gantt drag/save, CRUD/forms, TRL persistence, role restrictions, upload handling, navigation/reload and four roles with five concurrent reloads each.
- Remaining browser suite passes complete onboarding, admin fund/stakeholder lifecycle and patent lifecycle. Role picker suite passes eight desktop/mobile role cases with no browser errors.
- Large SQL fixture returns all 153 portfolio rows. Session tests verify production rejection and cookie flags without loading a database or opening a listener.

## Visual inspection

Inspected actual Startup desktop/mobile, Fund desktop/mobile and Stakeholder desktop/mobile stored-markup screenshots. Confirmed literal text, readable wrapped mobile popup, visible date/completion and no new page-level overflow. Original dark palette, orange navigation, purple Gantt bars and red/peach charts remain. Wide timelines and dense investor tables intentionally scroll within their cards; not every table column fits on a phone simultaneously. Screenshots are in this directory. Existing before/after application screenshots remain in the other QA directories.

The mobile popup correction was rerun and reinspected after the first screenshot revealed clipping. Capturing alone was not counted as visual acceptance. No redesign, new chart data or feature behavior was added.

## Independent technical review

An independent read-only gpt-6.1-sol/OpenAI Codex reviewer approved this scoped change with no must-fix findings. The reviewer independently ran all 27 server/unit tests, TypeScript, scoped ESLint, JavaScript syntax and whitespace checks. Actual Startup mobile, Fund desktop and Stakeholder mobile screenshots were independently inspected for literal text, wrapping and chart-boundary confinement. Browser suites were not rerun by the read-only reviewer; the parent execution owns the run results above.

The reviewer noted a non-blocking gap in the browser test's progress assertions. The test now checks that saved progress 73 is read back from the real chart endpoint and cancelled progress 81 does not persist; cancellation restores 73 in the actual Gantt task snapshot as well. All six browser cases and all 27 unit/server tests passed again after this test-only improvement. No production code changed after review.

## Limits

This is bounded hardening, not a full security audit. Legacy dependencies, other HTML-rendering paths, broader CSRF policy, database transactions, in-memory production session storage and live integrations remain outside this task. No credentials were printed, rotated or committed, and no network exposure, production settings, GitHub protection, Hermes policy or user services were changed. No merge or deployment occurred. Local tests are not a claim of CI success.