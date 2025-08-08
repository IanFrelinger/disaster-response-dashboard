#!/bin/bash

echo "🚀 Starting Disaster Response Dashboard Demo"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Build and start backend
echo "🔧 Building backend Docker image..."
cd backend
docker build -t disaster-response-backend . > /dev/null 2>&1

echo "🐳 Starting backend container..."
docker stop disaster-backend 2>/dev/null || true
docker rm disaster-backend 2>/dev/null || true
docker run -d --name disaster-backend -p 5001:5000 disaster-response-backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Test backend
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:5001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "🌐 Starting frontend..."
cd ../frontend
npm run dev:demo &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Demo is ready!"
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5001"
echo "🏥 Health Check: http://localhost:5001/api/health"
echo ""
echo "Press Ctrl+C to stop the demo"

# Wait for user to stop
trap "echo ''; echo '🛑 Stopping demo...'; docker stop disaster-backend; kill $FRONTEND_PID 2>/dev/null; echo '✅ Demo stopped'; exit 0" INT
wait 