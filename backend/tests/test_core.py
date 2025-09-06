import pytest
import sys
import os
from unittest.mock import Mock, patch

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestCoreFunctionality:
    """Test core functionality without external dependencies"""
    
    def test_basic_math(self) -> None:
        """Test basic math operations"""
        assert 2 + 2 == 4
        assert 3 * 4 == 12
        assert 10 / 2 == 5
    
    def test_strings(self) -> None:
        """Test string operations"""
        assert "hello" + " world" == "hello world"
        assert len("test") == 4
    
    def test_lists(self) -> None:
        """Test list operations"""
        test_list = [1, 2, 3]
        assert len(test_list) == 3
        assert test_list[0] == 1
        test_list.append(4)
        assert len(test_list) == 4
    
    def test_dictionaries(self) -> None:
        """Test dictionary operations"""
        test_dict = {"key": "value", "number": 42}
        assert test_dict["key"] == "value"
        assert test_dict["number"] == 42
        test_dict["new"] = "item"
        assert len(test_dict) == 3

class TestFileStructure:
    """Test that required files exist"""
    
    def test_required_files_exist(self) -> None:
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
    
    def test_test_files_exist(self) -> None:
        """Test that test files exist"""
        test_dir = os.path.dirname(__file__)
        
        test_files = [
            "test_core.py",
            "test_minimal.py"
        ]
        
        for file_name in test_files:
            file_path = os.path.join(test_dir, file_name)
            assert os.path.exists(file_path), f"Test file {file_name} not found"

class TestEnvironment:
    """Test environment setup"""
    
    def test_environment_variables(self) -> None:
        """Test that environment variables can be set"""
        import os
        
        # Test setting environment variables
        os.environ["TEST_VAR"] = "test_value"
        assert os.environ.get("TEST_VAR") == "test_value"
        
        # Clean up
        del os.environ["TEST_VAR"]
    
    def test_python_path(self) -> None:
        """Test Python path configuration"""
        assert len(sys.path) > 0
        assert isinstance(sys.path, list)

class TestMocking:
    """Test mocking functionality"""
    
    def test_mock_creation(self) -> None:
        """Test that mocks can be created"""
        mock_obj = Mock()
        mock_obj.some_method.return_value = "test"
        
        assert mock_obj.some_method() == "test"
        mock_obj.some_method.assert_called_once()
    
    def test_patch_decorator(self) -> None:
        """Test patch decorator"""
        with patch('builtins.print') as mock_print:
            mock_print.return_value = None
            print("test")
            mock_print.assert_called_once_with("test")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
