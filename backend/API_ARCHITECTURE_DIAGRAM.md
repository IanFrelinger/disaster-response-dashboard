# Disaster Response Backend API Architecture Diagram

## System Overview

The Disaster Response Backend API is a sophisticated, multi-layered system that processes real-time emergency data, provides ML-powered hazard analysis, calculates safe evacuation routes, and coordinates emergency resources through a Foundry-based architecture.

## Architecture Diagram

```mermaid
graph TB
    %% External Data Sources
    subgraph "External Data Sources"
        NASA["NASA FIRMS<br/>Satellite Data"]
        NOAA["NOAA Weather<br/>Atmospheric Data"]
        E911["911 Emergency<br/>Call Feeds"]
        GPS["GPS Tracking<br/>Emergency Vehicles"]
        TRAFFIC["Traffic APIs<br/>Road Conditions"]
    end

    %% Data Ingestion Layer
    subgraph "Data Ingestion Layer"
        FIRMS["FIRMS Data<br/>Processor"]
        WEATHER["Weather Data<br/>Processor"]
        EMERGENCY["Emergency Call<br/>Processor"]
        TRACKING["Vehicle Tracking<br/>Processor"]
    end

    %% Foundry Integration Layer
    subgraph "Foundry Platform"
        INPUTS["Foundry Inputs<br/>/data/raw/*"]
        FUNCTIONS["Foundry Functions<br/>@function decorators"]
        OUTPUTS["Foundry Outputs<br/>/data/processed/*"]
    end

    %% Core Processing Layer
    subgraph "Core Processing Engine"
        HP["HazardProcessor<br/>ML Prediction Engine"]
        RO["RouteOptimizer<br/>A* Algorithm"]
        RP["RiskProcessor<br/>Risk Assessment"]
    end

    %% API Layer
    subgraph "API Endpoints"
        DISASTER_API["Disaster API<br/>Foundry Functions"]
        SIMPLE_API["Simple API<br/>Flask Endpoints"]
        FUSION_API["Foundry Fusion API<br/>Data Integration"]
    end

    %% Data Models
    subgraph "Data Models"
        HAZARD["HazardZone<br/>Risk Assessment"]
        UNIT["EmergencyUnit<br/>Resource Tracking"]
        ROUTE["EvacuationRoute<br/>Safe Paths"]
        BUILDING["Building<br/>Infrastructure"]
        INCIDENT["Incident<br/>Event Tracking"]
    end

    %% Frontend Integration
    subgraph "Frontend Services"
        DASHBOARD["Dashboard<br/>Real-time Updates"]
        MAP["3D Terrain Map<br/>Spatial Visualization"]
        ANALYTICS["Analytics Panel<br/>Performance Metrics"]
    end

    %% Data Flow Connections
    NASA --> FIRMS
    NOAA --> WEATHER
    E911 --> EMERGENCY
    GPS --> TRACKING
    TRAFFIC --> TRACKING

    FIRMS --> INPUTS
    WEATHER --> INPUTS
    EMERGENCY --> INPUTS
    TRACKING --> INPUTS

    INPUTS --> FUNCTIONS
    FUNCTIONS --> HP
    FUNCTIONS --> RO
    FUNCTIONS --> RP

    HP --> OUTPUTS
    RO --> OUTPUTS
    RP --> OUTPUTS

    OUTPUTS --> DISASTER_API
    OUTPUTS --> SIMPLE_API
    OUTPUTS --> FUSION_API

    DISASTER_API --> HAZARD
    DISASTER_API --> UNIT
    DISASTER_API --> ROUTE
    SIMPLE_API --> BUILDING
    SIMPLE_API --> INCIDENT
    FUSION_API --> HAZARD
    FUSION_API --> UNIT
    FUSION_API --> ROUTE

    HAZARD --> DASHBOARD
    UNIT --> DASHBOARD
    ROUTE --> MAP
    BUILDING --> MAP
    INCIDENT --> ANALYTICS

    %% Styling
    classDef external fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000000
    classDef ingestion fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000000
    classDef foundry fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000000
    classDef processing fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000
    classDef api fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000000
    classDef models fill:#f1f8e9,stroke:#33691e,stroke-width:2px,color:#000000
    classDef frontend fill:#e0f2f1,stroke:#004d40,stroke-width:2px,color:#000000

    class NASA,NOAA,E911,GPS,TRAFFIC external
    class FIRMS,WEATHER,EMERGENCY,TRACKING ingestion
    class INPUTS,FUNCTIONS,OUTPUTS foundry
    class HP,RO,RP processing
    class DISASTER_API,SIMPLE_API,FUSION_API api
    class HAZARD,UNIT,ROUTE,BUILDING,INCIDENT models
    class DASHBOARD,MAP,ANALYTICS frontend
```

## Detailed Component Breakdown

### 1. Data Ingestion Layer

#### NASA FIRMS Integration
- **Purpose**: Satellite fire detection data processing
- **Data**: Brightness temperature, confidence scores, coordinates
- **Processing**: H3 spatial indexing, confidence calculation
- **Output**: GeoDataFrame with fire detection points

#### NOAA Weather Integration
- **Purpose**: Atmospheric condition monitoring
- **Data**: Wind vectors (u_wind, v_wind), temperature, humidity
- **Processing**: Wind speed/direction calculation, spatial indexing
- **Output**: Weather conditions with spatial coordinates

#### Emergency Call Processing
- **Purpose**: Real-time 911 incident tracking
- **Data**: Call location, incident type, priority level
- **Processing**: Geocoding, incident categorization
- **Output**: Structured emergency incident data

### 2. Core Processing Engine

#### HazardProcessor
```python
class HazardProcessor:
    - ML Model: RandomForest for spread prediction
    - Spatial Indexing: H3 hexagons (~174m resolution)
    - Prediction Horizon: 2 hours
    - Features: Weather, terrain, historical data
```

**Key Methods:**
- `process_firms_data()`: NASA satellite data processing
- `process_weather_data()`: NOAA weather data processing
- `predict_hazard_spread()`: ML-powered spread prediction
- `calculate_risk_zones()`: Risk assessment and zoning

#### RouteOptimizer
```python
class RouteOptimizer:
    - Algorithm: A* pathfinding with hazard avoidance
    - Buffer Distance: 500m hazard avoidance
    - Vehicle Constraints: Type-specific limitations
    - Real-time Updates: Traffic and hazard integration
```

**Key Methods:**
- `calculate_safe_route()`: Hazard-avoiding route calculation
- `_build_routing_graph()`: Graph construction with penalties
- `_calculate_astar_route()`: A* algorithm implementation
- `_calculate_route_metrics()`: Performance and safety metrics

### 3. API Endpoints Architecture

#### Foundry Functions (Primary API)
```python
@function decorators for:
- get_hazard_summary(): Hazard zone overview
- get_hazard_zones_geojson(): Spatial data for mapping
- get_evacuation_routes(): Safe evacuation paths
- get_risk_assessment(): Location-specific risk analysis
- calculate_safe_route_api(): Advanced routing with constraints
- get_evacuation_status(): Evacuation progress tracking
- get_resource_coordination(): Emergency resource management
- get_public_safety_status(): Public-facing safety info
```

#### Flask API (Simple Endpoints)
```python
Flask routes for:
- /api/disaster-data: Comprehensive disaster response data
- /api/health: System health monitoring
- /api/update-resource-status: Resource status updates
- /api/add-alert: Emergency alert management
```

#### Foundry Fusion API (Data Integration)
```python
Blueprint for:
- Real-time data fusion and caching
- Analytics calculation and aggregation
- Multi-source data synchronization
- Performance optimization and monitoring
```

### 4. Data Models

#### Core Entities
- **HazardZone**: Risk assessment with H3 spatial indexing
- **EmergencyUnit**: Resource tracking with status management
- **EvacuationRoute**: Safe path calculation with metrics
- **Building**: Infrastructure risk assessment
- **Incident**: Event tracking and management

#### Spatial Data Structure
```python
H3 Resolution: 9 (~174m hexagons)
Coordinate System: EPSG:4326 (WGS84)
Geometry Types: Point, LineString, Polygon
Spatial Indexing: R-tree for efficient queries
```

### 5. Data Flow Architecture

#### Real-Time Processing Pipeline
```
1. External Data Sources → Data Ingestion
2. Data Ingestion → Foundry Inputs
3. Foundry Inputs → Processing Functions
4. Processing Functions → Core Engines
5. Core Engines → Foundry Outputs
6. Foundry Outputs → API Endpoints
7. API Endpoints → Frontend Services
```

#### Spatial Data Processing
```python
# H3 Spatial Indexing
h3_resolution = 9  # ~174m hexagons
gdf['h3_index'] = gdf.apply(
    lambda row: h3.latlng_to_cell(row['latitude'], row['longitude'], h3_resolution), 
    axis=1
)

# Spatial Analysis
location_point = Point(longitude, latitude)
buffer_wgs84 = location_point.buffer(radius_km * 1000)
nearby_hazards = hazard_gdf[hazard_gdf.geometry.intersects(buffer_wgs84)]
```

### 6. Performance Optimizations

#### Caching Strategy
- **Hazard Data**: 5-minute cache intervals
- **Route Calculations**: Hazard-based invalidation
- **Resource Positions**: 30-second real-time updates
- **Analytics**: Aggregated data caching

#### Spatial Optimization
- **H3 Hexagons**: Efficient spatial queries
- **R-tree Indexing**: Fast geometric operations
- **Spatial Buffering**: Optimized proximity calculations
- **Batch Processing**: Bulk data operations

### 7. Integration Points

#### Foundry Platform
- **Data Sources**: All raw data through Foundry Inputs
- **Processing**: Hazard and route processing as Functions
- **Outputs**: Processed data written back to Foundry
- **Real-time Updates**: WebSocket connections for live data

#### Frontend Services
- **REST API**: JSON endpoints for dashboard data
- **WebSocket**: Real-time updates for live tracking
- **GeoJSON**: Spatial data for mapping visualization
- **CORS**: Cross-origin support for web frontend

### 8. Security & Reliability

#### Data Validation
- **Input Sanitization**: Coordinate and parameter validation
- **Geometry Validation**: Spatial data integrity checks
- **Type Checking**: Strong typing throughout pipeline
- **Error Handling**: Graceful degradation with fallbacks

#### Monitoring & Logging
- **Structured Logging**: Comprehensive logging with structlog
- **Health Checks**: API endpoint monitoring
- **Performance Metrics**: Real-time performance tracking
- **Error Reporting**: Detailed error logging and reporting

This architecture provides a robust, scalable foundation for emergency response coordination with real-time data processing, ML-powered predictions, and comprehensive API coverage for all disaster response needs.
