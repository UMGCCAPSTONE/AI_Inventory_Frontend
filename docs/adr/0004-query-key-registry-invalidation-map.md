# 0004. Client data layer: query-key registry + write→invalidate map (T-34)

**Status:** Accepted
**Date:** 2026-06-12

## Context & Problem Statement
Shared ADR [0004](./shared/0004-server-computed-derived-fields.md) makes the server the only authority for derived fields, so one inventory write can stale many reads — dashboard summary, urgent alerts, reports, recommendation availability. If every feature invents its own query keys and invalidation calls, caches drift and screens disagree.

## Considered Options
- **(A) Central query-key registry + invalidation map** — one module exports every query key; mutations look up which keys a write invalidates.
- **(B) Ad-hoc keys per feature** — each hook defines its own strings and invalidates what it remembers.

## Decision Outcome
Chosen option: **(A).** A single registry module (`src/services/queryKeys.ts`) exports every query key as a typed constant; no hook may inline a key. T-34 completes the layer with the shared API client (which unwraps the `{ data, meta }` envelope and normalizes `{ error }` per shared ADR [0002](./shared/0002-api-conventions-envelope-verbs.md)) and the write→invalidate map that mutations consult. T-0 lands the registry seam.

Chosen because the invalidation matrix is the riskiest part of a server-computed design — centralizing it makes "what refreshes after this write?" reviewable in one file.

## Consequences
- **Good:** every cache entry is addressable; invalidation is consistent and reviewable; refactors touch one module.
- **Bad:** every new resource requires a registry edit alongside its hook.
- **Neutral:** the Firebase bearer token (shared ADR [0003](./shared/0003-firebase-bearer-auth.md)) attaches in the shared client, not in individual hooks.
