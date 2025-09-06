"""Type stubs for flask_limiter."""

from typing import Any, Callable, Optional, Union
from flask import Flask

class Limiter:
    def __init__(
        self,
        app: Optional[Flask] = None,
        key_func: Optional[Callable[[], str]] = None,
        default_limits: Optional[list[str]] = None,
        **kwargs: Any
    ) -> None: ...
    
    def limit(self, limit_value: str, **kwargs: Any) -> Callable: ...
    def exempt(self, f: Callable) -> Callable: ...
    def reset(self) -> None: ...

