#!/bin/bash

# Quick Validation Script for Disaster Response Dashboard
# Validates container status and tile integration

echo "🚀 Disaster Response Dashboard - Quick Validation"
echo "=================================================="
echo "Timestamp: $(date)"
echo ""

# Check if containers are running
echo "🔍 Checking Container Status..."
if docker-compose -f docker-compose.demo.yml ps | grep -q "Up"; then
    echo "✅ All containers are running"
else
    echo "❌ Some containers are not running"
    docker-compose -f docker-compose.demo.yml ps
    exit 1
fi

echo ""

# Check service health
echo "🏥 Checking Service Health..."

# Frontend
if curl -s -f http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend: Healthy (http://localhost:3000)"
else
    echo "❌ Frontend: Not responding"
fi

# Backend
if curl -s -f http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend: Healthy (http://localhost:5001)"
else
    echo "❌ Backend: Not responding"
fi

# Tile Server
if curl -s -f http://localhost:8080/data/admin_boundaries.json > /dev/null; then
    echo "✅ Tile Server: Healthy (http://localhost:8080)"
else
    echo "❌ Tile Server: Not responding"
fi

echo ""

# Quick tile validation
echo "🗺️ Validating Tile System..."

tile_layers=(
    "admin_boundaries"
    "california_counties"
    "hazards"
    "routes"
)

for layer in "${tile_layers[@]}"; do
    if curl -s -f "http://localhost:8080/data/${layer}.json" > /dev/null; then
        echo "✅ ${layer}: Available"
    else
        echo "❌ ${layer}: Not available"
    fi
done

echo ""

# Test tile serving
echo "🔍 Testing Tile Serving..."
test_tile="http://localhost:8080/data/admin_boundaries/8/40/98.pbf"
if curl -s -f "$test_tile" > /dev/null; then
    echo "✅ Test tile served successfully"
else
    echo "❌ Test tile not served"
fi

echo ""

# Summary
echo "📊 Quick Validation Summary"
echo "============================"
echo "Frontend: http://localhost:3000"
echo "  - Command View: http://localhost:3000/command"
echo "  - Field View: http://localhost:3000/field"
echo "  - Public View: http://localhost:3000/public"
echo ""
echo "Backend API: http://localhost:5001"
echo "Tile Server: http://localhost:8080"
echo ""

echo "🎉 Quick validation complete!"
echo "For detailed validation, run: python validate_tile_integration.py"
