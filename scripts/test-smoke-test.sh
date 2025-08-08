#!/bin/bash

# Tactical Map Smoke Test Verification Script
echo "🚀 Tactical Map Smoke Test Verification"
echo "======================================"

# Check if development server is running
echo "📡 Checking development server status..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Development server is running on http://localhost:3000"
else
    echo "❌ Development server is not running"
    echo "   Please start with: cd frontend && npm run dev"
    exit 1
fi

# Test smoke test route
echo "🧪 Testing smoke test route..."
if curl -s http://localhost:3000/smoke-test | grep -q "Tactical Map Smoke Test"; then
    echo "✅ Smoke test route is accessible"
else
    echo "❌ Smoke test route not found or not loading properly"
fi

# Test tactical test route
echo "🎯 Testing tactical test route..."
if curl -s http://localhost:3000/tactical-test | grep -q "Tactical Map Test"; then
    echo "✅ Tactical test route is accessible"
else
    echo "❌ Tactical test route not found or not loading properly"
fi

# Test command view route
echo "🏢 Testing command view route..."
if curl -s http://localhost:3000/command | grep -q "Command View"; then
    echo "✅ Command view route is accessible"
else
    echo "❌ Command view route not found or not loading properly"
fi

echo ""
echo "🎉 Smoke Test Verification Complete!"
echo ""
echo "📋 Manual Testing Instructions:"
echo "1. Open browser and navigate to: http://localhost:3000/smoke-test"
echo "2. Click 'Run Tests' button in the top-right corner"
echo "3. Verify all test results show ✅ (pass)"
echo "4. Test manual interactions:"
echo "   - Mouse wheel zoom"
echo "   - Click and drag pan"
echo "   - Hover over map features"
echo "   - Right-click for context menus"
echo "   - Toggle layer controls"
echo "   - Adjust map settings"
echo ""
echo "🔗 Available Test Routes:"
echo "   • http://localhost:3000/smoke-test (Comprehensive test)"
echo "   • http://localhost:3000/tactical-test (Basic test)"
echo "   • http://localhost:3000/command (Integration test)"
echo ""
echo "📊 Mock Data Loaded:"
echo "   • 4 Emergency Units (Fire, Police, Medical, Rescue)"
echo "   • 3 Hazard Zones (Fire, Flood, Chemical)"
echo "   • 2 Evacuation Routes (Primary, Secondary)"
echo ""
