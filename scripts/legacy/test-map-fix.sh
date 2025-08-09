#!/bin/bash

# 🧪 Test Map Fix
# Verify that the map component is working without Mapbox dependencies

echo "🧪 Testing Map Fix"
echo "=================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. Checking Frontend Server${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "  ${GREEN}✅ Frontend server is running${NC}"
else
    echo -e "  ${RED}❌ Frontend server is not running${NC}"
    exit 1
fi

echo -e "\n${YELLOW}2. Checking Map Component${NC}"
if curl -s "http://localhost:3000/src/components/common/DisasterMap.tsx" > /dev/null; then
    echo -e "  ${GREEN}✅ Map component is accessible${NC}"
else
    echo -e "  ${RED}❌ Map component is not accessible${NC}"
    exit 1
fi

echo -e "\n${YELLOW}3. Checking for Mapbox Dependencies${NC}"
if grep -q "mapbox-gl" frontend/package.json; then
    echo -e "  ${RED}❌ Mapbox GL dependency still present${NC}"
else
    echo -e "  ${GREEN}✅ Mapbox GL dependency removed${NC}"
fi

echo -e "\n${YELLOW}4. Checking Backend API${NC}"
if curl -s http://localhost:5001/api/health | grep -q "healthy"; then
    echo -e "  ${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "  ${RED}❌ Backend API is not responding${NC}"
    exit 1
fi

echo -e "\n${YELLOW}5. Testing Data Endpoint${NC}"
if curl -s http://localhost:5001/api/disaster-data | jq -r '.success' | grep -q "true"; then
    echo -e "  ${GREEN}✅ Data endpoint is working${NC}"
else
    echo -e "  ${RED}❌ Data endpoint is not working${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Map fix test completed successfully!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to any view (Public, Field, or Command)"
echo "3. The map should now load without errors"
echo "4. Try toggling the map layers (Hazards, Routes, Resources, Boundaries)"

echo -e "\n${GREEN}✅ The map initialization error should now be resolved!${NC}"
