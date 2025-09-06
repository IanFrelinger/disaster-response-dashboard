"""
APITestCommand - Tests API endpoints and responses
"""

import requests
import json
from typing import Dict, List, Any
from .BaseCommand import BaseCommand, TestContext, TestResult, TestStatus, GLOBAL_TIMEOUTS

class APITestCommand(BaseCommand):
    """Test API endpoints for functionality and performance"""
    
    def __init__(self, input_data: Dict[str, Any] = None):
        super().__init__(input_data)
        self.name = "APITest"
    
    async def run(self, ctx: TestContext) -> TestResult:
        self.start_time = time.time()
        errors = []
        warnings = []
        artifacts = []
        
        try:
            endpoints = self.input.get("endpoints", [])
            expected_status = self.input.get("expected_status", 200)
            timeout = self.input.get("timeout", GLOBAL_TIMEOUTS["api_call"])
            
            print(f"🔍 Running API tests for {len(endpoints)} endpoints")
            
            for endpoint in endpoints:
                try:
                    await self.execute_with_timeout(
                        lambda: self.test_endpoint(ctx.base_url, endpoint, expected_status, timeout),
                        timeout,
                        f"API test timeout for {endpoint}"
                    )
                except Exception as error:
                    errors.append(f"API test failed for {endpoint}: {error}")
                    if self.input.get("fail_fast", True):
                        break
            
            success = len(errors) == 0
            
            if not success and self.input.get("fail_fast", True):
                raise Exception(f"API tests failed: {', '.join(errors)}")
            
            return self.create_result(
                TestStatus.SUCCESS if success else TestStatus.FAILURE,
                errors,
                warnings,
                artifacts,
                {
                    "endpoints_tested": len(endpoints),
                    "success_rate": (len(endpoints) - len(errors)) / len(endpoints) if endpoints else 0
                }
            )
            
        except Exception as error:
            return self.create_result(
                TestStatus.ERROR,
                [f"API test command failed: {error}"],
                warnings,
                artifacts
            )
    
    def test_endpoint(self, base_url: str, endpoint: str, expected_status: int, timeout: int) -> Dict[str, Any]:
        """Test a single API endpoint"""
        url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        try:
            response = requests.get(url, timeout=timeout)
            
            if response.status_code != expected_status:
                raise Exception(f"Expected status {expected_status}, got {response.status_code}")
            
            # Check response time
            response_time = response.elapsed.total_seconds()
            if response_time > timeout * 0.8:  # Warning if > 80% of timeout
                warnings.append(f"Slow response time for {endpoint}: {response_time:.2f}s")
            
            # Validate JSON response if applicable
            try:
                data = response.json()
                return {
                    "endpoint": endpoint,
                    "status_code": response.status_code,
                    "response_time": response_time,
                    "data_size": len(str(data))
                }
            except json.JSONDecodeError:
                return {
                    "endpoint": endpoint,
                    "status_code": response.status_code,
                    "response_time": response_time,
                    "data_size": len(response.text)
                }
                
        except requests.exceptions.RequestException as error:
            raise Exception(f"Request failed: {error}")
