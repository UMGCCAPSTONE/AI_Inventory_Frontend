# 0005. Every data-driven view renders four required UI states

**Status:** Accepted
**Date:** 2026-06-12

## Context & Problem Statement
The baseline frontend shipped with hardcoded placeholder data, so screens always looked "full" and the real behaviors — waiting on the API, a failed request, an empty kitchen — were never designed or testable. Once the app runs against real (initially empty) data, blank or misleading screens are the default failure mode.

## Considered Options
- **(A) Mandate loading, empty, error, and success states on every data-driven view**, enforced in ticket acceptance criteria.
- **(B) Leave state handling to each feature ticket's judgment.**

## Decision Outcome
Chosen option: **(A).** Every component consuming a data hook must render: **loading** while the request is pending, **error** (with a useful message) when it fails, **empty** (with guidance on what fills it) when the dataset has no rows, and **success** with the data. Feature-ticket acceptance includes all four.

Chosen because the app must demo credibly against an empty database from day one, and consistent states are far cheaper to build in from the start than to retrofit.

## Consequences
- **Good:** no blank screens; the app is demo-able at any data volume; reviewers can verify states without seeding data.
- **Bad:** more markup and copy per screen.
- **Neutral:** TanStack Query's `isPending` / `isError` / `data` flags map one-to-one onto the required states ([0002](./0002-tanstack-query-context-no-redux.md)).
