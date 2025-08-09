#!/bin/bash

echo "🚀 Disaster Response Dashboard - System Validation"
echo "=================================================="
echo

# Test frontend
echo "Testing Frontend (http://localhost:3000)..."
if curl -s http://localhost:3000 | grep -q "Vite + React"; then
    echo "✅ Frontend is loading correctly"
else
    echo "❌ Frontend is not loading correctly"
fi
echo

# Test backend health
echo "Testing Backend Health (http://localhost:5001/api/health)..."
HEALTH_RESPONSE=$(curl -s http://localhost:5001/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo "✅ Backend is healthy"
    echo "   Status: $(echo "$HEALTH_RESPONSE" | jq -r '.status')"
    echo "   Version: $(echo "$HEALTH_RESPONSE" | jq -r '.version')"
else
    echo "❌ Backend health check failed"
fi
echo

# Test disaster data API
echo "Testing Disaster Data API (http://localhost:5001/api/disaster-data)..."
DISASTER_RESPONSE=$(curl -s http://localhost:5001/api/disaster-data)
if echo "$DISASTER_RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ Disaster data API is working"
    HAZARDS=$(echo "$DISASTER_RESPONSE" | jq '.data.hazards | length')
    ROUTES=$(echo "$DISASTER_RESPONSE" | jq '.data.routes | length')
    RESOURCES=$(echo "$DISASTER_RESPONSE" | jq '.data.resources | length')
    echo "   Hazards: $HAZARDS"
    echo "   Routes: $ROUTES"
    echo "   Resources: $RESOURCES"
else
    echo "❌ Disaster data API failed"
fi
echo

# Test Mapbox token
echo "Testing Mapbox Token..."
TOKEN="pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw"
MAPBOX_RESPONSE=$(curl -s "https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=$TOKEN&limit=1")
if echo "$MAPBOX_RESPONSE" | jq -e '.features' > /dev/null; then
    echo "✅ Mapbox token is valid"
else
    echo "❌ Mapbox token is invalid"
fi
echo

# Test tile server
echo "Testing Tile Server..."
if curl -s -I http://localhost:5001/tiles/california_counties/0/0/0.pbf | head -1 | grep -q "200\|404"; then
    echo "✅ Tile server is responding"
else
    echo "❌ Tile server is not responding"
fi
echo

echo "🎉 System validation complete!"
echo
echo "Access your dashboard at: http://localhost:3000"
echo "API documentation at: http://localhost:5001/api/health"
