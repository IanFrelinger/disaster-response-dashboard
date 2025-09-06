# 3D Routing Integration Guide

## Overview

The Integrated 3D Routing System combines the existing role-based routing engine with the 3D hazard map to provide a comprehensive emergency response routing solution. This integration enables real-time route planning, hazard avoidance, and tactical coordination in a 3D environment.

## Key Features

### 🗺️ **3D Terrain Visualization**
- **Satellite imagery** with 3D terrain rendering
- **Hillshading** for elevation awareness
- **Building footprints** for urban navigation
- **Real-time weather effects** (fog, wind visualization)

### 🚨 **Hazard-Aware Routing**
- **Dynamic hazard zones** (fire, flood, chemical spills)
- **Real-time hazard updates** with severity levels
- **Automatic route recalculation** when hazards change
- **Hazard proximity warnings** and safety buffers

### 🚒 **Role-Based Route Profiles**
- **Civilian Evacuation**: Maximum safety, avoids all hazards
- **EMS Response**: Calculated risk, optimized for speed
- **Fire Tactical**: Direct approach, requires water sources
- **Police Escort**: Secure transit, maintains formation

### 🎯 **Interactive Route Planning**
- **Click-to-plan** route creation
- **Drag-and-drop** waypoint adjustment
- **Real-time route validation** against current conditions
- **Alternative route suggestions** with different profiles

## Architecture

### Frontend Components

```
Integrated3DRouting/
├── 3D Map Container (Mapbox GL)
├── Routing Control Panel
├── Route Information Panel
├── Full Routing Panel (RoleBasedRouting)
└── Unit Management Interface
```

### Backend Integration

```
Routing Service/
├── calculateSafeRoute() - Main route calculation
├── optimizeRoutes() - Multi-route optimization
├── getRouteAlternatives() - Alternative route suggestions
├── validateRoute() - Route feasibility checking
└── getHazardAwareRoutes() - Hazard-specific routing
```

## Implementation Details

### 1. Map Integration

The 3D map uses Mapbox GL JS with custom layers for:
- **Hazard zones** (fire, flood, chemical)
- **Route visualization** with profile-based colors
- **Unit markers** with real-time positioning
- **Staging areas** and command posts
- **Terrain effects** for tactical awareness

### 2. Route Calculation Modes

#### Manual Point Selection
```typescript
// User clicks on map to set start/end points
const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
  const clickedPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
  // Add point marker and calculate route
};
```

#### Auto-Optimized Routing
```typescript
// Automatic route optimization based on current conditions
const autoOptimize = async () => {
  const response = await routingService.optimizeRoutes({
    routes: currentRoutes,
    optimization_goal: 'maximize_efficiency',
    constraints: { avoid_hazard_zones: true }
  });
};
```

#### Hazard-Aware Routing
```typescript
// Routes that actively avoid and respond to hazards
const hazardAwareRoutes = await routingService.getHazardAwareRoutes(
  origin,
  destination,
  activeHazardIds
);
```

### 3. Real-Time Updates

The system provides real-time updates for:
- **Hazard progression** and new hazard zones
- **Unit movements** and status changes
- **Route conditions** (blocked, congested, clear)
- **Weather impacts** on route feasibility

### 4. Route Visualization

Routes are displayed with:
- **Profile-based colors** (green for civilian, red for fire, etc.)
- **Status indicators** (active, planned, blocked, completed)
- **Waypoint markers** with distance/time information
- **Hazard avoidance paths** with safety buffers

## Usage Examples

### Basic Route Planning

```typescript
// 1. Initialize the integrated routing component
<Integrated3DRouting
  mapboxAccessToken={token}
  routes={existingRoutes}
  units={emergencyUnits}
  hazards={activeHazards}
  onRouteSelect={handleRouteSelect}
/>

// 2. User clicks on map to set route points
// 3. System calculates optimal route based on selected profile
// 4. Route is displayed on 3D map with terrain context
```

### Advanced Route Optimization

```typescript
// Optimize multiple routes to avoid conflicts
const optimizeAllRoutes = async () => {
  const optimizationRequest = {
    routes: allActiveRoutes,
    optimization_goal: 'minimize_conflicts',
    constraints: {
      avoid_hazard_zones: true,
      maintain_unit_separation: true,
      max_total_distance: 500 // km
    }
  };
  
  const result = await routingService.optimizeRoutes(optimizationRequest);
  // Update routes with optimized paths
};
```

### Hazard Response Routing

```typescript
// Calculate routes that respond to new hazards
const respondToHazard = async (hazard: HazardLayer) => {
  // Get all units that need to respond
  const respondingUnits = units.filter(unit => 
    unit.capabilities.includes(hazard.responseCapability)
  );
  
  // Calculate routes for each unit
  const routes = await Promise.all(
    respondingUnits.map(unit => 
      routingService.calculateSafeRoute({
        origin: unit.location,
        destination: hazard.location,
        vehicle_type: routingService.mapVehicleType(unit.type),
        priority: 'fastest',
        avoid_hazards: [hazard.id]
      })
    )
  );
};
```

## Configuration

### Environment Variables

```bash
# Required for 3D map functionality
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here

# Backend API configuration
REACT_APP_API_URL=http://localhost:8000
```

### Route Profile Configuration

```typescript
const routeProfiles: RouteProfiles = {
  CIVILIAN_EVACUATION: {
    algorithm: 'maximum_safety',
    constraints: {
      avoidHazardBuffer: 1000, // meters
      avoidSmoke: true,
      preferHighways: true,
      maxGradient: 8
    },
    priorities: ['safety', 'capacity', 'speed']
  },
  // ... other profiles
};
```

## Performance Considerations

### Map Rendering
- **Layer management** to prevent memory leaks
- **Viewport-based loading** for large datasets
- **Efficient marker updates** for real-time units
- **Terrain optimization** for smooth 3D navigation

### Route Calculation
- **Background processing** for complex route optimization
- **Caching** of frequently calculated routes
- **Progressive loading** of route alternatives
- **Timeout handling** for long-running calculations

### Real-Time Updates
- **WebSocket connections** for live data
- **Throttled updates** to prevent UI lag
- **Delta updates** to minimize data transfer
- **Connection recovery** for network interruptions

## Testing

### Unit Tests
```typescript
// Test route calculation with different profiles
describe('Route Calculation', () => {
  it('should calculate safe civilian evacuation route', async () => {
    const route = await routingService.calculateSafeRoute({
      origin: [0, 0],
      destination: [1, 1],
      profile: 'CIVILIAN_EVACUATION'
    });
    expect(route.success).toBe(true);
    expect(route.route?.hazards).toHaveLength(0);
  });
});
```

### Integration Tests
```typescript
// Test full 3D routing workflow
describe('3D Routing Integration', () => {
  it('should display route on 3D map', async () => {
    // Setup map
    // Add hazards
    // Calculate route
    // Verify route visualization
  });
});
```

### Performance Tests
```typescript
// Test route calculation performance
describe('Performance', () => {
  it('should calculate route within 5 seconds', async () => {
    const startTime = Date.now();
    await routingService.calculateSafeRoute(complexRequest);
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });
});
```

## Deployment

### Frontend Deployment
```bash
# Build the application
npm run build

# Deploy to CDN/static hosting
aws s3 sync build/ s3://your-bucket/
```

### Backend Deployment
```bash
# Deploy routing API
docker build -t routing-api .
docker run -p 8000:8000 routing-api
```

### Environment Setup
```bash
# Set required environment variables
export REACT_APP_MAPBOX_TOKEN=your_token
export REACT_APP_API_URL=https://your-api-domain.com
```

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check Mapbox token validity
   - Verify network connectivity
   - Check browser console for errors

2. **Routes not calculating**
   - Verify backend API is running
   - Check API endpoint configuration
   - Review route calculation logs

3. **Performance issues**
   - Reduce number of simultaneous routes
   - Optimize hazard layer rendering
   - Implement route calculation caching

### Debug Mode

Enable debug mode for detailed logging:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('Route calculation request:', request);
  console.log('Route calculation response:', response);
}
```

## Future Enhancements

### Planned Features
- **AI-powered route prediction** based on historical data
- **Multi-modal routing** (ground, air, water)
- **Advanced terrain analysis** for off-road routing
- **Predictive hazard modeling** for proactive routing
- **Mobile app integration** for field units

### Performance Improvements
- **WebGL acceleration** for complex 3D rendering
- **Distributed route calculation** across multiple servers
- **Machine learning optimization** for route efficiency
- **Real-time traffic integration** for dynamic routing

## Support

For technical support or questions about the 3D routing integration:

1. **Documentation**: Check this guide and related API docs
2. **Issues**: Report bugs via GitHub issues
3. **Discussions**: Join community discussions for feature requests
4. **Training**: Contact the development team for training sessions

---

*This integration represents a significant advancement in emergency response technology, providing responders with the tools they need to make informed routing decisions in complex, dynamic environments.*
