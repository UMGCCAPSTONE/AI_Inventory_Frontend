# ADR 0007 — DashboardPage wrapper component

**Status:** Accepted  
**Decided:** 2026-06-16  
**Ticket:** T-6A (implementation), T-20B (prompted the decision)

## Decision

T-6A will introduce a `DashboardPage` component that owns the dashboard layout and composes `DashboardHeader`, `TodayDashboard`, and any new sections (alerts, AI preview cards) added by T-6A/B/C. `App.tsx` will render `<DashboardPage />` instead of individual dashboard sub-components directly.

## Context

`App.tsx` currently renders `DashboardHeader` and `TodayDashboard` directly. As T-6 adds more dashboard sections, that list would grow and `App.tsx` would accumulate layout concerns it shouldn't own.

## Alternatives considered

**Extend existing components in place** — T-6 adds features directly to `DashboardHeader` and `TodayDashboard`, no new wrapper. Keeps the component tree flat but leaves `App.tsx` as the de-facto dashboard layout owner and makes the `DashboardPage.test.tsx` spec file name misleading.

## Consequences

- `DashboardPage.test.tsx` (T-20B placeholder spec) targets the correct component when T-6A lands.
- `App.tsx` stays thin — it renders `<DashboardPage />`, `<InventoryPage />`, etc. as routing targets, not layout.
- `DashboardHeader` and `TodayDashboard` become sub-components of `DashboardPage`, not direct children of `App`.
