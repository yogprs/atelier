# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22.23.3

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION}-bookworm-slim AS build

WORKDIR /app
ENV CI=true

RUN npm install --global pnpm@11.25.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_API_ORIGIN
ARG VITE_DEFAULT_TIMEOUT=15000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_API_ORIGIN=${VITE_API_ORIGIN} \
    VITE_DEFAULT_TIMEOUT=${VITE_DEFAULT_TIMEOUT}

# Vite inlines these values into the bundle. Fail the build instead of
# publishing an image that silently points at localhost.
RUN test -n "$VITE_API_BASE_URL" \
 && test -n "$VITE_API_ORIGIN" \
 && pnpm build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1
