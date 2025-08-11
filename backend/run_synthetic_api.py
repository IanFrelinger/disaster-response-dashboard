#!/usr/bin/env python3
"""
Startup script for the synthetic data API server.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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