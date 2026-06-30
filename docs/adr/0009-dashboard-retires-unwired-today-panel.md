# 0009. Dashboard retires the unwired TodayDashboard panel

**Status:** Accepted (supersedes the composition in [ADR 0007](./0007-dashboard-page-wrapper.md))
**Date:** 2026-06-29
**Ticket:** T-42

## Context & Problem Statement

T-42 re-lays out `DashboardPage` to the approved mockup grid: a top row of KPI
cards, then a two-column row of Urgent Alerts (T-6B) and the AI recommendation
preview (T-6C). The mockup has no "current inventory" panel.

ADR 0007 had `DashboardPage` compose `DashboardHeader`, `TodayDashboard`, and the
T-6 sections, on the assumption `TodayDashboard` would become a live panel. It
never did. `fetchTodayDashboard()` is still the T-0 hook seam — it returns a
hardcoded empty dataset (`{ inventory: { filters: [], items: [] } }`) and calls no
API. So the panel renders its **empty** state permanently, even when the kitchen
is fully stocked. That is not an honest empty state (ADR 0005): the items exist —
they live on the Inventory page (T-7), which is fully wired with a DataGrid and
KPI cards. The panel therefore showed misleading copy and duplicated a real page.

## Considered Options

- **(A) Remove `TodayDashboard` from the dashboard.** Dashboard composes
  `DashboardHeader` + the Alerts/Preview columns. The inventory list lives only on
  the Inventory page. Matches the mockup; drops a misleading, duplicate panel.
- **(B) Keep it.** Ship the redesign with a permanently-empty inventory panel that
  contradicts the mockup and ADR 0005's intent.
- **(C) Wire `fetchTodayDashboard` to a real endpoint** as part of T-42. Net-new
  feature scope, and redundant with the Inventory page.

## Decision Outcome

Chosen option: **(A).** `DashboardPage` no longer renders `TodayDashboard`. The
component, its `useTodayDashboard` hook, and the `fetchTodayDashboard` seam are
left in the tree but orphaned, flagged for deletion in a follow-up cleanup (kept
out of T-42 to keep the layout change minimal and reversible). If an at-a-glance
inventory panel is wanted on the dashboard later, it is a new ticket with a real
data source — not a revival of the stub.

## Consequences

- **Good:** the dashboard matches the mockup and shows no misleading empty panel;
  the inventory list has a single home (the Inventory page).
- **Good:** no behavioural duplication between Dashboard and Inventory.
- **Neutral:** ADR 0007's *composition* is superseded; its core decision (a
  `DashboardPage` wrapper owns layout, `App.tsx` stays thin) still holds.
- **Bad:** `TodayDashboard.tsx`, `useTodayDashboard`, and `fetchTodayDashboard`
  become dead code until a follow-up removes them.
