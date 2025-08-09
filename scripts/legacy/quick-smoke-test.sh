#!/bin/bash

# Quick Smoke Test for Disaster Response Dashboard
# This script performs basic connectivity tests

echo "🧪 Quick Smoke Test - Disaster Response Dashboard"
echo "================================================"

# Test frontend
echo -n "Testing frontend (localhost:3000)... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test backend
echo -n "Testing backend (localhost:5001)... "
if curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test Mapbox token
echo -n "Testing Mapbox token... "
TOKEN="pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw"
if curl -s "https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=$TOKEN&limit=1" | grep -q "features" 2>/dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test tile server
echo -n "Testing tile server... "
if curl -s http://localhost:5001/tiles/california_counties/0/0/0.pbf > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo
echo "Quick test complete! Run './scripts/comprehensive-smoke-test.sh' for detailed testing."
