# Synthetic Data for Disaster Response Dashboard

This document explains how to use the synthetic data system to create mockups and test the disaster response dashboard UI.

## Overview

The synthetic data system generates realistic mock data for all dashboard components, allowing you to see how the UI will look with actual data without needing a backend connection.

## Components

### 1. SyntheticDataGenerator (`src/utils/syntheticData.ts`)

The main class that generates all synthetic data:

- **Hazard Zones**: Random polygons with different risk levels (low, medium, high, critical)
- **Safe Routes**: Evacuation routes with distance and time estimates
- **Risk Assessments**: Location-based risk analysis
- **Hazard Summaries**: Overall statistics and data source information
- **Evacuation Routes**: Complete route planning responses

### 2. Dashboard Components

- **Dashboard**: Main layout combining all components
- **HazardMap**: Interactive map showing hazards and routes
- **RiskAssessmentCard**: Risk metrics and statistics
- **HazardSummaryCard**: Overall hazard distribution and data sources
- **SafeRoutesCard**: Evacuation route details

## Usage

### Basic Usage

```typescript
import { SyntheticDataGenerator } from './utils/syntheticData';

// Generate complete dashboard data
const dashboardData = SyntheticDataGenerator.generateDashboardData();

// Or generate individual components
const hazardZones = SyntheticDataGenerator.generateHazardZones(20);
const safeRoutes = SyntheticDataGenerator.generateSafeRoutes(12);
const riskAssessment = SyntheticDataGenerator.generateRiskAssessment();
```

### Customizing Data

You can customize the generated data by modifying the `SyntheticDataGenerator` class:

```typescript
// Generate more or fewer hazards
const hazardZones = SyntheticDataGenerator.generateHazardZones(50);

// Generate routes for a specific area
const riskAssessment = SyntheticDataGenerator.generateRiskAssessment([-122.5, 37.8]);
```

### Data Characteristics

The synthetic data includes:

- **Geographic Bounds**: San Francisco Bay Area (37.4°N to 38.2°N, 122.8°W to 121.8°W)
- **Risk Levels**: Realistic distribution across low, medium, high, and critical
- **Data Sources**: FIRMS, NOAA, USGS with realistic counts
- **Timestamps**: Recent dates and times
- **Coordinates**: Valid GeoJSON polygons and line strings

## Running the Dashboard

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to see the dashboard with synthetic data

## Features Demonstrated

### Interactive Map
- Click on the map to update risk assessment for that location
- Hazard zones are color-coded by risk level
- Safe routes are shown as green lines
- Click on hazard zones to see detailed information

### Real-time Updates
- Click the "Refresh" button to generate new synthetic data
- Simulates real-time data updates
- Shows loading states during data generation

### Responsive Design
- Works on desktop and mobile devices
- Grid layout adapts to screen size
- Cards stack appropriately on smaller screens

### Data Visualization
- Risk level distribution charts
- Data source breakdowns
- Route statistics and details
- System status indicators

## Customization Options

### Modifying Data Generation

Edit `src/utils/syntheticData.ts` to:

- Change the geographic area
- Adjust risk level distributions
- Modify data source types
- Customize route generation logic

### Adding New Components

1. Create new component files in `src/components/`
2. Add them to the Dashboard layout
3. Generate appropriate synthetic data in `SyntheticDataGenerator`

### Styling

The dashboard uses Tailwind CSS for styling. Modify `src/App.css` for custom styles.

## Integration with Real Data

When ready to connect to real data:

1. Replace `SyntheticDataGenerator.generateDashboardData()` calls with API calls
2. Update data types if needed
3. Add error handling for API failures
4. Implement real-time data streaming

## Troubleshooting

### Map Not Loading
- Ensure you have a valid Mapbox access token
- Check browser console for errors
- Verify all map dependencies are installed

### Data Not Updating
- Check that the refresh function is working
- Verify synthetic data generation is completing
- Look for JavaScript errors in console

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check that all CSS classes are available
- Verify responsive breakpoints are working

## Next Steps

1. **Add More Data Types**: Extend the synthetic data to include weather data, population density, etc.
2. **Real-time Simulation**: Add time-based data changes to simulate real-time updates
3. **User Interactions**: Add more interactive features like filtering and searching
4. **Export Functionality**: Implement data export features
5. **Mobile Optimization**: Further optimize for mobile devices

## File Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard layout
│   ├── HazardMap.tsx          # Interactive map component
│   ├── RiskAssessmentCard.tsx # Risk metrics display
│   ├── HazardSummaryCard.tsx  # Overall statistics
│   └── SafeRoutesCard.tsx     # Evacuation routes
├── utils/
│   └── syntheticData.ts       # Data generation logic
├── types/
│   └── hazard.ts             # TypeScript interfaces
├── App.tsx                   # Main app component
└── App.css                   # Styles
```

This synthetic data system provides a complete foundation for testing and demonstrating the disaster response dashboard UI without requiring backend integration. 