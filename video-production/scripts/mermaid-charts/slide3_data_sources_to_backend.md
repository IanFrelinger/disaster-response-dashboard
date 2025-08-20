# Slide 3: Data Sources → Foundry → Backend

## Real-time Data Pipeline

### Chart Description
This flow diagram visualizes the complete data pipeline from external sources through Palantir Foundry to the backend architecture, demonstrating the sophisticated real-time data processing capabilities.

### Mermaid Chart

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

### Key Components

#### External Data Sources
- **NASA FIRMS**: Satellite fire detection with brightness temperature and confidence scores
- **NOAA Weather**: Wind vectors, temperature, humidity, and atmospheric conditions
- **911 Emergency**: Real-time emergency call feeds and incident data
- **GPS Tracking**: Emergency vehicle location and status data
- **Traffic APIs**: Road conditions, closures, and traffic flow data

#### Palantir Foundry Platform
- **Foundry Inputs**: Real-time data ingestion and validation
- **Foundry Functions**: Data fusion, processing, and transformation
- **Foundry Outputs**: Processed data streams ready for consumption

#### Backend Architecture
- **Flask API**: REST gateway for synchronous data access
- **Celery Workers**: Asynchronous processing for complex calculations
- **Redis Cache**: Real-time data storage and caching
- **WebSockets**: Live updates and real-time communication

### Technical Impact
This diagram demonstrates:
- **Enterprise Integration**: Multiple external data sources
- **Real-time Processing**: Live data fusion and processing
- **Scalable Architecture**: Async processing with caching
- **Modern Stack**: Flask, Celery, Redis, WebSockets

### Export Information
- **Filename**: `slide3_data_sources_to_backend.png`
- **Size**: 216 KB
- **Dimensions**: 1920x1080 (Full HD)
- **Theme**: Dark theme with high contrast
- **Colors**: Blue (external), Green (Foundry), Orange (backend)
