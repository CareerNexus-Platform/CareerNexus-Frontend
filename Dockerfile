# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_APP_BACKEND_HOST
ARG VITE_APP_BACKEND_PORT

# Set environment variables for Vite build process
ENV VITE_APP_BACKEND_HOST=$VITE_APP_BACKEND_HOST
ENV VITE_APP_BACKEND_PORT=$VITE_APP_BACKEND_PORT

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
