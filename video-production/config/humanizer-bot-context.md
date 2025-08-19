# Disaster Response Dashboard UI Component Map
Generated: 2025-08-19T13:58:15.598Z

## Overview
This map provides comprehensive information about all UI components, interactions, and user flows in the Disaster Response Dashboard frontend. Use this information to create realistic, contextually appropriate interaction descriptions for video production.

## Core Components


### AIPDecisionSupport
- **Type**: component
- **File**: AIPDecisionSupport.tsx
- **Description**: AI-powered decision support component
- **Interactions**: click on button/div, hover on element, hover on element, input on input/form, input on input/form, scroll on container
- **Key Props**: onDecisionMade?, className?, onDecisionMade, className = ''
- **State Variables**: null, query, isProcessing, currentGuidance, chatHistory
- **CSS Classes**: 

### BuildingEvacuationTracker
- **Type**: component
- **File**: BuildingEvacuationTracker.tsx
- **Description**: Evacuation planning and tracking component
- **Interactions**: click on button/div
- **Key Props**: zones, buildings, onZoneUpdate?, onBuildingUpdate?, className?
- **State Variables**: null, null, 'zones', selectedZone, selectedBuilding
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### ChallengeDemo
- **Type**: component
- **File**: ChallengeDemo.tsx
- **Description**: Challenge demo and presentation component
- **Interactions**: 
- **Key Props**: 
- **State Variables**: 
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### DrillDownCapability
- **Type**: component
- **File**: DrillDownCapability.tsx
- **Description**: Drill-down capability for detailed analysis
- **Interactions**: click on button/div
- **Key Props**: detailLevels, currentZoom, currentLocation, onZoomChange?, onLocationSelect?
- **State Variables**: 'county', currentLocation, selectedDetailLevel, expandedSections, selectedLocation
- **CSS Classes**: location-overview, overview-header, ios-title, overview-stats, overview-item

### EfficiencyMetrics
- **Type**: component
- **File**: EfficiencyMetrics.tsx
- **Description**: Efficiency metrics and analytics component
- **Interactions**: click on button/div
- **Key Props**: metrics, onMetricsUpdate?, className?, onMetricsUpdate, className = ''
- **State Variables**: null, 'overview', selectedMetric, viewMode
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### EvacuationDashboard
- **Type**: page
- **File**: EvacuationDashboard.tsx
- **Description**: Main dashboard component for evacuation management
- **Interactions**: click on button/div
- **Key Props**: zones, buildings, weatherData?, onZoneSelect?, onBuildingSelect?
- **State Variables**: null, null, 'zones', 'all', selectedZone
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### MultiHazardMap
- **Type**: component
- **File**: MultiHazardMap.tsx
- **Description**: Interactive map component for hazard visualization
- **Interactions**: click on button/div, input on input/form
- **Key Props**: hazards, onHazardSelect?, onHazardUpdate?, className?, onHazardSelect
- **State Variables**: null, 'overview', selectedHazard, activeLayers, viewMode
- **CSS Classes**: hazard-geometry, fire-hazard, fire-active, fire-predicted-1hr, fire-predicted-3hr

### RoleBasedRouting
- **Type**: component
- **File**: RoleBasedRouting.tsx
- **Description**: Route planning and optimization component
- **Interactions**: click on button/div, input on input/form
- **Key Props**: routes, units, stagingAreas, onRouteSelect?, onRouteUpdate?
- **State Variables**: null, 'CIVILIAN_EVACUATION', 'routes', selectedRoute, activeProfile
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### SearchMarkings
- **Type**: component
- **File**: SearchMarkings.tsx
- **Description**: Search and marking functionality component
- **Interactions**: click on button/div, input on input/form
- **Key Props**: searchMarkings, onMarkingCreate?, onMarkingUpdate?, onMarkingDelete?, className?
- **State Variables**: null, 'overview', selectedMarking, viewMode, newMarking
- **CSS Classes**: search-code-visual, code-grid, code-cell, top, left

### TechnicalArchitecture
- **Type**: component
- **File**: TechnicalArchitecture.tsx
- **Description**: Technical architecture and system information component
- **Interactions**: click on button/div, zoom on map, pan on map
- **Key Props**: className?, className = ''
- **State Variables**: 'overview', null, activeView, selectedComponent
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### UnitManagement
- **Type**: component
- **File**: UnitManagement.tsx
- **Description**: Unit and resource management component
- **Interactions**: click on button/div, input on input/form
- **Key Props**: units, zones, routes, onUnitAssign?, onUnitStatusUpdate?
- **State Variables**: null, null, 'units', 'all', 'all'
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### WeatherPanel
- **Type**: component
- **File**: WeatherPanel.tsx
- **Description**: Weather data display and integration component
- **Interactions**: click on button/div
- **Key Props**: weatherData, onWeatherAlert?, className?, onWeatherAlert, className = ''
- **State Variables**: null, expanded, selectedAlert
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### Enhanced3DTerrain
- **Type**: component
- **File**: Enhanced3DTerrain.tsx
- **Description**: AI-powered decision support component
- **Interactions**: click on button/div, input on input/form, zoom on map, pan on map
- **Key Props**: mapboxAccessToken, initialCenter?, initialZoom?, showDisasterResponse?, hazards?
- **State Variables**: isMapLoaded, showTerrainControls
- **CSS Classes**: terrain-controls, terrain-options, terrain-option, terrain-btn, map-container

### LiveHazardMap
- **Type**: component
- **File**: LiveHazardMap.tsx
- **Description**: Interactive map component for hazard visualization
- **Interactions**: zoom on map, pan on map
- **Key Props**: showPredictions?, show3D?, autoUpdate?, autoUpdate = true
- **State Variables**: new Date(, showHazards, showUnits, showRoutes, showAnalytics
- **CSS Classes**: ios-card, ios-container, ios-flex-between, ios-headline, ios-caption

### Mapbox3DTerrain
- **Type**: component
- **File**: Mapbox3DTerrain.tsx
- **Description**: Interactive map component for hazard visualization
- **Interactions**: click on button/div, input on input/form, zoom on map, pan on map
- **Key Props**: center?, zoom?, pitch?, bearing?, showHazards?
- **State Variables**: 'dark', isLoading, isRefreshing, mapStyle, localShowTerrain
- **CSS Classes**: w-full, h-full, rounded-lg, overflow-hidden, bg-gray-800

### SimpleMapboxTest
- **Type**: component
- **File**: SimpleMapboxTest.tsx
- **Description**: Interactive map component for hazard visualization
- **Interactions**: click on button/div, input on input/form, zoom on map, pan on map
- **Key Props**: showHazards?, showUnits?, showRoutes?, showBuildings?, showTerrain?
- **State Variables**: null, {
    visible: false,
    content: '',
    x: 0,
    y: 0
  }, mapLoaded, buildingsAdded, terrainAdded
- **CSS Classes**: weather-legend, simple-mapbox-test, mapbox-container, ios-caption, ios-spinner


## Navigation Structure

- **Evacuation Dashboard** (/dashboard) - Main evacuation management interface

- **Multi-Hazard Map** (/map) - Interactive hazard visualization

- **AI Decision Support** (/ai-support) - AI-powered operational guidance

- **Unit Management** (/units) - Emergency unit coordination

- **Role-Based Routing** (/routing) - Route optimization and planning

- **Building Tracker** (/buildings) - Building evacuation status tracking

- **Weather Panel** (/weather) - Real-time weather integration

- **Technical Architecture** (/architecture) - System architecture overview


## Data Flow Patterns

- **MultiHazardMap** → **EvacuationDashboard**: HazardLayer[] - Real-time hazard data flows to dashboard for evacuation planning

- **WeatherPanel** → **MultiHazardMap**: WeatherData - Weather conditions influence hazard visualization and routing

- **AIPDecisionSupport** → **EvacuationDashboard**: OperationalGuidance - AI recommendations guide evacuation decisions and resource allocation

- **BuildingEvacuationTracker** → **EvacuationDashboard**: Building[] - Building status updates flow to dashboard for progress tracking

- **UnitManagement** → **RoleBasedRouting**: EmergencyUnit[] - Unit availability and status inform route optimization

- **SearchMarkings** → **MultiHazardMap**: SearchMarking[] - Search and rescue markings overlay on hazard map


## User Interaction Patterns

### Map Exploration
Users explore hazards and evacuation routes through interactive map
**Components**: MultiHazardMap, SimpleMapboxTest, Enhanced3DTerrain
**User Journey**: Load map → Toggle hazard layers → Zoom/pan to areas → Select hazards → View details

### Evacuation Planning
Commanders plan and execute evacuation operations
**Components**: EvacuationDashboard, AIPDecisionSupport, RoleBasedRouting
**User Journey**: View evacuation zones → Analyze AI recommendations → Plan routes → Assign units → Monitor progress

### Real-time Monitoring
Continuous monitoring of evacuation progress and hazard changes
**Components**: BuildingEvacuationTracker, EfficiencyMetrics, WeatherPanel
**User Journey**: Check building status → Review metrics → Monitor weather → Update information → Track progress

### Unit Coordination
Emergency units coordinate and manage resources
**Components**: UnitManagement, RoleBasedRouting, DrillDownCapability
**User Journey**: View unit status → Assign tasks → Optimize routes → Track performance → Analyze efficiency

### Decision Support
AI-powered guidance for complex operational decisions
**Components**: AIPDecisionSupport, TechnicalArchitecture, ChallengeDemo
**User Journey**: Query AI system → Review recommendations → Analyze alternatives → Make decisions → Track outcomes


## Interaction Guidelines for Video Production

### Map Interactions
- **Zoom**: Users can zoom in/out using scroll wheel or zoom controls
- **Pan**: Users can drag the map to move the view
- **Layer Toggle**: Users can show/hide different hazard layers
- **Hazard Selection**: Users can click on hazards to view detailed information

### Dashboard Interactions
- **Zone Selection**: Users can click on evacuation zones to view details
- **Status Updates**: Users can update building and evacuation status
- **Filter Controls**: Users can filter by status, priority, or other criteria
- **Progress Tracking**: Users can monitor evacuation progress in real-time

### AI Decision Support
- **Query Input**: Users can type natural language queries
- **Recommendation Review**: Users can view AI-generated recommendations
- **Alternative Scenarios**: Users can explore different operational scenarios
- **Confidence Metrics**: Users can assess AI recommendation confidence

### Unit Management
- **Unit Assignment**: Users can assign units to specific tasks
- **Route Planning**: Users can plan and optimize unit routes
- **Performance Monitoring**: Users can track unit efficiency and performance
- **Resource Allocation**: Users can manage and allocate emergency resources

## Contextual Interaction Descriptions

When describing interactions in video production, consider:
1. **User Role**: Is this a commander, first responder, or public information officer?
2. **Operational Context**: What emergency scenario is being addressed?
3. **Component State**: What information is currently visible on screen?
4. **User Intent**: What is the user trying to accomplish?
5. **System Response**: How does the system respond to user actions?

## Realistic Interaction Examples

### Commander View
"Commander Johnson surveys the evacuation zones on the main dashboard. She clicks on Zone A to see detailed evacuation progress, then consults the AI decision support system for route optimization recommendations."

### First Responder View
"First responders use the building evacuation tracker to update status as they clear each building. They toggle between different hazard layers on the map to understand current threats."

### Public Information View
"Public information officers monitor the weather panel for changing conditions that might affect evacuation timing, while updating the public information dashboard with real-time status updates."

This component map should be referenced every time interaction descriptions are generated to ensure accuracy and contextual appropriateness.