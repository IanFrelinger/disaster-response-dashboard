# Disaster-Response Demo — Long Timeline with Exact Interactions (~5:40)

## Overview
This timeline provides explicit, step-by-step on-screen actions (clicks, drags, hovers, zooms, cuts) for a comprehensive disaster response platform demonstration. The demo showcases the Commander Dashboard and Live Map with technical architecture slides.

## Technical Specifications
- **Display Scale**: 110–125% for readability
- **Resolution**: 1920×1080, 30 fps
- **UI Theme**: Dark UI
- **Cursor Speed**: Slow & deliberate
- **Pauses**: 0.3–1.0 s between actions for viewer comprehension

---

## 0:00–0:30 — Introduction & Problem (title card)

### On-screen actions
- **0:00** Fade in intro artwork (still image)
- **0:02** Animate Title "Disaster Response Platform" (fade-in)
- **0:04** Animate Subtitle "Palantir Building Challenge – Ian Frelinger" (slide-up)
- **0:08** Hold 2 s; then crossfade to browser window

### VO (Ian)
"Hi, I'm Ian Frelinger. Emergencies move fast—tools shouldn't slow us down. Here's how we bring clear decisions to the front line."

---

## 0:30–1:00 — Users & Roles (Commander Dashboard)

### On-screen actions
- **0:30** In the app's header, click button:has-text("Commander Dashboard")
- **0:31** Pause briefly as dashboard loads
- **0:33** Move cursor over left column (roles area) and the zone cards
- **0:35** Show lower third: "Incident Commander · Planner · Dispatcher" (fade-in)
- **0:38** Hover Zone A card; pause 0.5 s

### VO
"Incident Commanders, planners, and dispatchers share the same picture. Commanders set intent; teams act quickly with less guesswork."

---

## 1:00–1:40 — Data Flow & API Overview (diagram slide)

### On-screen actions
- **1:00** Cut to Technical Architecture slide (full-screen PNG/SVG)
- **1:02** Zoom-pan to "Data Ingestion": highlight NASA FIRMS, NOAA, 911, population, traffic, GPS
- **1:09** Pan to "Processing": flash callouts "H3 indexing", "ML risk/spread"
- **1:17** Pan to "Delivery": label "React + Mapbox", "WebSocket API"
- **1:23** Crossfade to API data-flow diagram
- **1:25** Overlay callouts on endpoints: hazards, routes, risk, evacuations, units, public_safety (fade-in each, 0.2 s apart)

### VO
"Feeds enter the ingestion layer and are indexed on H3 hexagons. We fuse weather, population, and terrain, then predict spread. Routing uses A Star to find safe paths. The API exposes it all: GET /api/hazards, POST /api/routes, GET /api/risk, GET /api/evacuations, GET/PUT /api/units, and GET /api/public_safety. Behind each is a Foundry Function with Inputs/Outputs—so dashboards, mobile, and the AI assistant share one truth."

---

## 1:40–2:20 — Hazard Detection & Triage (Live Map)

### On-screen actions
- **1:40** Click button:has-text("Live Map")
- **1:41** Pause as map appears
- **1:43** Zoom in (mouse wheel ×2)
- **1:45** Pan (click-drag) toward the hazard cluster
- **1:48** Toggle "Hazards" checkbox off, pause 0.3 s, toggle on
- **1:51** Click a red hazard marker → tooltip/overlay appears
- **1:53** Hover the tooltip; pause 0.8 s for reading
- **1:55** Optional: toggle "Weather" on (show wind overlay), pause

### VO
"Hazards update live. One click shows intensity and population nearby. With layers like weather or evac zones you triage faster—monitor, shelter, or evacuate."

---

## 2:20–3:00 — Zones & Building Status (Commander Dashboard)

### On-screen actions
- **2:20** Click button:has-text("Commander Dashboard")
- **2:21** Scroll down the zone list slowly
- **2:24** Click "Zone A" card; keep it centered
- **2:26** Hover the progress bar; pause 0.5 s
- **2:28** Scroll building list if visible (small, controlled scroll)
- **2:32** Move cursor to "Special needs" badge (if present); pause

### VO
"Each card is a zone. Progress bars track evacuations; building lists reveal special-needs flags and refusals. Updating statuses keeps everyone aligned."

---

## 3:00–3:40 — Routing concept (A Star) — conceptual overlay

### On-screen actions
- **3:00** Click button:has-text("Live Map")
- **3:01** Crossfade a route overlay image on top of the map (blue line)
- **3:03** Animate the route draw (left→right wipe)
- **3:05** Show side callout with four profiles (stacked list; slide-in right):
  - Civilian Evacuation
  - EMS Response
  - Fire Tactical
  - Police Escort
- **3:12** Highlight hazard buffers the route avoids (pulsing ring)
- **3:18** Fade out the callout; keep route overlay visible

### VO
"Routing uses A Star—'A Star'—to balance safety and speed. Profiles reflect doctrine: civilians avoid hazards with wide buffers, EMS takes calculated risk, fire goes direct, police secures."

---

## 3:40–4:10 — AI Decision Support (concept)

### On-screen actions
- **3:40** Cut to AIP Commander static screen (or keep dashboard and show modal)
- **3:41** Type-on overlay in input bar: "What happens if we lose Highway 30?"
- **3:44** Fade-in a mock recommendation card: "Evacuate Zone B via Route 3; stage EMS at Oak Ridge. ETA 14 min."
- **3:48** Pulse recommendation card border 1×; pause

### VO
"Ask a question in plain language. The assistant pulls hazards, units, and traffic to suggest next actions. You remain in control—AI speeds the decision."

---

## 4:10–4:50 — Tech Deep Dive (hazard processing + API)

### On-screen actions
- **4:10** Cut back to API data-flow diagram
- **4:11** Zoom-in to "Hazard Processing"
- **4:12** Overlay three micro-callouts (sequential):
  - "H3 indexing @ res9 (~174 m)"
  - "ML spread probability (2 h horizon)"
  - "Risk polygons (low/med/high/critical)"
- **4:20** Pan to "Routing"; overlay "A Star graph, hazard penalties, vehicle constraints"
- **4:26** Pan to "API Endpoints"; sequentially highlight:
  - GET /api/hazards (summary)
  - GET /api/hazard_zones (GeoJSON)
  - POST /api/routes (A Star path + metrics)
  - GET /api/risk (buffer risk)
  - GET /api/evacuations (status by zone)
  - GET/PUT /api/units (resource state)
  - GET /api/public_safety (multilingual advisories)
- **4:42** Flash "WebSocket stream" label near Delivery box; pause

### VO
"Processing converts detections to H3 cells, predicts spread, and scores risk. Routing builds a hazard-aware graph. The API presents it cleanly via Foundry Functions—hazards, routes, risk, evacuations, units, and public safety—while WebSockets stream updates."

---

## 4:50–5:20 — Impact & Value (slide)

### On-screen actions
- **4:50** Cut to Impact slide (green card)
- **4:51** Animate Time Savings +40% bar upward (0.8 s)
- **4:53** Animate Coordination +60% bar upward (0.8 s)
- **4:55** Checkmarks animate in: "Unified sources", "Automated processing", "Scalable architecture", "Real-time updates", "Human judgment preserved"

### VO
"Faster decisions, fewer hand-offs, higher compliance—without drowning users in noise. This is a focused picture that accelerates safe action."

---

## 5:20–5:40 — Conclusion & CTA

### On-screen actions
- **5:20** Fade to conclusion artwork
- **5:22** Lower-third slides up: "Ian Frelinger · ian.frelinger@ex.com · github.com/ianfrelinger"
- **5:32** Lower-third fades out, hold background 3 s
- **5:40** Fade to black

### VO
"Thanks for watching. I'd love to discuss piloting this with your team."

---

## Appendix — Exact Selectors & Gesture Cues (for Playwright or manual)

### Navigation
- **Commander Dashboard**: `button:has-text("Commander Dashboard")` → click
- **Live Map**: `button:has-text("Live Map")` → click

### Map (Mapbox)
- **Canvas**: `.mapboxgl-canvas` → wheel (zoom), mousedown + drag (pan)
- **Hazard marker**: `.mapboxgl-marker` (or layer click event) → click
- **Layer toggles** (if visible sidebar): "Hazards", "Routes", "Units", "Evac Zones" → click checkboxes by label

### Dashboard
- **Zone card**: `[data-zone-card="Zone A"]` (or the first card) → click / hover
- **Scroll lists**: container element → wheel (slow)

### Diagram segments (slides)
- Use prepared PNG/SVGs and cut in/out
- Highlights via overlay boxes positioned at component bounding boxes

### Timing cues
- **Between every click/drag**: pause 0.3–0.6 s
- **After opening a tooltip or zone**: pause 0.8–1.0 s for viewer comprehension
- **Zoom increments**: two steps at a time for clarity

---

## Asset Requirements

### Images/Slides Needed
1. **Introduction artwork** - Disaster response theme
2. **Technical Architecture diagram** - Data flow visualization
3. **API data-flow diagram** - Endpoint mapping
4. **Route overlay image** - Blue line on map
5. **AIP Commander interface** - Mock AI interface
6. **Impact slide** - Green-themed metrics
7. **Conclusion artwork** - Professional closing

### Audio Requirements
- **Voice-over narration** - Ian Frelinger's voice
- **Background music** - Subtle, professional
- **Sound effects** - Minimal UI interaction sounds

### Technical Setup
- **Browser**: Chrome/Chromium with 1920×1080 viewport
- **Recording**: 30 fps, high quality
- **Post-processing**: Smooth transitions, professional color grading
