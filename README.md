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
        DashboardHeader.test.tsx
        TodayDashboard.tsx
      App.tsx
      App.css
      index.css
      setupTests.ts
    package.json
    vite.config.ts
  package.json
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

Run tests in watch mode while developing:

```powershell
npm run test
```

Run the test suite once (what CI runs):

```powershell
npm run test:run
```

## Docker (T-23A)

The repo ships a multi-stage `Dockerfile` so the frontend runs in a container for local dev and is deploy-ready for the T-23 EC2 compose:

- **`dev` stage** — runs the Vite dev server with hot reload (used by the frontend's own dev compose).
- **`prod` stage** — builds the static bundle and serves it with nginx (SPA deep-link fallback via `nginx.conf`). This is the image the T-23 deploy compose reuses.

The app is a plain SPA: the browser calls the backend API directly, so the API base URL is inlined at build time via `VITE_API_BASE_URL`.

Build and run the production image locally:

```powershell
docker build --target prod -t ai_inventory_frontend --build-arg VITE_API_BASE_URL=http://localhost:3000 .
docker run --rm -p 8080:80 ai_inventory_frontend   # http://localhost:8080
```

## Testing

The test harness uses Vitest with React Testing Library and a jsdom environment. It is configured in the `test` block of `client/vite.config.ts`, and `client/src/setupTests.ts` loads the `@testing-library/jest-dom` matchers before each test file.

Test files live next to the code they test and use the `.test.tsx` (or `.test.ts`) suffix, for example:

```text
client/src/components/DashboardHeader.tsx
client/src/components/DashboardHeader.test.tsx
```

To add a test, create a `.test.tsx` file next to the component, render it with React Testing Library, and assert on what the user would see. `describe`, `it`, and `expect` are available globally.

CI runs `npm run test:run` on pull requests targeting `dev` or `main`, so failing tests fail the build.

## Data Layer

The app contains no hardcoded or mock data. Screens get data through typed TanStack Query hooks (the "hook seams" from ticket T-0):

- Shared types live in `client/src/types`.
- Fetch functions live in `client/src/services` and currently resolve to empty datasets — feature tickets replace their bodies with real API calls through `appConfig.apiBaseUrl` (`VITE_API_BASE_URL`).
- Query keys are declared once in `client/src/services/queryKeys.ts` (see ADR 0004). Hooks must not inline their own keys.
- Hooks live in `client/src/hooks` and every screen that consumes one renders four states: loading, empty, error, and success (see ADR 0005).

## Architecture Decision Records

Frontend decisions are documented in [`docs/adr/`](./docs/adr/) in MADR format — see the index there.

`docs/adr/shared/` holds synced copies of the cross-repo ADRs that ship inside the `@umgccapstone/contracts` package. Never edit those copies by hand; after bumping the package, regenerate them from `client/` with:

```powershell
npm run adr:sync
```

CI re-runs the sync and fails if the committed copies drift from the installed package.

## Shared Contracts Package

The frontend consumes `@umgccapstone/contracts` (shared types, Zod schemas, enums, and constants) from GitHub Packages. The scoped registry mapping is committed in `client/.npmrc`.

Authentication is per-developer and must not be committed. Create a GitHub personal access token with the `read:packages` scope, then store it in your user-level npm config:

```powershell
npm config set //npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

In CI, provide the token through `actions/setup-node`'s `registry-url` and a `NODE_AUTH_TOKEN` secret.

> **Status:** the package is published by the backend T-0 ticket. Until it is available, the dependency is not yet listed in `client/package.json` (so installs and builds keep working), and `npm run adr:sync` is a graceful no-op. Once published, add it pinned to an exact version: `npm install @umgccapstone/contracts@0.1.0 --save-exact`.

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
- Fetch data only through the typed hooks in `client/src/hooks`; do not hardcode data in components.
- Run `npm run build` and `npm run test:run` before opening a pull request.

## CI/CD

GitHub Actions runs the frontend CI/CD workflow on pull requests targeting `dev` or `main`, and on pushes to `dev` or `main`.

The validation job checks out the repository, sets up Node.js 22, installs dependencies with `npm ci`, runs `npm run lint`, runs the test suite with `npm run test:run`, and validates the production build with `npm run build`.

Deployments are placeholders until hosting details are confirmed. The `deploy-dev` job runs only after successful validation on pushes to `dev`, and the `deploy-prod` job runs only after successful validation on pushes to `main`.

Do not commit deployment credentials, API keys, or environment-specific secrets. Store required deployment values in GitHub Actions secrets.
