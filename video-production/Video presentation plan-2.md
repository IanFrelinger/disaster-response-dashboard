# Video presentation plan-2

*Converted from PDF: Video presentation plan-2.pdf*

---

## Page 1

Disaster‑Response Demo Video Timeline with Dialogue and Images This document breaks down your extended briefing into time‑block segments for a four‑minute demo. Each block lists the approximate time range, provides a suggested narration that you can modify to match your style, and includes a reference image to display on screen at that moment. Feel free to adjust the durations slightly while keeping the total runtime under four minutes. 0:00–0:15 — Introduction ⏱ Suggested dialogue: Hi, I’m [Your Name], and I’m excited to share my Palantir Building Challenge project. I’ve built a disaster‑response platform that helps incident commanders and their teams coordinate faster and safer when minutes matter. Visual: A title card or a short on‑camera introduction works well here. No specific screenshot is required. 0:15–0:40 — Problem Statement & Motivation ⏱ Suggested dialogue: Emergency responders have to juggle radios, maps, spreadsheets and more, which slows them down when every minute counts. In many cases, lower‑level responders lack access to high‑level situational awareness and tools reserved for incident commanders 1 . I wanted to build something that brings everyone onto the same page without overloading them with information. Visual: Show the hazard detection screen so viewers see the starting point of the problem. The Live Map highlights active hazards, routes, units and evacuation zones: 1
## Page 2

0:40–0:55 — Target User Persona ⏱ Suggested dialogue: This system is designed for Incident Commanders, Operations and Planning chiefs, dispatchers and field units. We keep the Incident Commander at the top of the chain of command 2 but also give front‑line teams real‑time information and AI‑generated recommendations. Visual: You can remain on the hazard map or cut to a simple slide that lists the user roles. 0:55–1:25 — Technical Architecture & API Data Flow ⏱ Suggested dialogue: Under the hood, the front end uses React and Mapbox for a fast, 3‑D map. The backend runs on Python/Flask with WebSockets and Celery to handle real‑time updates. Everything sits on Palantir Foundry, which streams live data from NOAA, NASA and USGS and powers the AIP assistant. This API data‑flow diagram shows how external feeds flow into ingestion and hazard processing. From there, the data drives three core services: route optimisation, ontology and entities, and AI decision support 3 4 . Arrows point to the public endpoints (safety checks, hazard summaries, evacuation status) and the internal/fusion endpoints (dispatching resources, fused analytics, unit management). By focusing only on the essential components, the diagram stays clean and easy to follow 5 . Visual: 2
## Page 3

1:25–1:40 — Detect & Verify ⏱ Suggested dialogue: A satellite feed shows a new fire. The system flags it and scores the risk using population data and weather. As the Incident Commander, I confirm that this is a real incident. Visual: 1:40–1:50 — Triage & Risk Scoring ⏱ Suggested dialogue: 3
## Page 4

Looking at the risk and wind direction, I decide we should evacuate rather than shelter in place. The AI suggests this because the fire is near critical infrastructure. Visual: 1:50–2:00 — Define Zones ⏱ Suggested dialogue: With the drawing tool, I outline the evacuation zone and set its priority. This defines which buildings and residents are affected. Visual: 4
## Page 5

2:00–2:20 — Plan Routes ⏱ Suggested dialogue: I pick a route profile—civilian, EMS, fire tactical or police—each balancing safety and speed. The blue line you see is a hazard‑aware route calculated using A Star search. Visual: 5
## Page 6

2:20–2:30 — Assign Units & Track Assets ⏱ Suggested dialogue: I assign engines and medics. Dragging units onto the map updates their tasks and travel times. On the right, you can see building status—evacuated, in progress, refused or uncontacted. Visual: 2:30–2:50 — AI Support & Replan ⏱ Suggested dialogue: If I have a question, I can ask the AIP assistant something like “What happens if we lose Highway 30?” and get alternative routes right away. When a new hazard or weather update comes in, the system automatically recalculates and loops back to zone definition. Visual: 6
## Page 7

2:50–3:20 — Value Proposition & Impact ⏱ Suggested dialogue: This platform speeds up decisions, reduces staffing needed for manual data fusion, and gives every responder a common operating picture while keeping the Incident Commander firmly in control 1 . By automating routine steps, it lets teams focus on actions that save lives and property. Visual: You can reuse the asset management screen or remain on the hazard map to underscore the benefits. Here’s the asset dashboard again for reference: 7
## Page 8

3:20–3:40 — Foundry Integration & AI Assistance ⏱ Suggested dialogue: Thanks to Foundry’s data pipelines and ontology, I can ingest and fuse multiple feeds quickly. The AIP assistant is context‑aware because it sits on top of that ontology, so it can recommend re‑routing around a blocked highway or predict fire spread. Visual: You may display the API diagram again or stay on the AI support screen to remind viewers how Foundry and the AI fit together. For clarity, here’s the API data flow once more: 3:40–4:00 — Conclusion & Call to Action ⏱ Suggested dialogue: To wrap up, this project shows how real‑time data, AI assistance and a streamlined chain of command can modernize emergency response. I’d love to talk about piloting this with your teams. Visual: End on a thank‑you slide or return to your own camera to deliver the closing message. No specific screenshot is necessary. How to use this timeline Use these timeblocks as a flexible guide. Each segment pairs an example narration with a relevant image, so you can see at a glance what to say and what to show. Adjust the wording, durations or visuals as needed to fit your own style and ensure that the final video stays within the four‑minute limit. 8
## Page 9

1 2 emilms.fema.gov https://emilms.fema.gov/is_0200c/groups/450.html 3 4 5 API Flow Diagram: Best Practices & Examples | Multiplayer https://www.multiplayer.app/distributed-systems-architecture/api-flow-diagram/ 9
