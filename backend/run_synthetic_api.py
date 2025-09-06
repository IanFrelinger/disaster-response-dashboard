#!/usr/bin/env python3
"""
Startup script for the synthetic data API server.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from config.env
def load_env_file(env_file_path: str) -> None:
    """Load environment variables from a .env file."""
    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print(f"✅ Loaded environment variables from {env_file_path}")
    else:
        print(f"⚠️  Environment file not found: {env_file_path}")

# Load config.env file
config_env_path = Path(__file__).parent / 'config.env'
load_env_file(str(config_env_path))

from functions.synthetic_api import app

if __name__ == '__main__':
    # Get port from environment variable or default to 8000
    port = int(os.environ.get('FLASK_PORT', 8000))
    
    print("🚀 Starting Disaster Response Dashboard - Synthetic Data API")
    print("=" * 60)
    print(f"📡 API will be available at: http://localhost:{port}")
    print(f"📊 Dashboard endpoint: http://localhost:{port}/api/dashboard")
    print(f"🏥 Health check: http://localhost:{port}/api/health")
    print(f"📖 API info: http://localhost:{port}/api/info")
    print(f"🗺️ Mapbox Token: {'✅ Set' if os.getenv('MAPBOX_ACCESS_TOKEN') else '❌ Not Set'}")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(debug=False, host='0.0.0.0', port=port)
    except KeyboardInterrupt:
        print("\n👋 Shutting down synthetic data API server...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1) 