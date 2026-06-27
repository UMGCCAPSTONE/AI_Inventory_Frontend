<!-- SYNCED COPY — do not edit here. The canonical version ships inside the @umgccapstone/contracts package (authored in the backend repo under packages/contracts/adr/shared/). Run `npm run adr:sync` after bumping the package. -->

# 0001 (shared). Two repositories bridged by a versioned contract package

**Status:** Accepted
**Date:** 2026-06-08

## Context & Problem Statement

The system has a React frontend and a Node backend that must agree on data shapes — types, enums, validation rules, and metric constants. We need to decide how the code is organized and how the two sides stay in sync without drifting.

## Considered Options

- **(A) Two repos + shared versioned package** — separate frontend/backend repos plus `@umgccapstone/contracts` (types + Zod + enums + constants) published to GitHub Packages and pinned by both.
- **(B) Monorepo** — one repo holding frontend, backend, and shared code.
- **(C) Two repos, hand-duplicated types** — copy the shared shapes into each repo.

## Decision Outcome

Chosen option: **(A).** Separate `AI_Inventory_Frontend` and `AI_Inventory_Backend` repos, bridged by `@umgccapstone/contracts` published to GitHub Packages with semver and consumed (pinned) by both. The package's home is the backend repo. The frontend proposes shape changes via PR; the backend publishes.

Chosen because it lets each side own and deploy independently while keeping a single source of truth for shapes; hand-duplication (C) drifts, and a monorepo (B) wasn't the team's structure.

## Consequences

- **Good:** independent ownership/deploys; one definition of every shape; semver makes breaking changes explicit.
- **Bad:** a shared change is two steps (publish package, bump consumers); needs GitHub Packages auth + CI publish setup.
- **Neutral:** shared ADRs ship inside the package under `/adr/shared/` and sync into each repo's `docs/adr/shared/` (`npm run adr:sync`).
