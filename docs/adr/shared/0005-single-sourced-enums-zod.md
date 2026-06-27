<!-- SYNCED COPY — do not edit here. The canonical version ships inside the @umgccapstone/contracts package (authored in the backend repo under packages/contracts/adr/shared/). Run `npm run adr:sync` after bumping the package. -->

# 0005 (shared). Single-sourced enums and Zod schemas in the contract package

**Status:** Accepted
**Date:** 2026-06-08

## Context & Problem Statement

Enums (Category, Unit, RecommendationStatus, MenuItemStatus, UserRole) and field validation rules are needed by the frontend forms, the backend request validation, and the database. Defining them in more than one place invites drift between client, server, and schema.

## Considered Options

- **(A) Single-sourced** — author the enums and Zod schemas once in the contract package; both repos and Prisma derive from them.
- **(B) Per-repo** — define them separately in each repo (and again in the Prisma schema).

## Decision Outcome

Chosen option: **(A).** All enums and Zod validation schemas are authored once in `@umgccapstone/contracts`. The backend uses them for request validation and mirrors the enums into the Prisma schema; the frontend uses the same Zod schemas in React Hook Form. Zod is the shared validation library of record.

Chosen because one definition driving validation on both sides _and_ the database makes it impossible for client and server to disagree on what values are valid.

## Consequences

- **Good:** one definition powers client validation, server validation, and DB enums; no divergence.
- **Bad:** adding an enum value requires a package version bump consumed by both repos.
- **Neutral:** reinforces decisions [0001](./0001-two-repo-contract-package.md) and [0004](./0004-server-computed-derived-fields.md) — the package is the home for shapes, constants, and now validation.
