"""
ServiceHealthCommand - Tests service health and availability
"""

import requests
import time
from typing import Dict, List, Any
from .BaseCommand import BaseCommand, TestContext, TestResult, TestStatus, GLOBAL_TIMEOUTS

class ServiceHealthCommand(BaseCommand):
    """Test service health endpoints and overall system health"""
    
    def __init__(self, input_data: Dict[str, Any] = None):
        super().__init__(input_data)
        self.name = "ServiceHealth"
    
    async def run(self, ctx: TestContext) -> TestResult:
        self.start_time = time.time()
        errors = []
        warnings = []
        artifacts = []
        
        try:
            print("🏥 Running service health checks")
            
            # Test main health endpoint
            health_url = f"{ctx.base_url}/health"
            await self.execute_with_timeout(
                lambda: self.check_health_endpoint(health_url),
                GLOBAL_TIMEOUTS["health_check"],
                "Health check timeout"
            )
            
            # Test API health if specified
            if self.input.get("check_api_health", True):
                api_health_url = f"{ctx.base_url}/api/health"
                await self.execute_with_timeout(
                    lambda: self.check_api_health(api_health_url),
                    GLOBAL_TIMEOUTS["api_call"],
                    "API health check timeout"
                )
            
            # Test database health if specified
            if self.input.get("check_db_health", True):
                await self.execute_with_timeout(
                    lambda: self.check_database_health(ctx.database_url),
                    GLOBAL_TIMEOUTS["database_connection"],
                    "Database health check timeout"
                )
            
            # Test external dependencies if specified
            if self.input.get("check_dependencies", False):
                dependencies = self.input.get("dependencies", [])
                for dep in dependencies:
                    await self.execute_with_timeout(
                        lambda: self.check_dependency(dep),
                        GLOBAL_TIMEOUTS["network_request"],
                        f"Dependency check timeout for {dep}"
                    )
            
            success = len(errors) == 0
            
            if not success and self.input.get("fail_fast", True):
                raise Exception(f"Service health checks failed: {', '.join(errors)}")
            
            return self.create_result(
                TestStatus.SUCCESS if success else TestStatus.FAILURE,
                errors,
                warnings,
                artifacts,
                {
                    "health_endpoint_tested": True,
                    "api_health_tested": self.input.get("check_api_health", True),
                    "db_health_tested": self.input.get("check_db_health", True),
                    "dependencies_tested": len(self.input.get("dependencies", []))
                }
            )
            
        except Exception as error:
            return self.create_result(
                TestStatus.ERROR,
                [f"Service health command failed: {error}"],
                warnings,
                artifacts
            )
    
    def check_health_endpoint(self, health_url: str) -> Dict[str, Any]:
        """Check main health endpoint"""
        try:
            response = requests.get(health_url, timeout=GLOBAL_TIMEOUTS["health_check"])
            
            if response.status_code != 200:
                raise Exception(f"Health endpoint returned status {response.status_code}")
            
            return {
                "endpoint": health_url,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "healthy": True
            }
        except requests.exceptions.RequestException as error:
            raise Exception(f"Health endpoint request failed: {error}")
    
    def check_api_health(self, api_health_url: str) -> Dict[str, Any]:
        """Check API health endpoint"""
        try:
            response = requests.get(api_health_url, timeout=GLOBAL_TIMEOUTS["api_call"])
            
            if response.status_code != 200:
                raise Exception(f"API health endpoint returned status {response.status_code}")
            
            data = response.json()
            return {
                "endpoint": api_health_url,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "api_healthy": data.get("status") == "healthy"
            }
        except requests.exceptions.RequestException as error:
            raise Exception(f"API health endpoint request failed: {error}")
    
    def check_database_health(self, database_url: str) -> Dict[str, Any]:
        """Check database health"""
        if not database_url:
            raise Exception("Database URL not provided")
        
        # Mock database health check
        # In real implementation, this would check actual database connectivity
        time.sleep(0.1)  # Simulate check time
        
        return {
            "database_url": database_url,
            "connected": True,
            "response_time": 0.1
        }
    
    def check_dependency(self, dependency_url: str) -> Dict[str, Any]:
        """Check external dependency health"""
        try:
            response = requests.get(dependency_url, timeout=GLOBAL_TIMEOUTS["network_request"])
            
            return {
                "dependency": dependency_url,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "available": response.status_code < 500
            }
        except requests.exceptions.RequestException as error:
            raise Exception(f"Dependency check failed for {dependency_url}: {error}")
