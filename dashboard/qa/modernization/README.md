# PR #1 frontend modernization (task t_fbbf867c)

Base: reviewed role-picker/expanded-fixture commit c8c224b565be3579b662faabb508a6092dee73f3. Branch style/pr1-frontend-modernization, fast-forwarded from main 517731f. No push; publisher t_f1540f11 integrates into fix/ui-readiness / PR #1.

## What changed

Presentation only. No route, query, calculation, form field, label, chart dataset or role check changed.

- `public/css/theme.css` (new): one presentation layer loaded last by the dashboard, admin, onboarding and login layouts. Body classes `app layout-*` / `login-page` scope it.
- `public/js/chart-theme.js` (new): sets Chart.js defaults (text color, grid color, font, legend/tooltip spacing, point/line size, animation off under reduced motion). Loaded only when a page already loads Chart.js, after the page scripts and before their `DOMContentLoaded` chart construction. Series colors and data stay in the page scripts.
- Four layout templates: link theme.css, add a body class, add the chart-theme script tag.
- `tests/visual-capture.cjs` (new): before/after screenshot and layout-metric capture.

Original palette tokens kept (recorded as CSS variables in theme.css): sidebar #393e46, accent #d65a31, header rgb(53,53,53), page #252b38, card #3f495e, table rgb(53,58,70), thead #414752, alternate row rgb(58,68,85), input #45484e / border #979797, button #797b80, login background rgb(60,72,72) with gray card. The only additions are a lighter hover of the accent and button colors, a muted text gray and low-alpha white borders.

Fonts: system-ui stack ending in DejaVu Sans (the font actually present on this host). No webfont or network request.

Visual fixes, all roles:
- Consistent card radius/border/shadow/padding; removed backdrop blur; 2rem grid gaps.
- Header/sidebar heights aligned (5.6rem), sidebar items as uniform 4.4rem pills, hover state, focus-visible outline in the accent color.
- Tables: compact header/row padding (was 2rem), separators, tabular numerals, left alignment, no per-cell rounded hover; rating table centred numeric columns and un-floated weighting inputs.
- Buttons/inputs/selects: one size and radius, accent focus ring, accent-colored checkboxes/radios; icon buttons in rows compact.
- Dialogs (patent/milestone/TRL panes): bordered, scroll within viewport on small screens.
- Charts: readable light axis/legend text on dark cards (was default dark gray), subtle grid; startup/fund metric charts fill their cards in a two-column grid.
- Gantt: header/rows use table palette, readable tick labels, today highlight in accent.
- ag-grid portfolio: themed via Alpine CSS variables to the table palette, pointer cursor.
- Founders: expertise doughnut and table in a wrapping flex layout instead of floats.
- Onboarding product step: cards overlapped because grid rows were sized in percentages; now auto rows.
- Onboarding questionnaire: wide radio tables scroll per table on tablet/mobile instead of widening the page.
- Mobile/tablet: cards stack in document order in one column; dense submit/detail tables keep a 56rem minimum width and scroll inside their card instead of breaking words letter by letter; onboarding header no longer runs under its sidebar.
- Login: centred card with labelled controls; production email/password form gets the same styling.
- `prefers-reduced-motion` disables transitions and chart animation.

Known limitation left as is: the Gantt default Day view of multi-year milestones is wide by design and scrolls horizontally inside its card.

## Visual evidence

`qa/modernization/before/` (c8c224b, captured from a detached scratch worktree of that commit) and `qa/modernization/after/` (this branch), 53 screenshots each: login, admin overview/users/startups/funds, startup overview/submit/Gantt year view, fund portfolio/startup detail/founders/rating/patent dialog, stakeholder portfolio, onboarding startup/product/questionnaire/track record, at 1440x1000, 834x1112 and 390x844. Each `results.json` records URL, document horizontal overflow, and form controls outside the viewport that no scroll container reaches.

| | pages with document overflow / unreachable controls | console, page, HTTP >= 400, failed or external requests |
| --- | --- | --- |
| before | 3 (questionnaire tablet 462px/19, product mobile 191px, questionnaire mobile 906px/208) | 0 |
| after | 0 | 0 |

Inspected by eye, before vs after: startup overview desktop/mobile, Gantt year, fund portfolio/detail/founders/rating/patent dialog, admin overview/users, startup submit desktop/mobile, onboarding startup/product/questionnaire, login. Colors remain the original scheme.

## Executed verification (this branch)

All with `CHROMIUM_PATH=/home/boh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`, from `dashboard/` after `npm ci --ignore-scripts`:

- `node --openssl-legacy-provider --test tests/*.test.cjs`: 21/21 pass (HTTP auth/ownership, role picker CSRF/origin/token, expanded fixtures, milestone save/readback, 153-row large fixture).
- `npx tsc --noEmit`: pass. `npm run lint`: pass. `npx prettier --check` on new files: pass.
- `node tests/e2e.cjs`: 19 steps, 16 screenshots, 0 issue groups. Includes Gantt drag, TRL/milestone CRUD, contact status, cap-table upload, fund detail/founders/rating, foreign-startup 403, stakeholder isolation, admin CRUD, onboarding redirect, mobile keyboard reach of labelled icon buttons (26), and the deterministic stress step: 4 roles x 5 concurrent reloads keep their own sessions.
- `node tests/remaining-e2e.cjs`: full onboarding with reload/re-login, admin fund/stakeholder CRUD, patent lifecycle to granted with cancellation and reload: pass.
- `node tests/role-picker-e2e.cjs`: 4 roles x 1440/390, keyboard submit, destination, reload, populated Gantt (4 milestones) and portfolio rows (3/2), logout, cross-origin and tampered login rejected, no console/page errors.
- `VISUAL_OUT=qa/modernization/after node tests/visual-capture.cjs`: 53 screenshots, 0 problem groups, 0 overflow/unreachable-control pages.

The existing suites regenerated their screenshots in qa/after, qa/remaining and qa/role-picker with the new styling.
