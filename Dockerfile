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
COPY client/package*.json ./
RUN npm ci

# ---- dev: Vite dev server + hot reload ----------------------------------------
FROM base AS dev
COPY client/ ./
EXPOSE 5173
# --host binds 0.0.0.0 so the server is reachable from outside the container.
CMD ["npm", "run", "dev", "--", "--host"]

# ---- build: type-check + bundle to dist/ --------------------------------------
FROM base AS build
ARG VITE_API_BASE_URL
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
