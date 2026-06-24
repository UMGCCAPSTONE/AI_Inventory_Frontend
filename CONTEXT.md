# Mise Frontend — Domain Glossary

## placeholder spec
A `describe.skip` / `it.todo` block that names a user-story behaviour without containing any assertions or render calls. The test body is written by the page ticket (T-6/T-7/T-8/T-9/T-10) when the component exists. The prose description is the durable artefact; it survives prop renames and interface changes.

## Dashboard Page
The single React component (`DashboardPage`) that owns the dashboard layout and composes `DashboardHeader`, `TodayDashboard`, and any sections added by T-6A/B/C. Introduced by T-6A. `App.tsx` renders `<DashboardPage />` rather than individual dashboard sub-components directly.

## coverage matrix
The file `docs/test-coverage-matrix.md` committed to the frontend repo. It is the **living reference** — updated as each page ticket un-skips its specs. Distinct from the **Test Plan deliverable**, which is submitted to github.com/UMGCCAPSTONE/CourseDeliverables. When a testing milestone is reached, copy the coverage summary from `npm run test:coverage` into the deliverable.

## server-computed fields
Derived values calculated exclusively by the backend and returned in API responses. The frontend renders them as-is and never recomputes from raw data. Canonical fields (from shared ADR 0004): `isLowStock`, `isExpiringSoon`, `atRiskValue`, `isAvailable`, `limitingIngredient`, and dashboard summary counts. Any spec that touches these fields must assert against the API field value, not a locally derived result.

## API path assertion
When a spec asserts that a user action fires an API call, it targets the string literal path (e.g. `'/inventory'`) passed to `apiClient.post/patch/delete`. No route-constant layer exists; the path string is the unit of assertion.

## inventory item
A tracked stock record in `@umgccapstone/contracts`: `name`, `category`, `quantity` + `unit`, `parLevel`, `expirationDate`, `unitCost`, and an optional `supplierId`. Items reference a supplier by **id only** — the supplier name and reorder cadence come from the Supplier API (T-14). An item is not a "SKU"; SKU count is the *number* of items.

## low stock
An item whose `quantity` is at or below its `parLevel`. Server-computed (`isLowStock`); rendered as a status, never recomputed. Avoid "out of stock" / "below par".

## expiring soon
An item that expires within **7 days** (already-expired counts). Server-computed (`isExpiringSoon`). The 7-day window is canonical — do not conflate with *urgent*.

## urgent
A display-only sub-tier of *expiring soon* — expires within ~48 hours. It is **not** an inventory filter: the contract status filter is only `low_stock | expiring_soon | ok`. The urgent filter drawn in early specs/mockups is deferred to backend **T-12U (#38)**, pending PO sign-off on the 48h window. "Urgent" surfaces only on the **Dashboard** (the "Expiring <48h" card and "Urgent Alerts" list — T-6A/T-6B). Never use "urgent" to mean "expiring soon," and never recompute it client-side.

## at-risk value
The stock value of an item that is low stock OR expiring soon, otherwise 0. Server-computed (`atRiskValue`). Avoid "value at risk" / "exposure".

## category
One of eight fixed values: `PRODUCE, MEAT, SEAFOOD, DAIRY, DRY_GOODS, BEVERAGE, FROZEN, OTHER`. The inventory filter chips use these eight — not grouped/marketing labels like "Proteins" or "Pantry".

## reorder cadence
How often a supplier delivers (e.g. daily, weekly), shown in the grid's "Par / Reorder" column. It lives on the **supplier** (`deliveryCadence`), not the item.

## item count
The number of tracked inventory records (`totalItems` on the dashboard summary). The contract has **no separate "SKU count"** and no "total units" — quantities live in mixed units (kg, l, each…) that can't be summed, so the record count is the only meaningful total. The Inventory page's "Total items" card uses it; there is **no** "SKU count" card.

## last updated
The newest `updatedAt` across inventory items (`lastUpdatedAt` on the dashboard summary; `null` when there are no items). Adds and edits bump it; **deletes do not** (no audit trail). Shown as the Inventory page's "Updated …" line. Avoid implying it's the *fetch* time.

## Reports Page
The page at `/reports` that surfaces inventory health KPIs. For MVP (T-10A) it reads from `DashboardSummary` via a thin `useReportKpis` hook (a swap point for a future `/reports/kpis` endpoint). The four canonical KPI card labels are: **"Total items"** (`totalItems`), **"Expiring soon"** (`expiringSoonCount`), **"At-risk value"** (`atRiskValue`), **"Low stock"** (`lowStockCount`). Use these labels exactly — do not use "total inventory value", "waste-risk summary", "below par", or "expiring item counts".
