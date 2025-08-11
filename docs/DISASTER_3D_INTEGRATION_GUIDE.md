# Disaster 3D Integration Guide

## Overview

The Disaster Response 3D page provides a comprehensive 3D operational environment for emergency response commanders. It integrates terrain-aware hazard visualization, building evacuation status, route optimization, and real-time weather data into a unified 3D map interface.

## Key Features

### 1. **3D Terrain Integration**
- **Base Terrain**: Uses Mapbox DEM (Digital Elevation Model) with configurable exaggeration
- **Terrain Following**: All hazards, buildings, and routes automatically follow terrain contours
- **Height Integration**: Smoke rises above terrain, water flows downhill, buildings sit on actual ground level

### 2. **Dynamic Hazard Layers**

#### Fire Hazards
- **3D Fire Volumes**: Fire areas rendered as 3D extrusions with height based on intensity
- **Smoke Plumes**: Dynamic smoke visualization that follows terrain and wind patterns
- **Prediction Models**: Show 1-hour and 3-hour fire spread predictions
- **Real-time Updates**: Fire intensity, spread rate, and flame height updates

#### Flood Hazards
- **Terrain-Following Water**: Flood areas rendered as 3D volumes that follow terrain contours
- **Depth Visualization**: Water height above terrain with realistic flow patterns
- **Projection Models**: Show projected flood extent over time

#### Chemical Hazards
- **Dispersion Modeling**: Chemical plumes that follow wind patterns
- **Evacuation Radius**: Visual representation of affected areas
- **Wind Carried**: Dynamic movement based on current weather conditions

### 3. **Building-Level Evacuation Status**

#### 3D Building Visualization
- **Color Coding**: Buildings colored by evacuation status
  - 🟢 Green: Evacuated (flat to ground)
  - 🟡 Yellow: In Progress (normal height)
  - 🟠 Orange: Refused (normal height)
  - 🔴 Red: No Contact (normal height)
  - 🟣 Purple: Special Needs (elevated +5m)
  - ⚫ Gray: Unchecked (normal height)

#### Enhanced Building Information
- **Clickable Popups**: Detailed information for each building
- **Structural Integrity**: Visual indicators for building safety
- **Special Needs**: Highlighted buildings requiring priority attention
- **Population Counts**: Real-time evacuation progress tracking

### 4. **3D Route Visualization**

#### Route Types
- **Civilian Evacuation**: Green routes, highest elevation (25m above terrain)
- **Fire Tactical**: Red routes, highest elevation (30m above terrain)
- **EMS Response**: Blue routes, medium elevation (20m above terrain)
- **Police Escort**: Orange routes, medium elevation (18m above terrain)

#### Terrain Integration
- **Elevation Following**: Routes automatically follow terrain contours
- **Height Variation**: Subtle height variations for realistic appearance
- **Ground Indicators**: Secondary ground-level route markers for clarity

### 5. **Weather Visualization**

#### Wind Particle System
- **Dynamic Particles**: 150+ animated particles showing wind direction and speed
- **Terrain Following**: Particles move across terrain with realistic turbulence
- **Performance Optimized**: LOD system adjusts particle density based on zoom level
- **Real-time Updates**: Particles respond to changing wind conditions

#### Weather Data Integration
- **Fire Weather Index**: Real-time fire danger assessment
- **Wind Conditions**: Speed, direction, and gusts with visual compass
- **Humidity Tracking**: Critical for fire behavior prediction
- **Red Flag Warnings**: Prominent alerts for dangerous conditions

### 6. **Integrated HUD Overlay**

#### Weather Widget
- **Wind Compass**: Real-time wind direction and speed
- **Fire Danger**: Color-coded danger levels with humidity and temperature
- **Red Flag Warnings**: Prominent alerts for dangerous conditions
- **Humidity Recovery**: Forecast for moisture improvement

#### Evacuation Progress
- **Zone Status**: Real-time evacuation progress for each zone
- **Progress Bars**: Visual representation of evacuation completion
- **Status Breakdown**: Detailed counts for each evacuation status
- **Timeline Estimates**: Projected completion times

#### Resource Tracker
- **Unit Counts**: Real-time counts by unit type
- **Deployment Status**: Visual indicators for unit availability
- **Response Times**: Average response time calculations
- **Resource Summary**: Total units and deployment statistics

### 7. **Camera Controls**

#### Operational Presets
- **Overview**: See entire incident area (zoom 11, pitch 45°)
- **Tactical**: Focus on active fire line (zoom 14, pitch 60°)
- **Inspection**: Building-level detail (zoom 17, pitch 45°)
- **Routing**: Top-down route planning (zoom 13, pitch 0°)

#### Smooth Transitions
- **Fly Animations**: Smooth camera movements between presets
- **Essential Animations**: Performance-optimized transitions
- **Wind-Aware**: Tactical view automatically faces upwind

### 8. **Performance Optimization**

#### Level of Detail (LOD)
- **Building Visibility**: Detailed buildings only at high zoom (>14)
- **Smoke Simplification**: Reduced detail at distance (<12)
- **Particle Density**: Dynamic adjustment based on zoom level
- **Route Filtering**: Show only high-priority routes at low zoom

#### Rendering Optimization
- **Terrain Queries**: Efficient elevation lookups
- **Layer Management**: Smart layer addition/removal
- **Memory Management**: Proper cleanup of 3D objects
- **Animation Frames**: Optimized particle system updates

## Usage Instructions

### 1. **Layer Management**
- Use the right-side control panel to toggle different layers
- Fire, flood, smoke, weather, buildings, routes, and units can be independently controlled
- Each layer provides different operational information

### 2. **Camera Navigation**
- **Mouse**: Click and drag to rotate, scroll to zoom
- **Preset Buttons**: Use the view presets for operational perspectives
- **Tactical View**: Automatically positions for fire line observation

### 3. **Information Access**
- **Click Hazards**: Get detailed hazard information and status
- **Click Buildings**: View evacuation status and building details
- **Click Routes**: Access route information and optimization options
- **Click Units**: View unit status and capabilities

### 4. **Time Controls**
- **Prediction Slider**: Adjust timeline from current to +3 hours
- **Prediction Toggle**: Show/hide future hazard projections
- **Time Labels**: Clear indication of prediction timeframe

### 5. **Quick Actions**
- **Calculate Safe Routes**: Automatically generate evacuation routes
- **Issue Evacuation Order**: Initiate evacuation procedures
- **Request Resources**: Call for mutual aid and additional units

## Technical Implementation

### Architecture
- **React Component**: Built with TypeScript and React hooks
- **Mapbox GL JS**: 3D map rendering and terrain integration
- **Custom Systems**: Wind particles, hazard modeling, route optimization
- **Real-time Updates**: Live data integration for operational awareness

### Data Sources
- **Terrain**: Mapbox DEM tiles for elevation data
- **Hazards**: Real-time hazard feeds with prediction models
- **Buildings**: Building database with evacuation status
- **Weather**: Meteorological data with fire weather indices
- **Routes**: Optimized evacuation and response routes

### Performance Considerations
- **LOD System**: Automatic detail reduction at distance
- **Particle Management**: Efficient wind particle rendering
- **Memory Cleanup**: Proper disposal of 3D objects
- **Layer Optimization**: Smart layer management for GPU efficiency

## Integration Points

### 1. **Foundry Integration**
- **Data Fusion**: Real-time data from Foundry systems
- **Ontology Mapping**: Emergency response object models
- **Workflow Integration**: Automated status updates and alerts

### 2. **External Systems**
- **Weather APIs**: Real-time meteorological data
- **Hazard Feeds**: Live hazard detection and monitoring
- **Building Databases**: Evacuation status and structural information
- **Resource Management**: Unit tracking and deployment systems

### 3. **Mobile Integration**
- **Responsive Design**: Works on tablets and mobile devices
- **Touch Controls**: Optimized for touch interaction
- **Offline Capability**: Cached data for field operations

## Best Practices

### 1. **Operational Use**
- **Start with Overview**: Begin with overview preset for situational awareness
- **Use Tactical View**: Switch to tactical for active incident management
- **Monitor Weather**: Keep weather widget visible for fire behavior prediction
- **Track Resources**: Monitor resource tracker for unit availability

### 2. **Performance**
- **Adjust Layers**: Turn off unnecessary layers for better performance
- **Use LOD**: Zoom appropriately for desired detail level
- **Monitor FPS**: Watch for performance degradation on older devices
- **Clean Up**: Close popups and unnecessary information panels

### 3. **Data Quality**
- **Verify Sources**: Ensure data accuracy from external feeds
- **Update Frequency**: Monitor data freshness indicators
- **Error Handling**: Report data quality issues to system administrators
- **Backup Plans**: Have alternative information sources available

## Troubleshooting

### Common Issues
1. **Slow Performance**: Reduce particle density or turn off weather layer
2. **Missing Data**: Check data source connectivity and update frequency
3. **Terrain Issues**: Verify DEM tile availability and internet connection
4. **Layer Errors**: Refresh the page or restart the application

### Support
- **Documentation**: Refer to this guide for feature explanations
- **Technical Support**: Contact development team for technical issues
- **User Training**: Attend training sessions for advanced features
- **Feedback**: Report bugs and feature requests through proper channels

## Future Enhancements

### Planned Features
- **AI Prediction**: Machine learning-based hazard prediction models
- **Drone Integration**: Real-time aerial imagery and data
- **Mobile Apps**: Native mobile applications for field use
- **AR Integration**: Augmented reality overlays for field operations

### Customization Options
- **Theme Support**: Light/dark mode and color scheme options
- **Layout Customization**: Adjustable HUD positioning and sizing
- **Data Sources**: Configurable data feed integration
- **Export Options**: Screenshot and data export capabilities

---

This Disaster 3D integration provides emergency responders with a comprehensive, terrain-aware operational environment that enhances situational awareness and decision-making capabilities during critical incidents.
