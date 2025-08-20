# Disaster Response Dashboard - Component Interaction Diagram

## 🔄 Component Interaction Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    USER INTERFACE LAYER                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │   App.tsx       │    │  Main Router    │    │  State Store    │                │
│  │   (Root)        │◄──►│  (React Router) │◄──►│  (Zustand)      │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
│           │                                                                         │
│           ▼                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                              COMPONENT GRID                                │    │
│  │                                                                             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │Evacuation   │  │LiveHazard   │  │Weather      │  │Building     │      │    │
│  │  │Dashboard    │  │Map          │  │Panel        │  │Evacuation   │      │    │
│  │  │             │  │             │  │             │  │Tracker      │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │                                                                             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │AIP Decision │  │MultiHazard  │  │RoleBased    │  │Efficiency   │      │    │
│  │  │Support      │  │Map          │  │Routing      │  │Metrics      │      │    │
│  │  │             │  │             │  │             │  │             │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │                                                                             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │Unit         │  │Search       │  │DrillDown    │  │Technical    │      │    │
│  │  │Management   │  │Markings     │  │Capability   │  │Architecture  │      │    │
│  │  │             │  │             │  │             │  │             │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    SERVICE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │   API Service   │    │  Foundry API    │    │  WebSocket      │                │
│  │   (Axios)       │◄──►│  Service        │◄──►│  Service        │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
│           │                       │                       │                        │
│           ▼                       ▼                       ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  Data Fusion    │    │  Real-time      │    │  Performance    │                │
│  │  Service        │    │  Updates        │    │  Monitoring     │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  Flask API      │    │  Data Models    │    │  Foundry        │                │
│  │  (simple_api)   │◄──►│  (disaster_     │◄──►│  Integration    │                │
│  │                 │    │  models.py)     │    │  (foundry_      │                │
│  └─────────────────┘    └─────────────────┘    │  fusion_api)    │                │
│                                                 └─────────────────┘                │
│                                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  Redis Cache    │    │  Celery Tasks   │    │  Real-time      │                │
│  │  (Data Store)   │◄──►│  (Background    │◄──►│  Processing     │                │
│  │                 │    │  Jobs)          │    │  (Streaming)    │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Detailed Component Dependencies

### **1. Core Data Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│   Component     │───▶│   State Update  │
│   (Click/Form)  │    │   State         │    │   (Zustand)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Service   │◄───│   Service       │◄───│   Backend       │
│   Call          │    │   Layer         │    │   Processing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Update   │───▶│   Component     │───▶│   UI Refresh    │
│   (Response)    │    │   Re-render     │    │   (Display)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **2. Real-time Data Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend       │───▶│   WebSocket     │───▶│   Frontend      │
│   Data Change   │    │   Stream        │    │   Components    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   State Store   │◄───│   Real-time     │◄───│   Live Updates  │
│   Update        │    │   Service       │    │   (Socket.io)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Component     │───▶│   UI Update     │───▶│   User View     │
│   Re-render     │    │   (Animation)   │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **3. Map Component Interactions**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Map Controls  │───▶│   Map State     │───▶│   Layer Toggle  │
│   (Zoom/Pan)    │    │   (Zustand)     │    │   (Hazards)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Geospatial    │◄───│   Mapbox GL     │◄───│   Tile Service  │
│   Operations    │    │   (3D Render)   │    │   (MBTiles)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hazard Data   │───▶│   Visual        │───▶│   User          │
│   (H3 Index)    │    │   Overlay       │    │   Interaction   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **4. AI Decision Support Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Query    │───▶│   AI Service    │───▶│   Backend       │
│   (Decision)    │    │   (Frontend)    │    │   Processing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Analysis   │◄───│   Foundry       │◄───│   Data Fusion   │
│   (ML Models)   │    │   Integration   │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Decision      │───▶│   UI Display    │───▶│   User Action   │
│   Recommendation│    │   (Guidance)    │    │   (Execution)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Component Communication Patterns

### **1. Parent-Child Communication**
- **Props Down**: Data and callbacks passed from parent to child
- **Events Up**: Child components emit events to parent via callbacks
- **State Lifting**: Shared state managed at common ancestor level

### **2. Cross-Component Communication**
- **Zustand Store**: Global state management for shared data
- **Context API**: Theme and configuration sharing
- **Event Bus**: Custom event system for loose coupling

### **3. Service Communication**
- **API Calls**: HTTP requests for CRUD operations
- **WebSocket**: Real-time bidirectional communication
- **Service Workers**: Background processing and caching

## 📊 Data Flow Metrics

### **Performance Characteristics**
- **API Response Time**: < 200ms for standard operations
- **Real-time Updates**: < 100ms latency for critical data
- **Map Rendering**: < 16ms for 60fps smooth interaction
- **Component Mount**: < 50ms for complex components

### **Scalability Patterns**
- **Lazy Loading**: Components loaded on-demand
- **Virtual Scrolling**: Large datasets handled efficiently
- **Caching Strategy**: Multi-level caching (Redis, Browser, Service Worker)
- **Code Splitting**: Bundle optimization for faster loading

This diagram provides a comprehensive view of how all components interact and communicate within the disaster response dashboard system, showing the data flow, dependencies, and communication patterns that enable real-time emergency management operations.
