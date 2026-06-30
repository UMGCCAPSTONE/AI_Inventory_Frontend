# Architecture Decision Records

Decisions for the AI/LLM Inventory Management frontend, in [MADR](https://adr.github.io/madr/) format.

- **Frontend-local ADRs** live here (`docs/adr/`).
- **Shared / cross-repo ADRs** live under [`shared/`](./shared/) — authored in the backend repo, they ship inside the `@umgccapstone/contracts` package under `/adr/shared/` and sync into this repo via `npm run adr:sync` (run from `client/`). Never hand-edit the synced copies.

## Frontend-local

| # | Decision | Status |
|---|----------|--------|
| [0001](./0001-mui-and-mui-x-datagrid.md) | UI components via MUI with MUI X DataGrid for tables | Accepted |
| [0002](./0002-tanstack-query-context-no-redux.md) | TanStack Query for server state, React Context for app state — no Redux | Accepted |
| [0003](./0003-react-hook-form-zod-shared-schemas.md) | Forms via React Hook Form + Zod, consuming the shared contract schemas | Accepted |
| [0004](./0004-query-key-registry-invalidation-map.md) | Client data layer: query-key registry + write→invalidate map (T-34) | Accepted |
| [0005](./0005-four-required-ui-states.md) | Every data-driven view renders four required UI states | Accepted |
| [0006](./0006-frontend-first-contract-authorship.md) | Frontend-first contract authorship | Accepted |
| [0007](./0007-dashboard-page-wrapper.md) | DashboardPage wrapper component owns dashboard layout | Accepted (composition superseded by 0009) |
| [0008](./0008-recommendation-preview-two-query-split.md) | Recommendation preview: two-query split for content and availability | Accepted |
| [0009](./0009-dashboard-retires-unwired-today-panel.md) | Dashboard retires the unwired TodayDashboard panel | Accepted |

## Shared / cross-repo → [`shared/`](./shared/)

| # | Decision | Status |
|---|----------|--------|
| [0001](./shared/0001-two-repo-contract-package.md) | Two repositories bridged by a versioned contract package | Accepted |
| [0002](./shared/0002-api-conventions-envelope-verbs.md) | REST conventions: response envelopes and verb semantics | Accepted |
| [0003](./shared/0003-firebase-bearer-auth.md) | Authentication via Firebase ID tokens (Bearer) | Accepted |
| [0004](./shared/0004-server-computed-derived-fields.md) | Derived/metric fields are computed server-side only | Accepted |
| [0005](./shared/0005-single-sourced-enums-zod.md) | Single-sourced enums and Zod schemas in the contract package | Accepted |
