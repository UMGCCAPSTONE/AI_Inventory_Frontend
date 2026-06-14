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

Configure environment variables:

```powershell
Copy-Item .env.example .env.local
```

For native local dev the frontend (`:5173`) calls the backend (`:3000`)
**cross-origin**, so `.env.example` points `VITE_API_BASE_URL` at
`http://localhost:3000/api`. For the browser to allow that call, the backend
must set `CORS_ORIGIN=http://localhost:5173` (already in the backend's
`.env.example`). The containerized image takes a different path — nginx proxies
`/api` same-origin, so no CORS; see [Docker (T-23A)](#docker-t-23a) below.

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

The repo ships a multi-stage `Dockerfile` so the frontend runs in a container for local dev and is deploy-ready for the T-23 EC2 compose.

**Requires Docker Engine 23.0 or newer (or a current Docker Desktop, 4.19+).** The `# syntax=docker/dockerfile:1` directive and the `docker buildx build` commands below rely on **BuildKit/buildx**, which is the default builder from Engine 23.0 on; on older engines you must opt in with `DOCKER_BUILDKIT=1` and install the buildx plugin. Check your versions:

```powershell
docker --version
docker buildx version
```

The image has two stages:

- **`dev` stage** — runs the Vite dev server with hot reload (used by the frontend's own dev compose).
- **`prod` stage** — builds the static bundle and serves it with nginx. nginx also **reverse-proxies `/api/` to the backend**, so the browser talks to a single origin — **no CORS** — whenever the app is served from this image (locally or on the single-host EC2 deploy). This is the image the T-23 deploy compose reuses. (Native `npm run dev` does not use nginx and *does* need CORS — see [Setup](#setup).)

Because of the proxy, build with a **relative** API base (`VITE_API_BASE_URL=/api`); nginx forwards `/api/...` to `BACKEND_ORIGIN` (an env var, default `http://backend:3000` for the compose network). `proxy_pass` uses a variable + resolver, so the container starts and serves the SPA even when the backend isn't running.

**Run these from the repo root** (the folder that contains the `Dockerfile`) — *not* from `client/` — and keep the trailing `.` (it's the build context; omitting it prints a `docker buildx build` usage error):

```powershell
cd C:\path\to\AI_Inventory_Frontend
docker build --target prod -t ai_inventory_frontend --build-arg VITE_API_BASE_URL=/api .
docker run --rm -p 8080:80 ai_inventory_frontend   # http://localhost:8080 (SPA only)
```

To exercise the API proxy locally, run on the backend's compose network (after `npm run dev:up` in the backend repo) so nginx can resolve the `backend` service:

```powershell
docker run --rm --network ai_inventory_backend_default -p 8080:80 ai_inventory_frontend
# calls to http://localhost:8080/api/... proxy to the backend container
```

For a backend running on the host instead of that network, override the upstream: `-e BACKEND_ORIGIN=http://host.docker.internal:3000`.

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
