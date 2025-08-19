# Voice-Over Script - Beat by Beat

## Complete Presentation Script (21 Slides)

### **BEAT 1: Title & Persona** (30 seconds)
**Slide Title**: Title & Persona

**Narration**: 
"Hi, I'm Ian Frelinger. I'll walk you through how an incident commander or operations section chief uses our web tool to size up a live situation, pick the right resource, plan access and monitor progress."

---

### **BEAT 2: Problem & Outcomes** (45 seconds)
**Slide Title**: Problem & Outcomes

**Narration**: 
"In a live incident, seconds matter. The challenge is seeing hazards, exposure and conditions in one place, then turning that into clear assignments. Our goal is faster time-to-decision, safer access to the scene and continuous status you can trust."

---

### **BEAT 3: Data & Architecture** (60 seconds)
**Slide Title**: Data & Architecture

**Narration**: 
"Data streams in from F-I-R-M-S, N-O-A-A, nine one one, population and traffic, and is fused in Palantir Foundry. The backend is Python and Flask, with Celery and WebSockets for real-time updates. The front end is React with Mapbox. The system provides APIs for hazards, risk assessment, route planning, unit management, evacuation tracking and public safety functions."

---

### **BEAT 4: Backend API Overview** (60 seconds)
**Slide Title**: Backend API Overview

**Narration**: 
"Our backend architecture uses Python with Flask for the web framework, Celery for background task processing, and Redis for caching and message queuing. The system exposes RESTful APIs for all major functions including hazard management, route optimization, and real-time status updates."

---

### **BEAT 5: API Data Flow** (60 seconds)
**Slide Title**: API Data Flow

**Narration**: 
"Data flows through our system in real-time. External sources like F-I-R-M-S and N-O-A-A feed into our data ingestion pipeline, which processes and normalizes the information before storing it in our PostgreSQL database. The processed data is then made available through our API endpoints for the frontend to consume."

---

### **BEAT 6: Hazards API Endpoints** (60 seconds)
**Slide Title**: Hazards API Endpoints

**Narration**: 
"Our hazards API provides endpoints for retrieving active hazard data, including wildfire perimeters, flood zones, and other emergency conditions. The API supports filtering by geographic region, hazard type, and confidence level, enabling precise situational awareness for emergency responders."

---

### **BEAT 7: Risk Assessment Engine** (60 seconds)
**Slide Title**: Risk Assessment Engine

**Narration**: 
"The risk assessment engine analyzes multiple data sources to calculate threat levels for specific areas. It considers factors like population density, infrastructure vulnerability, and environmental conditions to provide risk scores that help prioritize emergency response efforts."

---

### **BEAT 8: Routing API Architecture** (60 seconds)
**Slide Title**: Routing API Architecture

**Narration**: 
"Our routing API uses advanced algorithms to calculate optimal evacuation routes. It considers real-time traffic conditions, hazard locations, and road closures to provide the safest and fastest paths for emergency vehicles and civilian evacuation."

---

### **BEAT 9: Real-time WebSocket Streams** (60 seconds)
**Slide Title**: Real-time WebSocket Streams

**Narration**: 
"WebSocket connections provide real-time data streaming to the frontend. This enables live updates of hazard conditions, vehicle positions, and system status without requiring page refreshes, ensuring emergency personnel always have the most current information."

---

### **BEAT 10: Database Schema Design** (60 seconds)
**Slide Title**: Database Schema Design

**Narration**: 
"Our database schema is designed for high-performance emergency response operations. It includes optimized tables for hazard data, vehicle tracking, user management, and audit logging, with proper indexing to support fast queries during critical situations."

---

### **BEAT 11: API Security & Authentication** (60 seconds)
**Slide Title**: API Security & Authentication

**Narration**: 
"Security is paramount in emergency response systems. Our API implements OAuth 2.0 authentication, role-based access control, and encrypted data transmission. All endpoints are rate-limited and monitored for suspicious activity to ensure system integrity."

---

### **BEAT 12: Live Hazard Map** (60 seconds)
**Slide Title**: Live Hazard Map

**Narration**: 
"We operate from the Live Hazard Map. Hazard cells give immediate situational awareness—what's active, where it's clustered and where to focus next."

---

### **BEAT 13: Exposure & Conditions** (60 seconds)
**Slide Title**: Exposure & Conditions

**Narration**: 
"I turn on the buildings and weather layers. Buildings act as a practical proxy for population. Weather shows the conditions that will shape access and operations."

---

### **BEAT 14: Incident Triage** (60 seconds)
**Slide Title**: Incident Triage

**Narration**: 
"I center the map on a specific hazard. This anchors the workflow to the right location and helps me prioritize the next move."

---

### **BEAT 15: Resource Roster** (60 seconds)
**Slide Title**: Resource Roster

**Narration**: 
"Next, I open the units panel and select a fire engine from the roster. The roster keeps status and location at a glance so I can match the assignment to the right capability."

---

### **BEAT 16: Route Planning** (60 seconds)
**Slide Title**: Route Planning

**Narration**: 
"I open the routing panel and choose a fire tactical profile. The system shows the route that matches this profile, including the staging and access points."

---

### **BEAT 17: Route Result** (60 seconds)
**Slide Title**: Route Result

**Narration**: 
"I review the route details—an estimated time of arrival and distance. This tells me how long it will take and which path the unit will follow."

---

### **BEAT 18: Tasking** (60 seconds)
**Slide Title**: Tasking

**Narration**: 
"With the route validated, I confirm the unit will follow it. The plan moves from planning to execution."

---

### **BEAT 19: AIP Guidance** (60 seconds)
**Slide Title**: AIP Guidance

**Narration**: 
"In A-I-P decision support, I review recommendations and their confidence levels. It's a quick cross-check that our plan aligns with the current risk picture."

---

### **BEAT 20: Ops Status & CTA** (60 seconds)
**Slide Title**: Ops Status & CTA

**Narration**: 
"I open the building evacuation tracker to monitor status and progress. From map to assignment to tracking, everything stays connected. If this matches your mission profile, I'd be happy to walk through a personalized scenario next."

---

### **BEAT 21: Outro & Conclusion** (45 seconds)
**Slide Title**: Outro & Conclusion

**Narration**: 
"Thank you for joining me on this technical deep dive into our disaster response platform. We've demonstrated how real-time data integration, intelligent routing, and AI-powered decision support can transform emergency response operations. This system represents the future of emergency management—where every second counts and every decision matters. For more information or to schedule a personalized demo, please visit our website or contact our team. Together, we can build a safer, more resilient future."

---

## **Presentation Summary**

- **Total Beats**: 21 slides
- **Total Duration**: ~21 minutes (1,260 seconds)
- **Average Beat Duration**: 60 seconds
- **Voice**: ElevenLabs AI Voice (Professional, Clear)
- **Style**: Technical but accessible, professional tone
- **Special Cases**: Phonetic spelling only for acronyms (F-I-R-M-S, N-O-A-A, A-I-P) and phone numbers (nine one one)

## **Key Themes Throughout**

1. **Real-time Integration**: Emphasizing live data and immediate updates
2. **Operational Workflow**: Following the incident commander's decision process
3. **Technical Excellence**: Highlighting robust architecture and security
4. **Human-Centered Design**: Focusing on practical emergency response needs
5. **Future Vision**: Positioning as the future of emergency management

## **Call-to-Action Elements**

- **Beat 20**: Invitation for personalized scenario walkthrough
- **Beat 21**: Website visit and team contact information
- **Overall**: Emphasis on building safer, more resilient communities
