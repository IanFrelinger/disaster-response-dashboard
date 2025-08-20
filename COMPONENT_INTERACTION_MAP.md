# Disaster Response Dashboard - Component Interaction Map

## 🗺️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   App.tsx       │  │  Main Router    │  │  State Store    │  │  Theme Provider │ │
│  │   (Root)        │  │  (React Router) │  │  (Zustand)      │  │  (CSS Context)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                    COMPONENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Dashboard      │  │  Map System     │  │  AI Support     │  │  Analytics      │ │
│  │  Components     │  │  Components     │  │  Components     │  │  Components     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                    SERVICE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  API Service    │  │  Foundry API    │  │  WebSocket      │  │  Data Fusion    │ │
│  │  (Axios)        │  │  Service        │  │  Service        │  │  Service        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                    BACKEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Flask API      │  │  Data Models    │  │  Foundry        │  │  Real-time      │ │
│  │  (simple_api)   │  │  (disaster_     │  │  Integration    │  │  Processing     │ │
│  │                 │  │  models.py)     │  │  (foundry_      │  │  (Redis/Celery) │ │
│  └─────────────────┘  └─────────────────┘  │  fusion_api)    │  └─────────────────┘ │
│                                             └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Component Interaction Flow

### **1. Data Flow Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   API       │───▶│   Backend   │───▶│   Foundry   │
│   Components│    │   Service   │    │   Models    │    │   Platform  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │                   │
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                           Real-time Updates via WebSocket
```

### **2. Component Hierarchy & Dependencies**

```
App.tsx (Root Container)
├── EvacuationDashboard
│   ├── AIPDecisionSupport
│   ├── UnitManagement
│   ├── RoleBasedRouting
│   └── TechnicalArchitecture
├── SimpleMapboxTest (TACMAP)
│   ├── LiveHazardMap
│   ├── Enhanced3DTerrain
│   └── Mapbox3DBuildings
├── WeatherPanel
├── BuildingEvacuationTracker
├── MultiHazardMap
├── RoleBasedRouting
├── SearchMarkings
├── EfficiencyMetrics
└── DrillDownCapability
```

## 🧩 Detailed Component Map

### **CORE DASHBOARD COMPONENTS**

#### **1. EvacuationDashboard** (`frontend/src/components/EvacuationDashboard.tsx`)
- **Purpose**: Main evacuation zone management and coordination hub
- **Dependencies**: 
  - `AIPDecisionSupport` - AI-powered decision guidance
  - `UnitManagement` - Emergency unit coordination
  - `RoleBasedRouting` - Route optimization
  - `TechnicalArchitecture` - System status
- **Data Flow**: 
  - Receives evacuation zones and building data
  - Manages zone selection and status updates
  - Coordinates with AI decision support
- **State Management**: 
  - Selected zones and buildings
  - Evacuation progress tracking
  - Unit assignment status

#### **2. AIPDecisionSupport** (`frontend/src/components/AIPDecisionSupport.tsx`)
- **Purpose**: AI-powered operational guidance and decision support
- **Dependencies**: 
  - `OperationalGuidance` interface
  - `AlternativeScenario` interface
- **Features**:
  - Real-time AI recommendations
  - Confidence scoring
  - Alternative scenario analysis
  - Decision reasoning
- **Interactions**:
  - User queries and responses
  - Decision validation
  - Guidance updates

### **MAP & VISUALIZATION COMPONENTS**

#### **3. SimpleMapboxTest** (`frontend/src/components/tacmap/SimpleMapboxTest.tsx`)
- **Purpose**: Core map visualization with Mapbox integration
- **Dependencies**: 
  - `mapbox-gl` for 3D rendering
  - `@turf/turf` for geospatial operations
  - `h3-js` for hexagonal grid indexing
- **Features**:
  - 3D terrain visualization
  - Hazard layer overlays
  - Route visualization
  - Real-time updates

#### **4. LiveHazardMap** (`frontend/src/components/tacmap/LiveHazardMap.tsx`)
- **Purpose**: Real-time hazard monitoring and visualization
- **Dependencies**: 
  - `SimpleMapboxTest` for base map
  - `WeatherData` for environmental context
- **Features**:
  - Live hazard updates
  - Weather integration
  - Layer toggling
  - Real-time analytics

#### **5. Enhanced3DTerrain** (`frontend/src/components/tacmap/Enhanced3DTerrain.tsx`)
- **Purpose**: Advanced 3D terrain and building visualization
- **Dependencies**: 
  - `three.js` for 3D rendering
  - `deck.gl` for large-scale data visualization
- **Features**:
  - 3D terrain modeling
  - Building height visualization
  - Elevation analysis
  - Spatial context

### **OPERATIONAL COMPONENTS**

#### **6. BuildingEvacuationTracker** (`frontend/src/components/BuildingEvacuationTracker.tsx`)
- **Purpose**: Real-time building evacuation status monitoring
- **Dependencies**: 
  - Evacuation zone data
  - Building status information
- **Features**:
  - Building-by-building tracking
  - Evacuation progress monitoring
  - Special needs identification
  - Real-time status updates

#### **7. RoleBasedRouting** (`frontend/src/components/RoleBasedRouting.tsx`)
- **Purpose**: Emergency unit routing based on role and capability
- **Dependencies**:
  - Unit type definitions
  - Route optimization algorithms
  - Hazard avoidance logic
- **Features**:
  - Role-based access control
  - Dynamic route calculation
  - Hazard avoidance
  - Performance optimization

#### **8. UnitManagement** (`frontend/src/components/UnitManagement.tsx`)
- **Purpose**: Emergency unit coordination and resource management
- **Dependencies**:
  - Unit status tracking
  - Equipment management
  - Capacity planning
- **Features**:
  - Unit status monitoring
  - Resource allocation
  - Performance tracking
  - Dispatch coordination

### **ANALYTICS & MONITORING COMPONENTS**

#### **9. EfficiencyMetrics** (`frontend/src/components/EfficiencyMetrics.tsx`)
- **Purpose**: Real-time performance monitoring and analytics
- **Dependencies**:
  - Performance data streams
  - Historical analytics
  - Real-time metrics
- **Features**:
  - Response time tracking
  - Resource utilization
  - Performance trends
  - Alert thresholds

#### **10. WeatherPanel** (`frontend/src/components/WeatherPanel.tsx`)
- **Purpose**: Weather data integration and fire weather monitoring
- **Dependencies**:
  - Weather API integration
  - Fire weather indices
  - Alert systems
- **Features**:
  - Current conditions
  - Fire weather warnings
  - Wind analysis
  - Forecast integration

#### **11. DrillDownCapability** (`frontend/src/components/DrillDownCapability.tsx`)
- **Purpose**: Detailed analysis and granular data exploration
- **Dependencies**:
  - Detail level definitions
  - Location data
  - Zoom controls
- **Features**:
  - Multi-level detail views
  - Location-specific analysis
  - Context switching
  - Data exploration

## 🔌 Service Layer Interactions

### **API Services**

#### **1. api.ts** (`frontend/src/services/api.ts`)
- **Purpose**: Core API communication layer
- **Dependencies**: Axios HTTP client
- **Endpoints**:
  - `/api/health` - Service health check
  - `/api/dashboard` - Dashboard data
  - `/api/hazards` - Hazard zone data
  - `/api/routes` - Evacuation routes
  - `/api/risk-assessment` - Risk analysis
  - `/api/scenario/{id}` - Scenario data

#### **2. foundryApi.ts** (`frontend/src/services/foundryApi.ts`)
- **Purpose**: Foundry platform integration
- **Dependencies**: Fetch API, Foundry SDK
- **Features**:
  - Data fusion state retrieval
  - Real-time updates
  - Hazard zone management
  - Unit coordination
  - Route optimization

#### **3. foundryDataFusion.ts** (`frontend/src/services/foundryDataFusion.ts`)
- **Purpose**: Advanced data processing and fusion
- **Dependencies**: Foundry transforms, data models
- **Features**:
  - Multi-source data fusion
  - Real-time processing
  - Predictive analytics
  - Performance optimization

### **WebSocket Services**

#### **4. realTimeService.ts** (`frontend/src/services/realTimeService.ts`)
- **Purpose**: Real-time data streaming and updates
- **Dependencies**: Socket.io client
- **Features**:
  - Live hazard updates
  - Unit location tracking
  - Weather alerts
  - Performance metrics

## 🗄️ Backend Data Models

### **Core Models** (`backend/models/disaster_models.py`)

#### **1. HazardZone**
- H3 geospatial indexing
- Risk assessment scoring
- Population impact analysis
- Real-time monitoring data

#### **2. EmergencyUnit**
- Unit type classification
- Status tracking
- Location management
- Equipment and capacity

#### **3. EvacuationRoute**
- Geospatial geometry
- Status monitoring
- Capacity planning
- Hazard avoidance

#### **4. Building**
- Address and location
- Evacuation status
- Special needs identification
- Occupancy tracking

## 🔄 Data Flow Patterns

### **1. Real-time Updates**
```
Backend Models → Redis Cache → WebSocket → Frontend Components → UI Updates
```

### **2. User Interactions**
```
User Input → Component State → API Service → Backend Processing → Data Update → UI Refresh
```

### **3. AI Decision Support**
```
Operational Data → AI Analysis → Decision Recommendations → User Interface → Decision Execution
```

### **4. Geospatial Operations**
```
Location Data → H3 Indexing → Spatial Queries → Map Rendering → Visual Updates
```

## 🧪 Testing & Validation

### **Testing Strategy**
- **Unit Tests**: Component-level testing with Vitest
- **Integration Tests**: API and service integration testing
- **E2E Tests**: Full user journey testing with Playwright
- **Performance Tests**: Load testing and optimization validation

### **Quality Assurance**
- **TypeScript**: Strict type checking and validation
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting standards
- **Coverage**: Comprehensive test coverage requirements

## 🚀 Performance & Scalability

### **Optimization Features**
- **Lazy Loading**: Component-level code splitting
- **Virtual Scrolling**: Large dataset handling
- **Caching**: Redis-based data caching
- **CDN Integration**: Static asset optimization

### **Monitoring & Observability**
- **Performance Metrics**: Real-time performance tracking
- **Error Tracking**: Comprehensive error monitoring
- **User Analytics**: Usage pattern analysis
- **System Health**: Service availability monitoring

This component interaction map provides a comprehensive view of how all parts of the disaster response dashboard work together to create a cohesive, real-time emergency management system.
