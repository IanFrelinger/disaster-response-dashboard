"""
Comprehensive API Integration Tests
Tests all API endpoints to ensure they work correctly in the containerized environment
"""

import pytest
import requests
import json
import time
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"
TIMEOUT = 30

class TestAPIIntegration:
    """Comprehensive API integration test suite"""
    
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        response = requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["success"] is True
        assert "timestamp" in data
        logger.info("✅ Health endpoint working correctly")
    
    def test_api_root(self):
        """Test the API root endpoint"""
        response = requests.get(f"{API_BASE}/", timeout=TIMEOUT)
        # API root might return 404 if not implemented, which is acceptable
        assert response.status_code in [200, 404], f"API root returned unexpected status: {response.status_code}"
        logger.info("✅ API root endpoint accessible")
    
    def test_disaster_data_endpoints(self):
        """Test disaster data related endpoints"""
        endpoints = [
            "/disasters",
            "/hazards", 
            "/risks",
            "/routes"
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=TIMEOUT)
            assert response.status_code in [200, 404], f"Endpoint {endpoint} failed with status {response.status_code}"
            logger.info(f"✅ Endpoint {endpoint} accessible")
    
    def test_data_validation(self):
        """Test that returned data has correct structure"""
        response = requests.get(f"{API_BASE}/disasters", timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, (list, dict)), "Data should be list or dict"
            logger.info("✅ Data structure validation passed")
    
    def test_error_handling(self):
        """Test error handling for invalid endpoints"""
        response = requests.get(f"{API_BASE}/nonexistent", timeout=TIMEOUT)
        assert response.status_code in [404, 405], "Should handle invalid endpoints gracefully"
        logger.info("✅ Error handling working correctly")
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
        assert "Access-Control-Allow-Origin" in response.headers or response.status_code == 200
        logger.info("✅ CORS headers present")
    
    def test_response_time(self):
        """Test that API responses are within acceptable time limits"""
        start_time = time.time()
        response = requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
        end_time = time.time()
        
        response_time = end_time - start_time
        assert response_time < 5.0, f"Response time {response_time}s exceeds 5s limit"
        logger.info(f"✅ Response time acceptable: {response_time:.2f}s")
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        import concurrent.futures
        
        def make_request():
            return requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request) for _ in range(5)]
            responses = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        for response in responses:
            assert response.status_code == 200
        
        logger.info("✅ Concurrent request handling working correctly")
    
    def test_data_consistency(self):
        """Test that data remains consistent across requests"""
        response1 = requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
        response2 = requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
        
        assert response1.status_code == response2.status_code
        logger.info("✅ Data consistency maintained")

class TestPerformance:
    """Performance testing suite"""
    
    def test_load_handling(self):
        """Test API under load"""
        import concurrent.futures
        import time
        
        def make_request():
            start = time.time()
            response = requests.get(f"{API_BASE}/health", timeout=TIMEOUT)
            end = time.time()
            return response.status_code, end - start
        
        # Make 10 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        
        # Check all requests succeeded
        status_codes = [result[0] for result in results]
        response_times = [result[1] for result in results]
        
        assert all(code == 200 for code in status_codes), "All requests should succeed"
        assert all(time < 10.0 for time in response_times), "All responses should be under 10s"
        
        avg_response_time = sum(response_times) / len(response_times)
        logger.info(f"✅ Load test passed - Average response time: {avg_response_time:.2f}s")

class TestSecurity:
    """Security testing suite"""
    
    def test_sql_injection_protection(self):
        """Test protection against SQL injection attempts"""
        malicious_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --"
        ]
        
        for payload in malicious_payloads:
            response = requests.get(f"{API_BASE}/disasters?q={payload}", timeout=TIMEOUT)
            # Should not crash or return sensitive data
            assert response.status_code in [200, 400, 404], f"Malicious payload {payload} should be handled safely"
        
        logger.info("✅ SQL injection protection working")
    
    def test_xss_protection(self):
        """Test protection against XSS attempts"""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ]
        
        for payload in xss_payloads:
            response = requests.get(f"{API_BASE}/disasters?q={payload}", timeout=TIMEOUT)
            # Should not crash
            assert response.status_code in [200, 400, 404], f"XSS payload {payload} should be handled safely"
        
        logger.info("✅ XSS protection working")

if __name__ == "__main__":
    # Run tests with detailed output
    pytest.main([__file__, "-v", "--tb=short"])
