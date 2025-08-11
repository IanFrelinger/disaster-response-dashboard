# Disaster Response 3D Terrain Integration

## Overview

The Disaster Response 3D system provides a comprehensive, terrain-aware visualization platform for emergency operations. It integrates real-time hazard data, building evacuation status, operational routes, and emergency units into a unified 3D operational environment.

## Key Features

### 🏔️ **3D Terrain Integration**
- **Terrain-Aware Hazards**: All fire, flood, and smoke visualizations follow actual terrain contours
- **Elevation-Based Rendering**: Buildings, routes, and hazards are positioned relative to real terrain height
- **Dynamic Height Calculation**: Automatic terrain height queries for realistic 3D positioning

### 🔥 **Dynamic Hazard Visualization**
- **3D Fire Volumes**: Fire hazards rendered as 3D extrusions with intensity-based coloring
- **Smoke Plume Modeling**: Realistic smoke visualization that rises from terrain and follows wind patterns
- **Flood Terrain Following**: Water levels that follow terrain contours for realistic flood representation
- **Prediction Timeline**: Time-based hazard progression (0-3 hours) with visual indicators

### 🏢 **Building-Level Evacuation Tracking**
- **3D Building Extrusion**: Buildings rendered as 3D objects with height based on type and status
- **Evacuation Status Visualization**: Color-coded buildings (Green=Evacuated, Yellow=In Progress, Red=No Contact)
- **Special Needs Highlighting**: Buildings with special needs shown at increased height
- **Interactive Popups**: Click any building for detailed evacuation information and actions

### 🛣️ **3D Route Visualization**
- **Terrain-Following Routes**: All evacuation and response routes follow terrain elevation
- **Route Type Differentiation**: Color-coded routes by purpose (Green=Civilian, Blue=EMS, Red=Fire, Orange=Police)
- **Dynamic Styling**: Active routes shown with enhanced visibility and animated patterns
- **Waypoint Markers**: Elevated markers at key route points for tactical planning

### 🌪️ **Weather Integration**
- **Wind Particle System**: 3D wind visualization with terrain-following particles
- **Fire Weather Index**: Real-time fire danger assessment with visual indicators
- **Red Flag Warnings**: Prominent alerts for extreme fire conditions
- **Wind Direction Compass**: Visual wind direction and speed indicators

### 🚒 **Emergency Unit Management**
- **3D Unit Positioning**: All emergency units positioned above terrain with realistic heights
- **Status-Based Visibility**: Units filtered by deployment status at different zoom levels
- **Interactive Unit Info**: Click any unit for detailed status and capability information
- **Real-Time Updates**: Live unit location and status updates

### 📊 **Enhanced HUD Overlay**
- **Evacuation Progress**: Real-time evacuation completion tracking with visual progress bars
- **Resource Tracker**: Comprehensive unit status and deployment information
- **Weather Widget**: Current conditions with fire danger and wind information
- **Prediction Status**: Timeline-based hazard progression indicators

### 🎛️ **Operational Controls**
- **Layer Management**: Toggle visibility of all disaster response layers
- **Camera Presets**: Quick navigation to operational views (Overview, Tactical, Inspection, Routing)
- **Time Control**: Interactive timeline for hazard prediction visualization
- **Quick Actions**: One-click access to common emergency operations

## Technical Architecture

### **Performance Optimization**
- **LOD System**: Level-of-detail rendering based on zoom level
- **Dynamic Filtering**: Route and unit visibility optimized for different zoom levels
- **Terrain Query Optimization**: Efficient elevation queries with fallback handling
- **Particle Density Control**: Wind particle count adjusted based on zoom and performance

### **3D Rendering Features**
- **Fill Extrusion**: 3D hazard volumes with terrain integration
- **Line Rendering**: Elevated routes with terrain following
- **Point Markers**: 3D positioned units and waypoints
- **Custom Shaders**: Enhanced visual effects for critical information

### **Data Integration**
- **Real-Time Updates**: Live data integration for all disaster response elements
- **Terrain Queries**: Automatic elevation calculation for all 3D features
- **Coordinate Systems**: Seamless integration with Mapbox GL JS
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Usage Examples

### **Basic Setup**
```typescript
import { DisasterResponse3D } from './components/tacmap/DisasterResponse3D';

<DisasterResponse3D
  map={mapboxMap}
  hazards={activeHazards}
  weather={currentWeather}
  buildings={buildingData}
  evacuationZones={evacuationData}
  routes={operationalRoutes}
  units={emergencyUnits}
  onHazardClick={handleHazardSelection}
  onBuildingClick={handleBuildingSelection}
  onRouteClick={handleRouteSelection}
  onUnitClick={handleUnitSelection}
/>
```

### **Camera Control**
```typescript
// Navigate to tactical view
flyToPreset('tactical');

// Custom camera positioning
map.flyTo({
  center: [longitude, latitude],
  zoom: 14,
  pitch: 60,
  bearing: windDirection - 180
});
```

### **Layer Management**
```typescript
// Toggle specific layers
toggleLayer('fire');
toggleLayer('buildings');
toggleLayer('routes');

// Show/hide HUD
setShowHUD(!showHUD);
```

### **Time-Based Predictions**
```typescript
// Enable predictions
setShowPredictions(true);

// Set prediction timeline
setPredictionTime(90); // 90 minutes from now
```

## Data Requirements

### **Hazard Data Structure**
```typescript
interface HazardLayer {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'chemical' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: [number, number];
  fire?: {
    active: number[][][];
    intensity: number; // 0-100
    spreadRate: number;
    flameHeight: number;
  };
  flood?: {
    current: {
      geometry: number[][][];
      depth: number;
      flowRate: number;
    };
  };
}
```

### **Building Data Structure**
```typescript
interface Building {
  id: string;
  address: string;
  coordinates: [number, number];
  type: 'residential' | 'commercial' | 'critical_facility';
  evacuationStatus: {
    evacuated: boolean;
    lastContact?: Date;
    notes?: string;
    specialNeeds: string[];
  };
  buildingHeight?: number;
}
```

### **Route Data Structure**
```typescript
interface OperationalRoute {
  id: string;
  profile: 'CIVILIAN_EVACUATION' | 'EMS_RESPONSE' | 'FIRE_TACTICAL';
  waypoints: [number, number][];
  status: 'planned' | 'active' | 'completed';
  capacity: number;
  estimatedTime: number;
}
```

## Performance Considerations

### **Recommended Hardware**
- **GPU**: Dedicated graphics card with 4GB+ VRAM
- **RAM**: 16GB+ system memory
- **CPU**: Multi-core processor for terrain calculations

### **Optimization Tips**
- Use LOD system for large datasets
- Limit particle count on lower-end devices
- Implement data streaming for real-time updates
- Cache terrain elevation data when possible

### **Browser Support**
- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Integration Points

### **Mapbox GL JS**
- Terrain source integration
- 3D layer rendering
- Camera controls and navigation
- Event handling and interactions

### **Real-Time Data Sources**
- WebSocket connections for live updates
- REST API integration for hazard data
- Database connections for building information
- Weather service APIs

### **Emergency Management Systems**
- CAD system integration
- Unit tracking systems
- Evacuation management platforms
- Incident command systems

## Future Enhancements

### **Planned Features**
- **AI-Powered Predictions**: Machine learning hazard progression models
- **Multi-Agency Coordination**: Cross-departmental resource sharing
- **Mobile Integration**: Field unit mobile app synchronization
- **Advanced Analytics**: Performance metrics and optimization insights

### **Technical Improvements**
- **WebGL 2.0**: Enhanced 3D rendering capabilities
- **Real-Time Collaboration**: Multi-user operational coordination
- **Offline Support**: Local data caching for connectivity issues
- **Accessibility**: Enhanced screen reader and keyboard navigation

## Support and Documentation

### **API Reference**
- Complete TypeScript definitions
- Interactive examples and demos
- Performance tuning guides
- Integration tutorials

### **Community Resources**
- GitHub repository with issue tracking
- Developer documentation and guides
- User community forums
- Training materials and webinars

---

**Built for Emergency Responders, by Emergency Responders**

This system is designed to provide the most comprehensive and intuitive disaster response visualization platform available, helping emergency personnel make better decisions faster when every second counts.
