# Onboarding / grader-simulation notes — frontend README work

> ⚠️ **Working notes — DELETE this file before merging to `dev`.** It exists only to carry
> context on the `docs/frontend-readme-onboarding` branch so the work can be revisited.
> A mirror copy lives outside the repo at `C:\dev\_UMGC_refresh_backup\` in case this
> branch is local-only and the repo gets refreshed again.

## Status (2026-06-27)
- Branch `docs/frontend-readme-onboarding` off `dev` @ `d60f79f`. **Not pushed, no PR** — parked for later.
- **May be abandoned** if another engineer picks up the frontend README first (team text 2026-06-27:
  "I'll update backend README in my PR if anybody else wants to take a stab at the frontend").
- **Backend README is owned by a teammate's PR — do NOT touch it here.**

## Why this branch exists
Ran a full clean-room "grader simulation": deleted the local `C:\dev\UMGC_Capstone`, recloned all 4
repos fresh, and stood up the stack following only the committed docs — to find where a new user (grader)
trips. The stack runs; the friction is in branch selection and one auth-command portability gap.

## Clean-room result — the stack DOES run (on `dev`)
| Repo | Steps | Time | Edits needed |
|---|---|---|---|
| Backend | `npm install` → `cp .env.example .env` → `npm run dev:up` → `npm run prisma:migrate` → `npm run db:seed` | ~2 min | **none** (defaults work locally) |
| Frontend | gh auth (`read:packages`) → `npm install` → `cp .env.example .env.local` → `npm run dev` | ~1 min | **none** (if you have a token) |

- Backend `dev:up` was healthy on the **first** try (README warns of a possible cold-start retry — didn't happen).
- Seed loaded: 3 suppliers, 15 inventory items, 4 menu items, 4 recommendations, 3 users.
- CORS verified: backend returns `Access-Control-Allow-Origin: http://localhost:5173`.
- Backend local needs **zero** `.env` edits: empty `FIREBASE_PROJECT_ID` = auth passthrough; empty AWS = rule-based fallback.

## Friction findings (ranked)
1. **🔴 Branch trap (most severe).** `git clone` lands on `main`, which is 9–11 commits behind `dev`.
   `main`'s README never mentions `dev`, tells you to branch off `main`, and shows an early-foundation
   state ("models land in T-11"). A grader on `main` can't run the finished app.
   **Fix path chosen: sync `dev`→`main` before grading** (team plans this by Tuesday) — this removes the
   trap entirely and is better than a "checkout dev" banner. Banner is only a fallback if the sync slips.
2. **🟡 Frontend needs a GitHub `read:packages` token.** `@umgccapstone/contracts` is a private GitHub
   Packages dep, so `client/` `npm install` 401s without auth — even though the repos are public.
   Backend is immune (builds contracts from the workspace). Documented, but a hard external dependency.
   **README gap fixed on this branch:** the auth command only had a `$(...)` shell form (fails in `cmd.exe`);
   added a copy/paste fallback + noted PAT option.
3. **🟢 Minor:** backend README "fill in the values afterward" oversells local setup — defaults work as-is
   (a backend-repo nit, owned by the teammate's PR; not changed here).

## dev→main sync reconciliation (for the Tuesday sync — applies to the 2 CODE repos only)
- **Frontend:** clean — `dev` 11 ahead, 0 main-only commits → trivial fast-forward.
- **Backend:** `dev` 9 ahead but `main` has **1 commit not on dev** (#46, T-25 Bedrock model-id). Do a real
  `git checkout main && git merge dev` (NOT a reset/force). Expect **one conflict in `.env.example`**:
  - `main` (#46): `BEDROCK_MODEL_ID=anthropic.claude-opus-4-5-20251101-v1:0`
  - `dev`: `BEDROCK_MODEL_ID=us.anthropic.claude-opus-4-5-20251101-v1:0`  ← **keep this one** (cross-region
    inference profile form Bedrock requires).
- **CourseDeliverables / Documentations:** no `origin/dev` branch — they deliver on `main`/doc branch
  directly. "sync dev to main" does NOT apply to them; don't let them get mishandled.

## What this branch changes (frontend README)
1. Added a **⚡ Quickstart** TL;DR (happy-path commands) with a "start the backend first / empty states are
   expected" note.
2. Fixed the **GitHub Packages auth** block to work in `cmd.exe` / without `gh` (paste-the-token fallback + PAT note).

## If revisited — further ideas (not yet done)
- Consider a one-line "backend must be running" callout near the top of the Run section (partially covered by Quickstart now).
- Decide whether the `read:packages` gate is acceptable for graders, or whether to publish contracts publicly
  / vendor them — that's a team decision, bigger than a README edit.
- A separate (unrelated) thread: a **500 error** was seen on one expected function on `dev` *before* the repo
  refresh — needs reproduction against the freshly-running stack; not a README issue.
