# =============================================================================
# CareerNexus Frontend — Multi-stage Dockerfile
# =============================================================================
#
# IMPORTANT — Vite Environment Variables:
# Vite bakes VITE_* env vars into the static bundle at BUILD time.
# They are NOT available at runtime via the container environment.
# Pass them as --build-arg flags during `docker build`:
#
#   docker build \
#     --build-arg VITE_APP_BACKEND_HOST=https://api.example.com \
#     --build-arg VITE_APP_BACKEND_PORT=443 \
#     -t careernexus-frontend .
#
# See DOCKER_DEPLOY.md for full deployment instructions.
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1 — Build (Node 20 Alpine)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# ------ Declare build-time variables (Vite bakes these into the bundle) -----
ARG VITE_APP_BACKEND_HOST
ARG VITE_APP_BACKEND_PORT

# Expose them to the Vite build process as environment variables
ENV VITE_APP_BACKEND_HOST=$VITE_APP_BACKEND_HOST
ENV VITE_APP_BACKEND_PORT=$VITE_APP_BACKEND_PORT

# ------ Dependency install (cached layer — only re-runs when package*.json changes) -----
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ------ Copy source & build -----
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — Serve (nginx Alpine)
# ---------------------------------------------------------------------------
FROM nginx:alpine AS production

# Remove the default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled Vite output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom nginx config (SPA routing + gzip + security headers)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
