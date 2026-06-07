# 0004. Client data layer: query-key registry + cache-invalidation map

* Status: accepted
* Date: 2026-06-07
* Deciders: Frontend Lead (Spencer Renfro) with Backend Lead sign-off; doc coordination by Asst PM (Robert Lee)

## Context and Problem Statement

With TanStack Query for server state (ADR 0002), every screen could invent its own query keys,
call `fetch` directly, and handle errors differently. That leads to inconsistent caching, stale
data after writes, and duplicated auth/error logic. How do we make every ticket read, write,
and refresh data the same way? (This ADR sets the direction that T-34 implements.)

## Decision Drivers

* One place that calls `fetch` (attaches Firebase bearer token, unwraps `{data,meta}`,
  normalizes `{error}` to a typed error, handles 401 → re-auth).
* Stable, discoverable query keys mapping 1:1 to endpoints.
* A write must refresh exactly the dependent reads (no stale screens, no over-fetching).
* Consistent loading/error/empty UI via shared components (ADR 0005).

## Considered Options

* **Centralized data layer**: shared API client + query-key registry + invalidation map +
  shared state components (the T-34 design).
* **Per-feature ad-hoc**: each ticket writes its own keys, fetches, and error handling.
* **Generated client** from an OpenAPI/contract spec.

## Decision Outcome

Chosen option: **centralized data layer**, because it guarantees consistent caching, a single
auth/error path, and a deterministic write→refresh story, while keeping feature tickets thin.
Concretely (T-34): a shared API client is the only caller of `fetch`; a **query-key registry**
exports every key; a **cache-invalidation map** declares which reads each write refreshes; and
shared `Skeleton/EmptyState/ErrorState` components render the four states.

### Consequences

* Good, because no inline fetch, ad-hoc keys, or bespoke error handling in feature code.
* Good, because a write invalidates the right reads per the map; 401 triggers re-auth in one
  place.
* Bad, because the registry/map is a coordination point that must stay in sync with backend
  endpoints (Backend Lead confirms keys map 1:1).
* Note: T-0 ships the seam only — the library-free `useAsyncResource` hooks and the four-state
  components (ADR 0005). T-34 replaces the hook bodies with this layer without changing call
  sites.

## Pros and Cons of the Options

### Centralized data layer (T-34)

* Good, because consistent caching, single auth/error path, deterministic invalidation.
* Bad, because one shared module to maintain and keep aligned with the API.

### Per-feature ad-hoc

* Good, because no upfront shared design.
* Bad, because inconsistent keys/caching, stale data after writes, duplicated error handling.

### Generated client from a spec

* Good, because types/endpoints stay in lockstep with the spec automatically.
* Bad, because we author the contract frontend-first (ADR 0006) and don't maintain a separate
  OpenAPI spec; generation tooling is extra overhead for a capstone.
