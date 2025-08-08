#!/bin/bash

echo "🚀 Starting Disaster Response Dashboard..."
echo "=========================================="

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "python.*synthetic_api" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend in background
echo "🔧 Starting backend API server..."
cd backend
nohup python run_synthetic_api.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
echo "🧪 Testing backend..."
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:5001"
else
    echo "⚠️  Backend may not be fully started yet, but continuing..."
fi

# Start frontend in background
echo "🎨 Starting frontend development server..."
cd frontend
nohup npm run dev:demo > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 8

# Test frontend
echo "🧪 Testing frontend..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "⚠️  Frontend may not be fully started yet, but continuing..."
fi

echo ""
echo "🎉 Dashboard Setup Complete!"
echo "============================"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "🏥 Health Check: http://localhost:5001/api/health"
echo "📖 API Info: http://localhost:5001/api/info"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop: pkill -f 'python.*synthetic_api' && pkill -f 'vite'"
echo ""

# Save PIDs for easy cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "Dashboard is ready! Open http://localhost:3000 in your browser." 