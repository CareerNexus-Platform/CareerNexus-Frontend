# CareerNexus Frontend — Docker Deployment Guide

## Overview

The frontend is a React + Vite single-page application served by **nginx** inside a Docker container. The image is built with a **multi-stage Dockerfile**:

| Stage | Base image | Purpose |
|-------|-----------|---------|
| `build` | `node:20-alpine` | Install deps, compile Vite bundle |
| `production` | `nginx:alpine` | Serve compiled static files |

---

## How Vite Environment Variables Work

> [!IMPORTANT]
> Vite **bakes** `VITE_*` variables into the static JavaScript bundle **at build time**. They are **not** injected at container runtime. The running nginx container has no awareness of them.

### Variables used by this project

| Variable | Description |
|----------|-------------|
| `VITE_APP_BACKEND_HOST` | Full URL of the backend API, e.g. `https://api.careernexus.com` |
| `VITE_APP_BACKEND_PORT` | Port of the backend (leave blank if using standard 80/443) |

---

## Building Locally

### 1. Basic build (development defaults)

```bash
docker build -t careernexus-frontend .
```

### 2. Production build — passing env vars at build time

```bash
docker build \
  --build-arg VITE_APP_BACKEND_HOST=https://api.careernexus.com \
  --build-arg VITE_APP_BACKEND_PORT=443 \
  -t careernexus-frontend:latest .
```

> [!NOTE]
> You must supply `--build-arg` for every `VITE_*` variable your app reads. Omitting one leaves it as an empty string in the bundle.

### 3. Run the container locally

```bash
docker run -p 8080:80 careernexus-frontend:latest
# → App available at http://localhost:8080
```

---

## Deploying to Render

### Service type
Choose **Web Service → Docker** when creating the service in Render.

### Environment variables on Render

Because Vite bakes vars at build time, Render must inject them as **build arguments**, not runtime env vars.

1. In the Render dashboard, open your frontend service → **Environment**.
2. Add each variable:

   | Key | Example value |
   |-----|--------------|
   | `VITE_APP_BACKEND_HOST` | `https://careernexus-backend.onrender.com` |
   | `VITE_APP_BACKEND_PORT` | *(leave blank — Render backend listens on 443)* |

3. In **Settings → Docker Build Args**, map the same keys so Render passes them as `--build-arg` to the Docker build:

   ```
   VITE_APP_BACKEND_HOST=$VITE_APP_BACKEND_HOST
   VITE_APP_BACKEND_PORT=$VITE_APP_BACKEND_PORT
   ```

### Port configuration

| Setting | Value |
|---------|-------|
| nginx listen port (inside container) | **80** |
| Render "Port" field | **80** |

Render automatically routes HTTPS traffic → port 80 inside the container. No extra configuration needed.

---

## nginx Configuration Highlights

The custom [`nginx.conf`](./nginx.conf) includes:

- ✅ **SPA routing** — `try_files $uri $uri/ /index.html` ensures React Router handles all client-side routes.
- ✅ **Gzip compression** — reduces bundle transfer size by ~70%.
- ✅ **Long-term caching** — JS/CSS/font/image assets get `Cache-Control: public, immutable` with a 1-year expiry (Vite content-hashes filenames, so this is safe).
- ✅ **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.

---

## Quick Reference

```bash
# Build with production API URL
docker build \
  --build-arg VITE_APP_BACKEND_HOST=https://api.careernexus.com \
  -t careernexus-frontend:prod .

# Run locally
docker run --rm -p 8080:80 careernexus-frontend:prod

# Verify the app is served
curl -I http://localhost:8080
```

