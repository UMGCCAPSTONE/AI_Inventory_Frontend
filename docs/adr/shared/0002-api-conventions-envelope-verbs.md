<!-- SYNCED COPY — do not edit here. Authored in @umgccapstone/contracts (adr/shared/) and pulled in via `npm run adr:sync`. -->

# 0002 (shared). REST conventions: response envelopes and verb semantics

**Status:** Accepted
**Date:** 2026-06-08

## Context & Problem Statement
Frontend and backend need a predictable contract for every endpoint — a consistent response shape, a uniform way to report errors, and agreed meaning for each HTTP method.

## Considered Options
- **(A) Enveloped responses + REST verb conventions** — `{ data, meta }` on success, `{ error: { code, message, field? } }` on failure, with conventional verb semantics.
- **(B) Bare bodies, ad-hoc errors** — return raw JSON and improvise error shapes per endpoint.

## Decision Outcome
Chosen option: **(A).** REST under `/api`. Success → `{ data, meta }`. Error → `{ error: { code, message, field? } }` with a machine-readable `code` (e.g. `ITEM_IN_USE`). Verbs: **POST** create · **PATCH** partial update including status transitions (archive, accept/dismiss) · **DELETE** remove. Auth failures → 401.

Chosen because a uniform envelope lets the client parse and handle errors in one place, and machine-readable codes let the UI branch on specific cases (e.g. show the dishes blocking a delete).

## Consequences
- **Good:** one client-side parse/error path; codes drive specific UI states; PATCH-for-status keeps archive/accept/dismiss consistent.
- **Bad:** every handler must wrap its response in the envelope.
- **Neutral:** the T-34 frontend data layer unwraps `data` and normalizes `error` centrally; ties to decision [0001](./0001-two-repo-contract-package.md).
