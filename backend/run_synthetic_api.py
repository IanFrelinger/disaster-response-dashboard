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
    print("🚀 Starting Disaster Response Dashboard - Synthetic Data API")
    print("=" * 60)
    print("📡 API will be available at: http://localhost:5000")
    print("📊 Dashboard endpoint: http://localhost:5000/api/dashboard")
    print("🏥 Health check: http://localhost:5000/api/health")
    print("📖 API info: http://localhost:5000/api/info")
    print("=" * 60)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Shutting down synthetic data API server...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1) 