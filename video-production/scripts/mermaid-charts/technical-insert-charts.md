# Technical Insert Mermaid Charts

## Slide 3: Data Sources → Foundry → Backend

### Flow Diagram: Real-time Data Pipeline

```mermaid
graph TB
    subgraph "External Data Sources"
        FIRMS["NASA FIRMS<br/>Satellite Fire Detection"]
        NOAA["NOAA Weather<br/>Atmospheric Data"]
        E911["911 Emergency<br/>Call Feeds"]
        GPS["GPS Tracking<br/>Emergency Vehicles"]
        TRAFFIC["Traffic APIs<br/>Road Conditions"]
    end
    
    subgraph "Palantir Foundry Platform"
        INPUTS["Foundry Inputs<br/>Real-time Ingestion"]
        FUNCTIONS["Foundry Functions<br/>Data Fusion & Processing"]
        OUTPUTS["Foundry Outputs<br/>Processed Data Streams"]
    end
    
    subgraph "Backend Architecture"
        FLASK["Flask API<br/>REST Gateway"]
        CELERY["Celery Workers<br/>Async Processing"]
        REDIS["Redis Cache<br/>Real-time Data"]
        WEBSOCKET["WebSockets<br/>Live Updates"]
    end
    
    FIRMS --> INPUTS
    NOAA --> INPUTS
    E911 --> INPUTS
    GPS --> INPUTS
    TRAFFIC --> INPUTS
    
    INPUTS --> FUNCTIONS
    FUNCTIONS --> OUTPUTS
    
    OUTPUTS --> FLASK
    OUTPUTS --> CELERY
    OUTPUTS --> REDIS
    
    FLASK --> WEBSOCKET
    CELERY --> WEBSOCKET
    REDIS --> WEBSOCKET
    
    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000
    classDef foundry fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000000
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000
    
    class FIRMS,NOAA,E911,GPS,TRAFFIC external
    class INPUTS,FUNCTIONS,OUTPUTS foundry
    class FLASK,CELERY,REDIS,WEBSOCKET backend
```

---

## Slide 4: Processing Engines

### Process Flow: ML-Powered Decision Engines

```mermaid
graph LR
    subgraph "Data Input"
        HAZARD_DATA["Hazard Data<br/>FIRMS + Weather"]
        SPATIAL_DATA["Spatial Data<br/>H3 Hexagons"]
        ROUTE_DATA["Route Data<br/>Road Networks"]
    end
    
    subgraph "Processing Engines"
        HP["HazardProcessor<br/>ML Forecasting<br/>RandomForest Models"]
        RP["RiskProcessor<br/>Spatial Analysis<br/>H3 Resolution-9"]
        RO["RouteOptimizer<br/>A* Algorithm<br/>Hazard Avoidance"]
    end
    
    subgraph "Output"
        PREDICTIONS["Fire Spread<br/>Predictions"]
        RISK_ZONES["Risk Assessment<br/>Hexagon Grids"]
        OPTIMAL_ROUTES["Safe Routes<br/>Real-time"]
    end
    
    HAZARD_DATA --> HP
    SPATIAL_DATA --> RP
    ROUTE_DATA --> RO
    
    HP --> PREDICTIONS
    RP --> RISK_ZONES
    RO --> OPTIMAL_ROUTES
    
    HP -.-> RP
    RP -.-> RO
    
    classDef input fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    classDef engine fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    classDef output fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000000
    
    class HAZARD_DATA,SPATIAL_DATA,ROUTE_DATA input
    class HP,RP,RO engine
    class PREDICTIONS,RISK_ZONES,OPTIMAL_ROUTES output
```

---

## Slide 5: API Surface → Frontend

### Architecture Diagram: API Integration

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

---

## Slide 10: Request Lifecycle

### Sequence Diagram: Async Route Planning

```mermaid
sequenceDiagram
    participant UI as Frontend UI
    participant API as Flask API
    participant CELERY as Celery Worker
    participant REDIS as Redis Cache
    participant WS as WebSocket
    
    UI->>API: POST /api/routes<br/>{origin, destination, profile}
    API->>API: Validate request
    API->>CELERY: Submit route calculation job
    API->>UI: 202 Accepted<br/>{jobId: "route_123"}
    
    Note over CELERY: Processing Route
    CELERY->>CELERY: Load hazard data
    CELERY->>CELERY: Calculate A* path
    CELERY->>CELERY: Apply constraints
    CELERY->>CELERY: Optimize route
    
    CELERY->>REDIS: Store route result
    CELERY->>WS: route_ready event<br/>{jobId: "route_123"}
    
    WS->>UI: WebSocket message<br/>route_ready
    
    UI->>API: GET /api/routes/route_123
    API->>REDIS: Retrieve route data
    API->>UI: Route response<br/>{geometry, eta, distance, hazards}
    
    Note over UI: Update map with route
    Note over UI: Display ETA and distance
    Note over UI: Show hazard avoidance
    
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    classDef backend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000000
    classDef cache fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000
    
    class UI frontend
    class API,CELERY,WS backend
    class REDIS cache
```

---

## Chart Integration Notes

### **Technical Specifications**
- **Chart Type**: Mermaid diagrams with custom styling
- **Color Scheme**: Consistent with slide theme (dark backgrounds, high contrast)
- **Text Color**: #000000 (black) for maximum readability
- **Stroke Width**: 2px for clear visibility
- **Font**: System fonts for compatibility

### **Integration Options**
1. **Static PNG Export**: Convert to high-resolution images
2. **HTML Embed**: Direct Mermaid.js integration
3. **Video Animation**: Animate chart elements for dynamic presentation

### **Expected Impact**
- **Technical Credibility**: Visual proof of sophisticated architecture
- **Understanding**: Complex concepts become immediately clear
- **Professional Presentation**: Enterprise-grade technical diagrams
- **Recruiter Satisfaction**: Directly addresses architecture requirements

### **Next Steps**
1. Export charts as PNG images
2. Integrate into slide generation process
3. Test visual quality and readability
4. Optimize for video presentation format
