# Street Data Integration Guide

## Overview

The Disaster Response Dashboard now integrates with street data that matches the "Where am I" app format, providing comprehensive routing capabilities for emergency response scenarios. This integration enables vehicle-specific routing, hazard avoidance, and real-time street condition assessment.

## Street Data Format

### Core Structure

The street data follows the "Where am I" app format with the following structure:

```typescript
interface StreetSegment {
  id: string;
  name: string;
  type: 'highway' | 'primary' | 'secondary' | 'tertiary' | 'residential' | 'service' | 'path';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  properties: {
    // Physical properties
    length_m: number;
    speed_limit_kmh: number;
    lanes: number;
    one_way: boolean;
    surface: 'paved' | 'unpaved' | 'gravel' | 'dirt';
    width_m: number;
    
    // Vehicle constraints
    max_weight_kg: number;
    max_height_m: number;
    max_width_m: number;
    
    // Infrastructure
    bridge: boolean;
    tunnel: boolean;
    access: 'yes' | 'no' | 'private' | 'emergency';
    
    // Emergency response features
    emergency_access: boolean;
    evacuation_route: boolean;
    hazard_zone: boolean;
    
    // Traffic control
    traffic_signals: boolean;
    stop_signs: boolean;
    yield_signs: boolean;
    roundabouts: boolean;
    traffic_calming: boolean;
    
    // Safety features
    lighting: boolean;
    sidewalk: boolean;
    bike_lane: boolean;
    bus_lane: boolean;
    hov_lane: boolean;
    
    // Operational status
    toll: boolean;
    seasonal: boolean;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | 'closed';
    last_updated: string;
  };
}
```

### Vehicle-Specific Constraints

The system supports different vehicle types with specific constraints:

#### Fire Engine
- **Max Weight**: 15,000 kg
- **Max Height**: 4.5 m
- **Max Width**: 3.0 m
- **Min Lanes**: 2
- **Requires**: Emergency access

#### Ambulance
- **Max Weight**: 5,000 kg
- **Max Height**: 3.5 m
- **Max Width**: 2.8 m
- **Min Lanes**: 1
- **Requires**: Emergency access

#### Police Car
- **Max Weight**: 2,500 kg
- **Max Height**: 2.0 m
- **Max Width**: 2.2 m
- **Min Lanes**: 1
- **Requires**: Emergency access

#### Civilian Vehicle
- **Max Weight**: 3,500 kg
- **Max Height**: 4.0 m
- **Max Width**: 2.5 m
- **Min Lanes**: 1
- **Avoids**: Hazard zones

## Integration Components

### 1. Street Data Service (`streetDataService.ts`)

The street data service provides the following key functions:

#### Core Functions
- `getStreetData(query)`: Retrieve street data for a specific area
- `getStreetNetwork(bounds)`: Get complete street network for routing
- `findNearestStreet(lat, lon, maxDistance)`: Find nearest street to a point
- `getRouteStreets(coordinates)`: Get street segments along a route
- `getStreetConditions(streetIds)`: Get real-time street conditions
- `getTrafficData(streetIds)`: Get real-time traffic data
- `getEvacuationRoutes(bounds)`: Get designated evacuation routes
- `getEmergencyAccessRoutes(bounds)`: Get emergency access routes

#### Utility Functions
- `convertToRoutingFormat(streets)`: Convert to routing engine format
- `filterByVehicleConstraints(streets, vehicleType)`: Filter by vehicle capabilities
- `calculateRouteMetrics(streets)`: Calculate route performance metrics

### 2. Enhanced Routing Service (`routingService.ts`)

The routing service has been enhanced to use street data:

#### Key Features
- **Street-based routing**: Uses actual street network data
- **Vehicle constraints**: Respects vehicle-specific limitations
- **Hazard avoidance**: Routes around hazard zones
- **Real-time conditions**: Considers current street conditions
- **Emergency access**: Prioritizes emergency access routes
- **Fallback support**: Falls back to API if street data unavailable

#### Route Calculation Process
1. **Query street data** for the area between origin and destination
2. **Filter streets** by vehicle constraints and requirements
3. **Find nearest streets** to origin and destination points
4. **Calculate optimal route** using A* pathfinding algorithm
5. **Apply vehicle-specific costs** based on street properties
6. **Generate route metrics** including safety and access scores
7. **Return comprehensive route** with street-level details

### 3. Backend API Integration (`street_data_api.py`)

The backend provides street data APIs that match the frontend requirements:

#### API Endpoints
- `GET /api/street_data`: Get street data with filtering options
- `GET /api/nearest_street`: Find nearest street to coordinates
- `GET /api/evacuation_routes`: Get evacuation routes in area
- `GET /api/emergency_access_routes`: Get emergency access routes
- `POST /api/route_streets`: Get streets along a route
- `POST /api/street_conditions`: Get street conditions
- `POST /api/traffic_data`: Get traffic data

## Usage Examples

### Basic Street Data Query

```typescript
import { streetDataService } from '../services/streetDataService';

const query = {
  latitude: 37.7749,
  longitude: -122.4194,
  radius_m: 10000,
  emergency_access_only: true,
  evacuation_routes_only: false
};

const result = await streetDataService.getStreetData(query);
console.log(`Found ${result.streets.length} streets in area`);
```

### Vehicle-Specific Route Calculation

```typescript
import { routingService } from '../services/routingService';

const request = {
  origin_lat: 37.7749,
  origin_lon: -122.4194,
  destination_lat: 37.7750,
  destination_lon: -122.4195,
  vehicle_type: 'fire_engine',
  priority: 'safest',
  profile: 'FIRE_TACTICAL',
  avoid_hazards: ['hazard-1', 'hazard-2'],
  constraints: {
    max_distance: 100,
    max_time: 120,
    require_staging_areas: true
  }
};

const result = await routingService.calculateSafeRoute(request);
if (result.success) {
  console.log(`Route calculated: ${result.route?.streetData?.totalLengthKm}km`);
  console.log(`Safety score: ${result.route?.streetData?.safetyScore}`);
}
```

### Street Network Analysis

```typescript
// Filter streets for fire engine access
const fireEngineStreets = streetDataService.filterByVehicleConstraints(
  allStreets, 
  'fire_engine'
);

// Calculate route metrics
const metrics = streetDataService.calculateRouteMetrics(routeStreets);
console.log(`Route length: ${metrics.total_length_km}km`);
console.log(`Estimated time: ${metrics.total_time_min} minutes`);
console.log(`Safety score: ${metrics.safety_score}`);
console.log(`Emergency access: ${metrics.emergency_access_score}%`);
```

## Route Metrics

The system calculates comprehensive route metrics:

### Basic Metrics
- **Total Length**: Route distance in kilometers
- **Estimated Time**: Travel time in minutes
- **Average Speed**: Average speed in km/h

### Safety Metrics
- **Safety Score**: 0-100 score based on street conditions
- **Hazard Avoidance**: Percentage of route avoiding hazards
- **Lighting Coverage**: Percentage of route with street lighting
- **Sidewalk Coverage**: Percentage of route with sidewalks

### Emergency Response Metrics
- **Emergency Access Score**: Percentage of route with emergency access
- **Evacuation Route Score**: Percentage of route using evacuation routes
- **Vehicle Compatibility**: Route suitability for specific vehicle types

## Integration with 3D Map

The street data integrates seamlessly with the 3D hazard map:

### Visualization Features
- **Street-level routing**: Routes follow actual street geometry
- **Vehicle constraints**: Visual indicators for vehicle limitations
- **Hazard overlays**: Street hazard zones displayed on map
- **Real-time updates**: Street conditions updated in real-time
- **3D terrain integration**: Routes consider elevation and terrain

### Interactive Features
- **Click-to-route**: Click on map to set route points
- **Vehicle selection**: Choose vehicle type for routing
- **Route alternatives**: View multiple route options
- **Street details**: Click on streets for detailed information

## Testing

The integration includes comprehensive tests:

### Test Coverage
- **Street data validation**: Verify data structure and format
- **Vehicle constraints**: Test vehicle-specific filtering
- **Route calculation**: Test routing algorithms
- **Integration testing**: Test end-to-end functionality
- **Performance testing**: Test with large datasets

### Running Tests
```bash
# Run all street data tests
npm test -- --run src/tests/integration/street-data-simple.test.ts

# Run specific test suites
npm test -- --run --grep "Street Data"
```

## Configuration

### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Street Data Configuration
REACT_APP_STREET_DATA_CACHE_TTL=300000  # 5 minutes
REACT_APP_STREET_DATA_MAX_RADIUS=50000  # 50km
```

### API Configuration
```typescript
// Configure API endpoints
const API_CONFIG = {
  streetData: '/api/street_data',
  nearestStreet: '/api/nearest_street',
  evacuationRoutes: '/api/evacuation_routes',
  emergencyAccess: '/api/emergency_access_routes',
  routeStreets: '/api/route_streets',
  streetConditions: '/api/street_conditions',
  trafficData: '/api/traffic_data'
};
```

## Performance Considerations

### Optimization Strategies
- **Spatial indexing**: Use spatial indexes for fast queries
- **Caching**: Cache frequently accessed street data
- **Lazy loading**: Load street data on demand
- **Compression**: Compress street data for network efficiency
- **CDN**: Use CDN for static street data

### Monitoring
- **Query performance**: Monitor API response times
- **Cache hit rates**: Track cache effectiveness
- **Error rates**: Monitor API error rates
- **Data freshness**: Track data update frequency

## Future Enhancements

### Planned Features
- **Real-time traffic integration**: Live traffic data integration
- **Weather impact**: Weather-based route adjustments
- **Dynamic routing**: Real-time route optimization
- **Predictive analytics**: Predict route conditions
- **Mobile integration**: Mobile app street data sync

### API Extensions
- **Batch operations**: Process multiple requests efficiently
- **Streaming updates**: Real-time street data updates
- **Advanced filtering**: More sophisticated query options
- **Analytics endpoints**: Route performance analytics

## Troubleshooting

### Common Issues
1. **No street data available**: Check API connectivity and data sources
2. **Route calculation failures**: Verify coordinate validity and street network
3. **Performance issues**: Check cache configuration and network latency
4. **Vehicle constraint violations**: Review vehicle specifications and street data

### Debug Tools
- **Street data inspector**: Visualize street data structure
- **Route debugger**: Step-through route calculation process
- **Performance profiler**: Analyze routing performance
- **Data validator**: Validate street data integrity

## Conclusion

The street data integration provides a robust foundation for emergency response routing, combining the precision of "Where am I" app data with the advanced capabilities of the Disaster Response Dashboard. This integration enables vehicle-specific routing, hazard avoidance, and real-time condition assessment, significantly improving emergency response effectiveness.
