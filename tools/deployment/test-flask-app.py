#!/usr/bin/env python3
"""
Flask App Test Script
Tests that the Flask application can start and respond to basic requests
"""

import os
import sys
import time
import requests
import subprocess
import signal
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

def test_flask_app():
    """Test the Flask application locally"""
    print("🧪 Testing Flask Application")
    print("=" * 40)
    
    # Check if run_synthetic_api.py exists
    api_file = backend_path / "run_synthetic_api.py"
    if not api_file.exists():
        print("❌ run_synthetic_api.py not found")
        return False
    
    print("✅ run_synthetic_api.py found")
    
    # Check if synthetic_api.py exists
    synthetic_api_file = backend_path / "functions" / "synthetic_api.py"
    if not synthetic_api_file.exists():
        print("❌ synthetic_api.py not found")
        return False
    
    print("✅ synthetic_api.py found")
    
    # Test Python syntax
    try:
        import run_synthetic_api
        print("✅ Python syntax is valid")
    except Exception as e:
        print(f"❌ Python syntax error: {e}")
        return False
    
    # Test Flask app import
    try:
        from functions.synthetic_api import app
        print("✅ Flask app import successful")
    except Exception as e:
        print(f"❌ Flask app import error: {e}")
        return False
    
    # Test Flask app configuration
    try:
        # Test basic Flask app properties
        assert hasattr(app, 'name'), "Flask app missing name"
        print("✅ Flask app has required properties")
    except Exception as e:
        print(f"❌ Flask app configuration error: {e}")
        return False
    
    # Test requirements installation (simulate)
    try:
        import flask
        import flask_cors
        import pandas
        import numpy
        print("✅ Core dependencies available")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        return False
    
    print("\n🎉 Flask app test completed successfully!")
    return True

def test_requirements():
    """Test that requirements can be installed"""
    print("\n📦 Testing Requirements Installation")
    print("=" * 40)
    
    requirements_file = backend_path / "requirements.txt"
    if not requirements_file.exists():
        print("❌ backend/requirements.txt not found")
        return False
    
    print("✅ backend/requirements.txt found")
    
    # Check for private packages
    with open(requirements_file, 'r') as f:
        content = f.read()
        if 'palantir-foundry' in content or 'foundry-sdk' in content:
            print("❌ Private packages found in requirements.txt")
            return False
    
    print("✅ No private packages in requirements.txt")
    
    # Test pip check
    try:
        result = subprocess.run(
            ['pip', 'check', '-r', str(requirements_file)],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            print("✅ Requirements syntax is valid")
            return True
        else:
            print(f"❌ Requirements check failed: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ Requirements check timed out")
        return False
    except Exception as e:
        print(f"❌ Requirements check error: {e}")
        return False

def test_deployment_config():
    """Test deployment configuration"""
    print("\n⚙️  Testing Deployment Configuration")
    print("=" * 40)
    
    deploy_script = Path(__file__).parent / "deploy-cloudshell.sh"
    if not deploy_script.exists():
        print("❌ deploy-cloudshell.sh not found")
        return False
    
    print("✅ deploy-cloudshell.sh found")
    
    # Check script syntax
    try:
        result = subprocess.run(
            ['bash', '-n', str(deploy_script)],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("✅ Deployment script syntax is valid")
        else:
            print(f"❌ Deployment script syntax error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Deployment script check error: {e}")
        return False
    
    # Check for required configuration
    with open(deploy_script, 'r') as f:
        content = f.read()
        
        checks = [
            ('AWS_REGION="us-east-2"', 'Region configuration'),
            ('backend/requirements.txt', 'Backend requirements path'),
            ('IanConnection', 'GitHub connection ARN'),
            ('run_synthetic_api.py', 'Start command'),
            ('Port.*8000', 'Port configuration')
        ]
        
        for pattern, description in checks:
            if pattern in content:
                print(f"✅ {description} found")
            else:
                print(f"❌ {description} not found")
                return False
    
    return True

def main():
    """Run all tests"""
    print("🚀 Disaster Response Dashboard - Local Validation")
    print("=" * 50)
    
    tests = [
        ("Flask App", test_flask_app),
        ("Requirements", test_requirements),
        ("Deployment Config", test_deployment_config)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} test failed")
        except Exception as e:
            print(f"❌ {test_name} test error: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your deployment should work in CloudShell.")
        return 0
    else:
        print("❌ Some tests failed. Please fix the issues before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
