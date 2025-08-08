#!/bin/bash

# 🍎 Simplified Disaster Response Dashboard Demo
# Quick start script for the take-home project

echo "🚀 Starting Simplified Disaster Response Dashboard Demo"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install flask flask-cors
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Start backend server
echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate
python simple_api.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:5001"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend server is running on http://localhost:5173"
else
    echo "❌ Frontend server failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Demo is ready!"
echo "=================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:5001"
echo ""
echo "📱 Available Views:"
echo "   • Public View: http://localhost:5173/public"
echo "   • Field View: http://localhost:5173/field"
echo "   • Command View: http://localhost:5173/command"
echo ""
echo "🔍 API Endpoints:"
echo "   • GET  /api/disaster-data - Main data endpoint"
echo "   • GET  /api/health - Health check"
echo "   • POST /api/update-resource-status - Update resource status"
echo "   • POST /api/add-alert - Add new alert"
echo ""
echo "💡 Features to demonstrate:"
echo "   • Apple-inspired design system"
echo "   • Composable component architecture"
echo "   • Real-time data updates"
echo "   • Interactive map with layer toggles"
echo "   • Resource status management"
echo "   • Alert system"
echo ""
echo "🛑 Press Ctrl+C to stop the demo"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping demo servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Demo stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait
