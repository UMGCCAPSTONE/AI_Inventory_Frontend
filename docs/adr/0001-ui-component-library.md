# 0001. UI component library: MUI + MUI X DataGrid

* Status: accepted
* Date: 2026-06-07
* Deciders: Frontend Lead (Spencer Renfro); doc coordination by Asst PM (Robert Lee)

## Context and Problem Statement

The app needs accessible, consistent UI primitives (buttons, inputs, dialogs, layout) and a
capable data table for the inventory, supplier, and reporting screens (sorting, filtering,
pagination of potentially hundreds of SKUs). Which component library do we standardize on so
feature tickets build from a shared, accessible foundation rather than bespoke CSS per screen?

## Decision Drivers

* Accessibility and keyboard support out of the box (project a11y requirements).
* A production-grade data grid for inventory/reports (sort, filter, paginate, CSV).
* Team familiarity and a large, well-documented ecosystem for a time-boxed capstone.
* TypeScript-first API.

## Considered Options

* **MUI (Material UI) + MUI X DataGrid**
* **Ant Design**
* **Chakra UI** (+ a separate table library such as TanStack Table)
* **Headless (Radix/Headless UI) + hand-rolled styling**

## Decision Outcome

Chosen option: **MUI + MUI X DataGrid**, because it provides both the general component set
and a first-class data grid from one vendor with strong TypeScript and accessibility support,
minimizing integration glue during a short capstone.

### Consequences

* Good, because inventory/reports get a mature grid (sorting/filtering/pagination) without
  assembling a table from scratch.
* Good, because a single theme drives consistent, accessible styling across all feature
  tickets.
* Bad, because MUI adds bundle weight and a styling paradigm the team must follow; the free
  DataGrid omits some Pro features (we stay within the community tier).
* Note: MUI is **not installed in T-0** — this ADR records the decision; the install lands in
  T-4 (setup). Until then, the four-state components use plain CSS (see ADR 0005).

## Pros and Cons of the Options

### MUI + MUI X DataGrid

* Good, because one ecosystem covers components + grid; excellent docs and TS types.
* Good, because accessible defaults reduce a11y rework.
* Bad, because heavier bundle and opinionated styling system.

### Ant Design

* Good, because rich component set including a table.
* Bad, because theming/customization is heavier and the design language is less neutral.

### Chakra UI + TanStack Table

* Good, because ergonomic, accessible primitives.
* Bad, because we'd integrate and style a table ourselves — more work for the inventory/report
  grids.

### Headless + hand-rolled styling

* Good, because maximum control and minimal bundle.
* Bad, because far more bespoke work to reach accessible, consistent UI in a capstone timebox.
