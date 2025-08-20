---
config:
  layout: elk
---
stateDiagram
  direction TB
  state Dashboard {
    direction TB
    [*] --> MapBaseline
    MapBaseline --> LayersOn:Toggle Buildings + Weather
    LayersOn --> HazardFocused:Center on selected hazard
[*]    MapBaseline
    LayersOn
    HazardFocused
  }
  [*] --> Dashboard:App loads
  Dashboard --> UnitsOpen:Open "Units" panel
  UnitsOpen --> RoutingOpen:Open "Routing" panel
  RoutingOpen --> RoutePending:Choose Fire Tactical profile (request sent)
  RoutePending --> RouteReady:WebSocket 'route_ready' event
  RouteReady --> AssignmentConfirmed:Confirm unit follows route
  AssignmentConfirmed --> AIPReview:Open AIP Decision Support
  AIPReview --> Tracking:Open Building Evacuation Tracker
  Tracking --> [*]
  RoutePending --> RouteTimeout:Job timeout / error
  RouteTimeout --> RoutingOpen:Retry or choose different profile
  RouteReady --> AssignmentFailed:API error
  AssignmentFailed --> RouteReady:Retry confirm
