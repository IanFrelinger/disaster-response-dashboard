"""
BaseCommand - Common interfaces and utilities for all backend test commands
"""

import time
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum

class TestStatus(Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    SKIPPED = "skipped"
    ERROR = "error"

@dataclass
class TestContext:
    """Context for test execution"""
    base_url: str
    timeout: int
    retries: int
    fail_fast: bool
    environment: str = "test"
    database_url: Optional[str] = None
    api_key: Optional[str] = None

@dataclass
class TestResult:
    """Result of test execution"""
    name: str
    status: TestStatus
    duration: float
    errors: List[str]
    warnings: List[str]
    artifacts: List[str]
    metadata: Dict[str, Any]

# Global timeout configurations
GLOBAL_TIMEOUTS = {
    # API operations
    "api_call": 10,           # 10s for API calls
    "api_response": 15,        # 15s for API responses
    "health_check": 10,        # 10s for health checks
    
    # Database operations
    "database_query": 15,      # 15s for database queries
    "database_connection": 10, # 10s for database connections
    "database_migration": 30,  # 30s for database migrations
    
    # Service operations
    "service_start": 30,       # 30s for service startup
    "service_stop": 10,        # 10s for service shutdown
    "service_health": 10,      # 10s for service health checks
    
    # File operations
    "file_read": 5,            # 5s for file reads
    "file_write": 5,           # 5s for file writes
    "file_upload": 15,         # 15s for file uploads
    
    # Validation operations
    "validation": 10,          # 10s for validation checks
    "data_processing": 20,     # 20s for data processing
    "model_inference": 30,     # 30s for ML model inference
    
    # Network operations
    "network_request": 15,     # 15s for network requests
    "network_timeout": 30,     # 30s for network timeouts
    "connection_pool": 5,      # 5s for connection pool operations
}

class TimeoutError(Exception):
    """Raised when an operation times out"""
    pass

class RetryError(Exception):
    """Raised when all retry attempts are exhausted"""
    pass

def with_timeout(operation, timeout_seconds: int, error_message: str = "Operation timeout"):
    """Add timeout to any operation"""
    async def timeout_wrapper():
        try:
            if asyncio.iscoroutinefunction(operation):
                return await asyncio.wait_for(operation(), timeout=timeout_seconds)
            else:
                return await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(None, operation), 
                    timeout=timeout_seconds
                )
        except asyncio.TimeoutError:
            raise TimeoutError(f"{error_message} (timeout after {timeout_seconds}s)")
    
    return timeout_wrapper()

def with_retry(operation, max_retries: int = 3, base_delay: float = 1.0):
    """Retry operation with exponential backoff"""
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            if asyncio.iscoroutinefunction(operation):
                return asyncio.run(operation())
            else:
                return operation()
        except Exception as error:
            last_error = error
            
            if attempt == max_retries:
                raise RetryError(f"Operation failed after {max_retries} retries: {last_error}")
            
            delay = base_delay * (2 ** attempt)
            time.sleep(delay)
    
    raise last_error

class BaseCommand(ABC):
    """Base command class that all commands should extend"""
    
    def __init__(self, input_data: Dict[str, Any] = None):
        self.input = input_data or {}
        self.start_time = 0
        self.name = self.__class__.__name__
    
    @abstractmethod
    async def run(self, ctx: TestContext) -> TestResult:
        """Execute the command"""
        pass
    
    def create_result(
        self, 
        status: TestStatus, 
        errors: List[str] = None, 
        warnings: List[str] = None, 
        artifacts: List[str] = None, 
        metadata: Dict[str, Any] = None
    ) -> TestResult:
        """Create a test result"""
        return TestResult(
            name=self.name,
            status=status,
            duration=time.time() - self.start_time,
            errors=errors or [],
            warnings=warnings or [],
            artifacts=artifacts or [],
            metadata=metadata or {}
        )
    
    async def execute_with_timeout(
        self, 
        operation, 
        timeout_seconds: int = None, 
        error_message: str = None
    ):
        """Execute operation with timeout"""
        timeout = timeout_seconds or GLOBAL_TIMEOUTS.get("validation", 10)
        error_msg = error_message or f"{self.name} operation timeout"
        
        return await with_timeout(operation, timeout, error_msg)
    
    async def execute_with_retry(
        self, 
        operation, 
        max_retries: int = None, 
        base_delay: float = 1.0
    ):
        """Execute operation with retry"""
        retries = max_retries or self.input.get("retries", 1)
        return await with_retry(operation, retries, base_delay)
