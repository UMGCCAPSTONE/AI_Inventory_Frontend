# syntax=docker/dockerfile:1

# Multi-stage frontend image (T-23A). The `dev` stage runs the Vite dev server
# with hot reload for the local docker-compose; the `prod` stage builds the
# static bundle and serves it with nginx — the slim image the T-23 EC2 deploy
# compose runs. Same source, same base, so local matches prod.
#
# The prod image serves the built SPA and nginx reverse-proxies /api to the
# backend, so the browser talks to a single origin (no CORS) — build it with
# VITE_API_BASE_URL=/api. Native `npm run dev` instead calls the backend
# cross-origin (VITE_API_BASE_URL=http://localhost:3000/api) and relies on the
# backend's CORS_ORIGIN; see README. VITE_* vars are inlined at build time.

# ---- base: install deps for the client workspace ------------------------------
FROM node:22-bookworm-slim AS base
WORKDIR /app/client
# client/.npmrc points the @umgccapstone scope at GitHub Packages; the auth token
# is supplied at build time as a BuildKit SECRET (never baked into a layer) so
# `npm ci` can fetch the private @umgccapstone/contracts. Provide it with:
#   docker build --secret id=gh_token,env=GH_PKG_TOKEN ...
# or via the compose `build.secrets` on the frontend service (T-23). The token is
# written to a throwaway ~/.npmrc inside this single RUN and removed on success,
# so it lives only in the secret mount, never in the image.
COPY client/package*.json client/.npmrc ./
RUN --mount=type=secret,id=gh_token,required=true sh -c '\
      echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/gh_token)" > ~/.npmrc && \
      npm ci && \
      rm -f ~/.npmrc'

# ---- dev: Vite dev server + hot reload ----------------------------------------
FROM base AS dev
COPY client/ ./
EXPOSE 5173
# --host binds 0.0.0.0 so the server is reachable from outside the container.
CMD ["npm", "run", "dev", "--", "--host"]

# ---- build: type-check + bundle to dist/ --------------------------------------
FROM base AS build
ARG VITE_API_BASE_URL
# Firebase web config (PUBLIC client identifiers, not secrets) — Vite inlines these
# into the bundle at build time so the SPA renders the Google login wall (all four
# required; App.tsx gates on them). Passed as build args by the prod compose (T-23),
# sourced from GitHub repo variables via deploy.yml. Absent -> the app builds
# login-less (isFirebaseConfigured=false), a safe default. VITE_* vars are inlined,
# never runtime — same as VITE_API_BASE_URL above.
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_APP_ID
COPY client/ ./
RUN npm run build

# ---- prod: static bundle served by nginx, with an API reverse-proxy -----------
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/client/dist /usr/share/nginx/html
# nginx's entrypoint runs envsubst on templates at startup, baking
# ${BACKEND_ORIGIN} into the served config. Default targets the compose/deploy
# service name; override at runtime (e.g. host.docker.internal for a host API).
ENV BACKEND_ORIGIN=http://backend:3000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
# Liveness probe: nginx is up and serving. Hits the same /health the deploy
# compose/LB uses; wget ships in the alpine base. Readiness (/health/ready) is
# checked by the orchestrator, not here — a container is either serving or not.
# Use 127.0.0.1, NOT localhost: nginx listens on IPv4 only, but `localhost`
# resolves to IPv6 ::1 first in the alpine image, so wget would be refused and
# the container would wrongly report unhealthy.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/health || exit 1
