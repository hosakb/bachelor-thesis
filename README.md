# Bachelors Thesis: Development of a Business Intelligence Dashboard for Deep Tech Focused Venture Capitalists
This dashboard represents the artifact under development for my bachelor's thesis in Information Systems Management (Wirtschafsinformatik) at the University of Bamberg. In its core, it is a proof-of-concept for dashboard, designed to help venture capitalists and incubators to track the business development of deep-tech startups in their portfolio and to provide them with insights into the core technology, the founders, and the milestones, to name  a few.

The dashboard is designed to work with Microsoft Dynamics 365 Microsoft Dynamics 365 Business Central. Financial metrics such as the burn-rate, the cash runway and the liquidity (cash ratio) are calculated based on data scraped from a Business Central endpoint on a daily schedule. Non-financial information is provided manually by the founder during the onboarding or following a specific event (e.g., updating milestones achievement level).

## Features
The full list of features include:
- Gantt Chart
- Financial metrics (Burn rate, Cash Runway and Liquidity)
- Technology Readiness Level and Technology Readiness Level of Product
- Overview of Patents and the Patent filing process (including deadlines)
- Founder's track record and composition of founder's expertise in the startup
- Capitalization Table Upload and rendering
- Status of contacted investors
- Structural Rating
- Portfolio Overview
- VC Fund information

## User Groups
The dashboard has the following user groups:
| User Group   | Description                                                                                     |
|--------------|-------------------------------------------------------------------------------------------------|
| Founders     | Provide information about startup and themselves.                                               |
| VC           | Are presented with detailed insights into startups in their portfolio and some fund information |
| Stakeholder  | Same as VC except for omitted fund information information  (e.g. incubator)                    |
| Admin        | Manages Users, Startups, and Funds                                                              |

## Run the fictional local ERP demo

No ERP account, VPN, PostgreSQL installation, private credentials or `.env` file is needed. The demo starts the existing dashboard, an in-memory PostgreSQL-compatible database using pg-mem, and a maintained Business Central mock. All people, companies, financial records and passwords in this demo are fictional. It binds only to `127.0.0.1`. Do not expose or deploy it.

### 1. Install and build

Install Git, Node.js and npm. This tutorial was exercised on Linux with Node.js **26.12.1** and npm **12.0.2**. Use those versions to reproduce the reported results. Older Node 12 instructions are obsolete. The application still has legacy dependencies and this is not production setup guidance.

Until this follow-up is merged, clone its branch, which includes the role picker and the reviewed frontend modernization:

```sh
git clone --branch feat/erp-demo-server https://github.com/hosakb/bachelor-thesis.git
cd bachelor-thesis
npm --prefix dashboard ci --ignore-scripts
npm --prefix scraper ci --ignore-scripts
npm --prefix scraper run build
node demo/start.cjs
```

Keep this terminal open. Wait for `ERP DEMO READY`. Open **http://127.0.0.1:3407**. The mock listens at **http://127.0.0.1:3408/ODataV4/** and its status endpoint is **http://127.0.0.1:3408/health**. The mock's OData endpoint requires the limited NTLM handshake implemented for the scraper; opening it directly in a browser is not a login workflow.

Use `node demo/start.cjs`, not the historical `npm start` or `devStart` commands. The demo launcher starts an isolated child with an allowlisted environment. It never loads the legacy `.env` files or `pg` connection module, and its only permitted outbound socket is its own ERP mock. Do not copy legacy configuration or credentials into the demo. No Docker, database migrations or external services are needed.

### 2. Explore all four roles

Choose a role at the login screen and select **Enter demo**. Use Logout before choosing another role. These are the representative fictional accounts behind the picker:

| Picker role | Fictional account | What to try |
|---|---|---|
| Admin | `admin@example.test` | Browse users, startups, funds and stakeholders; create and edit test records. |
| Startup/Founder | `startup@example.test` | Inspect HelioFusion's imported financial charts and four milestones. Use Year for the full Gantt timeline. Open Submit to edit technologies, milestones and investor status. |
| VC/Fund | `fund@example.test` | Open Aurora Ventures' three-company portfolio, then a startup's details, founders and rating. |
| Stakeholder | `stakeholder@example.test` | Inspect Northern Incubator's two-company portfolio without fund-only figures. |

The role picker requires no password. The fixture's email/password login used by automated regression tests has the demo-only password `local-demo-only`; never use it outside this fictional runtime. The complete fixture contract, additional empty/onboarding accounts, portfolios and reset behavior are in [dashboard/qa/demo-fixtures.md](dashboard/qa/demo-fixtures.md).

The repository-root `VC-Cap-Table-Example.xlsx` can be uploaded from the startup Submit page. Changes survive navigation, browser reloads, logout and login while this process runs. Nothing is written to a real database.

### 3. Exercise the actual financial import

Startup automatically runs the **real compiled scraper job** against the local mock for three fictional daily snapshots across five populated startups. The existing SQL models persist finance rows and the unchanged calculation functions persist the metrics read by the dashboard. Two empty/onboarding startups intentionally have no ERP credentials, so the scraper reports that it skips them.

For HelioFusion, the three balances are `100000`, `90000`, `81000.5`, and short-term liabilities total `20000.25`. The latest imported burn rate is `18999.5`; cash runway is `81000.5 / 18999.5`; liquidity is `81000.5 / 20000.25`. The first snapshot has zero burn rate and zero runway under the existing calculation. The demo does not change the thesis's formulas or chart formatting. Daily samples currently have repeated month/year labels because the original charts label dates by month.

In the terminal running the demo, type:

```text
import
```

Press Enter, wait for `ERP IMPORT COMPLETE`, then reload the Startup dashboard. The next fictional day reuses the final mock balance and adds another finance/metric row. Imports are serialized even if requested repeatedly. The clock is deterministic and exists only in the demo database adapter. There is no background cron timer in demo mode, so you do not have to wait for the production job's schedule.

### 4. Stop and reset

Press **Ctrl+C** in the demo terminal to stop both local listeners. Start `node demo/start.cjs` again to reset the entire in-memory database, edits and imported history to the original three snapshots. There is no persisted database, volume or demo credential file to delete. Reload the browser and choose a role again.

If a port is busy, stop your own earlier demo instance or choose different ports. In a POSIX shell:

```sh
PORT=3507 ERP_PORT=3508 node demo/start.cjs
```

Use the matching URL shown in the ready message. Both ports must be distinct integers from 1 to 65535. No host/bind override is provided.

### Optional standalone mock

```sh
node demo/mock-erp.cjs
```

This starts only the ERP mock on port 3408. Do not run it alongside the combined launcher on the same port. It serves the initial snapshot without a database or dashboard. The integration tests use the same exported server and select snapshots explicitly.

The maintained subset is `GET /ODataV4/Company('NAME')/testtest` with `$filter=No eq '1331'` or `$filter=No eq '1601' or No eq '1602'`, returning `{ "value": [{ "No": "1331", "Balance": 100000 }] }` for the first balance query. Company names and histories are in [demo/mock-erp.cjs](demo/mock-erp.cjs). It challenges NTLM type 1 and accepts well-formed type 3 messages, but **does not validate passwords or emulate Dynamics 365 authentication**. It is a contract mock, never an authentication service.

### Verify the demo

From the repository root after installing and building:

```sh
node --openssl-legacy-provider --test demo/tests/mock.test.cjs demo/tests/import.test.cjs demo/tests/launcher.test.cjs
```

The tests verify mock endpoints, the real NTLM client, persisted rows, unchanged metrics, serialized imports, hostile legacy settings, reloads and complete restart/reset. Browser checks additionally exercise all four roles at desktop, tablet and mobile widths:

```sh
cd dashboard
npx playwright install chromium
cd ..
node demo/tests/browser.cjs
```

Playwright 1.55.1 may not recognize newer Linux distributions. If Chromium is already installed, set `CHROMIUM_PATH` to its executable before running the browser script. On this Ubuntu 26.04 host the tests used an existing Chrome for Testing 156 executable via that variable, rather than changing project dependencies. Screenshots and the exact browser results are in [demo/qa](demo/qa).

### Troubleshooting and limitations

- `Cannot find module` means dependencies are missing. Run both `npm ci --ignore-scripts` commands, including development dependencies. The demo uses pg-mem and ts-node from the dashboard install.
- A missing `scraper/dist/api/job.js` means the build has not run. Use `npm --prefix scraper run build` from the root. The build is scoped to `src` so test files cannot shift its output directory.
- The launcher enables Node's OpenSSL legacy provider in its child because the original NTLM client uses legacy crypto. This affects only the demo child, not your shell or production configuration.
- `EADDRINUSE` means another process owns a chosen port. Do not stop unrelated services; choose free ports.
- This verifies the actual application and scraper against pg-mem and the fictional ERP subset, not a live PostgreSQL or Microsoft Dynamics deployment. SQL behavior, NTLM authentication, concurrency, timezone handling and deployment operation need separate live integration validation.
- Legacy dependency audit warnings remain. Do not run a broad `npm audit fix --force` to reproduce this demo.
- Production startup and configuration are unchanged by this demo. Do not reuse the role picker, in-memory database, mock, passwords or permissive mock handshake for production. Configure and review any real deployment separately.