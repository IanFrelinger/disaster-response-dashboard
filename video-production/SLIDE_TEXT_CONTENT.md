# Command Center - Complete Slide Text Content

## Demo Flow Overview
**Recruiter Cut**: 10 slides, 6:30 minutes
**Engineer Appendix**: 4 slides, 3-4 minutes (optional)
**IC User Story**: 12 slides, 8-10 minutes (optional)

---

## RECRUITER CUT (10 slides, 6:30 minutes)

### **Slide 1: Command Center**
**Duration**: 35 seconds

**For Incident Commanders and emergency planners who need a single operational picture.**

Welcome to the **Command Center** - a unified platform that transforms emergency management through **real-time data fusion** and **intelligent decision support**.

This system integrates **multiple data sources**, provides **ML-powered hazard analysis**, and delivers **optimized evacuation routes** for emergency responders.

Built on **Palantir Foundry architecture** with **real-time processing** and **spatial intelligence**.

---

### **Slide 2: Live Hazard Map**
**Duration**: 45 seconds

The **Live Hazard Map** displays real-time emergency incidents with **spatial intelligence** and **risk assessment**.

Active hazards are shown with **color-coded risk levels**, **risk scoring and proximity context**, and **affected areas**.

Data sources include **NASA FIRMS satellite feeds**, **NOAA weather data**, and **911 emergency calls**.

---

### **Slide 3: Emergency Units Panel**
**Duration**: 35 seconds

The **Emergency Units Panel** provides real-time visibility into **resource deployment** and **unit status**.

Track **fire engines**, **ambulances**, and **police units** with **GPS positioning** and **operational status**.

Units are categorized by **response type**, **availability**, and **current assignments**.

---

### **Slide 4: Route Optimization**
**Duration**: 40 seconds

**Route Optimization** calculates **safe evacuation paths** using **A* algorithm** with **hazard avoidance**.

Routes consider **traffic conditions**, **road closures**, **hazard zones**, and **vehicle constraints**.

Real-time updates ensure **optimal pathfinding** as conditions change during emergency response.

---

### **Slide 5: AIP Decision Support**
**Duration**: 35 seconds

The **AIP Decision Support** system provides **intelligent recommendations** for emergency response coordination.

Analyzes **resource availability**, **hazard progression**, and **response priorities** to suggest **optimal actions**.

Powered by **machine learning models** trained on historical emergency data and **real-time analytics**.

---

### **Slide 6: Building Evacuation Tracker**
**Duration**: 35 seconds

The **Building Evacuation Tracker** monitors **evacuation progress** and **occupant safety** in affected areas.

Tracks **evacuation status**, **occupant counts**, and **shelter assignments** for **real-time coordination**.

Designed to integrate with building systems; today shows building-level status and progress.

---

### **Slide 7: Analytics Dashboard**
**Duration**: 35 seconds

The **Analytics Dashboard** provides **comprehensive insights** into emergency response operations and **performance metrics**.

Displays **response times**, **resource utilization**, **hazard trends**, and **evacuation efficiency**.

Enables **data-driven decision making** and **continuous improvement** of emergency response capabilities.

---

### **Slide 8: Public Safety Communications**
**Duration**: 30 seconds

**Public Safety Communications** surfaces public-safety status; pluggable to existing mass-notification systems.

Surfaces current public-safety status for messaging teams.

Connects to existing notification platforms via integration points.

---

### **Slide 9: Incident Management**
**Duration**: 35 seconds

**Incident Management** provides **comprehensive oversight** of emergency response operations and **resource coordination**.

Manages **incident lifecycle**, **resource allocation**, **communication protocols**, and **response coordination**.

Enables **unified command structure** and **coordinated response** across multiple agencies and jurisdictions.

---

### **Slide 10: System Integration**
**Duration**: 30 seconds

**System Integration** connects **multiple data sources** and **emergency management systems** into a unified platform.

Integrates with **911 systems**, **traffic management**, **weather services**, and **public safety networks**.

Provides **real-time data fusion** and **seamless interoperability** across emergency response infrastructure.

---

### **Slide 11: Performance Metrics**
**Duration**: 25 seconds

**Performance Metrics** track **system performance** and **response effectiveness** across all emergency operations.

Monitors **response times**, **resource efficiency**, **evacuation success rates**, and **system reliability**.

Enables **continuous optimization** and **evidence-based improvements** to emergency response capabilities.

---

### **Slide 12: Conclusion and Next Steps**
**Duration**: 30 seconds

The **Command Center** demonstrates the power of **integrated emergency management** through **real-time data fusion**.

Key benefits include **faster response times**, **improved resource utilization**, **enhanced public safety**, and **coordinated operations**.

Next steps: **deployment planning**, **training programs**, and **continuous system enhancement**.

---

---

## ENGINEER APPENDIX (4 slides, 3-4 minutes)

### **Technical Insert Slides**

### **Technical Insert 1A: Data Sources → Foundry → Backend**
**Duration**: 35 seconds
**Chart**: Data flow diagram

**External Data Sources** flow into **Palantir Foundry** for real-time processing:

**FIRMS, NOAA, 911, traffic, GPS** → **Foundry Inputs/Functions/Outputs**

Our **Flask API + Celery + Redis** architecture pulls processed outputs:

**REST APIs** for data access + **WebSockets** for real-time updates

This creates a unified data pipeline that powers all emergency response operations.

---

### **Technical Insert 1B: Processing Engines**
**Duration**: 40 seconds
**Chart**: Processing engines diagram

Three specialized **Processing Engines** power intelligent decision-making:

**HazardProcessor** (ML Forecasting): RandomForest models predict fire spread patterns
**RiskProcessor** (H3 Spatial): H3 resolution-9 hexagons (~174m) for spatial analysis
**RouteOptimizer** (A* Algorithm): Advanced pathfinding with hazard avoidance

Each engine processes data through **Foundry Functions** with real-time updates.

This enables **ML-powered predictions** and **intelligent routing** for emergency response.

---

### **Technical Insert 1C: API Surface → Frontend**
**Duration**: 30 seconds
**Chart**: API surface diagram

**API Surface** connects backend processing to frontend interface:

**/api/hazards** - Active incident data
**/api/hazard_zones** - Spatial risk assessment
**/api/routes** - Optimized evacuation paths
**/api/risk** - Location-specific risk analysis
**/api/evacuations** - Progress tracking
**/api/units** - Resource management
**/api/public_safety** - Public communications

**REST APIs** expose data + **WebSockets** push live events to dashboard

---

### **Technical Insert 2: Request Lifecycle**
**Duration**: 35 seconds
**Chart**: Request lifecycle sequence diagram

**Async Request Lifecycle** for route planning:

**POST /api/routes** → **202 Accepted (jobId)**
**Celery Processing** → **route_ready Event**
**GET /api/routes/:id** → **Geometry/ETA/Distance**

This **asynchronous architecture** enables:
• Complex route calculations without blocking the UI
• Real-time updates via WebSocket events
• Scalable processing for multiple concurrent requests

The system maintains **sub-second response times** while processing complex spatial algorithms.

---

## RECRUITER CUT (6:15-6:45 minutes)

| Slide | Title | Duration | Key Actions |
|-------|-------|----------|-------------|
| 1 | Command Center | 25s | Persona + platform overview |
| 2 | Live Hazard Map | 35s | Toggle Buildings & Weather, Center hazard |
| 3 | Data Sources → Foundry → Backend | 30s | Foundry fusion + Flask/Celery/Redis |
| 4 | Emergency Units Panel | 25s | Select unit, show outcome |
| 5 | Route Optimization | 30s | Choose Fire Tactical + **Confirm assignment** |
| 6 | AIP Decision Support | 25s | Recs + confidence, training footnote |
| 7 | Building Evacuation Tracker | 25s | "Designed to integrate; today shows status" |
| 8 | Request Lifecycle | 25s | POST → 202 jobId → WS route_ready → GET |
| 9 | Analytics & Performance | 30s | Response times, health checks, logging, caching |
| 10 | Conclusion & CTA | 25s | "Book 30-minute scenario run-through" |

**Total Recruiter Cut**: 6:15-6:45 minutes (exactly 6:30)
**User Path**: Layers → Focus → Units → Routing → **Assignment** → AIP → Tracker

## ENGINEER APPENDIX (Optional 3-4 minutes)

| Slide | Title | Duration | Content |
|-------|-------|----------|---------|
| 11 | Processing Engines | 45s | Hazard/Risk/H3/A* details |
| 12 | API Surface → Frontend | 35s | All 7 endpoints + WebSockets |
| 13 | Public Safety Status | 25s | Status only, pluggable |
| 14 | Exception Flows | 35s | Timeouts, retries, resilience |

**Total Appendix**: 3-4 minutes
**Full Presentation**: 9-10 minutes

---

---

## IC USER STORY (12 slides, 8-10 minutes)

### **Slide 16: Earthquake Scenario: San Francisco**
**Duration**: 50 seconds

**Scenario:** 7.2 magnitude earthquake strikes San Francisco Bay Area at 2:47 PM

**Epicenter:** Hayward Fault, 3 miles east of downtown Oakland

**Immediate Impact:** Multiple building collapses, fires, gas leaks, bridge damage

**Critical Infrastructure:** BART stations compromised, major highways blocked

**Population at Risk:** 2.3 million people across 7 counties

**Time Pressure:** First 60 minutes critical for search & rescue operations

---

### **Slide 17: IC User Journey Overview**
**Duration**: 45 seconds

**Incident Commander Golden Path** - Complete workflow from situational awareness to execution:

**Personas:** IC (primary), Planner, Unit Lead, Public Info Officer

**End-to-End Storyboard:** 7 key beats that transform emergency response

**Each beat shows:** User Action → System Behavior → Outcome → Key APIs

This demonstrates the complete operational value of the Command Center platform.

---

### **Slide 18: Situational Picture**
**Duration**: 40 seconds

**User Action:** IC opens Dashboard; toggles Buildings & Weather; centers on hazard

**System Behavior:** Loads hazards + risk summary; overlays render

**Outcome:** Clear exposure + conditions at a glance

**Key APIs:** GET /api/hazards, GET /api/risk, GET /api/public_safety

**Focusing early prevents dispatching units into deteriorating areas.**

---

### **Slide 19: Resource Posture**
**Duration**: 40 seconds

**User Action:** IC opens Units and selects a fire engine from the roster

**System Behavior:** Shows status/location; highlights selection

**Outcome:** Right capability identified quickly

**Key APIs:** GET /api/units

**Selecting the right unit reduces time-to-arrival and risk.**

---

### **Slide 20: Access Planning**
**Duration**: 40 seconds

**User Action:** IC opens Routing and chooses the Fire Tactical profile

**System Behavior:** Displays route option(s) computed for that profile

**Outcome:** Safe approach path visible (ETA/distance)

**Key APIs:** GET /api/routes (profile view), later GET /api/routes/:id

**Profile-based routing keeps crews out of smoke/closures.**

---

### **Slide 21: Assignment & Execution**
**Duration**: 40 seconds

**User Action:** IC confirms the unit assignment to the selected route

**System Behavior:** Persists assignment; updates unit/route status

**Outcome:** Plan moves to execution

**Key APIs:** POST /api/units/:id/assign

**Assignment tracking enables coordinated response across multiple agencies.**

---

### **Slide 22: Decision Support Cross-Check**
**Duration**: 40 seconds

**User Action:** IC opens AIP Decision Support; reviews recommendations + confidence

**System Behavior:** Returns risk guidance for the area

**Outcome:** Confirms or adjusts plan with quick sanity-check

**Key APIs:** GET /api/risk?area=…

**AI-powered insights reduce decision uncertainty in time-critical situations.**

---

### **Slide 23: Progress Monitoring**
**Duration**: 40 seconds

**User Action:** IC opens Building Evacuation Tracker; drills into a building

**System Behavior:** Shows building-level status; pushes updates via WebSocket

**Outcome:** Reduced uncertainty, faster replans if needed

**Key APIs:** GET /api/evacuations, GET /api/public_safety, WS status events

**Real-time monitoring enables proactive response adjustments.**

---

### **Slide 24: Public Safety Status Surfacing**
**Duration**: 40 seconds

**User Action:** PIO views Public Safety status panel

**System Behavior:** Presents current public-facing status (no outbound sends)

**Outcome:** Accurate messaging inputs; pluggable to existing notification tools

**Key APIs:** GET /api/public_safety

**Unified status ensures consistent public communications across all channels.**

---

### **Slide 25: Async Lifecycle & Exception Handling**
**Duration**: 45 seconds

**Under the Hood:** POST /api/routes → 202 {jobId} → Celery compute → WS route_ready {routeId} → GET /api/routes/:id

**Alternative Flows:** Unit not available → filter by availability → select alternate unit

**Exception Handling:** Route compute delayed → non-blocking notice → retry path visible

**Resilience:** UI remains responsive on any backend error with readable messages

**This architecture ensures smooth operations even when complex calculations are running.**

---

### **Slide 26: Acceptance Criteria & Demo Readiness**
**Duration**: 45 seconds

**Map & Layers:** Buildings + Weather toggles change map; hazard focus recenters within 1s

**Units:** List shows type/status; selection persists highlight until changed

**Routing:** Profile selection updates route details within 1-2s or shows "pending"

**Assignment:** "Assigned" indicator appears; status reflected in oversight view

**Monitoring:** Building updates appear via WebSocket without refresh

**This validates the complete IC workflow from situational awareness to execution.**

---

## SLIDE SEQUENCE SUMMARY

### **RECRUITER CUT (10 slides, 6:30 minutes)**
| Slide | Title | Type | Duration | Notes |
|-------|-------|------|----------|-------|
| 1 | Command Center | Main | 25s | Persona + Foundry callout |
| 2 | Live Hazard Map | Main | 35s | Toggle layers + API badges |
| 3 | Data Sources → Foundry → Backend | Technical | 30s | Foundry fusion + PII note |
| 4 | Emergency Units Panel | Main | 25s | Select Fire Engine |
| 5 | Route Optimization | Main | 30s | Assignment + Full API lifecycle |
| 6 | AIP Decision Support | Main | 25s | Show recs + confidence |
| 7 | Building Evacuation Tracker | Main | 25s | Drill building + API badges |
| 8 | Request Lifecycle | Technical | 25s | Async flow |
| 9 | Analytics & Performance | Main | 30s | Reliability bullets |
| 10 | Conclusion and Next Steps | Main | 25s | Book demo call |

### **ENGINEER APPENDIX (4 slides, 3-4 minutes)**
| Slide | Title | Type | Duration | Notes |
|-------|-------|------|----------|-------|
| 11 | Processing Engines | Technical | 45s | H3/A*/ML details |
| 12 | API Surface → Frontend | Technical | 35s | All 7 endpoints |
| 13 | Public Safety Status | Technical | 25s | Status-only claims |
| 14 | Exception Flows & Resilience | Technical | 30s | Timeouts/retries |

### **IC USER STORY (12 slides, 8-10 minutes)**
| Slide | Title | Type | Duration | Notes |
|-------|-------|------|----------|-------|
| 15-26 | IC Workflow Beats | Story | 40-50s each | End-to-end user journey |

**Primary Presentation**: Recruiter Cut (10 slides, 6:30 minutes)
**Optional Deep-Dive**: Engineer Appendix (4 slides, 3-4 minutes)
**Optional Story**: IC User Story (12 slides, 8-10 minutes)

---

## STYLING CLASSES USED

- **highlight**: Primary emphasis (blue)
- **tech-term**: Technical terminology (green)
- **metric**: Performance metrics (orange)
- **api-endpoint**: API endpoints (purple)
- **data-flow**: Data flow elements (cyan)

All slides use a dark theme with high contrast and professional styling optimized for video presentation.
