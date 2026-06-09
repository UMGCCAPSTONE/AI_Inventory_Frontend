# Shared / Cross-Repo ADRs (synced — do not hand-edit)

Decisions that apply to **both** the frontend and backend repos. They are **authored once** in the
`@umgccapstone/contracts` package under `adr/shared/` (its home is the backend repo) and synced into
each repo's `docs/adr/shared/` via `npm run adr:sync`. The bodies below are identical to the
backend's copies; CI fails on drift (`npm run adr:check`).

| # | Decision | Status |
|---|----------|--------|
| [0001](./0001-two-repo-contract-package.md) | Two repositories bridged by a versioned contract package | Accepted |
| [0002](./0002-api-conventions-envelope-verbs.md) | REST conventions: response envelopes and verb semantics | Accepted |
| [0003](./0003-firebase-bearer-auth.md) | Authentication via Firebase ID tokens (Bearer) | Accepted |
| [0004](./0004-server-computed-derived-fields.md) | Derived/metric fields are computed server-side only | Accepted |
| [0005](./0005-single-sourced-enums-zod.md) | Single-sourced enums and Zod schemas in the contract package | Accepted |

## Rules

* **Do not edit files here by hand.** Changes belong in the source (`@umgccapstone/contracts`
  → `adr/shared/`); run `npm run adr:sync` to pull them in. CI's drift check (`npm run adr:check`)
  fails if this folder differs from the source.
* To author a repo-local frontend decision, add it to `docs/adr/` (one level up), not here.

## Source

The sync source is configured via the `ADR_SHARED_SOURCE` environment variable, which points at the
shared-ADR directory:

* **Once `@umgccapstone/contracts` is published & installed:** point it at
  `client/node_modules/@umgccapstone/contracts/adr/shared`.
* **Before publish (current):** point it at a local checkout of the backend repo's canonical folder,
  e.g. `../AI_Inventory_Backend/packages/contracts/adr/shared`.

When `ADR_SHARED_SOURCE` is unset, `adr:sync` / `adr:check` **skip gracefully** (exit 0) so dev and CI
stay green; the committed copies in this folder remain the source of truth until the env is wired.
See `scripts/adr-sync.mjs`.
