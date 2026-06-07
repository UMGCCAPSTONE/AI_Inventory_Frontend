# AI Inventory Frontend

Frontend for the Mise smart kitchen inventory dashboard. The app is built with React, TypeScript, and Vite.

## Prerequisites

Install these before running the project:

- Node.js 22 or newer
- npm, included with Node.js
- Git

Check your versions:

```powershell
node --version
npm --version
git --version
```

## Project Structure

```text
AI_Inventory_Frontend/
  client/
    src/
      components/
        DashboardHeader.tsx
        TodayDashboard.tsx
      App.tsx
      App.css
      index.css
    package.json
    vite.config.ts
  README.md
```

Most frontend work happens inside `client/src`.

## Setup

Clone the repository:

```powershell
git clone <repo-url>
cd AI_Inventory_Frontend
```

Install dependencies:

```powershell
cd client
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the local URL printed by Vite. It is usually:

```text
http://localhost:5173/
```

## Common Commands

> You can run these from the **repo root** (`npm run dev`, `build`, `lint`, `preview`) — the
> root `package.json` delegates to `client/` — or from inside `client/` directly. The root
> also hosts `npm run adr:sync` / `adr:check` (see Architecture Decision Records below).

Run the app locally:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
```

Preview the production build:

```powershell
npm run preview
```

Run lint checks:

```powershell
npm run lint
```

## Data layer & mock fixtures

Components hold no hardcoded data. Each data-driven screen reads from a typed hook seam that
returns one of four UI states — loading, error, empty, or success (see
[`docs/adr/0005-ui-states.md`](docs/adr/0005-ui-states.md)):

- `client/src/hooks/useDashboardSummary.ts`
- `client/src/hooks/useTodayDashboard.ts`
- `client/src/hooks/useSession.ts`

Until the backend API is wired, these hooks serve **mock fixtures** from `client/src/mocks/`
so the UI stays populated for testing. A flag controls this:

- `VITE_ENABLE_MOCKS` — defaults to **dev-only** (on with `npm run dev`, off in the production
  build). Set `VITE_ENABLE_MOCKS=false` to run the app against empty data and exercise the
  empty states; set `true` to force mocks on.

When the backend lands, replace each hook's resolver body with a call through the shared data
layer (T-34); call sites and the four-state rendering do not change. Domain types come from the
`@umgccapstone/contracts` seam (`client/src/types/contracts/`, see
[`docs/adr/0006-frontend-first-contracts.md`](docs/adr/0006-frontend-first-contracts.md)).

## Architecture Decision Records

Frontend ADRs (MADR format) live in [`docs/adr/`](docs/adr/) — start with the
[index](docs/adr/README.md). Cross-repo ADRs are mirrored into `docs/adr/shared/` by
`npm run adr:sync` (run from the repo root) and verified in CI with `npm run adr:check`.

## Troubleshooting

If dependencies fail to install, make sure you are inside the `client` folder before running `npm install`.

If the dev server port is already in use, run:

```powershell
npm run dev -- --port 5174
```

If the page does not update after code changes, stop the server with `Ctrl+C` and restart it with `npm run dev`.

If TypeScript or Vite reports missing packages, reinstall dependencies:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## Notes for Contributors

- Keep reusable UI in `client/src/components`.
- Keep placeholder API-shaped data typed so backend integration is simpler later.
- Run `npm run build` before opening a pull request.

## CI/CD

GitHub Actions runs the frontend CI/CD workflow on pull requests targeting `dev` or `main`, and on pushes to `dev` or `main`.

The validation job checks out the repository, sets up Node.js 22, installs dependencies with `npm ci`, runs `npm run lint`, uses a safe placeholder because no test script is configured yet, and validates the production build with `npm run build`.

Deployments are placeholders until hosting details are confirmed. The `deploy-dev` job runs only after successful validation on pushes to `dev`, and the `deploy-prod` job runs only after successful validation on pushes to `main`.

Do not commit deployment credentials, API keys, or environment-specific secrets. Store required deployment values in GitHub Actions secrets.
