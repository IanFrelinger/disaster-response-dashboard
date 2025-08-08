FROM maptiler/tileserver-gl:latest

# Copy tiles and configuration
COPY . /data

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1
