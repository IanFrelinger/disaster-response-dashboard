# Disaster Response Dashboard - Friends Demo
# Simple Dockerfile for AWS App Runner deployment

# Use multi-stage build for efficiency
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    curl \
    nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-builder /app/backend ./backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy tiles
COPY tiles/ ./tiles/

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV FLASK_APP=run_synthetic_api.py
ENV FLASK_ENV=production
ENV ENVIRONMENT_MODE=demo
ENV USE_SYNTHETIC_DATA=true

# Copy startup script
COPY --chown=appuser:appuser tools/deployment/start-friends-demo.sh ./start.sh
RUN chmod +x ./start.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start the application
CMD ["./start.sh"]
