# 0002. State management: TanStack Query for server state, React Context for app state — no Redux

* Status: accepted
* Date: 2026-06-07
* Deciders: Frontend Lead (Spencer Renfro); doc coordination by Asst PM (Robert Lee)

## Context and Problem Statement

The app has two distinct kinds of state: **server state** (inventory, suppliers, menus,
reports — fetched, cached, and refreshed from the backend) and **app/UI state** (auth session,
selected service, theme, transient UI flags). How do we manage each without over-engineering a
capstone-sized frontend?

## Decision Drivers

* Server data needs caching, background refetch, loading/error handling, and invalidation on
  writes (see ADR 0004).
* App state is small and mostly read-many/write-rarely (session, current service).
* Avoid boilerplate and a steep learning curve for a small team.
* Keep a clean seam so feature tickets read/write data the same way (T-34).

## Considered Options

* **TanStack Query (server state) + React Context (app state)**
* **Redux Toolkit (+ RTK Query) for everything**
* **Zustand (+ a fetching lib) for everything**
* **Plain React Context + `fetch` for everything**

## Decision Outcome

Chosen option: **TanStack Query for server state + React Context for app state; no Redux**,
because TanStack Query is purpose-built for caching/refetch/invalidation (which is most of our
state), and the remaining app state is small enough for Context. Redux's global store and
boilerplate are unjustified at this scale.

### Consequences

* Good, because server state gets caching, dedup, background refresh, and a clear invalidation
  story (ADR 0004) with minimal code.
* Good, because app state stays simple and explicit via small Context providers.
* Bad, because two mechanisms exist; contributors must know which to use (rule of thumb: comes
  from the API → TanStack Query; lives only on the client → Context).
* Note: TanStack Query is **not installed in T-0** — the data hooks ship as a library-free
  `useAsyncResource` seam (ADR 0005) that T-34 replaces with the real client without changing
  call sites.

## Pros and Cons of the Options

### TanStack Query + React Context

* Good, because best-in-class server-cache semantics; tiny footprint for app state.
* Bad, because two tools to learn; Context misuse can cause re-renders if overloaded.

### Redux Toolkit (+ RTK Query)

* Good, because one mature ecosystem, devtools, RTK Query covers fetching.
* Bad, because more boilerplate/concepts than this app needs; explicitly out of scope per the
  ticket ("No Redux").

### Zustand (+ fetching lib)

* Good, because minimal, ergonomic global store.
* Bad, because still need a separate server-cache solution; less convention for our team.

### Plain Context + fetch

* Good, because zero dependencies.
* Bad, because we'd reinvent caching, dedup, refetch, and invalidation by hand.
