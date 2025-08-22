#!/bin/bash

# Disaster Response Dashboard - Friends Demo Startup Script
# This script starts both the backend API and serves the frontend

set -e

echo "🚀 Starting Disaster Response Dashboard - Friends Demo"
echo "======================================================"
echo "Timestamp: $(date)"
echo ""

# Function to start backend
start_backend() {
    echo "🔌 Starting backend API..."
    cd /app/backend
    
    # Start Flask backend in background
    python run_synthetic_api.py &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    echo "⏳ Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s -f http://localhost:8000/api/health > /dev/null 2>&1; then
            echo "✅ Backend is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Backend failed to start"
            exit 1
        fi
        sleep 2
    done
    
    cd /app
}

# Function to start tile server
start_tile_server() {
    echo "🗺️ Starting tile server..."
    
    # Simple tile server using Python HTTP server
    cd /app/tiles
    python -m http.server 8081 &
    TILE_PID=$!
    
    # Wait for tile server to be ready
    echo "⏳ Waiting for tile server to be ready..."
    for i in {1..30}; do
        if curl -s -f http://localhost:8081/ > /dev/null 2>&1; then
            echo "✅ Tile server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Tile server failed to start"
            exit 1
        fi
        sleep 2
    done
    
    cd /app
}

# Function to start frontend server
start_frontend() {
    echo "🎨 Starting frontend server..."
    
    # Create simple nginx config for frontend
    cat > /tmp/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 8080;
        server_name localhost;
        root /app/frontend/dist;
        index index.html;
        
        # Serve static files
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy to backend
        location /api/ {
            proxy_pass http://localhost:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Tile server proxy
        location /tiles/ {
            proxy_pass http://localhost:8081/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    # Start nginx with custom config
    nginx -c /tmp/nginx.conf -g "daemon off;" &
    NGINX_PID=$!
    
    # Wait for frontend to be ready
    echo "⏳ Waiting for frontend to be ready..."
    for i in {1..30}; do
        if curl -s -f http://localhost:8080/ > /dev/null 2>&1; then
            echo "✅ Frontend is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Frontend failed to start"
            exit 1
        fi
        sleep 2
    done
}

# Function to show service status
show_status() {
    echo ""
    echo "🎉 All services are running!"
    echo "============================="
    echo ""
    echo "🌐 Frontend: http://localhost:8080"
    echo "🔌 Backend API: http://localhost:8000"
    echo "🗺️ Tile Server: http://localhost:8081"
    echo "🏥 Health Check: http://localhost:8080/health"
    echo ""
    echo "📱 Your friends can access the app at:"
    echo "   http://localhost:8080"
    echo ""
    echo "🔧 Service PIDs:"
    echo "   Backend: $BACKEND_PID"
    echo "   Tile Server: $TILE_PID"
    echo "   Nginx: $NGINX_PID"
    echo ""
    echo "📊 Monitoring:"
    echo "   - Backend logs: Check container logs"
    echo "   - Frontend: Access via browser"
    echo "   - Health: curl http://localhost:8080/health"
    echo ""
    echo "🚀 Friends demo is ready!"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up services..."
    
    # Stop all background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$TILE_PID" ]; then
        kill $TILE_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$NGINX_PID" ]; then
        kill $NGINX_PID 2>/dev/null || true
    fi
    
    echo "✅ Cleanup complete"
}

# Set up cleanup trap
trap cleanup INT TERM EXIT

# Start all services
start_backend
start_tile_server
start_frontend

# Show status
show_status

# Keep the script running
echo "🔄 Keeping services running... (Press Ctrl+C to stop)"
echo ""

# Wait for any process to exit
wait
