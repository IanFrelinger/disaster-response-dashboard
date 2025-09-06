#!/bin/sh

# Production startup script for Disaster Response Dashboard
# Starts both frontend (nginx) and backend (Python) services

set -e

echo "🚀 Starting Disaster Response Dashboard Production Services..."

# Function to handle shutdown gracefully
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$NGINX_PID" ]; then
        kill $NGINX_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup TERM INT

# Start backend service
echo "🐍 Starting backend service..."
cd /app/backend
python3 run_synthetic_api.py &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
i=1
while [ $i -le 30 ]; do
    if curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
    i=$((i + 1))
done

# Start nginx (frontend)
echo "🌐 Starting nginx (frontend)..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to be ready..."
i=1
while [ $i -le 10 ]; do
    if curl -f http://localhost/health >/dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Frontend failed to start within 10 seconds"
        exit 1
    fi
    sleep 1
    i=$((i + 1))
done

echo "🎉 All services are running!"
echo "📊 Frontend: http://localhost:80"
echo "🔧 Backend API: http://localhost:8000"
echo "❤️  Health Check: http://localhost/health"

# Monitor services
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend process died, restarting..."
        cd /app/backend
        python3 run_synthetic_api.py &
        BACKEND_PID=$!
    fi
    
    # Check if nginx is still running
    if ! kill -0 $NGINX_PID 2>/dev/null; then
        echo "❌ Nginx process died, restarting..."
        nginx -g "daemon off;" &
        NGINX_PID=$!
    fi
    
    sleep 5
done
