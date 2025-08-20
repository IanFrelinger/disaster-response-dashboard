# Slide 10: Request Lifecycle

## Async Route Planning

### Chart Description
This sequence diagram visualizes the complete asynchronous request lifecycle for route planning, demonstrating how the system handles complex calculations without blocking the user interface, using modern async patterns with job queues and real-time notifications.

### Mermaid Chart

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

### Key Components

#### Request Initiation
- **Frontend UI**: User initiates route planning request
- **Flask API**: Validates request and submits to job queue
- **202 Response**: Immediate acknowledgment with job ID

#### Async Processing
- **Celery Worker**: Background processing of complex route calculation
- **Hazard Data Loading**: Retrieves current hazard information
- **A* Path Calculation**: Advanced pathfinding algorithm execution
- **Constraint Application**: Applies hazard avoidance and vehicle constraints
- **Route Optimization**: Final optimization and validation

#### Result Delivery
- **Redis Cache**: Stores completed route data
- **WebSocket Event**: Real-time notification of completion
- **Frontend Update**: UI updates with route visualization
- **Route Display**: Shows geometry, ETA, distance, and hazard information

### Technical Impact
This diagram demonstrates:
- **Async Architecture**: Non-blocking request processing
- **Job Queue Pattern**: Scalable background processing
- **Real-time Notifications**: WebSocket-based event streaming
- **Caching Strategy**: Redis for performance optimization
- **Modern Patterns**: 202 Accepted with job tracking

### Request Flow Steps
1. **Request Submission**: UI sends route planning request
2. **Immediate Response**: API returns 202 with job ID
3. **Background Processing**: Celery worker calculates route
4. **Result Storage**: Completed route stored in Redis
5. **Event Notification**: WebSocket notifies UI of completion
6. **Data Retrieval**: UI fetches final route data
7. **Visual Update**: Map and interface updated with route

### Performance Benefits
- **Non-blocking UI**: User interface remains responsive
- **Scalable Processing**: Multiple requests can be processed simultaneously
- **Real-time Updates**: Immediate notification when processing completes
- **Caching**: Fast retrieval of completed calculations

### Export Information
- **Filename**: `slide10_request_lifecycle.png`
- **Size**: 365 KB
- **Dimensions**: 1920x1080 (Full HD)
- **Theme**: Dark theme with high contrast
- **Colors**: Blue (frontend), Green (backend), Orange (cache)
