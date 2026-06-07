# 0005. Four required UI states for every data-driven screen

* Status: accepted
* Date: 2026-06-07
* Deciders: Frontend Lead (Spencer Renfro); doc coordination by Asst PM (Robert Lee)

## Context and Problem Statement

Data-driven screens that only render the happy path leave users staring at blank screens while
loading, on error, or when there is no data. We need a consistent contract for how every
data-bound screen behaves across all four situations, so feature tickets handle them uniformly.

## Decision Drivers

* No blank screens: always explain what's happening.
* Consistency across inventory, menu, suppliers, reports.
* A shape that maps cleanly onto TanStack Query results (ADR 0002/0004).
* Accessibility: status/alert roles for loading and error.

## Considered Options

* **Mandate four explicit states** (loading / error / empty / success) via a shared
  discriminated union + shared state components.
* **Loading + success only**, treat empty/error ad hoc per screen.
* **Per-screen freeform** handling.

## Decision Outcome

Chosen option: **four explicit states**. Screens model their data as a discriminated union
`AsyncResource<T> = loading | error | empty | success` and render shared `LoadingState`,
`ErrorState`, `EmptyState` components for the first three; `success` is the screen's content.
"Empty" is distinct from "loading" and "error" so users get an actionable empty message.

### Consequences

* Good, because every screen behaves predictably; no blank screens; empty has its own CTA.
* Good, because the union maps directly onto query results, easing the T-34 swap.
* Bad, because slightly more code per screen than happy-path-only (mitigated by shared
  components).
* Implemented in T-0: `client/src/hooks/useAsyncResource.ts` and
  `client/src/components/states/StateViews.tsx` (plain CSS now; MUI versions arrive per
  ADR 0001/T-34).

## Pros and Cons of the Options

### Four explicit states (shared union + components)

* Good, because consistent, accessible, and aligned with query semantics.
* Bad, because a small upfront convention to follow.

### Loading + success only

* Good, because least code.
* Bad, because empty and error are exactly where users get stuck — blank/confusing screens.

### Per-screen freeform

* Good, because no shared abstraction.
* Bad, because inconsistent UX and duplicated handling across tickets.
