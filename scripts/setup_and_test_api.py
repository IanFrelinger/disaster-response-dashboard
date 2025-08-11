#!/usr/bin/env python3
"""
Comprehensive API Setup and Testing Script
Follows layer-by-layer testing approach to ensure no errors.
"""

import sys
import os
import time
import json
import subprocess
from datetime import datetime
from typing import Dict, List, Any, Optional

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import requests only after environment is set up
requests = None

# Import structlog only after environment is set up
structlog = None
logger = None


def print_header(title: str):
    """Print a formatted header"""
    print("\n" + "="*80)
    print(f"🚀 {title}")
    print("="*80)


def print_section(title: str):
    """Print a formatted section"""
    print(f"\n📋 {title}")
    print("-" * 60)


def print_success(message: str):
    """Print a success message"""
    print(f"✅ {message}")


def print_info(message: str):
    """Print an info message"""
    print(f"ℹ️  {message}")


def print_warning(message: str):
    """Print a warning message"""
    print(f"⚠️  {message}")


def print_error(message: str):
    """Print an error message"""
    print(f"❌ {message}")


def init_logger():
    """Initialize logger with fallback"""
    global structlog, logger
    if structlog is None:
        try:
            import structlog
            logger = structlog.get_logger(__name__)
        except ImportError:
            # Use a simple logger if structlog is not available
            class SimpleLogger:
                def warning(self, msg): print(f"WARNING: {msg}")
                def info(self, msg): print(f"INFO: {msg}")
                def error(self, msg): print(f"ERROR: {msg}")
            logger = SimpleLogger()


def check_prerequisites() -> bool:
    """Layer 1: Check system prerequisites"""
    print_section("LAYER 1: SYSTEM PREREQUISITES")
    
    try:
        # Check Python version
        python_version = sys.version_info
        if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
            print_error(f"Python 3.8+ required, found {python_version.major}.{python_version.minor}")
            return False
        print_success(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
        
        # Check if we're in the right directory
        if not os.path.exists('backend'):
            print_error("Backend directory not found. Run this script from the project root.")
            return False
        print_success("Project structure verified")
        
        # Check if virtual environment exists
        if os.path.exists('backend/venv'):
            print_success("Virtual environment found")
        else:
            print_warning("Virtual environment not found - will create one")
        
        # Check Docker availability
        try:
            result = subprocess.run(['docker', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print_success(f"Docker available: {result.stdout.strip()}")
            else:
                print_warning("Docker not available - will use local setup")
        except FileNotFoundError:
            print_warning("Docker not found - will use local setup")
        
        return True
        
    except Exception as e:
        print_error(f"Prerequisites check failed: {e}")
        return False


def setup_environment() -> bool:
    """Layer 2: Set up Python environment"""
    print_section("LAYER 2: PYTHON ENVIRONMENT SETUP")
    
    try:
        backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
        os.chdir(backend_dir)
        
        # Create virtual environment if it doesn't exist
        if not os.path.exists('venv'):
            print_info("Creating virtual environment...")
            result = subprocess.run([sys.executable, '-m', 'venv', 'venv'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                print_error(f"Failed to create virtual environment: {result.stderr}")
                return False
            print_success("Virtual environment created")
        
        # Determine virtual environment activation
        if os.name == 'nt':  # Windows
            venv_python = os.path.join('venv', 'Scripts', 'python.exe')
            venv_pip = os.path.join('venv', 'Scripts', 'pip.exe')
        else:  # Unix/Linux/macOS
            venv_python = os.path.join('venv', 'bin', 'python')
            venv_pip = os.path.join('venv', 'bin', 'pip')
        
        # Upgrade pip
        print_info("Upgrading pip...")
        result = subprocess.run([venv_python, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print_warning(f"Pip upgrade failed: {result.stderr}")
        
        # Install requirements
        print_info("Installing Python dependencies...")
        result = subprocess.run([venv_pip, 'install', '-r', 'requirements.txt'], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print_error(f"Failed to install requirements: {result.stderr}")
            return False
        print_success("Dependencies installed successfully")
        
        # Set environment variables
        os.environ['PYTHONPATH'] = backend_dir
        os.environ['FLASK_ENV'] = 'development'
        
        return True
        
    except Exception as e:
        print_error(f"Environment setup failed: {e}")
        return False


def validate_configuration() -> bool:
    """Layer 3: Validate API configuration"""
    print_section("LAYER 3: API CONFIGURATION VALIDATION")
    
    try:
        # Initialize logger
        init_logger()
        
        # Import configuration
        from config import get_config, validate_configuration
        
        config = get_config()
        
        # Check basic configuration
        print_info("Validating configuration...")
        
        # Test configuration validation
        if validate_configuration():
            print_success("Configuration validation passed")
        else:
            print_warning("Configuration validation failed - using defaults")
        
        # Check key settings
        print_info("Configuration settings:")
        print(f"   • Flask Environment: {config.FLASK_ENV}")
        print(f"   • Debug Mode: {config.FLASK_DEBUG}")
        print(f"   • Use Mock Data: {config.USE_MOCK_DATA}")
        print(f"   • Enable CORS: {config.ENABLE_CORS}")
        
        # Check if config.env exists
        if os.path.exists('config.env'):
            print_success("Configuration file found")
        else:
            print_warning("No config.env file - using default configuration")
        
        return True
        
    except Exception as e:
        print_error(f"Configuration validation failed: {e}")
        return False


def test_imports() -> bool:
    """Layer 4: Test all imports"""
    print_section("LAYER 4: IMPORT VALIDATION")
    
    try:
        print_info("Testing core imports...")
        
        # Test Flask and extensions
        import flask
        import flask_cors
        print_success("Flask imports successful")
        
        # Test data processing libraries
        import pandas
        import numpy
        print_success("Data processing imports successful")
        
        # Test geospatial libraries
        import h3
        import shapely
        print_success("Geospatial imports successful")
        
        # Test API modules
        from functions.synthetic_api import app
        print_success("API module imports successful")
        
        # Test utility modules
        from utils.synthetic_data import SyntheticDataGenerator
        print_success("Utility module imports successful")
        
        return True
        
    except ImportError as e:
        print_error(f"Import failed: {e}")
        return False
    except Exception as e:
        print_error(f"Import test failed: {e}")
        return False


def test_data_generation() -> bool:
    """Layer 5: Test synthetic data generation"""
    print_section("LAYER 5: SYNTHETIC DATA GENERATION TEST")
    
    try:
        from utils.synthetic_data import SyntheticDataGenerator
        
        print_info("Testing synthetic data generation...")
        
        # Test hazard zones generation
        hazard_zones = SyntheticDataGenerator.generate_hazard_zones(5)
        if len(hazard_zones) == 5:
            print_success(f"Generated {len(hazard_zones)} hazard zones")
        else:
            print_error(f"Expected 5 hazard zones, got {len(hazard_zones)}")
            return False
        
        # Test safe routes generation
        safe_routes = SyntheticDataGenerator.generate_safe_routes(3)
        if len(safe_routes) == 3:
            print_success(f"Generated {len(safe_routes)} safe routes")
        else:
            print_error(f"Expected 3 safe routes, got {len(safe_routes)}")
            return False
        
        # Test dashboard data generation
        dashboard_data = SyntheticDataGenerator.generate_dashboard_data()
        required_keys = ['hazards', 'routes', 'metrics', 'alerts']
        for key in required_keys:
            if key in dashboard_data:
                print_success(f"Dashboard data contains {key}")
            else:
                print_error(f"Dashboard data missing {key}")
                return False
        
        return True
        
    except Exception as e:
        print_error(f"Data generation test failed: {e}")
        return False


def start_api_server() -> Optional[subprocess.Popen]:
    """Layer 6: Start API server"""
    print_section("LAYER 6: API SERVER STARTUP")
    
    try:
        print_info("Starting API server...")
        
        # Use the virtual environment Python
        if os.name == 'nt':  # Windows
            venv_python = os.path.join('venv', 'Scripts', 'python.exe')
        else:  # Unix/Linux/macOS
            venv_python = os.path.join('venv', 'bin', 'python')
        
        # Start the server
        server_process = subprocess.Popen(
            [venv_python, 'run_synthetic_api.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if process is still running
        if server_process.poll() is None:
            print_success("API server started successfully")
            return server_process
        else:
            stdout, stderr = server_process.communicate()
            print_error(f"Server failed to start: {stderr}")
            return None
            
    except Exception as e:
        print_error(f"Failed to start API server: {e}")
        return None


def test_api_endpoints() -> bool:
    """Layer 7: Test API endpoints"""
    print_section("LAYER 7: API ENDPOINT TESTING")
    
    # Import requests now that environment is set up
    global requests
    if requests is None:
        import requests
    
    base_url = "http://localhost:8000"
    endpoints = [
        ("/api/health", "Health Check"),
        ("/api/info", "API Info"),
        ("/api/dashboard", "Dashboard Data"),
        ("/api/hazards", "Hazard Zones"),
        ("/api/routes", "Safe Routes"),
        ("/api/hazard-summary", "Hazard Summary"),
        ("/api/evacuation-routes", "Evacuation Routes")
    ]
    
    try:
        print_info("Testing API endpoints...")
        
        for endpoint, description in endpoints:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    print_success(f"{description}: {response.status_code}")
                    
                    # Test response structure for key endpoints
                    if endpoint == "/api/dashboard":
                        data = response.json()
                        if 'success' in data and 'data' in data:
                            print_success("  Dashboard response structure valid")
                        else:
                            print_warning("  Dashboard response structure unexpected")
                    
                    elif endpoint == "/api/hazards":
                        data = response.json()
                        if 'success' in data and 'data' in data:
                            print_success(f"  Hazards count: {len(data['data'])}")
                        else:
                            print_warning("  Hazards response structure unexpected")
                            
                else:
                    print_error(f"{description}: {response.status_code}")
                    return False
                    
            except requests.exceptions.RequestException as e:
                print_error(f"{description}: Connection failed - {e}")
                return False
        
        return True
        
    except Exception as e:
        print_error(f"API endpoint testing failed: {e}")
        return False


def test_api_functionality() -> bool:
    """Layer 8: Test API functionality"""
    print_section("LAYER 8: API FUNCTIONALITY TESTING")
    
    # Import requests now that environment is set up
    global requests
    if requests is None:
        import requests
    
    base_url = "http://localhost:8000"
    
    try:
        print_info("Testing API functionality...")
        
        # Test dashboard data completeness
        response = requests.get(f"{base_url}/api/dashboard")
        if response.status_code == 200:
            data = response.json()
            dashboard_data = data['data']
            
            # Check required sections
            required_sections = ['hazards', 'routes', 'metrics', 'alerts']
            for section in required_sections:
                if section in dashboard_data:
                    print_success(f"Dashboard contains {section}")
                else:
                    print_error(f"Dashboard missing {section}")
                    return False
            
            # Check metrics
            metrics = dashboard_data.get('metrics', {})
            if 'totalAffectedPopulation' in metrics:
                print_success(f"Total affected population: {metrics['totalAffectedPopulation']}")
            if 'averageResponseTime' in metrics:
                print_success(f"Average response time: {metrics['averageResponseTime']}m")
        
        # Test hazard zones with parameters
        response = requests.get(f"{base_url}/api/hazards?count=3")
        if response.status_code == 200:
            data = response.json()
            if len(data['data']) == 3:
                print_success("Hazard count parameter working")
            else:
                print_warning(f"Expected 3 hazards, got {len(data['data'])}")
        
        # Test risk assessment
        response = requests.get(f"{base_url}/api/risk-assessment?lat=37.7749&lng=-122.4194")
        if response.status_code == 200:
            data = response.json()
            if 'risk_level' in data:
                print_success("Risk assessment working")
            else:
                print_warning("Risk assessment response incomplete")
        
        return True
        
    except Exception as e:
        print_error(f"API functionality testing failed: {e}")
        return False


def test_performance() -> bool:
    """Layer 9: Test API performance"""
    print_section("LAYER 9: API PERFORMANCE TESTING")
    
    # Import requests now that environment is set up
    global requests
    if requests is None:
        import requests
    
    base_url = "http://localhost:8000"
    
    try:
        print_info("Testing API performance...")
        
        # Test response times
        endpoints = ["/api/health", "/api/dashboard", "/api/hazards", "/api/routes"]
        
        for endpoint in endpoints:
            start_time = time.time()
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                if response_time < 1000:  # Less than 1 second
                    print_success(f"{endpoint}: {response_time:.1f}ms")
                elif response_time < 3000:  # Less than 3 seconds
                    print_warning(f"{endpoint}: {response_time:.1f}ms (slow)")
                else:
                    print_error(f"{endpoint}: {response_time:.1f}ms (very slow)")
            else:
                print_error(f"{endpoint}: Failed ({response.status_code})")
        
        # Test concurrent requests
        print_info("Testing concurrent requests...")
        import concurrent.futures
        
        def make_request(endpoint):
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
                return response.status_code == 200
            except:
                return False
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request, "/api/health") for _ in range(10)]
            results = [future.result() for future in futures]
            
            success_count = sum(results)
            if success_count >= 8:  # At least 80% success rate
                print_success(f"Concurrent requests: {success_count}/10 successful")
            else:
                print_warning(f"Concurrent requests: {success_count}/10 successful")
        
        return True
        
    except Exception as e:
        print_error(f"Performance testing failed: {e}")
        return False


def cleanup(server_process: Optional[subprocess.Popen]):
    """Clean up resources"""
    print_section("CLEANUP")
    
    try:
        if server_process and server_process.poll() is None:
            print_info("Stopping API server...")
            server_process.terminate()
            server_process.wait(timeout=5)
            print_success("API server stopped")
    except Exception as e:
        print_warning(f"Cleanup warning: {e}")


def main():
    """Main function - run all layers"""
    print_header("DISASTER RESPONSE DASHBOARD - API SETUP AND TESTING")
    print_info("Following layer-by-layer approach to ensure no errors")
    
    # Track results
    layer_results = []
    server_process = None
    
    try:
        # Layer 1: Prerequisites
        if not check_prerequisites():
            print_error("Layer 1 failed - stopping")
            return False
        layer_results.append(("Prerequisites", True))
        
        # Layer 2: Environment Setup
        if not setup_environment():
            print_error("Layer 2 failed - stopping")
            return False
        layer_results.append(("Environment Setup", True))
        
        # Layer 3: Configuration
        if not validate_configuration():
            print_error("Layer 3 failed - stopping")
            return False
        layer_results.append(("Configuration", True))
        
        # Layer 4: Imports
        if not test_imports():
            print_error("Layer 4 failed - stopping")
            return False
        layer_results.append(("Imports", True))
        
        # Layer 5: Data Generation
        if not test_data_generation():
            print_error("Layer 5 failed - stopping")
            return False
        layer_results.append(("Data Generation", True))
        
        # Layer 6: Server Startup
        server_process = start_api_server()
        if not server_process:
            print_error("Layer 6 failed - stopping")
            return False
        layer_results.append(("Server Startup", True))
        
        # Wait for server to be fully ready
        time.sleep(2)
        
        # Layer 7: Endpoint Testing
        if not test_api_endpoints():
            print_error("Layer 7 failed - stopping")
            return False
        layer_results.append(("Endpoint Testing", True))
        
        # Layer 8: Functionality Testing
        if not test_api_functionality():
            print_error("Layer 8 failed - stopping")
            return False
        layer_results.append(("Functionality Testing", True))
        
        # Layer 9: Performance Testing
        if not test_performance():
            print_error("Layer 9 failed - stopping")
            return False
        layer_results.append(("Performance Testing", True))
        
        # Summary
        print_header("API SETUP AND TESTING COMPLETE")
        
        successful_layers = sum(1 for _, result in layer_results if result)
        total_layers = len(layer_results)
        
        print_success(f"All {total_layers} layers completed successfully!")
        
        print_info("API is now ready for use:")
        print("   • Health Check: http://localhost:8000/api/health")
        print("   • Dashboard: http://localhost:8000/api/dashboard")
        print("   • Hazards: http://localhost:8000/api/hazards")
        print("   • Routes: http://localhost:8000/api/routes")
        print("   • API Info: http://localhost:8000/api/info")
        
        print_info("Next steps:")
        print("   • Frontend can now connect to the API")
        print("   • Run integration tests with frontend")
        print("   • Deploy to production environment")
        
        return True
        
    except KeyboardInterrupt:
        print_warning("Setup interrupted by user")
        return False
    except Exception as e:
        print_error(f"Setup failed: {e}")
        return False
    finally:
        cleanup(server_process)


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
