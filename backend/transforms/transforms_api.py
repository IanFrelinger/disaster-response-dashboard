"""
Mock transforms.api module for local development.
This replaces Foundry-specific imports when running locally.
"""

import functools
from typing import Any, Callable


class Input:
    """Mock Input class for local development."""
    def __init__(self, path: str):
        self.path = path
    
    def read_dataframe(self) -> Any:
        """Mock method that returns None for local development."""
        return None


class Output:
    """Mock Output class for local development."""
    def __init__(self, path: str) -> None:
        self.path = path
    
    def write_dataframe(self, df: Any) -> None:
        """Mock method that does nothing for local development."""
        pass


def transform(*args: Any, **kwargs: Any) -> Callable:
    """Mock transform decorator for local development."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            # For local development, just call the function directly
            return func(*args, **kwargs)
        return wrapper
    return decorator 