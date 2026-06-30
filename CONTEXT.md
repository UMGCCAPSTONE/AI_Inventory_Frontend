# Mise Frontend — Domain Glossary

## placeholder spec
A `describe.skip` / `it.todo` block that names a user-story behaviour without containing any assertions or render calls. The test body is written by the page ticket (T-6/T-7/T-8/T-9/T-10) when the component exists. The prose description is the durable artefact; it survives prop renames and interface changes.

## Dashboard Page
The single React component (`DashboardPage`) that owns the dashboard layout. Introduced by T-6A. Since T-42 it composes `DashboardHeader` (greeting + KPI cards, T-6A) as a top row, then a two-column row of `AlertsSection` (T-6B) and `RecommendationPreviewSection` (T-6C). The `TodayDashboard` panel was retired here — it was an unwired T-0 stub that always rendered empty and duplicated the Inventory page (see [ADR 0009](docs/adr/0009-dashboard-retires-unwired-today-panel.md)). `App.tsx` renders `<DashboardPage />` rather than individual dashboard sub-components directly.

## recommendation preview
A lightweight card shown on the Dashboard (up to 3) summarising an AI-generated dish recommendation. Combines a **content snapshot** (`name`, `summary`; sourced from `GET /dashboard/recommendations/preview`) with a **live availability payload** (`isAvailable`, `limitingIngredient`; sourced from `GET /menu/availability`). Availability is re-fetched when inventory changes; content is not — the two queries are independent and invalidated separately. The card's CTA navigates to the Menu Builder. Do not call these "specials" (retired T-0 scaffold term). Distinct from a full *recommendation* (T-8), which adds food cost, suggested price, margin, ingredients, and accept/dismiss actions.

## recommendation
An AI-generated dish suggestion produced by the backend and surfaced in the Menu Builder (T-8). Per `@umgccapstone/contracts@0.6.0` (`recommendationSchema`) it carries: `name`, `explanation` (the AI reasoning, rendered as plain text), `ingredientsUsed` (the content snapshot, frozen at generation), live server-computed availability (`isAvailable`, `limitingIngredientId`), `status`, `source` (`AI | FALLBACK` — drives the "fallback" badge), `menuItemId` (nullable FK to a saved dish), and a derived `kind` (`EXISTING | NEW`, per ADR 0014). **Pricing** (`foodCost`, `suggestedPrice`, `margin`) is **not** in the contract — it is gated on an unmade PO pricing-rule decision, tracked in backend **T-37**; the T-8 card ships without it. The Dashboard shows only a *recommendation preview* — a lighter subset with no actions.

## food cost
The cost to make one serving of a recommended dish: `Σ(ingredient.quantity × inventory unitCost)` over `ingredientsUsed`, unit-normalized. Server-computed on the *recommendation* (tracked in T-37, not yet in the contract). Distinct from *unit cost* (the per-stock-unit cost of a single inventory item).

## suggested price
The menu price a *recommendation* proposes for a dish, derived from *food cost* via the food-cost-percentage rule: `suggestedPrice = foodCost / targetFoodCost`, with a PO-set **target food cost of 30%** (PO decision 2026-06-28). It is a *suggestion* the user can adjust — never rounded to .95/.99. Server-computed (T-37).

## margin
The **gross margin %** of a *recommendation*: `(suggestedPrice − foodCost) / suggestedPrice` (= 70% at a 30% target food cost). Always a percentage, not a dollar amount. Server-computed (T-37). Do not conflate with *markup* (`(price − cost) / cost`).

## recommendation kind
Whether a *recommendation* targets a dish already on the menu (`EXISTING`) or a novel dish (`NEW`), derived server-side from whether `menuItemId` is set (ADR 0014). The kind determines the available card actions: a **NEW** recommendation supports accept / dismiss / save (accept creates an ACTIVE menu item); an **EXISTING** recommendation supports **dismiss / save only** — there is nothing to accept because the dish is already on the menu, and the API rejects `ACCEPTED` for it with **409**. The rule-based fallback (`source: FALLBACK`) only ever produces `EXISTING` recommendations.

## recommendation status
The lifecycle of a *recommendation*, per the contract enum: `PROPOSED | ACCEPTED | DISMISSED | SAVED` (uppercase — not the retired `pending | accepted | dismissed`). A freshly generated recommendation is `PROPOSED`. The Menu Builder's active list shows `PROPOSED` **and** `ACCEPTED` items. **Accept** → `ACCEPTED` (card stays in the list, marked and no longer actionable; also creates an ACTIVE menu item) — **valid only for `kind: NEW`** (see [[recommendation kind]]; `EXISTING` rejects accept with 409). **Dismiss** → `DISMISSED` and **Save** → `SAVED` both leave the active list, for either kind. **`SAVED` is what the Dashboard preview shows** — saving a recommendation pins it to the Dashboard's "Tonight's Suggested Specials" (T-40); the preview shows only `SAVED` recs (an empty-state message when there are none). Each transition is a `PATCH /recommendations/:id` with body `{ status }` (not `/:id/status`). Browsing `SAVED`/historical recommendations is deferred to T-8S (stretch).

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

## category total value
The total dollar value of all inventory items in a category: `sum(quantity × unitCost)` across every item in that category. Computed in the frontend service layer from API-provided fields — this is arithmetic aggregation, not a business-rule recomputation prohibited by ADR 0004. Distinct from *at-risk value* (which is `isAtRisk ? quantity × unitCost : 0` and is server-computed). The column label in the category summary table is **"Total value"**.
