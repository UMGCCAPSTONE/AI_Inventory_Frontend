# 0006. Frontend-first contract authorship

**Status:** Accepted
**Date:** 2026-06-12

## Context & Problem Statement
The shared contract package lives in the backend repo and is published from there (shared ADR [0001](./shared/0001-two-repo-contract-package.md)). But it is the frontend, building screens, that first discovers what shapes, enums, and constants the UI actually needs. The team needed to decide who authors contract changes and how they flow.

## Considered Options
- **(A) Frontend proposes, backend publishes** — the frontend authors shape changes as PRs against `packages/contracts/` in the backend repo; the backend reviews, merges, and publishes a new version.
- **(B) Backend authors alone** — the frontend requests changes informally and waits.
- **(C) Either side edits freely** — no single review path.

## Decision Outcome
Chosen option: **(A).** UI tickets that need a new or changed shape open a PR against the contract package in `AI_Inventory_Backend`, including the Zod schema and types. The backend reviews for server feasibility, merges, and publishes the semver bump; the frontend then pins the new version.

Chosen because the consumer of a shape is the best author of it, while keeping a single publishing authority preserves review and versioning discipline.

## Consequences
- **Good:** shapes match real UI needs the first time; one review gate; explicit version history for every contract change.
- **Bad:** a UI ticket can block on a contract PR + publish round-trip.
- **Neutral:** the frontend never edits `docs/adr/shared/` directly — those files sync from the published package via `npm run adr:sync`.
