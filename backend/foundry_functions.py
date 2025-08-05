"""
Mock foundry_functions module for local development.
This replaces Foundry-specific imports when running locally.
"""

import functools
from typing import Any, Callable


class Input:
    """Mock Input class for local development."""
    def __init__(self, path: str):
        self.path = path
    
    def read_dataframe(self):
        """Mock method that returns None for local development."""
        return None


class Output:
    """Mock Output class for local development."""
    def __init__(self, path: str):
        self.path = path
    
    def write_dataframe(self, df):
        """Mock method that does nothing for local development."""
        pass


def function(*args, **kwargs):
    """Mock function decorator for local development."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # For local development, just call the function directly
            return func(*args, **kwargs)
        return wrapper
    return decorator 