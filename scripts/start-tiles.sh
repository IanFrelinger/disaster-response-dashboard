#!/bin/bash

# Start tile services for Disaster Response Dashboard

echo "🗺️  Starting Tile Services..."
echo "=============================="

# Check if tiles exist
if [ ! -f "./tiles/admin_boundaries.mbtiles" ]; then
    echo "❌ Tiles not found. Run setup-mock-tiles.sh first."
    exit 1
fi

# Start tile server
echo "Starting Tileserver-GL..."
docker-compose -f docker-compose.tiles.yml up -d tileserver

# Optional: Start PMTiles server
if [ "$1" = "--pmtiles" ]; then
    echo "Starting PMTiles server..."
    docker-compose -f docker-compose.tiles.yml --profile pmtiles up -d pmtiles-server
fi

echo ""
echo "✅ Tile services started!"
echo "📊 Tileserver-GL: http://localhost:8080"
if [ "$1" = "--pmtiles" ]; then
    echo "📁 PMTiles server: http://localhost:8081"
fi
echo ""
echo "🔧 To view tiles in browser:"
echo "   http://localhost:8080/"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.tiles.yml down"
