#!/usr/bin/env python3
"""
Minimal API Test Script
Tests the API with minimal dependencies - only requires requests and basic Python packages.
"""

import sys
import os
import time
import subprocess
from typing import Optional

# Try to import requests, but handle the case where it's not available
try:
    import requests
except ImportError:
    print("❌ requests module not found. Installing...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
        import requests
        print("✅ requests installed successfully")
    except Exception as e:
        print(f"❌ Failed to install requests: {e}")
        print("Please install manually: pip install requests")
        sys.exit(1)


def print_success(message: str):
    """Print a success message"""
    print(f"✅ {message}")


def print_error(message: str):
    """Print an error message"""
    print(f"❌ {message}")


def print_info(message: str):
    """Print an info message"""
    print(f"ℹ️  {message}")


def print_warning(message: str):
    """Print a warning message"""
    print(f"⚠️  {message}")


def check_python_version() -> bool:
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print_error(f"Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    print_success(f"Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True


def check_project_structure() -> bool:
    """Check if we're in the right directory"""
    if not os.path.exists('backend'):
        print_error("Backend directory not found. Run this script from the project root.")
        return False
    print_success("Project structure verified")
    return True


def start_api_server() -> Optional[subprocess.Popen]:
    """Start the API server using the existing run_synthetic_api.py"""
    print_info("Starting API server...")
    
    try:
        # Check if the API server file exists
        api_file = os.path.join('backend', 'run_synthetic_api.py')
        if not os.path.exists(api_file):
            print_error(f"API server file not found: {api_file}")
            return None
        
        # Start the server
        server_process = subprocess.Popen(
            [sys.executable, api_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd='backend'
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


def wait_for_server(base_url: str = "http://localhost:8000", timeout: int = 30) -> bool:
    """Wait for the server to be ready"""
    print_info(f"Waiting for server at {base_url}...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(f"{base_url}/api/health", timeout=2)
            if response.status_code == 200:
                print_success("Server is ready!")
                return True
        except requests.exceptions.RequestException:
            pass
        
        time.sleep(1)
        print(".", end="", flush=True)
    
    print()
    print_error(f"Server failed to start within {timeout} seconds")
    return False


def test_api_endpoints(base_url: str = "http://localhost:8000") -> bool:
    """Test key API endpoints"""
    print_info("Testing API endpoints...")
    
    endpoints = [
        ("/api/health", "Health Check"),
        ("/api/info", "API Info"),
        ("/api/dashboard", "Dashboard"),
        ("/api/hazards", "Hazards"),
        ("/api/routes", "Routes")
    ]
    
    all_success = True
    
    for endpoint, name in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                print_success(f"{name}: OK")
                
                # Quick data validation
                if endpoint == "/api/dashboard":
                    data = response.json()
                    if 'data' in data and 'hazards' in data['data']:
                        hazard_count = len(data['data']['hazards'])
                        print_info(f"  Dashboard has {hazard_count} hazards")
                
                elif endpoint == "/api/hazards":
                    data = response.json()
                    if 'data' in data:
                        print_info(f"  Hazards endpoint returned {len(data['data'])} items")
                        
            else:
                print_error(f"{name}: Failed ({response.status_code})")
                all_success = False
                
        except Exception as e:
            print_error(f"{name}: Error - {e}")
            all_success = False
    
    return all_success


def test_api_performance(base_url: str = "http://localhost:8000") -> bool:
    """Test API performance"""
    print_info("Testing API performance...")
    
    endpoints = ["/api/health", "/api/dashboard", "/api/hazards"]
    
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            if response.status_code == 200:
                if response_time < 1000:
                    print_success(f"{endpoint}: {response_time:.1f}ms")
                elif response_time < 3000:
                    print_info(f"{endpoint}: {response_time:.1f}ms (acceptable)")
                else:
                    print_warning(f"{endpoint}: {response_time:.1f}ms (slow)")
            else:
                print_error(f"{endpoint}: Failed")
                
        except Exception as e:
            print_error(f"{endpoint}: Error - {e}")
    
    return True


def cleanup(server_process: Optional[subprocess.Popen]):
    """Clean up resources"""
    if server_process and server_process.poll() is None:
        print_info("Stopping API server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
            print_success("API server stopped")
        except subprocess.TimeoutExpired:
            print_warning("Server didn't stop gracefully, forcing...")
            server_process.kill()


def main():
    """Main test function"""
    print("🧪 Minimal API Test")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        return False
    
    if not check_project_structure():
        return False
    
    # Check if API is already running
    print_info("Checking if API is already running...")
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=2)
        if response.status_code == 200:
            print_success("API is already running!")
            
            # Test the running API
            if test_api_endpoints():
                test_api_performance()
                print_success("API is working correctly!")
                return True
            else:
                print_error("API test failed")
                return False
    except requests.exceptions.RequestException:
        print_info("API not running, starting it...")
    
    # Start the API server
    server_process = start_api_server()
    if not server_process:
        return False
    
    try:
        # Wait for server to be ready
        if not wait_for_server():
            return False
        
        # Test endpoints
        if not test_api_endpoints():
            print_error("Some endpoints failed")
            return False
        
        # Test performance
        test_api_performance()
        
        print_success("API is working correctly!")
        
        # Show API endpoints
        print("\n📡 API endpoints available:")
        print("  • Health Check: http://localhost:8000/api/health")
        print("  • Dashboard: http://localhost:8000/api/dashboard")
        print("  • Hazards: http://localhost:8000/api/hazards")
        print("  • Routes: http://localhost:8000/api/routes")
        print("  • API Info: http://localhost:8000/api/info")
        
        return True
        
    finally:
        cleanup(server_process)


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

