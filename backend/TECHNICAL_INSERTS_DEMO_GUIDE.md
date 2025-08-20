# Technical Inserts Demo Guide

## Demo Flow Integration Strategy

This guide provides the exact content for technical inserts that will be integrated into the main demo flow to satisfy recruiter requirements while maintaining the operational story.

## Insert 1: 90-Second Mini-Module (After Beat 2)

### **Slice A: Sources → Foundry → Backend (30 seconds)**

#### **What to Show**
- External feeds flowing into Foundry Inputs/Functions/Outputs
- Flask API + Celery + Redis architecture
- Real-time data processing pipeline

#### **On-Screen Labels**
```
FIRMS, NOAA, 911, traffic, GPS → Foundry → Flask/Celery/Redis (REST + WebSockets)
```

#### **VO Script (TTS-friendly)**
"F-I-R-M-S, N-O-A-A, nine-one-one, traffic and G-P-S flow into Pal-an-TEER Found-ree. Functions fuse the streams. Our Flask gateway and Celery workers pull the processed outputs in real time."

#### **Visual Elements**
- **Data Flow Animation**: Arrows showing data streams from external sources
- **Foundry Platform**: Inputs, Functions, Outputs clearly labeled
- **Backend Stack**: Flask API, Celery workers, Redis cache highlighted
- **Real-time Indicators**: WebSocket connections and REST endpoints

---

### **Slice B: Processing Engines (35 seconds)**

#### **What to Show**
- HazardProcessor, RiskProcessor, RouteOptimizer
- A* algorithm on H3 resolution-9 grids
- ML models and spatial processing

#### **On-Screen Labels**
```
HazardProcessor (ML Forecasting) → RiskProcessor (H3 Spatial) → RouteOptimizer (A* Algorithm)
```

#### **VO Script (TTS-friendly)**
"Three engines power decisions: hazard forecasting, risk on H-three hexes, and A-star routing that balances safety and speed."

#### **Visual Elements**
- **Processing Engines**: Three distinct boxes showing each processor
- **H3 Grid**: Hexagonal grid overlay showing spatial resolution
- **A* Algorithm**: Route calculation visualization
- **ML Models**: RandomForest and prediction indicators

---

### **Slice C: API Surface → Frontend (25 seconds)**

#### **What to Show**
- API endpoints connecting to UI panels
- REST and WebSocket communication
- Frontend integration

#### **On-Screen Labels**
```
/api/hazards, /api/hazard_zones, /api/routes, /api/risk, /api/evacuations, /api/units, /api/public_safety
```

#### **VO Script (TTS-friendly)**
"REST exposes hazards, routes, units and evacuations; Web-Sockets push live events to the dashboard."

#### **Visual Elements**
- **API Endpoints**: Clear listing of all endpoints
- **UI Panels**: Map, Units, Routing, AIP, Tracker panels
- **Communication Lines**: REST calls and WebSocket streams
- **Real-time Updates**: Live data flow indicators

---

## Insert 2: Request Lifecycle (After Beat 9) - 25-30 seconds

### **What to Show**
- POST /api/routes → 202 jobId → Celery compute → route_ready WebSocket → GET /api/routes/:id
- Complete async request lifecycle

#### **On-Screen Labels**
```
POST /api/routes → 202 Accepted (jobId) → Celery Processing → route_ready Event → GET /api/routes/:id → Geometry/ETA/Distance
```

#### **VO Script (TTS-friendly)**
"Planning a route returns 202 with a job I-D. Celery computes; a route_ready event triggers the UI to fetch geometry, E-T-A and distance."

#### **Visual Elements**
- **Request Flow**: Step-by-step animation of the async process
- **Status Codes**: 202 Accepted clearly shown
- **Job Processing**: Celery worker visualization
- **Event Trigger**: WebSocket event firing
- **Response Data**: Final route geometry and metrics

---

## Timing Budget

| Component | Duration | Total Time |
|-----------|----------|------------|
| Beats 1-2 (Current Script) | ~1:15 | 1:15 |
| **Insert 1: Technical Deep-Dive** | **1:30** | **2:45** |
| Beats 3-9 Demo | ~2:45-3:00 | 5:30-5:45 |
| **Insert 2: Request Lifecycle (Optional)** | **0:25-0:30** | **5:55-6:15** |
| Beats 10-12 + CTA | ~0:45-1:00 | **6:40-7:15** |

**Total with Insert 2**: 6:40-7:15 minutes
**Total without Insert 2**: 6:15-6:45 minutes

---

## Guardrails for Clean Delivery

### **Jargon Management**
- **Keep jargon on screen, not in VO**: Let labels carry acronyms
- **Simple narration**: Focus on operational benefits, not technical details
- **Highlight key terms**: FIRMS, NOAA, Foundry, H3, A* mentioned once clearly

### **Technical Accuracy**
- **H3 resolution**: Mention once as "res-9, about one-hundred-seventy-four meters"
- **API endpoints**: Show all names but only highlight those used in demo
- **Avoid unsupported claims**: No polygon drawing or click-to-create routes
- **Emphasize supported features**: Profile selection + route review

### **Visual Clarity**
- **Clear data flow**: Arrows and labels show direction
- **Color coding**: Different colors for different data types
- **Real-time indicators**: Animated elements show live processing
- **Status updates**: Clear progression through each step

---

## Appendix Slide (For Deep Technical Questions)

### **Backend Import Graph**
- **Auto-generated dependency graph**: Shows clean architecture boundaries
- **No circular dependencies**: Proves maintainable code structure
- **Module separation**: Clear separation of concerns
- **Scalability indicators**: Horizontal scaling capabilities

### **When to Use**
- **If recruiter asks for "more tech"**: Pull up appendix slide
- **Satisfies curiosity**: Shows technical depth without slowing demo
- **Not in main flow**: Keeps operational story focused
- **Available on demand**: Ready for technical deep-dive questions

---

## Integration Points

### **After Beat 2: Architecture Overview**
- **Natural transition**: From high-level architecture to technical deep-dive
- **Sets context**: Shows what powers the operational workflow
- **Builds credibility**: Demonstrates enterprise-grade infrastructure
- **Prepares audience**: Technical foundation for operational demo

### **After Beat 9: Request Lifecycle**
- **Explains what they just saw**: Route calculation in action
- **Shows async processing**: Real-time capabilities demonstrated
- **Technical validation**: Proves the architecture works
- **Optional inclusion**: Can be dropped if time is tight

---

## Success Metrics

### **Recruiter Satisfaction**
- **Architecture boxes ticked**: All technical requirements addressed
- **Operational story maintained**: Focus on business value
- **Technical depth shown**: Without overwhelming the audience
- **Timing respected**: Fits 5-7 minute target

### **Demo Flow Quality**
- **Seamless integration**: Technical inserts feel natural
- **Clear progression**: Each insert builds on previous content
- **Engaging delivery**: Maintains audience attention
- **Professional presentation**: Enterprise-grade demonstration

This approach hits every technical requirement while keeping your operational story tight and engaging. The 90-second mini-module satisfies the recruiter's architecture questions, and the optional request lifecycle provides technical validation without disrupting the flow.
