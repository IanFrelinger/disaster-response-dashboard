# Mock Geo-Tiles Quick Start Guide

This guide sets up mock geo-tiles for the Disaster Response Dashboard using the pipeline architecture approach. You'll have realistic-looking tiles for development and testing in under 5 minutes.

## 🚀 Quick Start (2 minutes)

### 1. Run the Setup Script

```bash
# Make sure you're in the project root
cd /path/to/disaster-response-dashboard

# Run the automated setup
./scripts/setup-mock-tiles.sh
```

This script will:
- ✅ Install Tippecanoe and GDAL (macOS)
- ✅ Download sample datasets (Natural Earth, California counties)
- ✅ Generate mock hazard zones and evacuation routes
- ✅ Create vector tiles (.mbtiles)
- ✅ Convert to PMTiles format (optional)
- ✅ Set up Tileserver-GL configuration
- ✅ Create Docker services
- ✅ Generate frontend integration code

### 2. Start Tile Services

```bash
# Start Tileserver-GL (recommended)
./scripts/start-tiles.sh

# Or start with PMTiles server (no-server option)
./scripts/start-tiles.sh --pmtiles
```

### 3. Test Your Setup

```bash
# Test all tile endpoints
./scripts/test-tiles.sh
```

### 4. View in Browser

- **Tileserver-GL**: http://localhost:8080/
- **PMTiles Server**: http://localhost:8081/ (if using --pmtiles)

## 🗺️ What You Get

### Vector Tile Layers

| Layer | Description | Zoom Levels | Use Case |
|-------|-------------|-------------|----------|
| `admin_boundaries` | Country/state boundaries | 0-10 | Base map context |
| `california_counties` | CA county boundaries | 8-14 | Regional context |
| `hazards` | Mock hazard zones | 10-16 | Disaster visualization |
| `routes` | Evacuation routes | 10-16 | Emergency planning |

### Mock Data Included

- **Hazard Zones**: Wildfire and flood areas around San Francisco
- **Evacuation Routes**: Emergency access and evacuation paths
- **Admin Boundaries**: Global country boundaries
- **County Boundaries**: California county lines

## 🎨 Frontend Integration

### Using the DisasterMap Component

```tsx
import DisasterMap from './components/common/DisasterMap';

function MyComponent() {
  return (
    <DisasterMap
      center={[-122.4194, 37.7749]} // San Francisco
      zoom={10}
      showHazards={true}
      showRoutes={true}
      showCounties={true}
      onMapLoad={(map) => {
        console.log('Map loaded:', map);
      }}
    />
  );
}
```

### Tile Service API

```tsx
import tileService from './services/tileService';

// Get tile sources
const sources = tileService.getVectorTileSources();

// Get disaster response style
const style = tileService.getDisasterResponseStyle();

// Check server health
const isHealthy = await tileService.checkHealth();
```

## 🏗️ Architecture Overview

### Pipeline Components

```
Data Sources → Processing → Tiles → Serving → Frontend
     ↓              ↓         ↓        ↓         ↓
  GeoJSON      Tippecanoe   MBTiles  Tileserver  MapLibre
  Natural Earth   GDAL      PMTiles   Nginx      Mapbox GL
```

### Directory Structure

```
disaster-response-dashboard/
├── tiles/                    # Generated tile files
│   ├── *.mbtiles            # Vector tile databases
│   ├── config.json          # Tileserver-GL config
│   └── styles/              # Map styles
├── pmtiles/                 # PMTiles format (optional)
│   └── *.pmtiles           # Single-file tiles
├── data/                    # Source data
│   ├── *.geojson           # GeoJSON source files
│   └── mock_*.geojson      # Generated mock data
└── scripts/                 # Automation scripts
    ├── setup-mock-tiles.sh  # Main setup script
    ├── start-tiles.sh       # Start services
    └── test-tiles.sh        # Test endpoints
```

## 🔧 Configuration Options

### Environment Variables

Add to your `.env` file:

```bash
# Tile server URLs
VITE_TILE_SERVER_URL=http://localhost:8080
VITE_PMTILES_URL=http://localhost:8081

# Optional: Custom tile sources
VITE_CUSTOM_TILE_SOURCE=https://your-tile-server.com
```

### Docker Compose Integration

The tile services integrate with your existing Docker setup:

```yaml
# docker-compose.tiles.yml (auto-generated)
services:
  tileserver:
    build: ./tiles
    ports:
      - "8080:8080"
    volumes:
      - ./tiles:/data
  
  pmtiles-server:
    image: nginx:alpine
    ports:
      - "8081:80"
    volumes:
      - ./pmtiles:/usr/share/nginx/html
```

## 🧪 Testing & Validation

### Automated Tests

```bash
# Test tile server health
./scripts/test-tiles.sh

# Expected output:
# ✅ Tileserver-GL is healthy
# ✅ /data/admin_boundaries.json is accessible
# ✅ /data/hazards.json is accessible
# ✅ /data/routes.json is accessible
```

### Manual Testing

1. **Check Tileserver-GL**: http://localhost:8080/
2. **View TileJSON**: http://localhost:8080/data/hazards.json
3. **Test Vector Tiles**: http://localhost:8080/data/hazards/10/163/395.pbf
4. **Check PMTiles**: http://localhost:8081/hazards.pmtiles

## 🔄 Updating Mock Data

### Add New Hazard Zones

```bash
# Edit the mock data
vim data/mock_hazards.geojson

# Regenerate tiles
tippecanoe \
  --output tiles/hazards.mbtiles \
  --layer hazards \
  --minimum-zoom 10 \
  --maximum-zoom 16 \
  data/mock_hazards.geojson

# Restart services
./scripts/start-tiles.sh
```

### Add Real Data Sources

```bash
# Download real data
curl -L "https://firms.modaps.eosdis.nasa.gov/api/area/csv/..." > data/real_fires.csv

# Convert to GeoJSON (using GDAL)
ogr2ogr -f GeoJSON data/real_fires.geojson data/real_fires.csv

# Generate tiles
tippecanoe --output tiles/real_fires.mbtiles data/real_fires.geojson
```

## 🚨 Troubleshooting

### Common Issues

**Tippecanoe not found**
```bash
# macOS
brew install tippecanoe

# Ubuntu/Debian
sudo apt-get install tippecanoe

# Or build from source
git clone https://github.com/mapbox/tippecanoe.git
cd tippecanoe && make && sudo make install
```

**Docker service won't start**
```bash
# Check if ports are in use
lsof -i :8080
lsof -i :8081

# Stop conflicting services
docker-compose -f docker-compose.tiles.yml down
```

**Tiles not loading in frontend**
```bash
# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8080/

# Check tile server health
curl http://localhost:8080/
```

### Debug Mode

```bash
# Start with debug logging
docker-compose -f docker-compose.tiles.yml up tileserver

# Check logs
docker-compose -f docker-compose.tiles.yml logs tileserver
```

## 📚 Advanced Usage

### Custom Map Styles

Edit `tiles/styles/disaster-response.json` to customize:

- Colors and styling
- Layer visibility rules
- Zoom level behavior
- Data-driven styling

### Performance Optimization

```bash
# Optimize tile generation
tippecanoe \
  --output tiles/optimized.mbtiles \
  --simplification 10 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  data/large_dataset.geojson
```

### Production Deployment

1. **Use PMTiles** for static hosting
2. **CDN Integration** for global distribution
3. **Caching Headers** for performance
4. **Authentication** for sensitive data

## 🔗 Related Documentation

- [Tippecanoe Documentation](https://github.com/mapbox/tippecanoe)
- [Tileserver-GL Guide](https://tileserver.readthedocs.io/)
- [PMTiles Specification](https://github.com/protomaps/PMTiles)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)

## 🎯 Next Steps

1. **Customize Data**: Replace mock data with real disaster datasets
2. **Add Layers**: Create additional tile layers for your use case
3. **Style Maps**: Design custom map styles for your brand
4. **Performance**: Optimize tile generation for production
5. **Integration**: Connect with your existing disaster response APIs

---

**Need Help?** Check the troubleshooting section or run `./scripts/test-tiles.sh` to diagnose issues.
