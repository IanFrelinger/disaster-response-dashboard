"""
BackendTestSuites - Predefined test suites using command pattern
"""

from typing import List
from ..orchestrator.TestOrchestrator import TestSuite
from ..commands.APITestCommand import APITestCommand
from ..commands.DatabaseTestCommand import DatabaseTestCommand
from ..commands.ServiceHealthCommand import ServiceHealthCommand

class BackendTestSuites:
    """Predefined backend test suites"""
    
    @staticmethod
    def get_health_check_suite(base_url: str, database_url: str = None) -> TestSuite:
        """Basic health check suite"""
        return TestSuite(
            name="Health Check",
            commands=[
                ServiceHealthCommand({
                    "check_api_health": True,
                    "check_db_health": True,
                    "timeout": 10,
                    "fail_fast": True
                })
            ],
            timeout=30,
            fail_fast=True
        )
    
    @staticmethod
    def get_api_validation_suite(base_url: str) -> TestSuite:
        """API endpoint validation suite"""
        return TestSuite(
            name="API Validation",
            commands=[
                APITestCommand({
                    "endpoints": [
                        "health",
                        "api/health",
                        "api/hazards",
                        "api/units",
                        "api/routes"
                    ],
                    "expected_status": 200,
                    "timeout": 10,
                    "fail_fast": True
                })
            ],
            timeout=60,
            fail_fast=True
        )
    
    @staticmethod
    def get_database_suite(base_url: str, database_url: str) -> TestSuite:
        """Database connectivity and operations suite"""
        return TestSuite(
            name="Database Tests",
            commands=[
                DatabaseTestCommand({
                    "test_query": True,
                    "test_integrity": True,
                    "timeout": 15,
                    "fail_fast": True
                })
            ],
            timeout=60,
            fail_fast=True
        )
    
    @staticmethod
    def get_integration_suite(base_url: str, database_url: str = None) -> TestSuite:
        """Full integration test suite"""
        return TestSuite(
            name="Integration Tests",
            commands=[
                ServiceHealthCommand({
                    "check_api_health": True,
                    "check_db_health": True,
                    "check_dependencies": True,
                    "dependencies": [f"{base_url}/health"],
                    "timeout": 10,
                    "fail_fast": True
                }),
                APITestCommand({
                    "endpoints": [
                        "health",
                        "api/health",
                        "api/hazards",
                        "api/units",
                        "api/routes"
                    ],
                    "expected_status": 200,
                    "timeout": 10,
                    "fail_fast": True
                }),
                DatabaseTestCommand({
                    "test_query": True,
                    "test_integrity": True,
                    "timeout": 15,
                    "fail_fast": True
                }) if database_url else None
            ],
            timeout=120,
            fail_fast=True
        )
    
    @staticmethod
    def get_performance_suite(base_url: str) -> TestSuite:
        """Performance and load testing suite"""
        return TestSuite(
            name="Performance Tests",
            commands=[
                APITestCommand({
                    "endpoints": [
                        "health",
                        "api/health",
                        "api/hazards"
                    ],
                    "expected_status": 200,
                    "timeout": 5,  # Shorter timeout for performance
                    "fail_fast": True
                })
            ],
            timeout=30,
            fail_fast=True
        )
    
    @staticmethod
    def get_comprehensive_suite(base_url: str, database_url: str = None) -> TestSuite:
        """Comprehensive test suite covering all aspects"""
        commands = [
            ServiceHealthCommand({
                "check_api_health": True,
                "check_db_health": True,
                "check_dependencies": True,
                "dependencies": [f"{base_url}/health"],
                "timeout": 10,
                "fail_fast": True
            }),
            APITestCommand({
                "endpoints": [
                    "health",
                    "api/health",
                    "api/hazards",
                    "api/units",
                    "api/routes"
                ],
                "expected_status": 200,
                "timeout": 10,
                "fail_fast": True
            })
        ]
        
        if database_url:
            commands.append(
                DatabaseTestCommand({
                    "test_query": True,
                    "test_integrity": True,
                    "timeout": 15,
                    "fail_fast": True
                })
            )
        
        return TestSuite(
            name="Comprehensive Tests",
            commands=commands,
            timeout=180,  # 3 minutes
            fail_fast=True
        )
    
    @staticmethod
    def get_all_suites(base_url: str, database_url: str = None) -> List[TestSuite]:
        """Get all available test suites"""
        suites = [
            BackendTestSuites.get_health_check_suite(base_url, database_url),
            BackendTestSuites.get_api_validation_suite(base_url),
            BackendTestSuites.get_performance_suite(base_url)
        ]
        
        if database_url:
            suites.append(BackendTestSuites.get_database_suite(base_url, database_url))
        
        suites.extend([
            BackendTestSuites.get_integration_suite(base_url, database_url),
            BackendTestSuites.get_comprehensive_suite(base_url, database_url)
        ])
        
        return suites
