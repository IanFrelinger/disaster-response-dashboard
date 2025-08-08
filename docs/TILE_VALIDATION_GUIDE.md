# Tile Validation Guide

This guide covers the comprehensive validation system for your Disaster Response Dashboard tile sets. The validation tools ensure data quality, integrity, and performance across all tile layers.

## 🎯 Overview

The validation system provides two levels of validation:

1. **Basic Validation** (`validate-tiles.sh`) - Quick checks for tile server health and basic functionality
2. **Advanced Validation** (`validate_tiles_advanced.py`) - Comprehensive analysis including geometry validation, performance testing, and data quality metrics

## 🚀 Quick Start

### Basic Validation
```bash
# Run basic validation
./scripts/validate-tiles.sh
```

### Advanced Validation
```bash
# Run comprehensive validation
python3 scripts/validate_tiles_advanced.py

# With verbose output
python3 scripts/validate_tiles_advanced.py --verbose

# Custom output file
python3 scripts/validate_tiles_advanced.py --output my_validation_report.json
```

## 🔍 Validation Checks

### 1. GeoJSON Structure Validation

**What it checks:**
- Valid JSON format
- GeoJSON FeatureCollection structure
- Feature count and geometry types
- Coordinate system (WGS84)
- Coordinate range validation (-180 to 180, -90 to 90)

**Example output:**
```
[INFO] Validating GeoJSON structure: mock_hazards.geojson
[SUCCESS] Found 2 features in mock_hazards.geojson
[SUCCESS] Coordinates in valid WGS84 range: -122.5, 37.7
```

### 2. MBTiles Metadata Validation

**What it checks:**
- SQLite database integrity
- Required metadata fields (name, format, minzoom, maxzoom, bounds)
- Valid zoom levels (0-22)
- Valid geographic bounds
- Tile count and coverage ratio

**Example output:**
```
[INFO] Validating MBTiles structure: hazards.mbtiles
[SUCCESS] Valid SQLite database with metadata table
[INFO]   Format: pbf
[INFO]   Name: Hazard Zones
[INFO]   Zoom levels: 10 - 16
[INFO]   Bounds: -122.5,37.6,-122.2,37.8
[SUCCESS] Valid bounds: -122.5,37.6,-122.2,37.8
```

### 3. Tile Server Endpoint Validation

**What it checks:**
- TileJSON endpoint accessibility
- Tile endpoint accessibility
- Response time performance
- Tile content validation

**Example output:**
```
[INFO] Validating tile server endpoint: hazards
[SUCCESS] TileJSON endpoint accessible: http://localhost:8080/data/hazards.json
[INFO]   Tiles URL: http://localhost:8080/data/hazards/{z}/{x}/{y}.pbf
[INFO]   Zoom levels: 10 - 16
[SUCCESS] Test tile accessible: http://localhost:8080/data/hazards/10/0/0.pbf
```

### 4. Tile Content Validation

**What it checks:**
- Actual tile content retrieval
- Tile file size validation
- Protocol Buffer (PBF) format validation
- Tile content storage for inspection

**Example output:**
```
[INFO] Validating tile content: hazards
[SUCCESS] Tile content received: 2048 bytes
[INFO]   Test tile saved to: validation/hazards_test_tile.pbf
```

### 5. Coordinate Consistency Validation

**What it checks:**
- Bounds consistency across layers
- Geographic overlap detection
- Coordinate system alignment

**Example output:**
```
[INFO] Validating coordinate consistency across layers
[INFO]   admin_boundaries bounds: -180,-85,180,85
[INFO]   california_counties bounds: -124.5,32.5,-114.1,42.0
[INFO]   hazards bounds: -122.5,37.6,-122.2,37.8
[INFO]   routes bounds: -122.5,37.7,-122.35,37.85
[SUCCESS] Coordinate consistency check completed
[INFO]   Found 4 layers with bounds
```

### 6. Data Quality Validation

**What it checks:**
- Feature count analysis
- Geometry type distribution
- Attribute analysis
- Tile count statistics

**Example output:**
```
[INFO] Validating data quality metrics
[INFO]   mock_hazards.geojson: 2 features (Polygon)
[INFO]   mock_routes.geojson: 2 features (LineString)
[INFO]   admin_boundaries.mbtiles: 1024 tiles
[INFO]   hazards.mbtiles: 256 tiles
[SUCCESS] Data quality summary:
[INFO]   Total features: 4
[INFO]   Total tiles: 1280
```

### 7. Performance Validation

**What it checks:**
- TileJSON response time (< 1 second)
- Tile response time (< 2 seconds)
- Tile size validation (> 100 bytes)
- Server performance metrics

**Example output:**
```
[INFO] Validating tile server performance: hazards
[SUCCESS] Performance test passed
[INFO]   TileJSON response time: 0.15s
[INFO]   Tile response time: 0.23s
[INFO]   Tile size: 2048 bytes
```

## 📊 Validation Reports

### Basic Report Format
```json
{
  "timestamp": "2024-08-07T17:51:00Z",
  "tile_server_url": "http://localhost:8080",
  "validation_summary": {
    "total_layers": 4,
    "layers_tested": ["admin_boundaries", "california_counties", "hazards", "routes"],
    "validation_passed": true
  },
  "layer_details": {
    "hazards": {
      "name": "Hazard Zones",
      "minzoom": 10,
      "maxzoom": 16,
      "bounds": "-122.5,37.6,-122.2,37.8",
      "status": "valid"
    }
  }
}
```

### Advanced Report Format
```json
{
  "timestamp": "2024-08-07T17:51:00Z",
  "summary": {
    "total_checks": 12,
    "passed": 11,
    "failed": 0,
    "warnings": 1,
    "success_rate": 0.92
  },
  "results": [
    {
      "layer_name": "hazards",
      "status": "pass",
      "message": "Validated 2 features",
      "details": {
        "feature_count": 2,
        "geometry_issues": [],
        "coordinate_issues": [],
        "attribute_analysis": {
          "hazard_type": {
            "types": ["str"],
            "values": ["wildfire", "flood"],
            "count": 2
          }
        }
      }
    }
  ]
}
```

## 🛠️ Customization

### Custom Validation Rules

You can customize validation thresholds in the advanced validation script:

```python
# Performance thresholds
tilejson_threshold = 1.0  # seconds
tile_threshold = 2.0      # seconds
min_tile_size = 100       # bytes

# Coordinate validation
min_lng, max_lng = -180, 180
min_lat, max_lat = -90, 90
```

### Adding Custom Validators

Extend the `TileValidator` class to add custom validation rules:

```python
def validate_custom_rule(self, layer_name: str) -> ValidationResult:
    """Custom validation rule"""
    # Your custom validation logic here
    return ValidationResult(
        layer_name=layer_name,
        status='pass',
        message="Custom validation passed",
        details={},
        timestamp=datetime.now()
    )
```

## 🔧 Integration with CI/CD

### GitHub Actions Example
```yaml
name: Tile Validation
on: [push, pull_request]

jobs:
  validate-tiles:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      
      - name: Install dependencies
        run: |
          pip install requests
      
      - name: Run tile validation
        run: |
          python3 scripts/validate_tiles_advanced.py
      
      - name: Upload validation report
        uses: actions/upload-artifact@v2
        with:
          name: validation-report
          path: validation_report_advanced.json
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tile validation..."
python3 scripts/validate_tiles_advanced.py

if [ $? -ne 0 ]; then
    echo "❌ Tile validation failed. Please fix issues before committing."
    exit 1
fi

echo "✅ Tile validation passed!"
```

## 🚨 Troubleshooting

### Common Issues

**Tile server not responding:**
```bash
# Check if tile server is running
docker ps | grep tileserver

# Check tile server logs
docker logs disaster-response-dashboard-tileserver-1

# Restart tile server
./scripts/start-tiles.sh
```

**Validation script errors:**
```bash
# Check Python dependencies
pip install requests

# Check file permissions
chmod +x scripts/validate_tiles_advanced.py

# Run with verbose output
python3 scripts/validate_tiles_advanced.py --verbose
```

**MBTiles validation failures:**
```bash
# Check if sqlite3 is installed
which sqlite3

# Install sqlite3 (macOS)
brew install sqlite3

# Install sqlite3 (Ubuntu)
sudo apt-get install sqlite3
```

### Performance Issues

**Slow tile responses:**
- Check server resources (CPU, memory)
- Verify tile server configuration
- Consider tile optimization with Tippecanoe

**Large tile files:**
- Optimize tile generation parameters
- Use appropriate zoom levels
- Consider tile simplification

## 📈 Monitoring and Alerting

### Automated Monitoring
```python
# Example monitoring script
import schedule
import time
from validate_tiles_advanced import TileValidator

def run_validation():
    validator = TileValidator()
    summary = validator.run_comprehensive_validation()
    
    if summary['summary']['failed'] > 0:
        # Send alert
        send_alert("Tile validation failed", summary)
    
    # Save report
    validator.save_report(f"validation_report_{time.strftime('%Y%m%d_%H%M%S')}.json")

# Run validation every hour
schedule.every().hour.do(run_validation)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### Metrics Collection
```python
# Collect validation metrics
def collect_metrics(summary):
    metrics = {
        'validation_success_rate': summary['summary']['success_rate'],
        'total_checks': summary['summary']['total_checks'],
        'failed_checks': summary['summary']['failed'],
        'warning_checks': summary['summary']['warnings']
    }
    
    # Send to monitoring system (Prometheus, DataDog, etc.)
    send_metrics(metrics)
```

## 🎯 Best Practices

1. **Run validation regularly** - Set up automated validation in your CI/CD pipeline
2. **Monitor performance** - Track response times and tile sizes over time
3. **Validate data sources** - Check source data quality before tile generation
4. **Document issues** - Keep track of validation failures and resolutions
5. **Optimize continuously** - Use validation results to improve tile quality

## 📚 Additional Resources

- [Tippecanoe Documentation](https://github.com/mapbox/tippecanoe)
- [MBTiles Specification](https://github.com/mapbox/mbtiles-spec)
- [TileJSON Specification](https://github.com/mapbox/tilejson-spec)
- [Vector Tile Specification](https://github.com/mapbox/vector-tile-spec)

---

**Ready to validate your tiles?** Run `./scripts/validate-tiles.sh` for a quick check or `python3 scripts/validate_tiles_advanced.py` for comprehensive validation!
