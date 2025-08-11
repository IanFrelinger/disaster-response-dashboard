# Disaster Response Dashboard API Documentation

## Overview

The Disaster Response Dashboard API provides real-time access to disaster data, hazard zones, evacuation routes, and emergency response metrics. The API is built with Flask and serves synthetic data for demonstration purposes.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication for demonstration purposes. In production, JWT tokens or API keys would be implemented.

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1234567890.123
}
```

## Endpoints

### Health Check

**GET** `/api/health`

Check if the API is running and healthy.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### API Information

**GET** `/api/info`

Get information about the API and available endpoints.

**Response:**
```json
{
  "success": true,
  "name": "Disaster Response Dashboard API",
  "version": "1.0.0",
  "description": "Real-time disaster response data API",
  "endpoints": [
    "/api/health",
    "/api/dashboard",
    "/api/hazards",
    "/api/routes",
    "/api/risk-assessment"
  ]
}
```

### Dashboard Data

**GET** `/api/dashboard`

Get complete dashboard data including hazards, routes, metrics, and alerts.

**Response:**
```json
{
  "success": true,
  "data": {
    "hazards": [
      {
        "id": "hazard-1",
        "type": "wildfire",
        "name": "Oakland Hills Fire",
        "severity": "high",
        "coordinates": [-122.2, 37.8],
        "radius": 5000,
        "affected_population": 15000,
        "last_updated": "2024-01-15T10:30:00Z",
        "status": "active"
      }
    ],
    "routes": [
      {
        "id": "route-1",
        "name": "Oakland Hills Evacuation Route",
        "start": [-122.2, 37.8],
        "end": [-122.3, 37.9],
        "distance": 8.5,
        "duration": 15,
        "status": "open",
        "hazards_avoided": ["hazard-1"]
      }
    ],
    "metrics": {
      "totalAffectedPopulation": 25000,
      "averageResponseTime": 12,
      "evacuationCompliance": 85,
      "activeHazards": 3,
      "availableRoutes": 8
    },
    "alerts": [
      {
        "id": "alert-1",
        "type": "evacuation",
        "message": "Evacuation order issued for Oakland Hills area",
        "severity": "high",
        "timestamp": "2024-01-15T10:25:00Z"
      }
    ]
  },
  "timestamp": 1234567890.123
}
```

### Hazard Zones

**GET** `/api/hazards`

Get hazard zones data.

**Query Parameters:**
- `count` (optional): Number of hazards to return (default: 20)

**Example:**
```
GET /api/hazards?count=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hazard-1",
      "type": "wildfire",
      "name": "Oakland Hills Fire",
      "severity": "high",
      "coordinates": [-122.2, 37.8],
      "radius": 5000,
      "affected_population": 15000,
      "last_updated": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "count": 1,
  "timestamp": 1234567890.123
}
```

### Safe Routes

**GET** `/api/routes`

Get safe evacuation routes.

**Query Parameters:**
- `count` (optional): Number of routes to return (default: 12)

**Example:**
```
GET /api/routes?count=3
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "route-1",
      "name": "Oakland Hills Evacuation Route",
      "start": [-122.2, 37.8],
      "end": [-122.3, 37.9],
      "distance": 8.5,
      "duration": 15,
      "status": "open",
      "hazards_avoided": ["hazard-1"]
    }
  ],
  "count": 1,
  "timestamp": 1234567890.123
}
```

### Risk Assessment

**GET** `/api/risk-assessment`

Get risk assessment for a specific location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude

**Example:**
```
GET /api/risk-assessment?lat=37.7749&lng=-122.4194
```

**Response:**
```json
{
  "success": true,
  "risk_level": "medium",
  "risk_score": 0.65,
  "affected_population": 5000,
  "nearest_hazard": {
    "id": "hazard-1",
    "distance": 2500,
    "type": "wildfire"
  },
  "recommendations": [
    "Monitor local emergency broadcasts",
    "Prepare evacuation plan",
    "Stay informed about weather conditions"
  ],
  "timestamp": 1234567890.123
}
```

### Hazard Summary

**GET** `/api/hazard-summary`

Get summary statistics for all hazards.

**Response:**
```json
{
  "success": true,
  "total_hazards": 3,
  "active_hazards": 2,
  "total_affected_population": 25000,
  "hazard_types": {
    "wildfire": 2,
    "flood": 1
  },
  "severity_distribution": {
    "high": 1,
    "medium": 1,
    "low": 1
  },
  "timestamp": 1234567890.123
}
```

### Evacuation Routes

**GET** `/api/evacuation-routes`

Get evacuation routes with detailed information.

**Query Parameters:**
- `hazard_id` (optional): Filter routes by hazard ID

**Example:**
```
GET /api/evacuation-routes?hazard_id=hazard-1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "route-1",
      "name": "Oakland Hills Evacuation Route",
      "start": [-122.2, 37.8],
      "end": [-122.3, 37.9],
      "distance": 8.5,
      "duration": 15,
      "status": "open",
      "hazards_avoided": ["hazard-1"],
      "capacity": 1000,
      "current_usage": 250,
      "estimated_clearance_time": 45
    }
  ],
  "timestamp": 1234567890.123
}
```

### Scenario Data

**GET** `/api/scenario/{scenario_id}`

Get data for a specific disaster scenario.

**Path Parameters:**
- `scenario_id`: ID of the scenario

**Example:**
```
GET /api/scenario/wildfire-2024-01-15
```

**Response:**
```json
{
  "success": true,
  "scenario": {
    "id": "wildfire-2024-01-15",
    "name": "Oakland Hills Wildfire Scenario",
    "type": "wildfire",
    "start_time": "2024-01-15T10:00:00Z",
    "status": "active",
    "hazards": [...],
    "routes": [...],
    "metrics": {...},
    "timeline": [
      {
        "time": "2024-01-15T10:00:00Z",
        "event": "Fire detected",
        "severity": "medium"
      }
    ]
  },
  "timestamp": 1234567890.123
}
```

### Refresh Data

**POST** `/api/refresh`

Force refresh of cached data.

**Response:**
```json
{
  "success": true,
  "message": "Data refreshed successfully",
  "timestamp": 1234567890.123
}
```

## Error Responses

When an error occurs, the API returns an error response:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "timestamp": 1234567890.123
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (endpoint or resource not found)
- `500`: Internal Server Error

## Rate Limiting

Currently, no rate limiting is implemented for demonstration purposes. In production, rate limiting would be added to prevent abuse.

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for all origins to allow frontend integration.

## Testing

### Quick Test

Run a quick test to verify the API is working:

```bash
python3 scripts/quick_api_test.py
```

### Full Setup and Testing

Run comprehensive setup and testing:

```bash
./scripts/test-api.sh
```

### Manual Testing

Test individual endpoints using curl:

```bash
# Health check
curl http://localhost:8000/api/health

# Dashboard data
curl http://localhost:8000/api/dashboard

# Hazards with count parameter
curl "http://localhost:8000/api/hazards?count=5"

# Risk assessment
curl "http://localhost:8000/api/risk-assessment?lat=37.7749&lng=-122.4194"
```

## Development

### Starting the API Server

```bash
cd backend
python run_synthetic_api.py
```

### Environment Variables

The API uses the following environment variables (see `backend/config.env.example`):

- `FLASK_ENV`: Flask environment (development/production)
- `FLASK_DEBUG`: Enable debug mode
- `USE_MOCK_DATA`: Use synthetic data (default: true)
- `ENABLE_CORS`: Enable CORS (default: true)

### Adding New Endpoints

1. Add the endpoint to `backend/functions/synthetic_api.py`
2. Update this documentation
3. Add tests to the testing scripts
4. Update the API info endpoint

## Integration with Frontend

The frontend can connect to the API by setting the base URL to `http://localhost:8000` and using the endpoints documented above. The API provides all necessary data for the disaster response dashboard visualization.

