# Use Python image with numpy pre-installed to avoid compilation issues
FROM python:3.11

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    curl \
    build-essential \
    libspatialindex-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* /var/tmp/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --timeout=300 --retries=3 \
        --prefer-binary \
        -r requirements.txt

# Install additional dependencies for street data processing
RUN pip install --no-cache-dir \
    geopandas \
    shapely \
    fiona \
    pyproj \
    rtree \
    networkx \
    osmnx

# Copy backend code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV PYTHONPATH=/app
ENV FLASK_APP=run_synthetic_api.py
ENV FLASK_ENV=production

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the application
CMD ["python", "run_synthetic_api.py"] 