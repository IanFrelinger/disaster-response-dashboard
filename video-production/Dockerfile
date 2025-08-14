# Headless Video Pipeline Docker Image
# Includes Node.js, Python, FFmpeg, Playwright, and all video production tools

FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=18
ENV PYTHON_VERSION=3.11
ENV FFMPEG_VERSION=6.0

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Basic tools
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    \
    # Python dependencies
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    cmake \
    pkg-config \
    \
    # Audio/Video dependencies
    ffmpeg \
    libx264-dev \
    libx265-dev \
    libvpx-dev \
    libaom-dev \
    libfdk-aac-dev \
    libmp3lame-dev \
    libopus-dev \
    libvorbis-dev \
    libass-dev \
    libfreetype6-dev \
    libfontconfig1-dev \
    \
    # Browser dependencies for Playwright (comprehensive list)
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxss1 \
    libxtst6 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    \
    # Fonts for video rendering
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Install Python packages
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install Node.js dependencies
RUN pnpm install

# Install Playwright browsers with all dependencies as root
RUN npx playwright install --with-deps

# Install Playwright system dependencies explicitly
RUN npx playwright install-deps

# Create a non-root user
RUN useradd -m -s /bin/bash videoproducer

# Create necessary directories
RUN mkdir -p \
    captures \
    audio \
    subs \
    luts \
    out \
    scripts \
    voices

# Copy application files
COPY . .

# Make scripts executable
RUN chmod +x scripts/*.py scripts/*.js scripts/*.ts scripts/*.sh

# Set up environment
ENV NODE_ENV=production
ENV PYTHONPATH=/app
ENV PATH="/app/venv/bin:$PATH"

# Copy Playwright browsers from root cache to videoproducer cache
RUN mkdir -p /home/videoproducer/.cache && \
    cp -r /root/.cache/ms-playwright /home/videoproducer/.cache/ && \
    chown -R videoproducer:videoproducer /home/videoproducer/.cache

# Change ownership of all files to videoproducer
RUN chown -R videoproducer:videoproducer /app

# Switch to non-root user
USER videoproducer

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import yaml, openai; print('OK')" || exit 1

# Default command
CMD ["bash"]
