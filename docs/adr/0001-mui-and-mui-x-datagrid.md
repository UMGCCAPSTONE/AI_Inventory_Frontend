# 0001. UI components via MUI with MUI X DataGrid for tables

**Status:** Accepted
**Date:** 2026-06-12

## Context & Problem Statement
The frontend needs inventory tables, supplier directories, report views, forms, and dialogs on a capstone timeline. Hand-rolling accessible tables with sorting, filtering, and pagination is expensive, and the team needs one consistent component vocabulary across feature tickets.

## Considered Options
- **(A) MUI (Material UI) + MUI X DataGrid (community/MIT)** — full component library plus a purpose-built data grid.
- **(B) Keep hand-rolled components + plain CSS** — the current baseline, built screen by screen.
- **(C) Another library** — Chakra, Ant Design, or Tailwind component kits.

## Decision Outcome
Chosen option: **(A).** MUI supplies the shared component vocabulary (forms, dialogs, navigation, feedback), and the MIT-licensed MUI X DataGrid backs the data-heavy screens — inventory (T-7B), suppliers (T-9A), and reports (T-10B) — giving sorting, filtering, and pagination out of the box.

Chosen because it is the fastest path to consistent, accessible, data-dense screens within the sprint budget; hand-rolling (B) spends ticket time on table mechanics instead of features.

## Consequences
- **Good:** accessible components by default; DataGrid covers sort/filter/pagination/empty-overlay; one design language across tickets.
- **Bad:** bundle size grows; the team must learn MUI theming conventions.
- **Neutral:** existing plain-CSS screens migrate per feature ticket, not in a big-bang restyle; MUI is introduced by the first ticket that needs it.
