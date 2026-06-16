<!-- SYNCED COPY — do not edit here. The canonical version ships inside the @umgccapstone/contracts package (authored in the backend repo under packages/contracts/adr/shared/). Run `npm run adr:sync` after bumping the package. -->

# 0004 (shared). Derived/metric fields are computed server-side only

**Status:** Accepted
**Date:** 2026-06-08

## Context & Problem Statement
Several values are derived from raw data — `isLowStock`, `isExpiringSoon`, `atRiskValue`, `isAvailable`, `limitingIngredient`, and the dashboard summary counts. Either side could compute them. We need one authority so the numbers never disagree.

## Considered Options
- **(A) Server computes all derived fields**; the frontend only displays them.
- **(B) Frontend recomputes** from raw data.
- **(C) Both compute** via a shared helper.

## Decision Outcome
Chosen option: **(A).** The backend computes every derived/metric field from the canonical algorithms and returns them in responses; the frontend never recomputes — it renders what the API sends. The canonical algorithms and their constants (e.g. `EXPIRING_WINDOW_DAYS`, the unit-normalization rules for availability) live in the contract package.

Chosen because business math in two places drifts; a single server-side authority guarantees the dashboard, inventory, and reports all agree, and lets the algorithm change without a frontend release.

## Consequences
- **Good:** one source of truth for all business math; no client/server drift; algorithm tweaks ship server-side only.
- **Bad:** more fields cross the wire; the client can't compute offline or optimistically.
- **Neutral:** ties to the cache-invalidation matrix — an inventory write refreshes every derived read (summary, alerts, reports, availability).
