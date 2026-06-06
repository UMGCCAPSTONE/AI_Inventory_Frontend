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

## API Data Placeholders

The current UI uses placeholder data so the dashboard can be built before the backend is connected.

Placeholder data lives in:

- `client/src/components/DashboardHeader.tsx`
- `client/src/components/TodayDashboard.tsx`

Both components accept optional `data` props. When API integration is added, fetch the backend data in a parent component or state layer, then pass it into these components.

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
