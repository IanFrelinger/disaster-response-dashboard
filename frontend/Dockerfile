# Multi-stage build for production-ready frontend container
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_MAPBOX_ACCESS_TOKEN
ARG VITE_MAPBOX_STYLE_URL
ARG VITE_API_BASE_URL
ARG VITE_DEBUG_MODE
ARG VITE_BUILD_ENV
ARG REACT_APP_API_URL
ARG REACT_APP_MAPBOX_TOKEN

# Set environment variables for the build stage
ENV VITE_MAPBOX_ACCESS_TOKEN=$VITE_MAPBOX_ACCESS_TOKEN
ENV VITE_MAPBOX_STYLE_URL=$VITE_MAPBOX_STYLE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_DEBUG_MODE=$VITE_DEBUG_MODE
ENV VITE_BUILD_ENV=$VITE_BUILD_ENV
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN

# Override production environment variables for local development
ENV VITE_API_BASE_URL=http://localhost:8000

# Install build dependencies only (minimal set needed for building)
COPY package.build.json ./package.json
COPY .npmrc.build ./.npmrc
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Install security updates and remove unnecessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application from build stage
COPY --from=base --chown=nextjs:nodejs /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create health check directory
RUN mkdir -p /usr/share/nginx/html/health && \
    echo "healthy" > /usr/share/nginx/html/health/index.html

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx

# Create nginx runtime directories with proper permissions
RUN mkdir -p /run /var/log/nginx && \
    chown -R nextjs:nodejs /run /var/log/nginx && \
    chmod -R 755 /run /var/log/nginx

# Set proper permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
