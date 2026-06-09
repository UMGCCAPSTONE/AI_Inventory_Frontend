<div align="center">

# 🍽️ AI Inventory — Frontend

**Smart inventory for restaurants — track ingredients, cut food waste, and get AI-assisted menu specials.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A5%2022-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](./LICENSE)

[Architecture (`CLAUDE.md`)](./CLAUDE.md) · [Decisions (ADRs)](./docs/adr/) · [Mock data & UI states](#-mock-data--ui-states) · [Project Board](https://github.com/orgs/UMGCCAPSTONE/projects/1)

</div>

---

The **frontend** for the AI/LLM Inventory Management System: authentication, the dashboard, inventory and supplier management, menu-recommendation screens, reporting, and API integration. Built with React + TypeScript + Vite. Part of a multi-repo project bridged by the shared [`@umgccapstone/contracts`](https://github.com/orgs/UMGCCAPSTONE/packages) package.

## ✨ Highlights

- 🥬 **Inventory & dashboard UI** — at-risk value, low-stock and expiring-soon alerts, supplier and reporting screens
- 🤖 **AI menu specials** — recommendation screens fed by the backend's Bedrock engine
- 🔒 **Firebase auth** — Google Sign-In; the ID token rides along on every API call (see [shared ADR 0003](./docs/adr/shared/0003-firebase-bearer-auth.md))
- 🎭 **Mock-first data layer** — every screen reads a typed hook seam that renders four UI states; mock fixtures keep the UI populated until the API lands
- 🧱 **Typed end-to-end** — shared Zod schemas + types via the contracts package (no client-side recompute of business math, [shared ADR 0004](./docs/adr/shared/0004-server-computed-derived-fields.md))
- 📐 **Decisions captured** — frontend + cross-repo Architecture Decision Records in [`docs/adr/`](./docs/adr/)

## 📋 Prerequisites

- **Node ≥ 22** and **npm** (bundled with Node)
- **Git**

```powershell
node --version
npm --version
git --version
```

## 🚀 Setup

```powershell
npm install
```

> `npm install` at the repo root installs the app in `client/` (the root `package.json` only hosts ADR tooling). You can also work from inside `client/` directly.

Then create your env file from the template (fill in the values afterward):

- **macOS / Linux:** `cp client/.env.example client/.env`
- **Windows (PowerShell):** `Copy-Item client/.env.example client/.env`

## ▶️ Run

```powershell
npm run dev      # Vite dev server with hot reload → http://localhost:5173
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (hot reload) at **http://localhost:5173** |
| `npm run build` | Type-check + production build to `client/dist` |
| `npm run preview` | Serve the production build locally |

If port 5173 is taken: `npm run dev -- --port 5174`.

## 🎭 Mock data & UI states

Components hold **no hardcoded data**. Each data-driven screen reads a typed hook seam that returns one of four UI states — **loading · error · empty · success** (see [ADR 0005](./docs/adr/0005-ui-states.md)):

- `client/src/hooks/useDashboardSummary.ts`
- `client/src/hooks/useTodayDashboard.ts`
- `client/src/hooks/useSession.ts`

Until the API is wired, these hooks serve **mock fixtures** from `client/src/mocks/`. The `VITE_ENABLE_MOCKS` flag controls this — **dev-only by default** (on with `npm run dev`, off in the production build). Set it `false` to exercise the empty states, `true` to force mocks on.

When the backend lands, replace each hook's resolver with a call through the shared data layer (T-34); call sites and the four-state rendering don't change. Domain types come from the `@umgccapstone/contracts` seam (`client/src/types/contracts/`, see [ADR 0006](./docs/adr/0006-frontend-first-contracts.md)).

## 🧪 Tests

No test runner is wired yet — CI uses a safe placeholder until a framework is approved (per [CLAUDE.md](./CLAUDE.md), no new testing framework without team sign-off). Until then, the production build (`npm run build`, incl. `tsc -b`) is the gate before opening a PR.

## 🛠️ Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Run the app with hot reload |
| `npm run build` | Type-check and build to `client/dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run adr:sync` | Sync shared ADRs from the contracts package |
| `npm run adr:check` | CI drift check for shared ADRs |

## 🗂️ Project structure

```text
client/
  src/
    components/       UI components (DashboardHeader, TodayDashboard, states/)
    hooks/            Typed data seams (useAsyncResource + per-screen hooks)
    mocks/            Mock fixtures (served behind VITE_ENABLE_MOCKS)
    services/         API config (config.ts)
    types/contracts/  Local stub for @umgccapstone/contracts (until published)
    App.tsx           App shell
  .env.example        VITE_ENABLE_MOCKS and friends
  vite.config.ts
docs/adr/             Architecture Decision Records (MADR); shared/ is synced
scripts/adr-sync.mjs  Shared-ADR sync + drift check (zero-dep)
```

## 📐 Conventions

- **UI states** — every data-driven screen handles loading · error · empty · success ([ADR 0005](./docs/adr/0005-ui-states.md)).
- **State** — TanStack Query for server state + React Context for app state; no Redux ([ADR 0002](./docs/adr/0002-state-management.md)).
- **Forms** — React Hook Form + Zod, with Zod schemas single-sourced from the contracts package ([ADR 0003](./docs/adr/0003-forms-and-validation.md), [shared ADR 0005](./docs/adr/shared/0005-single-sourced-enums-zod.md)).
- **API** — REST under `/api`; success `{ data, meta? }`, error `{ error: { code, message, field? } }`; the data layer unwraps `data` and normalizes errors centrally ([shared ADR 0002](./docs/adr/shared/0002-api-conventions-envelope-verbs.md)).
- **Branches** — `feature/T_X_<short-name>` off `main`; PRs only, no direct commits.

## 🧭 Tech stack

React · TypeScript · Vite · MUI + MUI X DataGrid · TanStack Query · React Hook Form + Zod · Firebase Auth · `@umgccapstone/contracts` (Zod + shared types). UI libraries land with their feature tickets; the choices are recorded in [`docs/adr/`](./docs/adr/).

<div align="center">
<sub>UMGC 495 Capstone · Summer 2026 · See <a href="./CLAUDE.md">CLAUDE.md</a> for architecture and <a href="./docs/adr/">docs/adr/</a> for decisions.</sub>
</div>
