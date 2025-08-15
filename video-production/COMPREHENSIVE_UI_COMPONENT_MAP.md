# Comprehensive UI Component Map

Generated: 8/14/2025, 6:35:00 PM

## Overview

This document provides a complete map of all available UI components, their selectors, and interactions for the Disaster Response Dashboard. This information is essential for creating realistic demo recordings that showcase the full capabilities of the system.

## Page Structure

The application has two main views:
1. **Commander Dashboard** - Main operational view with zone management
2. **Live Map** - Geographic visualization with layer controls

## Commander Dashboard View

### Navigation Elements
- **Main Navigation Buttons**
  - `button:has-text("Commander Dashboard")` - [click, scroll] - Returns to dashboard view
  - `button:has-text("Live Map")` - [click, scroll] - Switches to map view

### Tab Navigation
- **Primary Tab**
  - `button.ios-button.primary.small` - "Operations" - [click, scroll] - Main operations view
  
- **Secondary Tabs**
  - `button.ios-button.secondary.small` - "Conditions" - [click, scroll] - Weather/conditions view
  - `button.ios-button.secondary.small` - "Assets" - [click, scroll] - Asset management view
  - `button.ios-button.secondary.small` - "AIP Commander" - [click, scroll] - AI assistant interface

### Content Cards
- **Dashboard Overview**
  - `div.ios-card` - Command center description - [no direct interactions]
  - `div.ios-card` - Tab navigation container - [no direct interactions]

### Zone Management Cards
- **Zone A (IMMEDIATE)**
  - `div.zone-card` - [click] - Zone A management interface
    - **Children:**
      - `div.zone-header` - "Zone A IMMEDIATE"
      - `div.zone-stats` - "Total Buildings: 150, Population: 1500"
      - `div.progress-section` - "Evacuated (120), In Progress (20), Refused (5), No Contact (3), Unchecked (2)"
      - `div.zone-footer` - "Est. Completion: 8:35:39 PM, 2 units assigned"

- **Zone B (WARNING)**
  - `div.zone-card` - [click] - Zone B management interface
    - **Children:**
      - `div.zone-header` - "Zone B WARNING"
      - `div.zone-stats` - "Total Buildings: 75, Population: 2200"
      - `div.progress-section` - "Evacuated (60), In Progress (10), Refused (2), No Contact (2), Unchecked (1)"
      - `div.zone-footer` - "Est. Completion: 10:35:39 PM, 1 unit assigned"

- **Zone C (STANDBY)**
  - `div.zone-card` - [click] - Zone C management interface
    - **Children:**
      - `div.zone-header` - "Zone C STANDBY"
      - `div.zone-stats` - "Total Buildings: 50, Population: 800"
      - `div.progress-section` - "Evacuated (40), In Progress (5), Refused (1), No Contact (1), Unchecked (1)"
      - `div.zone-footer` - "Est. Completion: 12:35:39 AM, 1 unit assigned"

## Live Map View

### Navigation Elements
- **Main Navigation**
  - `button:has-text("Commander Dashboard")` - [click, scroll] - Returns to dashboard
  - `button:has-text("Live Map")` - [click, scroll] - Stays on map view

### Map Controls
- **Attribution Button**
  - `button.mapboxgl-ctrl-attrib-button` - [click, scroll] - Toggle attribution panel

### Layer Controls
- **Checkbox Toggles** (5 total)
  - `input[type="checkbox"]` - [type, focus, blur, check, uncheck, scroll] - Layer visibility toggles
    - All checkboxes are currently checked (layers visible)
    - Can be toggled on/off to show/hide different map layers

### Map Canvas
- **Main Map Area**
  - `.mapboxgl-canvas` - [click, hover] - Interactive map surface
    - Dimensions: 772x641 pixels
    - Supports click interactions at specific coordinates
    - Can be clicked at positions like (100, 100) for testing

### Attribution Links
- **Mapbox Attribution**
  - `a` - "© Mapbox" - [click, navigate, scroll] - Links to Mapbox about page
  - `a.mapbox-improve-map` - "Improve this map" - [click, navigate, scroll] - Feedback link
  - `a.mapboxgl-ctrl-logo` - [click, navigate, scroll] - Mapbox homepage link

- **OpenStreetMap Attribution**
  - `a` - "© OpenStreetMap" - [click, navigate, scroll] - Links to OSM copyright page

## Available Interactions Summary

### Click Interactions
- **Navigation**: Switch between dashboard and map views
- **Tab Navigation**: Access different operational views (Operations, Conditions, Assets, AIP Commander)
- **Zone Management**: Click zone cards to access detailed zone information
- **Map Layers**: Toggle layer visibility via checkboxes
- **Map Interaction**: Click on map canvas for location-specific actions
- **External Links**: Navigate to attribution and feedback pages

### Form Interactions
- **Checkboxes**: Toggle map layer visibility (5 available)
- **Input Fields**: Available for text entry (if any forms are present)

### Scroll Interactions
- **All Elements**: Most elements support scrolling for content navigation

### Hover Interactions
- **Map Canvas**: Hover over map areas for tooltip information

## Demo Recording Recommendations

### Commander Dashboard Scenarios
1. **Zone Overview**: Click through each zone card to show evacuation progress
2. **Tab Navigation**: Demonstrate switching between Operations, Conditions, Assets, and AIP Commander
3. **Data Visualization**: Show zone statistics and progress bars
4. **Navigation Flow**: Demonstrate dashboard-to-map transitions

### Live Map Scenarios
1. **Layer Management**: Toggle different map layers on/off to show data overlays
2. **Map Interaction**: Click on specific map coordinates to demonstrate location selection
3. **Navigation**: Show map-to-dashboard transitions
4. **Control Usage**: Demonstrate map controls and attribution

### Combined Workflows
1. **Operational Flow**: Start on dashboard, switch to map, toggle layers, return to dashboard
2. **Zone Management**: Select zones on dashboard, view on map, adjust layers
3. **Navigation Patterns**: Demonstrate the full navigation between views
4. **Interactive Elements**: Show all clickable elements and their responses

## Technical Notes

### Selector Strategy
- **Text-based selectors**: Use `button:has-text("Commander Dashboard")` for reliable navigation
- **Class-based selectors**: Use specific classes like `.zone-card` for content elements
- **Type-based selectors**: Use `input[type="checkbox"]` for form controls

### Interaction Timing
- **Navigation**: Allow 2-3 seconds for view transitions
- **Map Loading**: Allow 3+ seconds for map rendering
- **Element Clicks**: Allow 1-2 seconds for UI responses

### Browser Compatibility
- **Viewport**: 1920x1080 recommended for full UI visibility
- **Browser**: Chrome/Chromium with Playwright for reliable automation
- **Performance**: Headless mode available but visible mode recommended for demo recording

## Usage Guidelines

This component map should be used to:
1. **Plan Demo Scenarios**: Identify which interactions to showcase
2. **Create Realistic Workflows**: Build sequences that demonstrate real user behavior
3. **Ensure Coverage**: Verify that all major features are demonstrated
4. **Maintain Consistency**: Use consistent selectors and timing across recordings

The map provides 23 total components with 21 interactive elements, offering rich opportunities for engaging demo content that showcases the full capabilities of the Disaster Response Dashboard.
