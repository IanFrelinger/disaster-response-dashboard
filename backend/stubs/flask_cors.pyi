"""Type stubs for flask_cors."""

from typing import Any, Dict, List, Optional, Union, Callable
from flask import Flask

def CORS(app: Flask, **kwargs: Any) -> None: ...
def cross_origin(**kwargs: Any) -> Callable: ...
