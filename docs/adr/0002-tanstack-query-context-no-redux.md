# 0002. TanStack Query for server state, React Context for app state — no Redux

**Status:** Accepted
**Date:** 2026-06-12

## Context & Problem Statement
Most frontend state is server data — inventory, recommendations, suppliers, metrics — which needs caching, refetching, and invalidation after writes. A small remainder is app state (signed-in user, UI preferences). The team needed to decide the state architecture before feature tickets, including whether to adopt Redux.

## Considered Options
- **(A) TanStack Query for server state + React Context for app state.**
- **(B) Redux Toolkit (+ RTK Query)** — one store for everything.
- **(C) Component state + manual `fetch`** — no shared cache.

## Decision Outcome
Chosen option: **(A), explicitly no Redux.** TanStack Query owns every piece of data that comes from the API — caching, request de-duplication, status flags, and invalidation — keyed through the query-key registry ([0004](./0004-query-key-registry-invalidation-map.md)). React Context carries the few cross-cutting client values (auth user, app config). Local component state covers everything else.

Chosen because the project's state is overwhelmingly server cache, which TanStack Query solves purpose-built with far less boilerplate than Redux; a global store would mostly re-implement the cache by hand.

## Consequences
- **Good:** caching/refetch/invalidation for free; query status flags map directly onto the four required UI states ([0005](./0005-four-required-ui-states.md)); less boilerplate per feature.
- **Bad:** two mechanisms to know — contributors must place state correctly (server data never goes in Context).
- **Neutral:** if genuinely complex client-only state appears later, that is a new ADR, not an ad-hoc library addition.
