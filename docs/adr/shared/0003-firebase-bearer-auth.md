<!-- SYNCED COPY — do not edit here. The canonical version ships inside the @umgccapstone/contracts package (authored in the backend repo under packages/contracts/adr/shared/). Run `npm run adr:sync` after bumping the package. -->

# 0003 (shared). Authentication via Firebase ID tokens (Bearer)

**Status:** Accepted
**Date:** 2026-06-08

## Context & Problem Statement

Users must log in, and the backend must verify identity on protected routes. We need an auth mechanism that's quick to build for a capstone and works cleanly across the two repos.

## Considered Options

- **(A) Firebase Auth (Google Sign-In)** — client signs in with Firebase; backend verifies the Firebase ID token with `firebase-admin`.
- **(B) Custom email/password + JWT** — build and store credentials ourselves.
- **(C) Full SSO/SAML.**

## Decision Outcome

Chosen option: **(A).** The client authenticates with Firebase (Google Sign-In) and sends the Firebase ID token as `Authorization: Bearer`. The backend verifies it with `firebase-admin`; missing or invalid tokens return **401**. Email/password and SSO beyond Google are out of MVP scope.

Chosen because it avoids building and securing our own credential store, uses a battle-tested provider, and is fast to integrate — appropriate for the MVP timeline.

## Consequences

- **Good:** no password storage/management; proven provider; quick to ship.
- **Bad:** a dependency on Firebase config/secrets; Google-only sign-in for the MVP.
- **Neutral:** the token feeds the frontend data-layer client (T-34), which attaches it to every request and re-authenticates on 401.
