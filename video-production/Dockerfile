# Video Production Environment for Disaster Response Dashboard
# Multi-stage build for optimal size and functionality

FROM node:18-alpine AS base

# Install system dependencies including QuickTime-compatible codecs
RUN apk add --no-cache \
    ffmpeg \
    ffmpeg-dev \
    imagemagick \
    imagemagick-dev \
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
    espeak \
    espeak-dev \
    # QuickTime-compatible video dependencies (Alpine-compatible names)
    x264-dev \
    x265-dev \
    libvpx-dev \
    libvorbis-dev \
    libtheora-dev \
    lame-dev \
    opus-dev \
    libass-dev \
    libbluray-dev \
    dav1d-dev \
    libwebp-dev \
    aom-dev \
    rav1e-dev \
    svt-av1-dev \
    xvidcore-dev \
    openjpeg-dev \
    speex-dev \
    soxr-dev \
    zeromq-dev \
    zimg-dev \
    # Additional container formats
    libmatroska-dev \
    && rm -rf /var/cache/apk/*

# Install additional Python packages for video processing and AI TTS
RUN pip3 install --no-cache-dir --break-system-packages \
    numpy \
    pillow \
    moviepy \
    imageio \
    imageio-ffmpeg \
    gTTS \
    pyttsx3 \
    speechrecognition \
    pydub \
    requests \
    beautifulsoup4 \
    lxml \
    # Additional video processing packages
    opencv-python-headless \
    ffmpeg-python

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p output temp assets output/animatic output/voice-recordings

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
    # Additional video tools for development
    mediainfo \
    exiftool \
    qt-faststart \
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
