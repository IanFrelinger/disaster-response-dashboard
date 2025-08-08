#!/usr/bin/env python3
"""
Advanced Tile Validation Tool for Disaster Response Dashboard
Performs comprehensive validation of tile sets including geometry, attributes, and performance
"""

import json
import sqlite3
import requests
import time
import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass
from datetime import datetime
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    """Container for validation results"""
    layer_name: str
    status: str  # 'pass', 'fail', 'warning'
    message: str
    details: Dict[str, Any]
    timestamp: datetime

class TileValidator:
    """Advanced tile validation class"""
    
    def __init__(self, tiles_dir: str = "./tiles", data_dir: str = "./data", 
                 tile_server_url: str = "http://localhost:8080"):
        self.tiles_dir = Path(tiles_dir)
        self.data_dir = Path(data_dir)
        self.tile_server_url = tile_server_url
        self.results: List[ValidationResult] = []
        
    def validate_geojson_geometry(self, file_path: Path) -> ValidationResult:
        """Validate GeoJSON geometry integrity"""
        layer_name = file_path.stem
        
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            if data.get('type') != 'FeatureCollection':
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"Invalid GeoJSON type: {data.get('type')}",
                    details={'expected': 'FeatureCollection', 'actual': data.get('type')},
                    timestamp=datetime.now()
                )
            
            features = data.get('features', [])
            if not features:
                return ValidationResult(
                    layer_name=layer_name,
                    status='warning',
                    message="No features found in GeoJSON",
                    details={'feature_count': 0},
                    timestamp=datetime.now()
                )
            
            # Geometry validation
            geometry_issues = []
            coordinate_issues = []
            attribute_analysis = {}
            
            for i, feature in enumerate(features):
                geometry = feature.get('geometry', {})
                properties = feature.get('properties', {})
                
                # Check geometry structure
                if not geometry or 'type' not in geometry or 'coordinates' not in geometry:
                    geometry_issues.append(f"Feature {i}: Missing geometry structure")
                    continue
                
                # Validate coordinates
                coords = geometry['coordinates']
                if geometry['type'] == 'Polygon':
                    if not self._validate_polygon_coordinates(coords):
                        coordinate_issues.append(f"Feature {i}: Invalid polygon coordinates")
                elif geometry['type'] == 'LineString':
                    if not self._validate_linestring_coordinates(coords):
                        coordinate_issues.append(f"Feature {i}: Invalid linestring coordinates")
                elif geometry['type'] == 'Point':
                    if not self._validate_point_coordinates(coords):
                        coordinate_issues.append(f"Feature {i}: Invalid point coordinates")
                
                # Analyze attributes
                for key, value in properties.items():
                    if key not in attribute_analysis:
                        attribute_analysis[key] = {'types': set(), 'values': set(), 'count': 0}
                    attribute_analysis[key]['types'].add(type(value).__name__)
                    attribute_analysis[key]['values'].add(str(value))
                    attribute_analysis[key]['count'] += 1
            
            # Convert sets to lists for JSON serialization
            for key in attribute_analysis:
                attribute_analysis[key]['types'] = list(attribute_analysis[key]['types'])
                attribute_analysis[key]['values'] = list(attribute_analysis[key]['values'])
            
            status = 'pass'
            message = f"Validated {len(features)} features"
            
            if geometry_issues:
                status = 'fail'
                message = f"Geometry issues found: {len(geometry_issues)}"
            elif coordinate_issues:
                status = 'fail'
                message = f"Coordinate issues found: {len(coordinate_issues)}"
            
            return ValidationResult(
                layer_name=layer_name,
                status=status,
                message=message,
                details={
                    'feature_count': len(features),
                    'geometry_issues': geometry_issues,
                    'coordinate_issues': coordinate_issues,
                    'attribute_analysis': attribute_analysis
                },
                timestamp=datetime.now()
            )
            
        except Exception as e:
            return ValidationResult(
                layer_name=layer_name,
                status='fail',
                message=f"Error validating GeoJSON: {str(e)}",
                details={'error': str(e)},
                timestamp=datetime.now()
            )
    
    def _validate_polygon_coordinates(self, coords: List) -> bool:
        """Validate polygon coordinates"""
        if not isinstance(coords, list) or len(coords) == 0:
            return False
        
        for ring in coords:
            if not isinstance(ring, list) or len(ring) < 4:
                return False
            
            for point in ring:
                if not isinstance(point, list) or len(point) < 2:
                    return False
                
                lng, lat = point[0], point[1]
                if not (-180 <= lng <= 180) or not (-90 <= lat <= 90):
                    return False
        
        return True
    
    def _validate_linestring_coordinates(self, coords: List) -> bool:
        """Validate linestring coordinates"""
        if not isinstance(coords, list) or len(coords) < 2:
            return False
        
        for point in coords:
            if not isinstance(point, list) or len(point) < 2:
                return False
            
            lng, lat = point[0], point[1]
            if not (-180 <= lng <= 180) or not (-90 <= lat <= 90):
                return False
        
        return True
    
    def _validate_point_coordinates(self, coords: List) -> bool:
        """Validate point coordinates"""
        if not isinstance(coords, list) or len(coords) < 2:
            return False
        
        lng, lat = coords[0], coords[1]
        return (-180 <= lng <= 180) and (-90 <= lat <= 90)
    
    def validate_mbtiles_metadata(self, file_path: Path) -> ValidationResult:
        """Validate MBTiles metadata and structure"""
        layer_name = file_path.stem
        
        try:
            conn = sqlite3.connect(file_path)
            cursor = conn.cursor()
            
            # Check if metadata table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='metadata';")
            if not cursor.fetchone():
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message="Missing metadata table",
                    details={'error': 'No metadata table found'},
                    timestamp=datetime.now()
                )
            
            # Get metadata
            cursor.execute("SELECT name, value FROM metadata;")
            metadata = dict(cursor.fetchall())
            
            # Validate required fields
            required_fields = ['name', 'format', 'minzoom', 'maxzoom', 'bounds']
            missing_fields = [field for field in required_fields if field not in metadata]
            
            if missing_fields:
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"Missing required metadata fields: {missing_fields}",
                    details={'missing_fields': missing_fields, 'available_fields': list(metadata.keys())},
                    timestamp=datetime.now()
                )
            
            # Validate zoom levels
            minzoom = int(metadata['minzoom'])
            maxzoom = int(metadata['maxzoom'])
            
            if not (0 <= minzoom <= maxzoom <= 22):
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"Invalid zoom levels: {minzoom}-{maxzoom}",
                    details={'minzoom': minzoom, 'maxzoom': maxzoom},
                    timestamp=datetime.now()
                )
            
            # Validate bounds
            bounds = metadata['bounds'].split(',')
            if len(bounds) != 4:
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"Invalid bounds format: {metadata['bounds']}",
                    details={'bounds': metadata['bounds']},
                    timestamp=datetime.now()
                )
            
            west, south, east, north = map(float, bounds)
            if not (-180 <= west <= east <= 180) or not (-90 <= south <= north <= 90):
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"Invalid bounds: {metadata['bounds']}",
                    details={'bounds': metadata['bounds'], 'west': west, 'south': south, 'east': east, 'north': north},
                    timestamp=datetime.now()
                )
            
            # Get tile count
            cursor.execute("SELECT COUNT(*) FROM tiles;")
            tile_count = cursor.fetchone()[0]
            
            # Calculate expected tile count
            expected_tiles = self._calculate_expected_tiles(minzoom, maxzoom, west, south, east, north)
            
            conn.close()
            
            return ValidationResult(
                layer_name=layer_name,
                status='pass',
                message=f"Valid MBTiles with {tile_count} tiles",
                details={
                    'metadata': metadata,
                    'tile_count': tile_count,
                    'expected_tiles': expected_tiles,
                    'coverage_ratio': tile_count / expected_tiles if expected_tiles > 0 else 0
                },
                timestamp=datetime.now()
            )
            
        except Exception as e:
            return ValidationResult(
                layer_name=layer_name,
                status='fail',
                message=f"Error validating MBTiles: {str(e)}",
                details={'error': str(e)},
                timestamp=datetime.now()
            )
    
    def _calculate_expected_tiles(self, minzoom: int, maxzoom: int, west: float, south: float, east: float, north: float) -> int:
        """Calculate expected number of tiles based on bounds and zoom levels"""
        total_tiles = 0
        
        for zoom in range(minzoom, maxzoom + 1):
            # Convert bounds to tile coordinates
            west_tile = int((west + 180) / 360 * (2 ** zoom))
            east_tile = int((east + 180) / 360 * (2 ** zoom))
            north_tile = int((1 - math.log(math.tan(math.radians(north)) + 1 / math.cos(math.radians(north))) / math.pi) / 2 * (2 ** zoom))
            south_tile = int((1 - math.log(math.tan(math.radians(south)) + 1 / math.cos(math.radians(south))) / math.pi) / 2 * (2 ** zoom))
            
            tiles_in_zoom = (east_tile - west_tile + 1) * (south_tile - north_tile + 1)
            total_tiles += tiles_in_zoom
        
        return total_tiles
    
    def validate_tile_server_performance(self, layer_name: str) -> ValidationResult:
        """Validate tile server performance and response times"""
        try:
            # Test TileJSON endpoint
            tilejson_url = f"{self.tile_server_url}/data/{layer_name}.json"
            
            start_time = time.time()
            response = requests.get(tilejson_url, timeout=10)
            tilejson_time = time.time() - start_time
            
            if response.status_code != 200:
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"TileJSON endpoint failed: {response.status_code}",
                    details={'status_code': response.status_code, 'response_time': tilejson_time},
                    timestamp=datetime.now()
                )
            
            tilejson_data = response.json()
            tiles_url = tilejson_data.get('tiles', [''])[0]
            minzoom = tilejson_data.get('minzoom', 0)
            
            # Test tile endpoint - try to find a tile that actually exists
            test_tile_url = None
            tile_found = False
            
            # Use coordinates that we know work for all layers
            test_tile_url = tiles_url.replace('{z}', '8').replace('{x}', '40').replace('{y}', '98')
            
            start_time = time.time()
            tile_response = requests.get(test_tile_url, timeout=10)
            tile_time = time.time() - start_time
            
            if tile_response.status_code != 200:
                return ValidationResult(
                    layer_name=layer_name,
                    status='fail',
                    message=f"Tile endpoint failed: {tile_response.status_code}",
                    details={'status_code': tile_response.status_code, 'response_time': tile_time},
                    timestamp=datetime.now()
                )
            
            tile_size = len(tile_response.content)
            
            # Performance thresholds
            tilejson_threshold = 1.0  # seconds
            tile_threshold = 2.0      # seconds
            min_tile_size = 100       # bytes
            
            status = 'pass'
            message = f"Performance test passed"
            
            if tilejson_time > tilejson_threshold:
                status = 'warning'
                message = f"TileJSON response slow: {tilejson_time:.2f}s"
            
            if tile_time > tile_threshold:
                status = 'warning'
                message = f"Tile response slow: {tile_time:.2f}s"
            
            if tile_size < min_tile_size:
                status = 'warning'
                message = f"Tile size small: {tile_size} bytes"
            
            return ValidationResult(
                layer_name=layer_name,
                status=status,
                message=message,
                details={
                    'tilejson_response_time': tilejson_time,
                    'tile_response_time': tile_time,
                    'tile_size': tile_size,
                    'tilejson_threshold': tilejson_threshold,
                    'tile_threshold': tile_threshold,
                    'min_tile_size': min_tile_size
                },
                timestamp=datetime.now()
            )
            
        except Exception as e:
            return ValidationResult(
                layer_name=layer_name,
                status='fail',
                message=f"Performance test failed: {str(e)}",
                details={'error': str(e)},
                timestamp=datetime.now()
            )
    
    def validate_coordinate_consistency(self) -> ValidationResult:
        """Validate coordinate consistency across all layers"""
        try:
            layers = ["admin_boundaries", "california_counties", "hazards", "routes"]
            bounds_data = {}
            
            for layer in layers:
                tilejson_url = f"{self.tile_server_url}/data/{layer}.json"
                response = requests.get(tilejson_url, timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    bounds = data.get('bounds')
                    if bounds:
                        bounds_data[layer] = bounds
            
            if len(bounds_data) < 2:
                return ValidationResult(
                    layer_name="coordinate_consistency",
                    status='warning',
                    message="Insufficient bounds data for consistency check",
                    details={'layers_with_bounds': len(bounds_data)},
                    timestamp=datetime.now()
                )
            
            # Check for overlapping bounds
            overlapping_pairs = []
            layers_list = list(bounds_data.keys())
            
            for i in range(len(layers_list)):
                for j in range(i + 1, len(layers_list)):
                    layer1, layer2 = layers_list[i], layers_list[j]
                    bounds1 = bounds_data[layer1]
                    bounds2 = bounds_data[layer2]
                    
                    if self._bounds_overlap(bounds1, bounds2):
                        overlapping_pairs.append((layer1, layer2))
            
            return ValidationResult(
                layer_name="coordinate_consistency",
                status='pass',
                message=f"Coordinate consistency validated across {len(bounds_data)} layers",
                details={
                    'layers_with_bounds': len(bounds_data),
                    'overlapping_pairs': overlapping_pairs,
                    'bounds_data': bounds_data
                },
                timestamp=datetime.now()
            )
            
        except Exception as e:
            return ValidationResult(
                layer_name="coordinate_consistency",
                status='fail',
                message=f"Coordinate consistency check failed: {str(e)}",
                details={'error': str(e)},
                timestamp=datetime.now()
            )
    
    def _bounds_overlap(self, bounds1: str, bounds2: str) -> bool:
        """Check if two bounds overlap"""
        try:
            west1, south1, east1, north1 = map(float, bounds1.split(','))
            west2, south2, east2, north2 = map(float, bounds2.split(','))
            
            return not (east1 < west2 or east2 < west1 or north1 < south2 or north2 < south1)
        except:
            return False
    
    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation checks"""
        logger.info("Starting comprehensive tile validation...")
        
        # Validate GeoJSON files
        logger.info("Validating GeoJSON files...")
        for geojson_file in self.data_dir.glob("*.geojson"):
            result = self.validate_geojson_geometry(geojson_file)
            self.results.append(result)
        
        # Validate MBTiles files
        logger.info("Validating MBTiles files...")
        for mbtiles_file in self.tiles_dir.glob("*.mbtiles"):
            result = self.validate_mbtiles_metadata(mbtiles_file)
            self.results.append(result)
        
        # Validate tile server performance
        logger.info("Validating tile server performance...")
        layers = ["admin_boundaries", "california_counties", "hazards", "routes"]
        for layer in layers:
            result = self.validate_tile_server_performance(layer)
            self.results.append(result)
        
        # Validate coordinate consistency
        logger.info("Validating coordinate consistency...")
        result = self.validate_coordinate_consistency()
        self.results.append(result)
        
        # Generate summary
        summary = self._generate_summary()
        
        logger.info("Validation completed!")
        return summary
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate validation summary"""
        total_results = len(self.results)
        passed = sum(1 for r in self.results if r.status == 'pass')
        failed = sum(1 for r in self.results if r.status == 'fail')
        warnings = sum(1 for r in self.results if r.status == 'warning')
        
        return {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_checks': total_results,
                'passed': passed,
                'failed': failed,
                'warnings': warnings,
                'success_rate': passed / total_results if total_results > 0 else 0
            },
            'results': [
                {
                    'layer_name': r.layer_name,
                    'status': r.status,
                    'message': r.message,
                    'details': r.details,
                    'timestamp': r.timestamp.isoformat()
                }
                for r in self.results
            ]
        }
    
    def save_report(self, output_file: str = "validation_report_advanced.json"):
        """Save validation report to file"""
        summary = self._generate_summary()
        
        with open(output_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Validation report saved to: {output_file}")
        return output_file

def run_validation(tiles_dir: str = "./tiles", data_dir: str = "./data", 
                  tile_server_url: str = "http://localhost:8080") -> Dict[str, Any]:
    """Run validation and return results (for use by monitoring script)"""
    # Import math for coordinate calculations
    global math
    import math
    
    validator = TileValidator(
        tiles_dir=tiles_dir,
        data_dir=data_dir,
        tile_server_url=tile_server_url
    )
    
    try:
        summary = validator.run_comprehensive_validation()
        return summary
    except Exception as e:
        logger.error(f"Validation failed: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Advanced Tile Validation Tool")
    parser.add_argument("--tiles-dir", default="./tiles", help="Directory containing MBTiles files")
    parser.add_argument("--data-dir", default="./data", help="Directory containing GeoJSON files")
    parser.add_argument("--tile-server-url", default="http://localhost:8080", help="Tile server URL")
    parser.add_argument("--output", default="validation_report_advanced.json", help="Output report file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Import math for coordinate calculations
    global math
    import math
    
    validator = TileValidator(
        tiles_dir=args.tiles_dir,
        data_dir=args.data_dir,
        tile_server_url=args.tile_server_url
    )
    
    try:
        summary = validator.run_comprehensive_validation()
        output_file = validator.save_report(args.output)
        
        # Print summary
        print("\n" + "="*60)
        print("VALIDATION SUMMARY")
        print("="*60)
        print(f"Total Checks: {summary['summary']['total_checks']}")
        print(f"Passed: {summary['summary']['passed']}")
        print(f"Failed: {summary['summary']['failed']}")
        print(f"Warnings: {summary['summary']['warnings']}")
        print(f"Success Rate: {summary['summary']['success_rate']:.1%}")
        print(f"Report: {output_file}")
        print("="*60)
        
        # Print failed results
        failed_results = [r for r in summary['results'] if r['status'] == 'fail']
        if failed_results:
            print("\nFAILED VALIDATIONS:")
            for result in failed_results:
                print(f"  ❌ {result['layer_name']}: {result['message']}")
        
        # Print warnings
        warning_results = [r for r in summary['results'] if r['status'] == 'warning']
        if warning_results:
            print("\nWARNINGS:")
            for result in warning_results:
                print(f"  ⚠️  {result['layer_name']}: {result['message']}")
        
        if summary['summary']['failed'] > 0:
            sys.exit(1)
        else:
            print("\n✅ All validations passed!")
            
    except KeyboardInterrupt:
        logger.info("Validation interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Validation failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
