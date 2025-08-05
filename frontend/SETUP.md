# Disaster Response Dashboard Setup

This guide will help you set up and run the disaster response dashboard with backend API integration.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Start the synthetic data API server:**
   ```bash
   python run_synthetic_api.py
   ```

The API server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Tailwind CSS (if not already installed):**
   ```bash
   npm install -D tailwindcss autoprefixer postcss
   npx tailwindcss init -p
   ```

## Configuration

### Environment Configuration

Create a `.env` file in the frontend directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Mapbox Token (Optional)
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

**Note:** 
- The API base URL should point to your backend server
- The dashboard will work without a Mapbox token, but the map will show a placeholder

## Running the Dashboard

1. **Ensure the backend API is running:**
   ```bash
   # In the backend directory
   python run_synthetic_api.py
   ```

2. **Start the frontend development server:**
   ```bash
   # In the frontend directory
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the URL shown in the terminal)

## Using the API

The dashboard now fetches data from the backend API. You can:

### View API Data

Test the API endpoints directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Get dashboard data
curl http://localhost:5000/api/dashboard

# Get API info
curl http://localhost:5000/api/info
```

### Generate Different Scenarios

Test different disaster scenarios via API:

```bash
# Generate wildfire scenario data
curl http://localhost:5000/api/scenario/wildfire

# Generate earthquake scenario data
curl http://localhost:5000/api/scenario/earthquake

# Generate flood scenario data
curl http://localhost:5000/api/scenario/flood

# Generate normal scenario data
curl http://localhost:5000/api/scenario/normal
```

### Customize Data Generation

You can modify the backend synthetic data generator:

```python
# In backend/utils/synthetic_data.py
# Modify the BAY_AREA_BOUNDS for different geographic areas
# Adjust risk level distributions
# Change data source types
# Customize route generation logic
```

## Dashboard Features

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

## Troubleshooting

### Common Issues

1. **Map not loading:**
   - Check if you have a valid Mapbox token in `.env`
   - Ensure all map dependencies are installed
   - Check browser console for errors

2. **Styling issues:**
   - Make sure Tailwind CSS is properly installed
   - Run `npm install` to ensure all dependencies are installed
   - Check that `tailwind.config.js` and `postcss.config.js` exist

3. **TypeScript errors:**
   - Run `npm run type-check` to check for type errors
   - Ensure all required types are properly imported

4. **Build errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check that all dependencies are compatible

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
```

## Next Steps

1. **Connect to Real Data:** Replace synthetic data with actual API calls
2. **Add Authentication:** Implement user authentication and authorization
3. **Add More Features:** Implement filtering, searching, and export functionality
4. **Deploy:** Deploy the dashboard to a production environment

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard layout
│   │   ├── HazardMap.tsx          # Interactive map component
│   │   ├── RiskAssessmentCard.tsx # Risk metrics display
│   │   ├── HazardSummaryCard.tsx  # Overall statistics
│   │   └── SafeRoutesCard.tsx     # Evacuation routes
│   ├── utils/
│   │   ├── syntheticData.ts       # Data generation logic
│   │   └── demo.ts               # Demo utilities
│   ├── types/
│   │   └── hazard.ts             # TypeScript interfaces
│   ├── App.tsx                   # Main app component
│   └── App.css                   # Styles
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Documentation
```

The synthetic data system provides a complete foundation for testing and demonstrating the disaster response dashboard UI without requiring backend integration. 