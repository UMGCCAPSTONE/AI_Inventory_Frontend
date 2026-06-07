# 0006. Frontend-first contract authorship via `@umgccapstone/contracts`

* Status: accepted
* Date: 2026-06-07
* Deciders: Frontend Lead (Spencer Renfro) with Backend Lead sign-off; doc coordination by Asst PM (Robert Lee)

## Context and Problem Statement

The frontend and backend must agree on request/response shapes. If each repo defines its own
types, they drift. We need a single shared source of truth for DTOs and validation schemas, and
a decision on **who authors it** and **how the frontend consumes it**.

## Decision Drivers

* One source of truth for types + Zod schemas, reused by both repos (ADR 0003).
* The frontend builds UI before endpoints exist, so the UI's data needs should drive the shape.
* Reproducible builds: a pinned, versioned dependency, not copy-paste.
* Private distribution within the org.

## Considered Options

* **Frontend-first contract in a shared package** `@umgccapstone/contracts`, published to
  GitHub Packages, consumed pinned by both repos.
* **Backend-first**: backend defines types; frontend imports or mirrors them.
* **Duplicate types** in each repo, kept in sync manually.

## Decision Outcome

Chosen option: **frontend-first `@umgccapstone/contracts`**, published to **GitHub Packages**
and consumed at a **pinned version**. The frontend authors the contract (types + Zod schemas)
from the UI's needs; the backend implements against it. The package is installed via a scoped
registry in `.npmrc` using a `read:packages` token.

### Consequences

* Good, because both repos share one versioned source of truth for types and validation.
* Good, because pinning keeps builds reproducible; bumps are deliberate.
* Bad, because consuming a private package requires registry auth (a `read:packages` token) in
  every dev and CI environment.

### Interim state (T-0)

The package is **not yet published** (backend/T-1 pending). To avoid blocking:

* `client/.npmrc` is configured for `@umgccapstone:registry=https://npm.pkg.github.com/` with
  the token read from `NODE_AUTH_TOKEN` — **no token is committed**.
* The contract types live temporarily in `client/src/types/contracts/` as a local stub.
* No `@umgccapstone/contracts` entry is added to `package.json` yet, so `npm ci`/build stay
  green.

**Swap path:** when the package is published, add it to `dependencies` at a pinned version and
either re-export from `src/types/contracts/index.ts` or delete the stub and update imports —
call sites do not change.

## Pros and Cons of the Options

### Frontend-first shared package

* Good, because single versioned source of truth; UI needs drive the shape.
* Bad, because requires registry auth and a publishing/versioning workflow.

### Backend-first

* Good, because types live next to the implementation.
* Bad, because the UI is built first here; backend-first would block or lag the frontend.

### Duplicated types per repo

* Good, because no shared tooling/auth.
* Bad, because guaranteed drift and manual sync burden.
