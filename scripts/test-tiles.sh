#!/bin/bash

# Test tile services for Disaster Response Dashboard

echo "🧪 Testing Tile Services..."
echo "==========================="

# Test tile server health
echo "Testing Tileserver-GL health..."
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    echo "✅ Tileserver-GL is healthy"
else
    echo "❌ Tileserver-GL is not responding"
    exit 1
fi

# Test tile endpoints
echo "Testing tile endpoints..."
endpoints=(
    "/data/admin_boundaries.json"
    "/data/california_counties.json"
    "/data/hazards.json"
    "/data/routes.json"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f "http://localhost:8080$endpoint" > /dev/null 2>&1; then
        echo "✅ $endpoint is accessible"
    else
        echo "❌ $endpoint is not accessible"
    fi
done

# Test PMTiles server if running
if curl -f http://localhost:8081/ > /dev/null 2>&1; then
    echo "✅ PMTiles server is accessible"
    
    pmtiles_files=(
        "/admin_boundaries.pmtiles"
        "/california_counties.pmtiles"
        "/hazards.pmtiles"
        "/routes.pmtiles"
    )
    
    for file in "${pmtiles_files[@]}"; do
        if curl -f "http://localhost:8081$file" > /dev/null 2>&1; then
            echo "✅ $file is accessible"
        else
            echo "❌ $file is not accessible"
        fi
    done
else
    echo "ℹ️  PMTiles server not running (use --pmtiles flag to start)"
fi

echo ""
echo "🎉 Tile testing complete!"
