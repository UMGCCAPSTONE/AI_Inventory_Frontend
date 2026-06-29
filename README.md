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

The **frontend** for the AI/LLM Inventory Management System: sign-in, the dashboard, inventory and menu screens, and reporting. It talks to the [backend](https://github.com/UMGCCAPSTONE/AI_Inventory_Backend) over REST and shares types through the [`@umgccapstone/contracts`](#-shared-contracts) package.

---

## 📑 Contents

1. [What you get](#-what-you-get)
2. [Before you start](#-before-you-start)
3. [A note on the commands in this guide](#-a-note-on-the-commands-in-this-guide)
4. [Get it running (5 steps)](#-get-it-running-5-steps)
5. [The one thing that trips people up: GitHub Packages auth](#-the-one-thing-that-trips-people-up-github-packages-auth)
6. [Everyday commands](#-everyday-commands)
7. [Running in Docker](#-running-in-docker)
8. [Tests](#-tests)
9. [How the code is organized](#-how-the-code-is-organized)
10. [How data flows](#-how-data-flows)
11. [Conventions & ground rules](#-conventions--ground-rules)
12. [Reference](#-reference)

---

## ✨ What you get

- ⚛️ **React 19 + Vite** — a fast dev server with hot reload, typed end-to-end.
- 🔌 **Typed data layer** — every screen talks to the backend through one shared client and always shows a loading, empty, error, or success state.
- 🔒 **Firebase auth** — optional. The app runs without it; you just won't be signed in.
- 🐳 **Container-ready** — a single image serves the built app and forwards `/api` to the backend, so there's no CORS to fight in production.

---

## 📋 Before you start

You need these installed:

| Tool | Version | Notes |
| ---- | ------- | ----- |
| **Node.js** | ≥ 22 | Includes `npm`. Check with `node --version`. |
| **Git** | any recent | |
| **GitHub CLI (`gh`)** | any recent | Easiest way to get the package token in Step 2. [Install](https://cli.github.com/) |
| **Docker** | *optional* | Only for the [container path](#-running-in-docker). Desktop ≥ 4.19 / Engine ≥ 23. |

You'll also want the **[backend](https://github.com/UMGCCAPSTONE/AI_Inventory_Backend) running on `http://localhost:3000`**. The frontend works without it, but data screens will sit on their empty state — that's expected, not a bug.

---

## 💻 A note on the commands in this guide

A few commands differ by operating system. Where they do, you'll see both versions — run the one for your machine. Commands shown without a label work the same everywhere.

| Your machine | Shell | Label |
| ------------ | ----- | ----- |
| **macOS / Linux** | Terminal (bash or zsh) | 🟦 **macOS / Linux** |
| **Windows** | **PowerShell** | 🟪 **Windows (PowerShell)** |

> **On Windows, use PowerShell** (not the old Command Prompt) — open it from the Start menu, or pick *PowerShell* in the VS Code terminal dropdown.

---

## 🚀 Get it running (5 steps)

> Pressed for time? This is the whole happy path. Each step is explained in more detail in the sections that follow.

### Step 1 — Clone and enter the app folder

The React app lives in the **`client/`** subfolder.

```bash
git clone https://github.com/UMGCCAPSTONE/AI_Inventory_Frontend.git
cd AI_Inventory_Frontend/client
```

### Step 2 — Get a GitHub Packages token (first time only)

This project uses a private package, so `npm install` needs a token **before** it will work. Skip this and you'll get a `401 Unauthorized` that looks like a network error but isn't. Full explanation [below](#-the-one-thing-that-trips-people-up-github-packages-auth).

🟦 **macOS / Linux**
```bash
gh auth refresh -s read:packages
npm config set //npm.pkg.github.com/:_authToken="$(gh auth token)"
```

🟪 **Windows (PowerShell)**
```powershell
gh auth refresh -s read:packages
npm config set //npm.pkg.github.com/:_authToken=(gh auth token)
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Create your local env file

🟦 **macOS / Linux**
```bash
cp .env.example .env.local
```

🟪 **Windows (PowerShell)**
```powershell
Copy-Item .env.example .env.local
```

### Step 5 — Start the dev server

```bash
npm run dev
```

Open the URL it prints — usually **http://localhost:5173**. 🎉

> **Is the backend connected?** In dev, the app checks the backend on startup and logs the result to the **browser console** (F12 → Console):
> ```text
> [backend] Connected to backend — http://localhost:3000/health returned 200.
> ```
> A warning there means the backend isn't running or CORS is blocking it — the screens still load, they just show empty data.

---

## 🔑 The one thing that trips people up: GitHub Packages auth

The app depends on the **private** `@umgccapstone/contracts` package (shared types and validation). npm can't download it without a GitHub token that has the **`read:packages`** permission. **Without the token, `npm install` fails with `401 Unauthorized`** — and the error looks like a git or network problem, so it's easy to misread.

You only have to do this **once per machine**. Pick whichever option fits your setup.

### Option A — Use the GitHub CLI (recommended)

If you have `gh` installed and you're logged in:

🟦 **macOS / Linux**
```bash
gh auth refresh -s read:packages
npm config set //npm.pkg.github.com/:_authToken="$(gh auth token)"
```

🟪 **Windows (PowerShell)**
```powershell
gh auth refresh -s read:packages
npm config set //npm.pkg.github.com/:_authToken=(gh auth token)
```

### Option B — Paste the token manually

Works anywhere, including if you don't use `gh`. First print the token:

```bash
gh auth token
```

Copy the value it prints, then paste it into this command in place of `PASTE_TOKEN_HERE`:

```bash
npm config set //npm.pkg.github.com/:_authToken=PASTE_TOKEN_HERE
```

> No `gh` at all? Create a **Personal Access Token (classic)** at [github.com/settings/tokens](https://github.com/settings/tokens) with the **`read:packages`** scope and use that value instead.

Once the token is set, `npm install` works normally and you won't need to repeat this.

---

## ▶️ Everyday commands

After the one-time setup, day-to-day work is just:

```bash
npm run dev      # start the dev server with hot reload → http://localhost:5173
```

> **Heads up — where to run commands.** Most commands run from inside `client/`. As a convenience, a few common ones (`dev`, `build`, `lint`, `test`, `test:run`) also work from the **repo root** — a thin wrapper forwards them into `client/`. The 🛠️ [Scripts table](#scripts) marks which ones.

See the full [Scripts table](#scripts) for everything else (`build`, `lint`, `preview`, coverage, …).

---

## 🐳 Running in Docker

You only need this for the container/deploy path — local development doesn't require Docker. The image is multi-stage: a `dev` stage (Vite + hot reload) and a `prod` stage where **nginx serves the built app and forwards `/api/` to the backend**, so the browser sees a single origin and there's no CORS. This is the same image used for the production deploy.

> **Important:** run these from the **repo root** (the folder with the `Dockerfile`), **not** from `client/`. And keep the trailing `.` at the end of the build command — it's the build context, not a typo.

### Step 1 — Provide the package token to the build

Same idea as [Step 2 above](#step-2--get-a-github-packages-token-first-time-only), but here the token is passed to Docker as a build secret (so it never gets baked into the image). Put it in an environment variable:

🟦 **macOS / Linux**
```bash
export GH_PKG_TOKEN="$(gh auth token)"
```

🟪 **Windows (PowerShell)**
```powershell
$env:GH_PKG_TOKEN = (gh auth token)
```

### Step 2 — Build the image

> ⚠️ **Use the version for your shell.** The macOS/Linux form uses `\` line-breaks and a `DOCKER_BUILDKIT=1` prefix that don't work in PowerShell — copy the PowerShell form below instead.

🟦 **macOS / Linux**
```bash
DOCKER_BUILDKIT=1 docker build --target prod -t ai_inventory_frontend \
  --secret id=gh_token,env=GH_PKG_TOKEN \
  --build-arg VITE_API_BASE_URL=/api .
```

🟪 **Windows (PowerShell)** — all on one line (simplest, no continuation characters):
```powershell
$env:DOCKER_BUILDKIT = 1
docker build --target prod -t ai_inventory_frontend --secret id=gh_token,env=GH_PKG_TOKEN --build-arg VITE_API_BASE_URL=/api .
```

> Prefer multi-line in PowerShell? The continuation character is a **backtick** (`` ` ``), not a backslash:
> ```powershell
> docker build --target prod -t ai_inventory_frontend `
>   --secret id=gh_token,env=GH_PKG_TOKEN `
>   --build-arg VITE_API_BASE_URL=/api .
> ```

> Modern Docker Desktop already uses BuildKit, so `DOCKER_BUILDKIT=1` / `$env:DOCKER_BUILDKIT = 1` is usually optional — it's shown for older setups and does no harm.

### Step 3 — Run the container

```bash
docker run --rm -p 8080:80 ai_inventory_frontend     # → http://localhost:8080 (app only)
```

### Notes

> **Want the whole stack** (frontend + backend + Postgres)? That runs from the **backend repo's** `docker-compose.yml` — see its README. This section builds just the frontend image on its own.

> **Why `VITE_API_BASE_URL=/api`?** The build bakes in a *relative* API path; at runtime nginx forwards `/api/...` to the backend (default `http://backend:3000`). That's what lets the container serve the app even when the backend is down.

> **Test the API proxy locally** by attaching to the backend's compose network so nginx can find the `backend` service:
> ```bash
> docker run --rm --network ai_inventory_backend_default -p 8080:80 ai_inventory_frontend
> ```
> For a backend running on your host instead, override the upstream: add `-e BACKEND_ORIGIN=http://host.docker.internal:3000`.

---

## 🧪 Tests

```bash
npm run test           # watch mode (re-runs as you edit)
npm run test:run       # one pass — this is what CI runs
npm run test:coverage  # one pass + coverage report (HTML in client/coverage/)
```

Vitest + React Testing Library, running in a jsdom browser-like environment. Test files live next to the code they cover — `DashboardHeader.tsx` → `DashboardHeader.test.tsx`. `describe`, `it`, and `expect` are available globally (no imports needed).

---

## 🗂️ How the code is organized

```text
Dockerfile              Multi-stage build (dev + nginx prod)
nginx.conf.template     Serves the app + reverse-proxies /api
package.json            Root wrapper — forwards a few scripts into client/
client/
  src/
    components/         Reusable UI (e.g. DashboardHeader, TodayDashboard)
    hooks/              TanStack Query hooks (one per screen)
    services/           apiClient, config, query keys, fetch functions, health probe
    types/              Shared TypeScript types + API response shapes
    styles/             MUI theme
  vite.config.ts        Vite + Vitest config
docs/adr/               Architecture Decision Records (MADR)
```

---

## 🔌 How data flows

Screens never call `fetch` directly and never use mock data. Everything goes through one typed path:

1. **A screen calls a hook** — typed TanStack Query hooks in `client/src/hooks`, one per screen.
2. **The hook calls a fetch function** in `client/src/services`. *(These currently return empty data; feature tickets fill in the real calls.)*
3. **The fetch function uses `apiClient`** (`services/apiClient.ts`) — the **only** place API `fetch` happens. It attaches the Firebase token and unwraps the `{ data }` / `{ error }` envelope into a typed result or a thrown `ApiError`.
4. **Every screen renders four states**: loading, empty, error, success (see [ADR 0005](./docs/adr/)).

> **Query keys** are declared once in `services/queryKeys.ts` ([ADR 0004](./docs/adr/)) — don't inline your own. Types live in `client/src/types`; the response envelope is in `types/api.ts`.

---

## 📐 Conventions & ground rules

- **Components** — functional, PascalCase, one job each. Business logic belongs in hooks/services/utils, not in the component.
- **API URLs** — never hardcode them. Read `appConfig.apiBaseUrl` (from `VITE_API_BASE_URL`).
- **Branches** — `feature/T_X_<short-name>` branched off `dev`. Open PRs **into `dev` only** — never `main` (that's production), and no direct commits.
- **Before you open a PR** — run `npm run build` and `npm run test:run` and make sure both pass.

---

## 📚 Reference

<a id="scripts"></a>

### 🛠️ Scripts

Run from `client/`. The ✓ ones also work from the repo root via the wrapper.

| Script | What it does | Repo-root wrapper |
| ------ | ------------ | :---: |
| `npm run dev` | Dev server with hot reload | ✓ |
| `npm run build` | Type-check + production build to `dist/` | ✓ |
| `npm run preview` | Serve the production build locally | |
| `npm run lint` | ESLint | ✓ |
| `npm run test` | Vitest (watch) | ✓ |
| `npm run test:run` | Vitest (single pass — CI) | ✓ |
| `npm run test:coverage` | Vitest single pass + coverage report | |
| `npm run adr:sync` | Sync shared ADRs from the contracts package | |

### 🧭 Tech stack

React · TypeScript · Vite · MUI · TanStack Query · Firebase Auth · Vitest + React Testing Library · ESLint

### 🤝 Shared contracts

The frontend consumes **`@umgccapstone/contracts`** (shared types, Zod schemas, enums) from GitHub Packages. The registry mapping is committed in `client/.npmrc`; the per-developer token is the [`read:packages` auth above](#-the-one-thing-that-trips-people-up-github-packages-auth). After the package version is bumped, run `npm run adr:sync` to refresh the synced shared ADR copies in `docs/adr/shared/` (CI fails if they drift — never edit those by hand).

### 🔁 Cross-origin (CORS), explained once

- **Native dev** runs Vite on `:5173` and calls the backend on `:3000` — a *cross-origin* call. The browser blocks it unless the backend sets `CORS_ORIGIN=http://localhost:5173` (already in the backend's `.env.example`). That's why `VITE_API_BASE_URL` points at `http://localhost:3000/api` in dev.
- **The Docker path** sidesteps CORS entirely: nginx serves the app and proxies `/api` from the *same* origin.

### ⚙️ CI/CD

GitHub Actions runs on pull requests to `dev`/`main` and on pushes to those branches: checkout → Node 22 → `npm ci` → `npm run lint` → `npm run test:run` → `npm run build`. Deploy jobs run only after validation passes and are placeholders until hosting is confirmed. Never commit credentials or environment-specific secrets — store them in Actions secrets.

### 📖 ADRs

Frontend decisions live in [`docs/adr/`](./docs/adr/) (MADR format). `docs/adr/shared/` holds synced copies of cross-repo ADRs that ship inside `@umgccapstone/contracts`.

---

## 👥 Team

| Member | Role |
| ------ | ---- |
| [Dan Nunes](https://github.com/dnunes01) | Project Manager |
| Robert Lee | Assistant Project Manager |
| Adan Medina | Product Owner |
| Spencer Renfro | Frontend Lead |
| Arth Thakkar | AI / Cloud Lead |
| [Jose Escandor](https://github.com/calcucool) | Backend Lead |

<div align="center">
<sub>UMGC 495 Capstone · Summer 2026 · See <a href="./CLAUDE.md">CLAUDE.md</a> for architecture and <a href="./docs/adr/">docs/adr/</a> for decisions.</sub>
</div>
