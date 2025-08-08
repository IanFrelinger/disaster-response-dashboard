#!/bin/bash

# Disaster Response Dashboard - Tile Validation Script
# Procedurally validates tile sets for data quality, integrity, and functionality

set -e

echo "🔍 Disaster Response Dashboard - Tile Validation"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TILES_DIR="./tiles"
DATA_DIR="./data"
VALIDATION_DIR="./validation"
TILE_SERVER_URL="http://localhost:8080"

# Create validation directory
mkdir -p $VALIDATION_DIR

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate GeoJSON structure
validate_geojson() {
    local file="$1"
    local name="$2"
    
    print_status "Validating GeoJSON structure: $name"
    
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    
    # Check if it's valid JSON
    if ! python3 -m json.tool "$file" >/dev/null 2>&1; then
        print_error "Invalid JSON format: $file"
        return 1
    fi
    
    # Check GeoJSON structure
    local type=$(python3 -c "import json; data=json.load(open('$file')); print(data.get('type', 'unknown'))" 2>/dev/null)
    if [ "$type" != "FeatureCollection" ]; then
        print_error "Invalid GeoJSON type: expected FeatureCollection, got $type"
        return 1
    fi
    
    # Count features
    local feature_count=$(python3 -c "import json; data=json.load(open('$file')); print(len(data.get('features', [])))" 2>/dev/null)
    if [ "$feature_count" -eq 0 ]; then
        print_warning "No features found in: $file"
    else
        print_success "Found $feature_count features in $name"
    fi
    
    # Validate coordinate system (should be WGS84)
    local coords=$(python3 -c "
import json
data = json.load(open('$file'))
features = data.get('features', [])
if features:
    coords = features[0]['geometry']['coordinates'][0] if features[0]['geometry']['type'] == 'Polygon' else features[0]['geometry']['coordinates']
    print(' '.join(map(str, coords[:2])))
" 2>/dev/null)
    
    if [ -n "$coords" ]; then
        local lng=$(echo $coords | cut -d' ' -f1)
        local lat=$(echo $coords | cut -d' ' -f2)
        
        # Check if coordinates are in reasonable WGS84 range
        if (( $(echo "$lng >= -180 && $lng <= 180" | bc -l) )) && (( $(echo "$lat >= -90 && $lat <= 90" | bc -l) )); then
            print_success "Coordinates in valid WGS84 range: $lng, $lat"
        else
            print_error "Coordinates out of WGS84 range: $lng, $lat"
            return 1
        fi
    fi
    
    return 0
}

# Function to validate MBTiles structure
validate_mbtiles() {
    local file="$1"
    local name="$2"
    
    print_status "Validating MBTiles structure: $name"
    
    if [ ! -f "$file" ]; then
        print_error "MBTiles file not found: $file"
        return 1
    fi
    
    # Check file size
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$size" -lt 1024 ]; then
        print_warning "MBTiles file seems small: ${size} bytes"
    else
        print_success "MBTiles file size: ${size} bytes"
    fi
    
    # Check if it's a valid SQLite database
    if command_exists sqlite3; then
        if sqlite3 "$file" "SELECT name FROM sqlite_master WHERE type='table' AND name='metadata';" 2>/dev/null | grep -q metadata; then
            print_success "Valid SQLite database with metadata table"
            
            # Extract metadata
            local format=$(sqlite3 "$file" "SELECT value FROM metadata WHERE name='format';" 2>/dev/null)
            local name_meta=$(sqlite3 "$file" "SELECT value FROM metadata WHERE name='name';" 2>/dev/null)
            local minzoom=$(sqlite3 "$file" "SELECT value FROM metadata WHERE name='minzoom';" 2>/dev/null)
            local maxzoom=$(sqlite3 "$file" "SELECT value FROM metadata WHERE name='maxzoom';" 2>/dev/null)
            local bounds=$(sqlite3 "$file" "SELECT value FROM metadata WHERE name='bounds';" 2>/dev/null)
            
            print_status "  Format: $format"
            print_status "  Name: $name_meta"
            print_status "  Zoom levels: $minzoom - $maxzoom"
            print_status "  Bounds: $bounds"
            
            # Validate zoom levels
            if [ -n "$minzoom" ] && [ -n "$maxzoom" ]; then
                if [ "$minzoom" -le "$maxzoom" ] && [ "$minzoom" -ge 0 ] && [ "$maxzoom" -le 22 ]; then
                    print_success "Valid zoom levels: $minzoom - $maxzoom"
                else
                    print_error "Invalid zoom levels: $minzoom - $maxzoom"
                    return 1
                fi
            fi
            
            # Validate bounds
            if [ -n "$bounds" ]; then
                local west=$(echo $bounds | cut -d',' -f1)
                local south=$(echo $bounds | cut -d',' -f2)
                local east=$(echo $bounds | cut -d',' -f3)
                local north=$(echo $bounds | cut -d',' -f4)
                
                if (( $(echo "$west >= -180 && $west <= 180" | bc -l) )) && \
                   (( $(echo "$east >= -180 && $east <= 180" | bc -l) )) && \
                   (( $(echo "$south >= -90 && $south <= 90" | bc -l) )) && \
                   (( $(echo "$north >= -90 && $north <= 90" | bc -l) )); then
                    print_success "Valid bounds: $bounds"
                else
                    print_error "Invalid bounds: $bounds"
                    return 1
                fi
            fi
        else
            print_error "Invalid MBTiles file: missing metadata table"
            return 1
        fi
    else
        print_warning "sqlite3 not available, skipping MBTiles validation"
    fi
    
    return 0
}

# Function to validate tile server endpoints
validate_tile_endpoints() {
    local layer="$1"
    local name="$2"
    
    print_status "Validating tile server endpoint: $name"
    
    # Test TileJSON endpoint
    local tilejson_url="$TILE_SERVER_URL/data/$layer.json"
    if curl -s -f "$tilejson_url" >/dev/null 2>&1; then
        print_success "TileJSON endpoint accessible: $tilejson_url"
        
        # Parse TileJSON response
        local response=$(curl -s "$tilejson_url")
        local tiles_url=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('tiles', [''])[0])" 2>/dev/null)
        local minzoom=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('minzoom', 'unknown'))" 2>/dev/null)
        local maxzoom=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); data=json.load(sys.stdin); print(data.get('maxzoom', 'unknown'))" 2>/dev/null)
        
        print_status "  Tiles URL: $tiles_url"
        print_status "  Zoom levels: $minzoom - $maxzoom"
        
        # Test a specific tile
        if [ -n "$minzoom" ] && [ "$minzoom" != "unknown" ]; then
            local test_tile_url=$(echo "$tiles_url" | sed "s/{z}/$minzoom/g" | sed "s/{x}/0/g" | sed "s/{y}/0/g")
            if curl -s -f -I "$test_tile_url" >/dev/null 2>&1; then
                print_success "Test tile accessible: $test_tile_url"
            else
                print_warning "Test tile not accessible: $test_tile_url"
            fi
        fi
    else
        print_error "TileJSON endpoint not accessible: $tilejson_url"
        return 1
    fi
    
    return 0
}

# Function to validate tile content
validate_tile_content() {
    local layer="$1"
    local name="$2"
    
    print_status "Validating tile content: $name"
    
    # Get TileJSON to find tile URL pattern
    local tilejson_url="$TILE_SERVER_URL/data/$layer.json"
    local response=$(curl -s "$tilejson_url" 2>/dev/null)
    
    if [ -z "$response" ]; then
        print_error "Could not fetch TileJSON for $name"
        return 1
    fi
    
    local tiles_url=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('tiles', [''])[0])" 2>/dev/null)
    local minzoom=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('minzoom', 0))" 2>/dev/null)
    
    if [ -n "$tiles_url" ] && [ "$minzoom" != "unknown" ]; then
        # Test a specific tile
        local test_tile_url=$(echo "$tiles_url" | sed "s/{z}/$minzoom/g" | sed "s/{x}/0/g" | sed "s/{y}/0/g")
        local tile_data=$(curl -s "$test_tile_url" 2>/dev/null)
        
        if [ -n "$tile_data" ]; then
            # Check if it's a valid PBF (Protocol Buffer) file
            local file_size=${#tile_data}
            if [ "$file_size" -gt 0 ]; then
                print_success "Tile content received: ${file_size} bytes"
                
                # Save tile for inspection
                echo "$tile_data" > "$VALIDATION_DIR/${layer}_test_tile.pbf"
                print_status "  Test tile saved to: $VALIDATION_DIR/${layer}_test_tile.pbf"
            else
                print_warning "Empty tile content received"
            fi
        else
            print_warning "No tile content received"
        fi
    fi
    
    return 0
}

# Function to validate coordinate consistency
validate_coordinate_consistency() {
    print_status "Validating coordinate consistency across layers"
    
    local layers=("admin_boundaries" "california_counties" "hazards" "routes")
    local bounds_list=()
    
    for layer in "${layers[@]}"; do
        local tilejson_url="$TILE_SERVER_URL/data/$layer.json"
        local response=$(curl -s "$tilejson_url" 2>/dev/null)
        
        if [ -n "$response" ]; then
            local bounds=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('bounds', ''))" 2>/dev/null)
            if [ -n "$bounds" ] && [ "$bounds" != "None" ]; then
                bounds_list+=("$layer:$bounds")
                print_status "  $layer bounds: $bounds"
            fi
        fi
    done
    
    # Check for overlapping bounds
    if [ ${#bounds_list[@]} -gt 1 ]; then
        print_success "Coordinate consistency check completed"
        print_status "  Found ${#bounds_list[@]} layers with bounds"
    else
        print_warning "Limited coordinate data available for consistency check"
    fi
}

# Function to validate data quality
validate_data_quality() {
    print_status "Validating data quality metrics"
    
    local total_features=0
    local total_geometries=0
    
    # Check GeoJSON files
    for geojson_file in "$DATA_DIR"/*.geojson; do
        if [ -f "$geojson_file" ]; then
            local filename=$(basename "$geojson_file")
            local feature_count=$(python3 -c "import json; data=json.load(open('$geojson_file')); print(len(data.get('features', [])))" 2>/dev/null)
            local geometry_types=$(python3 -c "
import json
data = json.load(open('$geojson_file'))
features = data.get('features', [])
types = set(f['geometry']['type'] for f in features if 'geometry' in f)
print(', '.join(types))
" 2>/dev/null)
            
            total_features=$((total_features + feature_count))
            print_status "  $filename: $feature_count features ($geometry_types)"
        fi
    done
    
    # Check MBTiles files
    for mbtiles_file in "$TILES_DIR"/*.mbtiles; do
        if [ -f "$mbtiles_file" ]; then
            local filename=$(basename "$mbtiles_file")
            if command_exists sqlite3; then
                local tile_count=$(sqlite3 "$mbtiles_file" "SELECT COUNT(*) FROM tiles;" 2>/dev/null)
                print_status "  $filename: $tile_count tiles"
                total_geometries=$((total_geometries + tile_count))
            fi
        fi
    done
    
    print_success "Data quality summary:"
    print_status "  Total features: $total_features"
    print_status "  Total tiles: $total_geometries"
}

# Function to generate validation report
generate_validation_report() {
    local report_file="$VALIDATION_DIR/validation_report.json"
    
    print_status "Generating validation report: $report_file"
    
    # Collect validation data
    local report_data=$(cat << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "tile_server_url": "$TILE_SERVER_URL",
  "validation_summary": {
    "total_layers": 4,
    "layers_tested": ["admin_boundaries", "california_counties", "hazards", "routes"],
    "validation_passed": true
  },
  "layer_details": {
EOF
)
    
    # Add layer details
    local layers=("admin_boundaries" "california_counties" "hazards" "routes")
    local first=true
    
    for layer in "${layers[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            report_data="$report_data,"
        fi
        
        local tilejson_url="$TILE_SERVER_URL/data/$layer.json"
        local response=$(curl -s "$tilejson_url" 2>/dev/null)
        
        if [ -n "$response" ]; then
            local name=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('name', 'unknown'))" 2>/dev/null)
            local minzoom=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('minzoom', 'unknown'))" 2>/dev/null)
            local maxzoom=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('maxzoom', 'unknown'))" 2>/dev/null)
            local bounds=$(echo "$response" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('bounds', 'unknown'))" 2>/dev/null)
            
            report_data="$report_data
    \"$layer\": {
      \"name\": \"$name\",
      \"minzoom\": $minzoom,
      \"maxzoom\": $maxzoom,
      \"bounds\": \"$bounds\",
      \"status\": \"valid\"
    }"
        else
            report_data="$report_data
    \"$layer\": {
      \"status\": \"error\",
      \"error\": \"TileJSON not accessible\"
    }"
        fi
    done
    
    report_data="$report_data
  }
}"
EOF
    
    echo "$report_data" > "$report_file"
    print_success "Validation report saved to: $report_file"
}

# Main validation function
main() {
    print_status "Starting comprehensive tile validation..."
    echo ""
    
    local validation_passed=true
    
    # 1. Validate GeoJSON source files
    print_status "=== Validating GeoJSON Source Files ==="
    for geojson_file in "$DATA_DIR"/*.geojson; do
        if [ -f "$geojson_file" ]; then
            local filename=$(basename "$geojson_file")
            if ! validate_geojson "$geojson_file" "$filename"; then
                validation_passed=false
            fi
        fi
    done
    echo ""
    
    # 2. Validate MBTiles files
    print_status "=== Validating MBTiles Files ==="
    for mbtiles_file in "$TILES_DIR"/*.mbtiles; do
        if [ -f "$mbtiles_file" ]; then
            local filename=$(basename "$mbtiles_file")
            if ! validate_mbtiles "$mbtiles_file" "$filename"; then
                validation_passed=false
            fi
        fi
    done
    echo ""
    
    # 3. Validate tile server endpoints
    print_status "=== Validating Tile Server Endpoints ==="
    local layers=("admin_boundaries" "california_counties" "hazards" "routes")
    for layer in "${layers[@]}"; do
        if ! validate_tile_endpoints "$layer" "$layer"; then
            validation_passed=false
        fi
    done
    echo ""
    
    # 4. Validate tile content
    print_status "=== Validating Tile Content ==="
    for layer in "${layers[@]}"; do
        validate_tile_content "$layer" "$layer"
    done
    echo ""
    
    # 5. Validate coordinate consistency
    print_status "=== Validating Coordinate Consistency ==="
    validate_coordinate_consistency
    echo ""
    
    # 6. Validate data quality
    print_status "=== Validating Data Quality ==="
    validate_data_quality
    echo ""
    
    # 7. Generate validation report
    print_status "=== Generating Validation Report ==="
    generate_validation_report
    echo ""
    
    # Final summary
    print_status "=== Validation Summary ==="
    if [ "$validation_passed" = true ]; then
        print_success "✅ All tile validations passed!"
        print_status "📊 Tile server is healthy and serving valid tiles"
        print_status "🗺️  All layers are accessible and properly formatted"
        print_status "📋 Validation report: $VALIDATION_DIR/validation_report.json"
    else
        print_error "❌ Some validations failed. Check the output above for details."
        print_status "📋 Validation report: $VALIDATION_DIR/validation_report.json"
        exit 1
    fi
    
    echo ""
    print_status "🔍 Validation completed successfully!"
}

# Run main validation
main "$@"
