<div align="center">

# 🍽️ AI Inventory — Frontend

**The dashboard for the Mise smart kitchen — track inventory, surface alerts, and review AI menu specials.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A5%2022-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MUI](https://img.shields.io/badge/MUI-9-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](./LICENSE)

[Architecture (`CLAUDE.md`)](./CLAUDE.md) · [Decisions (ADRs)](./docs/adr/) · [Backend repo](https://github.com/UMGCCAPSTONE/AI_Inventory_Backend) · [Project Board](https://github.com/orgs/UMGCCAPSTONE/projects/1)

</div>

---

The **frontend** for the AI/LLM Inventory Management System: authentication, the dashboard, inventory and menu screens, and reporting. It talks to the [backend](https://github.com/UMGCCAPSTONE/AI_Inventory_Backend) over REST and shares types through the [`@umgccapstone/contracts`](#-shared-contracts) package.

## ✨ Highlights

- ⚛️ **React 19 + Vite** — fast dev server with hot reload, typed end-to-end
- 🔌 **Typed data layer** — TanStack Query hooks over a single `apiClient`; every screen renders loading / empty / error / success
- 🔒 **Firebase auth** — optional; the app runs unauthenticated when unconfigured
- 🐳 **Container-ready** — multi-stage image; nginx serves the SPA and proxies `/api` same-origin (no CORS) for the T-23 deploy

## 📋 Prerequisites

- **Node ≥ 22** and npm
- **Git**
- **Docker** (optional) — Engine ≥ 23 / Desktop ≥ 4.19, only needed for the [container path](#-docker-t-23a)

## 🚀 Setup

The app lives in [`client/`](./client).

**First-time only — GitHub Packages auth.** `client/` depends on the private `@umgccapstone/contracts` package, so `npm install` needs a GitHub token with the **`read:packages`** scope. Without it you'll get a `401 Unauthorized` on install — it looks like a git/network error, but it's auth. Set it up once:

```bash
# simplest — reuse your existing gh login:
gh auth refresh -s read:packages
npm config set //npm.pkg.github.com/:_authToken="$(gh auth token)"

# …or use a Personal Access Token (classic) with the read:packages scope:
# npm config set //npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

Then install:

```bash
cd client
npm install
```

Create your env file from the template:

- **macOS / Linux:** `cp .env.example .env.local`
- **Windows (Command Prompt):** `copy .env.example .env.local`

> **Cross-origin dev (CORS):** native dev runs the Vite server on `:5173` and calls the backend on `:3000` **cross-origin**, so `.env.example` points `VITE_API_BASE_URL` at `http://localhost:3000/api`. The browser blocks that unless the backend sets `CORS_ORIGIN=http://localhost:5173` (already in the backend's `.env.example`). The [container path](#-docker-t-23a) avoids CORS entirely — nginx proxies `/api` same-origin.

## ▶️ Run

```bash
npm run dev      # Vite dev server with hot reload → http://localhost:5173
```

Open the URL Vite prints (usually `http://localhost:5173/`).

> **Is the backend connected?** On startup (dev only) the app probes the backend and logs the result to the **browser console**:
> ```text
> [backend] Connected to backend — http://localhost:3000/health returned 200.
> ```
> A warning or error there means the backend isn't running or CORS is blocking it. Data screens render their **empty state** until feature tickets wire the service functions to real endpoints (see [Data layer](#-data-layer)).

> All scripts can also be run from the repo root via a thin wrapper (`npm run dev`, `build`, `lint`, `test`, `test:run`) — it proxies into `client/`.

## 🐳 Docker (T-23A)

A multi-stage `Dockerfile` runs the frontend in a container — `dev` (Vite + hot reload) and `prod` (static bundle served by nginx). The **prod** image reverse-proxies `/api/` to the backend, so the browser sees a **single origin — no CORS**. This is the image the T-23 deploy compose reuses.

**Run from the repo root** (where the `Dockerfile` is — *not* `client/`), and keep the trailing `.`:

```bash
# The build fetches the private @umgccapstone/contracts, so pass a read:packages
# token as a BuildKit secret (never baked into the image):
export GH_PKG_TOKEN="$(gh auth token)"     # or a PAT with read:packages
#   Windows PowerShell:  $env:GH_PKG_TOKEN = (gh auth token)

DOCKER_BUILDKIT=1 docker build --target prod -t ai_inventory_frontend \
  --secret id=gh_token,env=GH_PKG_TOKEN \
  --build-arg VITE_API_BASE_URL=/api .
docker run --rm -p 8080:80 ai_inventory_frontend          # → http://localhost:8080 (SPA only)
```

> **Full stack?** The whole app (frontend + backend + Postgres) runs from the **backend repo's** `docker-compose.yml` (T-23) — see its README. This section builds/runs just the frontend image.

> **Why `VITE_API_BASE_URL=/api`?** The build bakes in a **relative** base; at runtime nginx forwards `/api/...` to `BACKEND_ORIGIN` (default `http://backend:3000`). A variable + resolver means the container serves the SPA even when the backend is down.

> **Exercise the API proxy locally:** attach to the backend's compose network so nginx can resolve the `backend` service —
> ```bash
> docker run --rm --network ai_inventory_backend_default -p 8080:80 ai_inventory_frontend
> ```
> For a backend on the host instead, override the upstream: `-e BACKEND_ORIGIN=http://host.docker.internal:3000`.

## 🧪 Tests

```bash
npm run test           # watch mode (Vitest)
npm run test:run       # single run — what CI runs
npm run test:coverage  # single run + coverage report (HTML in client/coverage/)
```

Vitest + React Testing Library in a jsdom environment (configured in `client/vite.config.ts`; matchers loaded by `client/src/setupTests.ts`). Tests live next to the code as `*.test.tsx` — for example `DashboardHeader.tsx` → `DashboardHeader.test.tsx`. `describe`, `it`, and `expect` are global.

## 🛠️ Scripts

Run from `client/` (or from the repo root for the ✓ wrapped ones):

| Script | What it does | Root wrapper |
|--------|--------------|:---:|
| `npm run dev` | Vite dev server with hot reload | ✓ |
| `npm run build` | Type-check + production build to `dist/` | ✓ |
| `npm run preview` | Serve the production build locally | |
| `npm run lint` | ESLint | ✓ |
| `npm run test` | Vitest (watch) | ✓ |
| `npm run test:run` | Vitest (single run — CI) | ✓ |
| `npm run test:coverage` | Vitest single run + coverage report | |
| `npm run adr:sync` | Sync shared ADRs from the contracts package | |

## 🗂️ Project structure

```text
Dockerfile              Multi-stage build (dev + nginx prod)
nginx.conf.template     SPA serving + /api reverse proxy
package.json            Root wrapper — proxies scripts into client/
client/
  src/
    components/         Reusable UI (e.g. DashboardHeader, TodayDashboard)
    hooks/              TanStack Query hooks (one per screen seam)
    services/           apiClient, config, query keys, fetch functions, health probe
    types/              Shared TypeScript types + API envelope shapes
    styles/             MUI theme
  vite.config.ts        Vite + Vitest config
docs/adr/               Architecture Decision Records (MADR)
```

## 🔌 Data layer

Screens get data through typed TanStack Query hooks (the "hook seams" from ticket T-0) — there is **no hardcoded or mock data**.

- **Types** live in `client/src/types`; the `{ data, meta }` / `{ error }` envelope is in `types/api.ts`.
- **`apiClient`** (`services/apiClient.ts`) is the only place `fetch` is called for API data — it attaches the Firebase bearer token and unwraps the envelope into typed results or a thrown `ApiError`.
- **Fetch functions** (`services/`) currently resolve to **empty datasets**; feature tickets replace their bodies with real `apiClient` calls.
- **Query keys** are declared once in `services/queryKeys.ts` (see [ADR 0004](./docs/adr/)) — hooks must not inline their own.
- Every screen renders **four states**: loading, empty, error, success (see [ADR 0005](./docs/adr/)).

## 📐 Conventions

- **Components** — functional, PascalCase, one responsibility; business logic lives in hooks/services/utils.
- **API base** — never hardcode URLs; read `appConfig.apiBaseUrl` (`VITE_API_BASE_URL`).
- **Branches** — `feature/T_X_<short-name>` off `dev`; PRs into `dev` only (never `main` — `main` is production), no direct commits.
- **Before a PR** — run `npm run build` and `npm run test:run`.

## 🧭 Tech stack

React · TypeScript · Vite · MUI · TanStack Query · Firebase Auth · Vitest + React Testing Library · ESLint

## 📚 ADRs & shared contracts

Frontend decisions live in [`docs/adr/`](./docs/adr/) (MADR format). `docs/adr/shared/` holds synced copies of the cross-repo ADRs that ship inside `@umgccapstone/contracts` — never edit those by hand; after bumping the package, regenerate with `npm run adr:sync` (CI fails if they drift).

The frontend consumes **`@umgccapstone/contracts`** (shared types, Zod schemas, enums) from GitHub Packages; the scoped registry mapping is committed in `client/.npmrc`. Auth is per-developer — create a token with `read:packages` scope and store it locally:

```bash
npm config set //npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

> **Published & required.** `@umgccapstone/contracts` is published to GitHub Packages and pinned in `client/package.json`, so both `npm install` and CI's `npm ci` need the `read:packages` auth from [Setup](#-setup) — without it you get a `401`. After bumping the package version, run `npm run adr:sync` to regenerate the shared ADR copies.

## ⚙️ CI/CD

GitHub Actions runs on pull requests to `dev`/`main` and on pushes to those branches: checkout → Node 22 → `npm ci` → `npm run lint` → `npm run test:run` → `npm run build`. Deploy jobs (`deploy-dev`, `deploy-prod`) run only after successful validation and are placeholders until hosting is confirmed. Never commit credentials or environment-specific secrets — store them in Actions secrets.

## 👥 Team

| Member | Role |
|--------|------|
| [Dan Nunes](https://github.com/dnunes01) | Project Manager |
| Robert Lee | Assistant Project Manager |
| Adan Medina | Product Owner |
| Spencer Renfro | Frontend Lead |
| Arth Thakkar | AI / Cloud Lead |
| [Jose Escandor](https://github.com/calcucool) | Backend Lead |

<div align="center">
<sub>UMGC 495 Capstone · Summer 2026 · See <a href="./CLAUDE.md">CLAUDE.md</a> for architecture and <a href="./docs/adr/">docs/adr/</a> for decisions.</sub>
</div>
