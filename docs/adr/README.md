# Architecture Decision Records (Frontend)

This directory holds the **frontend** Architecture Decision Records (ADRs) for the Mise
capstone project, written in [MADR](https://adr.github.io/madr/) format.

An ADR captures a single architecturally significant decision: the context, the options
considered, the choice, and its consequences. ADRs are immutable once accepted — to change a
decision, add a new ADR that supersedes the old one (update the old one's status to
`superseded by ...`).

## Layout

| Path                | Contents                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| `docs/adr/*.md`     | Frontend-local ADRs (decisions owned by this repo).                      |
| `docs/adr/shared/`  | Synced **read-only** copy of cross-repo ADRs. See `shared/README.md`.    |
| `docs/adr/template.md` | Copy this when authoring a new ADR.                                   |

## Numbering & authoring

* Number sequentially, zero-padded to four digits: `0007-short-title.md`.
* Copy `template.md`, fill in every section, set `Status: accepted` and the date.
* Keep one decision per ADR; link related ADRs by filename.

## Index

| ADR | Title | Status |
| --- | ----- | ------ |
| [0001](0001-ui-component-library.md) | UI component library: MUI + MUI X DataGrid | accepted |
| [0002](0002-state-management.md) | State management: TanStack Query + React Context, no Redux | accepted |
| [0003](0003-forms-and-validation.md) | Forms & validation: React Hook Form + Zod | accepted |
| [0004](0004-client-data-layer.md) | Client data layer: query-key registry + invalidation map | accepted |
| [0005](0005-ui-states.md) | Four required UI states | accepted |
| [0006](0006-frontend-first-contracts.md) | Frontend-first contract authorship via `@umgccapstone/contracts` | accepted |

## Shared ADRs

Cross-repo decisions are authored once in `@umgccapstone/contracts` (`adr/shared/`) and mirrored
into [`docs/adr/shared/`](shared/) by `npm run adr:sync`. Do not hand-edit that folder; CI runs
`npm run adr:check` to detect drift. See [`shared/README.md`](shared/README.md) for the source/sync
details.

| ADR | Title | Status |
| --- | ----- | ------ |
| [0001](shared/0001-two-repo-contract-package.md) | Two repositories bridged by a versioned contract package | accepted |
| [0002](shared/0002-api-conventions-envelope-verbs.md) | REST conventions: response envelopes and verb semantics | accepted |
| [0003](shared/0003-firebase-bearer-auth.md) | Authentication via Firebase ID tokens (Bearer) | accepted |
| [0004](shared/0004-server-computed-derived-fields.md) | Derived/metric fields computed server-side only | accepted |
| [0005](shared/0005-single-sourced-enums-zod.md) | Single-sourced enums and Zod schemas in the contract package | accepted |
