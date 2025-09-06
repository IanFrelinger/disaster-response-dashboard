# Map Layers

This directory contains the layer management system for the disaster response dashboard map.

## Layer Architecture

Each layer type (terrain, buildings, hazards, units, routes) follows a consistent pattern:

- **Layer Component**: React component that manages the layer's visual representation
- **Layer Manager**: Coordinates layer visibility and interactions
- **Test Suite**: Comprehensive testing for the layer's functionality

## Layer Types

### Terrain Layer
- **Purpose**: 3D terrain visualization with elevation data
- **Dependencies**: Mapbox GL JS terrain API
- **Performance Impact**: High (affects rendering performance)

### Buildings Layer
- **Purpose**: Building footprint visualization and evacuation tracking
- **Dependencies**: GeoJSON building data
- **Performance Impact**: Medium (depends on building count)

### Hazards Layer
- **Purpose**: Hazard zone visualization and risk assessment
- **Dependencies**: Real-time hazard data from Foundry
- **Performance Impact**: Low (minimal rendering overhead)

### Units Layer
- **Purpose**: Emergency response unit locations and status
- **Dependencies**: Real-time unit data from Foundry
- **Performance Impact**: Low (point-based rendering)

### Routes Layer
- **Purpose**: Evacuation route visualization and optimization
- **Dependencies**: Route calculation service
- **Performance Impact**: Medium (line-based rendering)

## Contract + Gotchas

### Terrain Layer
**Contract:**
- Must support enable/disable without map recreation
- Must handle WebGL unavailability gracefully
- Must support exaggeration parameter (1.0-3.0)

**Gotchas:**
- Terrain requires WebGL support - always check availability
- Terrain layers can significantly impact performance on low-end devices
- Terrain exaggeration affects all subsequent layer positioning

### Buildings Layer
**Contract:**
- Must support filtering by building type and evacuation status
- Must handle large datasets (>1000 buildings) efficiently
- Must support click interactions for building details

**Gotchas:**
- Building data can be large - implement virtual scrolling for performance
- Building heights affect 3D positioning when terrain is enabled
- Building visibility depends on zoom level and data density

### Hazards Layer
**Contract:**
- Must support real-time updates from Foundry
- Must handle multiple hazard types with different visual styles
- Must support risk level filtering

**Gotchas:**
- Hazard data can change rapidly - implement debounced updates
- Hazard zones may overlap - implement proper z-index management
- Hazard colors must meet accessibility contrast requirements

### Units Layer
**Contract:**
- Must support real-time location updates
- Must handle unit status changes (available, busy, offline)
- Must support unit type filtering

**Gotchas:**
- Unit locations update frequently - implement smooth transitions
- Unit clustering required for high-density areas
- Unit status changes should be visually distinct

### Routes Layer
**Contract:**
- Must support route optimization and real-time updates
- Must handle traffic conditions and hazard avoidance
- Must support route comparison and selection

**Gotchas:**
- Route calculations can be expensive - implement caching
- Route updates should not cause map re-renders
- Route selection affects other layers (hazards, units)

## Testing Strategy

### Unit Tests
- Layer component rendering
- Layer state management
- Layer interaction handlers

### Integration Tests
- Layer manager coordination
- Layer data flow
- Layer performance metrics

### E2E Tests
- Layer visibility toggles
- Layer interactions
- Layer performance under load

## Performance Guidelines

### Rendering Performance
- Limit layer updates to 60fps
- Implement layer culling for off-screen content
- Use efficient data structures for large datasets

### Memory Management
- Implement proper cleanup in layer unmount
- Monitor memory usage during layer operations
- Implement memory limits for large datasets

### Network Performance
- Implement data caching for static content
- Use efficient data formats (GeoJSON, MVT)
- Implement progressive loading for large datasets

## Accessibility Requirements

### Visual Accessibility
- Ensure sufficient color contrast for all layer elements
- Provide alternative visual indicators for color-blind users
- Support high-contrast mode

### Interaction Accessibility
- Support keyboard navigation for all layer controls
- Provide screen reader descriptions for layer content
- Support voice control interfaces

## Error Handling

### Graceful Degradation
- Handle missing data gracefully
- Provide fallback visualizations
- Implement retry mechanisms for failed operations

### User Feedback
- Clear error messages for layer failures
- Progress indicators for long operations
- Recovery options for failed operations

## Future Enhancements

### Planned Features
- Layer animation support
- Advanced filtering and search
- Custom layer styling
- Layer export capabilities

### Performance Improvements
- WebGL optimization
- Data compression
- Intelligent caching
- Background processing
