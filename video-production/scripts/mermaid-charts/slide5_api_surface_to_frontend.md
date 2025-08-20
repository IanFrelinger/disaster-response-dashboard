# Slide 5: API Surface → Frontend

## API Integration Architecture

### Chart Description
This architecture diagram visualizes the complete API surface and its integration with frontend components, showing how REST APIs and WebSockets work together to provide both synchronous data access and real-time updates to the user interface.

### Mermaid Chart

```mermaid
graph TB
    subgraph "Backend APIs"
        HAZARDS_API["/api/hazards<br/>Active Incidents"]
        ZONES_API["/api/hazard_zones<br/>Spatial Risk"]
        ROUTES_API["/api/routes<br/>Optimized Paths"]
        RISK_API["/api/risk<br/>Location Analysis"]
        EVAC_API["/api/evacuations<br/>Progress Tracking"]
        UNITS_API["/api/units<br/>Resource Management"]
        SAFETY_API["/api/public_safety<br/>Communications"]
    end
    
    subgraph "Communication Layer"
        REST["REST APIs<br/>Synchronous Data"]
        WEBSOCKETS["WebSockets<br/>Real-time Events"]
    end
    
    subgraph "Frontend Components"
        MAP["Live Hazard Map<br/>Spatial Visualization"]
        UNITS_PANEL["Emergency Units<br/>Resource Tracking"]
        ROUTING_PANEL["Route Planning<br/>Optimization"]
        AIP_PANEL["AIP Decision Support<br/>ML Recommendations"]
        TRACKER_PANEL["Evacuation Tracker<br/>Progress Monitoring"]
        ANALYTICS_PANEL["Analytics Dashboard<br/>Performance Metrics"]
    end
    
    HAZARDS_API --> REST
    ZONES_API --> REST
    ROUTES_API --> REST
    RISK_API --> REST
    EVAC_API --> REST
    UNITS_API --> REST
    SAFETY_API --> REST
    
    REST --> MAP
    REST --> UNITS_PANEL
    REST --> ROUTING_PANEL
    REST --> AIP_PANEL
    REST --> TRACKER_PANEL
    REST --> ANALYTICS_PANEL
    
    WEBSOCKETS --> MAP
    WEBSOCKETS --> UNITS_PANEL
    WEBSOCKETS --> ROUTING_PANEL
    WEBSOCKETS --> AIP_PANEL
    WEBSOCKETS --> TRACKER_PANEL
    WEBSOCKETS --> ANALYTICS_PANEL
    
    classDef api fill:#fff8e1,stroke:#f57c00,stroke-width:2px,color:#000000
    classDef comm fill:#e0f2f1,stroke:#00695c,stroke-width:2px,color:#000000
    classDef frontend fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000000
    
    class HAZARDS_API,ZONES_API,ROUTES_API,RISK_API,EVAC_API,UNITS_API,SAFETY_API api
    class REST,WEBSOCKETS comm
    class MAP,UNITS_PANEL,ROUTING_PANEL,AIP_PANEL,TRACKER_PANEL,ANALYTICS_PANEL frontend
```

### Key Components

#### Backend APIs
- **/api/hazards**: Active incident data and real-time hazard information
- **/api/hazard_zones**: Spatial risk assessment and zone boundaries
- **/api/routes**: Optimized evacuation paths and route calculations
- **/api/risk**: Location-specific risk analysis and assessment
- **/api/evacuations**: Progress tracking and evacuation status
- **/api/units**: Resource management and emergency unit tracking
- **/api/public_safety**: Public communications and emergency alerts

#### Communication Layer
- **REST APIs**: Synchronous data access for initial loads and specific requests
- **WebSockets**: Real-time event streaming for live updates and notifications

#### Frontend Components
- **Live Hazard Map**: Spatial visualization of hazards and conditions
- **Emergency Units Panel**: Resource tracking and unit management
- **Route Planning Panel**: Optimization interface and route selection
- **AIP Decision Support**: ML recommendations and intelligent guidance
- **Evacuation Tracker**: Progress monitoring and status updates
- **Analytics Dashboard**: Performance metrics and operational insights

### Technical Impact
This diagram demonstrates:
- **Comprehensive API Surface**: Complete coverage of emergency response needs
- **Dual Communication**: Both REST and WebSocket patterns for optimal UX
- **Component Integration**: Seamless connection between backend and frontend
- **Real-time Capabilities**: Live updates across all interface components

### API Design Principles
1. **RESTful Design**: Standard HTTP methods and resource-based URLs
2. **Real-time Updates**: WebSocket connections for live data streaming
3. **Component-Specific APIs**: Tailored endpoints for each frontend panel
4. **Unified Interface**: Consistent API patterns across all services

### Export Information
- **Filename**: `slide5_api_surface_to_frontend.png`
- **Size**: 305 KB
- **Dimensions**: 1920x1080 (Full HD)
- **Theme**: Dark theme with high contrast
- **Colors**: Orange (APIs), Teal (communication), Pink (frontend)
