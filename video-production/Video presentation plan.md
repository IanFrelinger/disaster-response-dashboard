# Video presentation plan

*Converted from PDF: Video presentation plan.pdf*

---

## Page 1

Disaster‑Response Demo Video Timeline with Dialogue and Images This document breaks down your extended briefing into time‑block segments for a four‑minute demo. Each block lists the approximate time range, provides a suggested narration that you can modify to match your style, and includes a reference image to display on screen at that moment. Feel free to adjust the durations slightly while keeping the total runtime under four minutes. 0:00–0:15 — Introduction ⏱ Suggested dialogue: Hi, I’m [Your Name], and I’m excited to share my Palantir Building Challenge project. I’ve built a disaster‑response platform that helps commanders and teams coordinate faster and safer in crisis situations. Visual: A title card or a short on‑camera introduction works well here. No specific screenshot is required. 0:15–0:40 — Problem Statement & Motivation ⏱ Suggested dialogue: Today’s emergency responders juggle radios, maps and spreadsheets, which slows decision‑making when every minute counts. In many cases, lower‑level responders lack access to high‑level situational awareness and tools reserved for commanders 1 . I wanted to build something that brings everyone onto the same page without overwhelming them with data. Visual: Show the hazard detection screen so viewers see the starting point of the problem. The Live Map highlights active hazards, routes, units and evacuation zones: 1
## Page 2

0:40–0:55 — Target User Persona ⏱ Suggested dialogue: This system is designed for Incident Commanders, Operations and Planning chiefs, dispatchers and field units. It keeps the commander at the top of the chain of command 2 but also empowers front‑line teams with real‑time information and AI‑generated recommendations. Visual: You can remain on the hazard map or cut to a simple slide that lists the user roles. 0:55–1:25 — Technical Architecture & API Data Flow ⏱ Suggested dialogue: On the front end, I used React and Mapbox to create a fast, 3‑D map interface. The backend is Python/Flask with WebSockets and Celery for real‑time updates. All of this sits on Palantir Foundry, which streams live data from NOAA, NASA and USGS and powers the AIP assistant. To illustrate how the backend components interact, I built this API data‑flow diagram. External feeds—such as NASA FIRMS, NOAA weather and 911 calls—flow into the ingestion and hazard‑processing layer. From there, data drives three core services: route optimisation, ontology and entities, and AI decision support 3 4 . Arrows show how these processors push information to public endpoints (safety checks, hazard summaries, evacuation status) and internal/fusion endpoints (dispatching resources, fused analytics, unit management). By focusing on relevant components and showing clear interaction paths, the diagram remains readable and actionable 5 . Visual: 2
## Page 3

1:25–1:40 — Detect & Verify ⏱ Suggested dialogue: Here, a satellite feed shows a new fire. The system flags it and scores the risk based on population and weather. As the commander, I confirm that this is a real incident. Visual: 1:40–1:50 — Triage & Risk Scoring ⏱ Suggested dialogue: 3
## Page 4

Based on risk and wind direction, I choose to evacuate rather than shelter in place. The AI suggests this because the fire is near critical infrastructure. Visual: 1:50–2:00 — Define Zones ⏱ Suggested dialogue: Using the drawing tool, I outline the evacuation zone and set its priority. This defines which buildings and residents are affected. Visual: 4
## Page 5

2:00–2:20 — Plan Routes ⏱ Suggested dialogue: I select a route profile—civilian, EMS, fire tactical or police. Each balances safety versus speed. The blue line you see is a hazard‑aware route calculated using A* search. Visual: 5
## Page 6

2:20–2:30 — Assign Units & Track Assets ⏱ Suggested dialogue: Next, I assign engines and medics. Dragging units onto the map updates their tasks and travel times. On the right, you can see building status—evacuated, in progress or refused. Visual: 2:30–2:50 — AI Support & Replan ⏱ Suggested dialogue: I can ask the AIP assistant questions like “What if we lose Highway 30?” and immediately get alternative routes. If a new hazard or weather update comes in, the system automatically recalculates and loops back to zone definition. Visual: 6
## Page 7

2:50–3:20 — Value Proposition & Impact ⏱ Suggested dialogue: This platform speeds up decisions, reduces staffing needed for manual data fusion, and gives every responder a common operating picture while keeping the commander firmly in control 1 . By automating routine steps, it allows teams to focus on actions that save lives and property. Visual: You can reuse the asset management screen or remain on the hazard map to underscore the benefits. Here’s the asset dashboard again for reference: 7
## Page 8

3:20–3:40 — Foundry Integration & AI Assistance ⏱ Suggested dialogue: Thanks to Foundry’s data pipelines and ontology, I was able to ingest and fuse multiple feeds quickly. The AIP assistant is context‑aware because it sits on top of that ontology, so it can offer recommendations like rerouting around a blocked highway or predicting fire spread. Visual: You may display the API diagram again or stay on the AI support screen to remind viewers how Foundry and the AI fit together. For clarity, here’s the API data flow once more: 3:40–4:00 — Conclusion & Call to Action ⏱ Suggested dialogue: In summary, this project demonstrates how we can modernize emergency response by combining real‑time data, AI assistance and a simplified chain of command. I’m excited to discuss how this could be piloted with your teams. Visual: End on a thank‑you slide or return to your own camera to deliver the closing message. No specific screenshot is necessary. How to use this timeline Use these timeblocks as a flexible guide. Each segment pairs an example narration with a relevant image, so you can see at a glance what to say and what to show. Adjust the wording, durations or visuals as needed to fit your own style and ensure that the final video stays within the four‑minute limit. 8
## Page 9

1 2 emilms.fema.gov https://emilms.fema.gov/is_0200c/groups/450.html 3 4 5 API Flow Diagram: Best Practices & Examples | Multiplayer https://www.multiplayer.app/distributed-systems-architecture/api-flow-diagram/ 9
