# 0008. Recommendation preview: two-query split for content and availability

**Status:** Accepted
**Date:** 2026-06-26
**Ticket:** T-6C

## Context & Problem Statement

The Dashboard's recommendation preview section (T-6C) must show up to 3 AI-generated dish cards, each with a dish name, one-line summary, a live availability flag (`isAvailable`), and the limiting ingredient (`limitingIngredient`). The ticket specifies two distinct data sources with different staleness characteristics:

- **Content** (`name`, `summary`) — an AI-generated snapshot. It changes when the recommendation engine reruns, not when inventory changes.
- **Availability** (`isAvailable`, `limitingIngredient`) — a live, inventory-derived flag. It changes whenever inventory is written and must reflect the current stock state.

The team needed to decide whether to model these as a single query or two independent queries.

## Considered Options

- **(A) Two queries — content and availability fetched and cached independently.** `GET /dashboard/recommendations/preview` owns content; `GET /menu/availability` owns availability. Each has its own query key. Only the availability key is in the `inventory.write` invalidation map.
- **(B) Single query — one `GET /dashboard/recommendations/preview` endpoint returns both content and availability.** Added to `inventory.write` so availability stays fresh, but this also re-fetches content on every inventory write.

## Decision Outcome

Chosen option: **(A).** Two independent queries, registered as `queryKeys.dashboard.recommendations` (content) and `queryKeys.menu.availability` (availability) in the query-key registry ([ADR 0004](./0004-query-key-registry-invalidation-map.md)).

Only `queryKeys.menu.availability` is added to the `inventory.write` row of the invalidation map. `queryKeys.dashboard.recommendations` is **not** invalidated by inventory writes — the content snapshot is only stale after a recommendation-engine write (a future write key, T-8).

If the availability query fails, the preview cards still render using the content data; the availability badge is omitted rather than blocking the whole section. If the content query fails, the section shows an error state (cards cannot render without names and summaries).

Chosen because the ticket explicitly separates the two sources and specifies that "availability updates when inventory changes **without** the recommendation content changing." A single query would conflate those staleness domains and re-fetch AI-generated content on every stock edit — wasteful and semantically incorrect.

## Consequences

- **Good:** invalidation is precise — inventory writes refresh only what inventory affects; content cache survives stock edits.
- **Good:** availability failure degrades gracefully; cards remain visible without blocking on a secondary enrichment.
- **Good:** when T-8 lands its recommendation-engine write key, it only needs to invalidate `queryKeys.dashboard.recommendations` — the availability key is already wired separately.
- **Bad:** two round-trips per Dashboard load instead of one; both queries are stubs until the backend ships the endpoints.
- **Neutral:** `queryKeys.menu` is a new top-level namespace in the registry — the first non-dashboard, non-inventory key.
