# Slide 4: Processing Engines

## ML-Powered Decision Engines

### Chart Description
This process flow diagram visualizes the three specialized processing engines that power intelligent decision-making in the disaster response system, showing how data flows through ML models and spatial analysis to produce actionable insights.

### Mermaid Chart

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

### Key Components

#### Data Input Layer
- **Hazard Data**: FIRMS satellite data + NOAA weather conditions
- **Spatial Data**: H3 hexagonal grid system (~174m resolution)
- **Route Data**: Road networks, traffic conditions, and constraints

#### Processing Engines
- **HazardProcessor**: ML forecasting using RandomForest models for fire spread prediction
- **RiskProcessor**: Spatial analysis using H3 resolution-9 hexagons for risk assessment
- **RouteOptimizer**: A* algorithm with hazard avoidance for optimal pathfinding

#### Output Layer
- **Fire Spread Predictions**: ML-powered forecasting of hazard progression
- **Risk Assessment**: Spatial risk zones using hexagonal grids
- **Safe Routes**: Real-time optimized evacuation paths

### Technical Impact
This diagram demonstrates:
- **ML Integration**: RandomForest models for predictive analytics
- **Spatial Intelligence**: H3 hexagonal grid system for efficient spatial processing
- **Advanced Algorithms**: A* pathfinding with hazard avoidance
- **Real-time Processing**: Live updates and continuous optimization

### Processing Flow
1. **Data Ingestion**: Multiple data sources feed into specialized processors
2. **Parallel Processing**: Three engines work simultaneously on different aspects
3. **Cross-Communication**: Engines share data for comprehensive analysis
4. **Output Generation**: Real-time predictions, risk assessments, and routes

### Export Information
- **Filename**: `slide4_processing_engines.png`
- **Size**: 287 KB
- **Dimensions**: 1920x1080 (Full HD)
- **Theme**: Dark theme with high contrast
- **Colors**: Blue (input), Purple (engines), Green (output)
