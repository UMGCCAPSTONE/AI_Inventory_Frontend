# syntax=docker/dockerfile:1

# Multi-stage frontend image (T-23A). The `dev` stage runs the Vite dev server
# with hot reload for the local docker-compose; the `prod` stage builds the
# static bundle and serves it with nginx — the slim image the T-23 EC2 deploy
# compose runs. Same source, same base, so local matches prod.
#
# This is a plain SPA: the browser talks to the backend API directly. The API
# base URL is injected at build time via VITE_API_BASE_URL (Vite inlines
# VITE_* vars into the bundle), so there is no server-side proxy here.

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
