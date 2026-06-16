# Frontend Test Coverage Matrix

**Last updated:** 2026-06-16  
**Ticket:** T-20B — Frontend Test Coverage (placeholder specs for upcoming MVP pages)  
**Harness:** Vitest + React Testing Library + jsdom (T-20A)

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Active | Spec exists, runs, and passes |
| ⏭ Skipped | `describe.skip` placeholder — reported as skipped, never fails CI |
| 🔲 Todo | `it.todo` inside a skipped block — named behaviour, no body yet |
| — | Not applicable for this page |

---

## Coverage by Page × User Story

| Page | User Story | Spec file | Status | Owned by |
|------|-----------|-----------|--------|----------|
| **Auth / Login** | US-AUTH-1: Google sign-in | `src/pages/LoginPage.test.tsx` | ✅ Active | T-5 |
| | US-AUTH-2: Sign-in error feedback | `src/pages/LoginPage.test.tsx` | ✅ Active | T-5 |
| | US-AUTH-3: Disabled when Firebase not configured | `src/pages/LoginPage.test.tsx` | ✅ Active | T-5 |
| **Dashboard** | US-DASH-1: Summary cards & metrics | `src/pages/DashboardPage.test.tsx` | ⏭ Skipped | T-6A |
| | US-DASH-2: Urgent alerts section | `src/pages/DashboardPage.test.tsx` | ⏭ Skipped | T-6B |
| | US-DASH-3: AI recommendation preview | `src/pages/DashboardPage.test.tsx` | ⏭ Skipped | T-6C |
| **Inventory** | US-INV-1: Metrics & layout | `src/pages/InventoryPage.test.tsx` | ⏭ Skipped | T-7A |
| | US-INV-2: Item grid with badges | `src/pages/InventoryPage.test.tsx` | ⏭ Skipped | T-7B |
| | US-INV-3: Add / edit item flow | `src/pages/InventoryPage.test.tsx` | ⏭ Skipped | T-7C |
| **Suppliers** | US-SUPP-1: Directory view | `src/pages/SuppliersPage.test.tsx` | ⏭ Skipped | T-9A / T-9B |
| | US-SUPP-2: Add supplier | `src/pages/SuppliersPage.test.tsx` | ⏭ Skipped | T-9B |
| | US-SUPP-3: Edit supplier | `src/pages/SuppliersPage.test.tsx` | ⏭ Skipped | T-9B |
| **Menu Builder** | US-MENU-1: Layout & generate flow | `src/pages/MenuBuilderPage.test.tsx` | ⏭ Skipped | T-8A |
| | US-MENU-2: Recommendation detail | `src/pages/MenuBuilderPage.test.tsx` | ⏭ Skipped | T-8B |
| | US-MENU-3: Accept recommendation | `src/pages/MenuBuilderPage.test.tsx` | ⏭ Skipped | T-8B |
| | US-MENU-4: Dismiss recommendation | `src/pages/MenuBuilderPage.test.tsx` | ⏭ Skipped | T-8B |
| | US-MENU-5: Explanation modal | `src/pages/MenuBuilderPage.test.tsx` | ⏭ Skipped | T-8B |
| | US-MENU-6: Empty state | `src/pages/MenuBuilderPage.test.tsx` | ⏭ Skipped | T-8A / T-8B |
| **Reports** | US-REP-1: KPI cards | `src/pages/ReportsPage.test.tsx` | ⏭ Skipped | T-10A |
| | US-REP-2: Category summary table | `src/pages/ReportsPage.test.tsx` | ⏭ Skipped | T-10B |
| | US-REP-3: Recommendation history | `src/pages/ReportsPage.test.tsx` | ⏭ Skipped | T-10C |
| | US-REP-4: Waste-risk breakdown | `src/pages/ReportsPage.test.tsx` | ⏭ Skipped | T-10C |

---

## Shared / Infrastructure Specs

| Component | Spec file | Status | Notes |
|-----------|-----------|--------|-------|
| DashboardHeader (scaffold) | `src/components/DashboardHeader.test.tsx` | ✅ Active | T-20A harness smoke test — heading renders |
| LoginPage | `src/pages/LoginPage.test.tsx` | ✅ Active | T-5 auth UI tests |

---

## Running Coverage

```bash
# Full text summary in the terminal (for Test Plan deliverable)
npm run test:coverage

# Watch mode (development)
npm test

# One-off without the npm script
npm test -- --coverage
```

Coverage rises as each page ticket (T-6 / T-7 / T-8 / T-9 / T-10) merges and its `describe.skip` blocks are un-skipped and filled in.

---

## Un-skipping Checklist (per page ticket)

When a page ticket merges:

1. Remove `describe.skip(` → `describe(` on the relevant block(s)
2. Import the real page component
3. Add a `vi.mock` for the API service or T-34 client
4. Build a contract-shaped fixture from `@umgccapstone/contracts` types
5. Fill in each `it.todo` body
6. Run `npm run test:coverage` and update the Status column above to ✅ Active
7. Confirm `npm test` is green in CI
