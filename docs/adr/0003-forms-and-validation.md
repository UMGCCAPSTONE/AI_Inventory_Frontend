# 0003. Forms & validation: React Hook Form + Zod consuming shared schemas

* Status: accepted
* Date: 2026-06-07
* Deciders: Frontend Lead (Spencer Renfro); doc coordination by Asst PM (Robert Lee)

## Context and Problem Statement

Several tickets add forms (inventory add/edit, supplier add/edit, auth). We need controlled,
accessible forms with clear, specific validation that does not let invalid data reach the
backend — and we want validation to agree with the backend's rules rather than drift from them.

## Decision Drivers

* Validation must match the backend contract to avoid client/server drift.
* Good accessibility and UX (per-field errors, required-field indication).
* Minimal re-renders and boilerplate.
* TypeScript types inferred from the same source as validation.

## Considered Options

* **React Hook Form + Zod**, with Zod schemas exported from `@umgccapstone/contracts`
* **Formik + Yup**
* **Uncontrolled/native forms + hand-written validation**

## Decision Outcome

Chosen option: **React Hook Form + Zod consuming shared schemas**, because RHF gives
performant, accessible forms and Zod lets the frontend validate against the *same* schemas the
contract publishes (see ADR 0006) — types and validation come from one source, so client rules
can't silently diverge from the backend.

### Consequences

* Good, because one schema yields both runtime validation and inferred TS types; no duplicated
  rules.
* Good, because RHF minimizes re-renders and integrates Zod via a resolver.
* Bad, because it depends on the shared contract exporting Zod schemas; until that package is
  published, forms validate against locally mirrored schemas (interim, see ADR 0006).
* Note: not installed in T-0 — recorded here; forms arrive with their feature tickets.

## Pros and Cons of the Options

### React Hook Form + Zod (shared schemas)

* Good, because performant, accessible, and schema-driven types + validation from one source.
* Bad, because couples forms to the contract package's schema exports.

### Formik + Yup

* Good, because widely used and approachable.
* Bad, because more re-renders than RHF; Yup types are weaker and not our contract format.

### Native forms + hand-written validation

* Good, because zero dependencies.
* Bad, because error-prone, more code, and easy to drift from backend rules.
