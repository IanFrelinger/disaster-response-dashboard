# Video Production Environment for Disaster Response Dashboard
# Multi-stage build for optimal size and functionality

FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    git \
    bash \
    curl \
    wget \
    unzip \
    build-base \
    gcc \
    g++ \
    make \
    cmake \
    pkgconfig \
    freetype-dev \
    libpng-dev \
    jpeg-dev \
    pixman-dev \
    cairo-dev \
    pango-dev \
    && rm -rf /var/cache/apk/*

# Install additional Python packages for video processing
RUN pip3 install --no-cache-dir --break-system-packages \
    numpy \
    pillow \
    moviepy \
    imageio \
    imageio-ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p output temp assets

# Set permissions
RUN chmod +x scripts/*.js

# Development stage with additional tools
FROM base AS development

# Install development dependencies
RUN npm ci

# Install additional development tools
RUN apk add --no-cache \
    vim \
    nano \
    htop \
    && rm -rf /var/cache/apk/*

# Install additional Python packages for development
RUN pip3 install --no-cache-dir --break-system-packages \
    pytest \
    pytest-cov \
    black \
    flake8

# Production stage (minimal)
FROM base AS production

# Remove development files
RUN rm -rf node_modules/.cache \
    && rm -rf temp/* \
    && rm -rf .git

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port for web interface (if needed)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('Video production environment is healthy')" || exit 1

# Default command
CMD ["npm", "run", "dev"]
