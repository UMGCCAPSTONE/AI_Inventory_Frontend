# 0003. Forms via React Hook Form + Zod, consuming the shared contract schemas

**Status:** Accepted
**Date:** 2026-06-12

## Context & Problem Statement
Inventory items, suppliers, menu actions, and auth all need forms whose validation rules must match what the backend accepts. Shared ADR [0005](./shared/0005-single-sourced-enums-zod.md) single-sources the Zod schemas and enums in `@umgccapstone/contracts`; the frontend needs a form layer that consumes them rather than restating the rules.

## Considered Options
- **(A) React Hook Form + `zodResolver`, wired to the schemas from `@umgccapstone/contracts`.**
- **(B) Hand-rolled controlled inputs with bespoke validation functions.**
- **(C) Formik + Yup.**

## Decision Outcome
Chosen option: **(A).** Forms are built with React Hook Form and validated through `@hookform/resolvers/zod` using the exact schema objects exported by the contract package. Field-level error messages come from the schema; forms do not submit payloads the schema rejects.

Chosen because reusing the published schema objects makes client/server validation drift impossible (B and C both restate the rules), and React Hook Form keeps re-renders low on data-entry-heavy screens.

## Consequences
- **Good:** one validation definition for client, server, and DB; specific per-field errors; invalid payloads never reach the API.
- **Bad:** adds `react-hook-form` + resolver dependencies; contributors must learn its register/controller model.
- **Neutral:** schemas arrive via the pinned contracts package, so validation changes ship as a deliberate version bump.
