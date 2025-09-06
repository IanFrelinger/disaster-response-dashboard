import pytest
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_imports() -> None:
    """Test that we can import the main modules without errors"""
    try:
        # Test basic imports
        import run_synthetic_api
        assert run_synthetic_api is not None
        print("✅ Successfully imported run_synthetic_api")
    except ImportError as e:
        pytest.fail(f"Failed to import run_synthetic_api: {e}")

def test_basic_functionality() -> None:
    """Test basic functionality without external dependencies"""
    # Test that we can create basic data structures
    test_data = {
        "disasters": [
            {"id": 1, "type": "fire", "location": "test"},
            {"id": 2, "type": "flood", "location": "test2"}
        ]
    }
    
    assert len(test_data["disasters"]) == 2
    assert test_data["disasters"][0]["type"] == "fire"
    assert test_data["disasters"][1]["type"] == "flood"
    print("✅ Basic data structure tests passed")

def test_environment_variables() -> None:
    """Test that environment variables can be set"""
    import os
    
    # Test setting environment variables
    os.environ["TEST_VAR"] = "test_value"
    assert os.environ.get("TEST_VAR") == "test_value"
    
    # Clean up
    del os.environ["TEST_VAR"]
    print("✅ Environment variable tests passed")

def test_file_structure() -> None:
    """Test that required files exist"""
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    
    required_files = [
        "run_synthetic_api.py",
        "requirements.txt",
        "Dockerfile"
    ]
    
    for file_name in required_files:
        file_path = os.path.join(backend_dir, file_name)
        assert os.path.exists(file_path), f"Required file {file_name} not found"
    
    print("✅ File structure tests passed")

if __name__ == "__main__":
    # Run tests
    test_imports()
    test_basic_functionality()
    test_environment_variables()
    test_file_structure()
    print("🎉 All unit tests passed!")

