# Disaster Response API Architecture Outline

## Overview

The Disaster Response API is a comprehensive system that processes real-time emergency data, provides hazard analysis, calculates safe evacuation routes, and coordinates emergency resources. It's built on a **Foundry-based architecture** with **real-time data fusion** and **ML-powered predictions**.

## Architecture Layers

### 1. Data Ingestion Layer
```
📡 Data Sources → Foundry Inputs → Processing Pipeline
```

**Data Sources:**
- **NASA FIRMS**: Satellite fire detection data (brightness temperature, confidence scores)
- **NOAA Weather**: Wind vectors, temperature, humidity, atmospheric conditions
- **911 Emergency Feeds**: Real-time emergency calls and incident reports
- **Population Data**: Census data, building footprints, demographic information
- **Traffic Data**: Real-time traffic conditions and road closures
- **Resource Positions**: GPS tracking of emergency vehicles and personnel

**Foundry Integration:**
```python
@function(
    firms_data=Input("/data/raw/nasa_firms"),
    weather_data=Input("/data/raw/noaa_weather"),
    terrain_data=Input("/data/static/elevation_model")
)
def process_hazard_data(firms_data, weather_data, terrain_data):
    # Data fusion and processing
```

### 2. Processing Layer

#### Hazard Processing Engine (`HazardProcessor`)
```python
class HazardProcessor:
    def __init__(self):
        self.model = None  # ML model for spread prediction
        self.scaler = None  # Feature scaling
        self.h3_resolution = 9  # ~174m hexagons for spatial indexing
        self.prediction_horizon_hours = 2
```

**Key Processing Steps:**

1. **FIRMS Data Processing:**
   ```python
   def process_firms_data(self, firms_df: pd.DataFrame) -> gpd.GeoDataFrame:
       # Convert to GeoDataFrame with Point geometries
       # Add H3 spatial indices for efficient querying
       # Calculate confidence scores based on brightness temperature
       # Add metadata (data_source, processed_at timestamps)
   ```

2. **Weather Data Processing:**
   ```python
   def process_weather_data(self, weather_df: pd.DataFrame) -> gpd.GeoDataFrame:
       # Convert to GeoDataFrame
       # Calculate wind vectors from u_wind, v_wind components
       # Add H3 spatial indices
       # Calculate wind speed and direction
   ```

3. **ML-Powered Hazard Spread Prediction:**
   ```python
   def predict_hazard_spread(self, hazard_points, weather_data, terrain_data):
       # Extract prediction features for each hazard
       # Use RandomForest model to predict spread probability
       # Generate spread cells using H3 hexagons
       # Return predictions with confidence scores
   ```

4. **Risk Zone Calculation:**
   ```python
   def calculate_risk_zones(self, hazard_points):
       # Calculate risk scores based on:
       # - Hazard intensity
       # - Population density
       # - Weather conditions
       # - Terrain factors
       # Generate risk polygons with levels (low/medium/high/critical)
   ```

#### Route Optimization Engine (`RouteOptimizer`)
```python
class RouteOptimizer:
    def __init__(self):
        self.road_network = None
        self.hazard_buffer_distance = 500  # meters
        self.max_route_distance = 100  # km
        self.vehicle_constraints = {
            'engine': {'max_weight': 40000, 'height': 4.2, 'width': 2.6},
            'ambulance': {'max_weight': 5000, 'height': 3.2, 'width': 2.2},
            'civilian': {'max_weight': 3000, 'height': 2.0, 'width': 2.0}
        }
```

**Route Calculation Process:**
```python
def calculate_safe_route(self, origin, destination, hazard_zones, vehicle_type, priority):
    # 1. Load road network with spatial indexing
    # 2. Find nearest road segments to origin/destination
    # 3. Build routing graph with hazard penalties
    # 4. Apply A* algorithm with vehicle constraints
    # 5. Calculate route metrics (distance, time, safety score)
    # 6. Return optimized route with geometry
```

### 3. API Endpoints Layer

#### Core Disaster API Functions

**1. Hazard Summary (`get_hazard_summary`)**
```python
@function(
    hazard_zones=Input("/data/processed/hazard_zones"),
    safe_routes=Input("/data/processed/safe_routes")
)
def get_hazard_summary(hazard_zones, safe_routes):
    # Returns:
    # - total_hazards: count of active hazards
    # - risk_distribution: breakdown by risk level
    # - data_sources: source distribution
    # - bbox: bounding box of all hazards
    # - total_population_at_risk: affected population
```

**2. Hazard Zones GeoJSON (`get_hazard_zones_geojson`)**
```python
def get_hazard_zones_geojson(hazard_zones):
    # Converts hazard data to GeoJSON format for mapping
    # Includes metadata (generated_at, total_features, bbox)
    # Handles timestamp serialization for JSON compatibility
```

**3. Evacuation Routes (`get_evacuation_routes`)**
```python
def get_evacuation_routes(hazard_zones, safe_routes, origin_lat, origin_lon, 
                         destination_lat, destination_lon):
    # Finds routes avoiding hazard zones
    # Supports coordinate-based routing
    # Returns route details with hazard avoidance info
```

**4. Risk Assessment (`get_risk_assessment`)**
```python
def get_risk_assessment(hazard_zones, latitude, longitude, radius_km=10):
    # Calculates risk for specific location
    # Uses spatial buffer analysis
    # Returns:
    # - total_nearby_hazards
    # - risk_levels distribution
    # - avg_risk_score, max_risk_score
    # - closest_hazard_distance_km
```

**5. Safe Route Calculation (`calculate_safe_route_api`)**
```python
def calculate_safe_route_api(hazard_zones, road_network, traffic_data,
                           origin_lat, origin_lon, destination_lat, destination_lon,
                           vehicle_type='civilian', priority='safest'):
    # Advanced routing with:
    # - Hazard avoidance
    # - Vehicle-specific constraints
    # - Real-time traffic integration
    # - Multiple priority modes (safest, fastest, balanced)
```

**6. Evacuation Status (`get_evacuation_status`)**
```python
def get_evacuation_status(hazard_zones, evacuation_zones, shelter_locations, zone_id=None):
    # Tracks evacuation progress by zone
    # Calculates population at risk
    # Finds nearest emergency shelters
    # Provides evacuation recommendations
```

**7. Resource Coordination (`get_resource_coordination`)**
```python
def get_resource_coordination(hazard_zones, resource_positions):
    # Tracks emergency resources (fire trucks, ambulances, etc.)
    # Calculates nearest hazards to each resource
    # Provides resource availability and assignment status
    # Supports real-time resource tracking
```

**8. Public Safety Status (`get_public_safety_status`)**
```python
def get_public_safety_status(hazard_zones, address=None, latitude=None, longitude=None):
    # Provides public-facing safety information
    # Multi-language support (English, Spanish, Chinese)
    # Generates evacuation recommendations
    # Calculates hazard proximity and direction
```

#### Flask API Endpoints (Simple API)

**Main Data Endpoint:**
```python
@app.route('/api/disaster-data', methods=['GET'])
def get_disaster_data():
    # Returns comprehensive disaster response data:
    # - hazards: active hazard zones
    # - routes: evacuation routes
    # - resources: emergency resources
    # - metrics: dashboard metrics
    # - alerts: current alerts
```

**Health Check:**
```python
@app.route('/api/health', methods=['GET'])
def health_check():
    # API health status and version info
```

**Resource Management:**
```python
@app.route('/api/update-resource-status', methods=['POST'])
def update_resource_status():
    # Updates resource status (available, deployed, responding)
```

**Alert Management:**
```python
@app.route('/api/add-alert', methods=['POST'])
def add_alert():
    # Adds new emergency alerts
```

### 4. Data Flow Architecture

#### Real-Time Processing Pipeline
```
1. Data Ingestion
   ↓
2. Foundry Data Fusion
   ↓
3. Hazard Processing (ML predictions)
   ↓
4. Route Optimization (A* algorithm)
   ↓
5. API Response Generation
   ↓
6. Frontend Delivery (WebSocket/HTTP)
```

#### Spatial Data Processing
```python
# H3 Spatial Indexing
h3_resolution = 9  # ~174m hexagons
gdf['h3_index'] = gdf.apply(
    lambda row: h3.latlng_to_cell(row['latitude'], row['longitude'], h3_resolution), 
    axis=1
)

# Spatial Analysis
location_point = Point(longitude, latitude)
buffer_wgs84 = location_point.buffer(radius_km * 1000)  # Convert to meters
nearby_hazards = hazard_gdf[hazard_gdf.geometry.intersects(buffer_wgs84)]
```

#### ML Prediction Pipeline
```python
# Feature Extraction
features = self._extract_prediction_features(hazard, weather_data, terrain_data)

# Model Prediction
features_scaled = self.scaler.transform([features])
spread_probability = self.model.predict(features_scaled)[0]

# Spread Cell Generation
spread_cells = self._generate_spread_cells(
    hazard.geometry, 
    spread_probability, 
    weather_data
)
```

### 5. Integration Points

#### Foundry Integration
- **Data Sources**: All raw data ingested through Foundry Inputs
- **Processing**: Hazard processing and route optimization as Foundry Functions
- **Outputs**: Processed data written back to Foundry for persistence
- **Real-time Updates**: WebSocket connections for live data streaming

#### Frontend Integration
- **REST API**: JSON endpoints for dashboard data
- **WebSocket**: Real-time updates for live hazard tracking
- **GeoJSON**: Spatial data for mapping visualization
- **CORS**: Cross-origin support for web frontend

#### External Systems
- **NASA FIRMS**: Satellite fire detection data
- **NOAA Weather**: Atmospheric condition data
- **911 Systems**: Emergency call data
- **Traffic APIs**: Real-time traffic conditions
- **GPS Tracking**: Emergency vehicle positions

### 6. Performance Optimizations

#### Spatial Indexing
- **H3 Hexagons**: Efficient spatial queries and clustering
- **R-tree Indexing**: Fast geometric operations
- **Spatial Buffering**: Optimized proximity calculations

#### Caching Strategy
- **Hazard Data**: Cached for 5-minute intervals
- **Route Calculations**: Cached with hazard-based invalidation
- **Resource Positions**: Real-time updates with 30-second cache

#### Scalability Features
- **Async Processing**: Non-blocking hazard analysis
- **Batch Operations**: Efficient bulk data processing
- **Memory Management**: Optimized GeoDataFrame operations
- **Error Handling**: Graceful degradation with fallback data

### 7. Security & Reliability

#### Data Validation
- **Input Sanitization**: All coordinates and parameters validated
- **Geometry Validation**: Ensures valid spatial data
- **Type Checking**: Strong typing throughout the pipeline

#### Error Handling
- **Graceful Degradation**: Fallback to cached data on failures
- **Logging**: Comprehensive logging with structlog
- **Monitoring**: Health checks and performance metrics

#### Multi-language Support
- **Public Safety Messages**: English, Spanish, Chinese
- **Localized Content**: Region-specific evacuation instructions
- **Accessibility**: Clear, actionable messaging

### 8. Deployment Architecture

#### Development Environment
```python
# Mock Foundry Functions for local development
class Input:
    def __init__(self, path: str):
        self.path = path
    
    def read_dataframe(self):
        return None  # Mock data for local testing
```

#### Production Environment
- **Foundry Platform**: Full Foundry integration
- **Container Deployment**: Docker-based deployment
- **Load Balancing**: Multiple API instances
- **Monitoring**: Real-time performance tracking

This architecture provides a robust, scalable foundation for emergency response coordination with real-time data processing, ML-powered predictions, and comprehensive API coverage for all disaster response needs.
