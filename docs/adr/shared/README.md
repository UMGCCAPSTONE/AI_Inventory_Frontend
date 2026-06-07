# Shared ADRs (synced — do not hand-edit)

This folder is a **read-only mirror** of cross-repo Architecture Decision Records that are
authored outside this repository (the shared/contract ADRs). It is populated by:

```bash
npm run adr:sync
```

and validated in CI by:

```bash
npm run adr:check
```

## Rules

* **Do not edit files here by hand.** Changes belong in the source repo; run `adr:sync` to pull
  them in. CI's drift check (`adr:check`) fails if this folder differs from the source.
* To author a repo-local decision, add it to `docs/adr/` (one level up), not here.

## Source

The sync source is configured via the `ADR_SHARED_SOURCE` environment variable (a path or
clone of the shared-ADR source). See `scripts/adr-sync.mjs`.

> **Status:** the shared-ADR source is not published yet (backend/T-1 pending). Until it is,
> `adr:sync` and `adr:check` **skip gracefully** with a message and this folder stays empty
> apart from this README. Once a source is configured, the synced ADRs appear here and the
> drift check becomes enforcing.
