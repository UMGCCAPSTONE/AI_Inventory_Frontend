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

Cross-repo ADRs are authored elsewhere and mirrored into `docs/adr/shared/` by
`npm run adr:sync`. Do not hand-edit that folder; CI runs `npm run adr:check` to detect drift.
