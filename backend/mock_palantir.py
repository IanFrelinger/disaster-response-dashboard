"""
Mock Palantir Foundry Module for Demo Environment
This provides the necessary classes and decorators to run the challenge-winning implementations
in a demo environment without requiring the actual Foundry platform.
"""

import pandas as pd
import numpy as np
from typing import Any, Dict, List, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger(__name__)


# Mock Input/Output classes
class Input:
    def __init__(self, path: str):
        self.path = path
        self._data = None
    
    def dataframe(self):
        """Return a mock dataframe for demo purposes"""
        if self._data is None:
            # Generate mock data based on the path
            if "firms" in self.path:
                self._data = generate_mock_firms_data()
            elif "weather" in self.path:
                self._data = generate_mock_weather_data()
            elif "population" in self.path:
                self._data = generate_mock_population_data()
            elif "terrain" in self.path:
                self._data = generate_mock_terrain_data()
            else:
                self._data = pd.DataFrame()
        return self._data


class Output:
    def __init__(self, path: str):
        self.path = path
    
    def write_dataframe(self, df):
        """Mock writing to Foundry dataset"""
        logger.info(f"Mock writing {len(df)} records to {self.path}")
        return True


# Mock DataFrame class with PySpark-like methods
class DataFrame:
    def __init__(self, data: pd.DataFrame):
        self._df = data
    
    def withColumn(self, col_name: str, expression):
        """Mock withColumn method"""
        if callable(expression):
            # Handle UDF-like expressions
            if hasattr(expression, '__call__'):
                # Simple mock implementation
                self._df[col_name] = expression(self._df)
            else:
                self._df[col_name] = expression
        else:
            self._df[col_name] = expression
        return self
    
    def groupBy(self, *cols):
        """Mock groupBy method"""
        return MockGroupedData(self._df, cols)
    
    def join(self, other, on=None, how="inner"):
        """Mock join method"""
        if isinstance(other, DataFrame):
            other_df = other._df
        else:
            other_df = other
        
        if on:
            if isinstance(on, str):
                on = [on]
            result = pd.merge(self._df, other_df, on=on, how=how)
        else:
            result = pd.merge(self._df, other_df, how=how)
        
        return DataFrame(result)
    
    def filter(self, condition):
        """Mock filter method"""
        if hasattr(condition, '__call__'):
            mask = condition(self._df)
            return DataFrame(self._df[mask])
        return self
    
    def agg(self, *exprs):
        """Mock agg method"""
        # Simple mock aggregation
        return DataFrame(self._df)
    
    def count(self):
        """Mock count method"""
        return len(self._df)
    
    def collect(self):
        """Mock collect method"""
        return [tuple(row) for row in self._df.values]
    
    def __getattr__(self, name):
        """Delegate unknown attributes to underlying pandas DataFrame"""
        return getattr(self._df, name)


class MockGroupedData:
    def __init__(self, df: pd.DataFrame, group_cols: List[str]):
        self._df = df
        self._group_cols = group_cols
    
    def agg(self, *exprs):
        """Mock aggregation on grouped data"""
        # Simple mock - just return the original data
        return DataFrame(self._df)


# Mock SQL functions
def col(col_name: str):
    """Mock col function"""
    return lambda df: df[col_name]


def lit(value: Any):
    """Mock lit function"""
    return value


def when(condition, value):
    """Mock when function"""
    return lambda df: np.where(condition(df), value, None)


def coalesce(*exprs):
    """Mock coalesce function"""
    def _coalesce(df):
        for expr in exprs:
            if hasattr(expr, '__call__'):
                result = expr(df)
            else:
                result = expr
            if result is not None and not pd.isna(result).all():
                return result
        return None
    return _coalesce


def current_timestamp():
    """Mock current_timestamp function"""
    return datetime.now()


def max(col_name: str):
    """Mock max function"""
    return lambda df: df[col_name].max()


def count():
    """Mock count function"""
    return lambda df: len(df)


def sum(col_name: str):
    """Mock sum function"""
    return lambda df: df[col_name].sum()


# Mock transform decorator
def transform(**kwargs):
    """Mock transform decorator"""
    def decorator(func):
        def wrapper(*args, **kw):
            logger.info(f"Mock executing transform: {func.__name__}")
            return func(*args, **kw)
        return wrapper
    return decorator


# Mock data generators
def generate_mock_firms_data():
    """Generate mock FIRMS satellite data"""
    np.random.seed(42)
    n_points = 100
    
    data = {
        'latitude': np.random.uniform(32.5, 42.5, n_points),
        'longitude': np.random.uniform(-124.5, -114.5, n_points),
        'brightness': np.random.uniform(300, 500, n_points),
        'acq_date': [datetime.now() - pd.Timedelta(hours=i) for i in range(n_points)],
        'confidence': np.random.choice(['high', 'medium', 'low'], n_points)
    }
    
    return pd.DataFrame(data)


def generate_mock_weather_data():
    """Generate mock weather data"""
    np.random.seed(42)
    n_points = 50
    
    data = {
        'h3_cell': [f"8928308284{str(i).zfill(5)}" for i in range(n_points)],
        'wind_speed': np.random.uniform(5, 35, n_points),
        'temperature': np.random.uniform(15, 35, n_points),
        'humidity': np.random.uniform(20, 80, n_points),
        'pressure': np.random.uniform(1000, 1020, n_points)
    }
    
    return pd.DataFrame(data)


def generate_mock_population_data():
    """Generate mock population data"""
    np.random.seed(42)
    n_points = 50
    
    data = {
        'h3_cell': [f"8928308284{str(i).zfill(5)}" for i in range(n_points)],
        'population': np.random.randint(100, 5000, n_points),
        'density': np.random.uniform(10, 200, n_points),
        'median_age': np.random.uniform(25, 65, n_points)
    }
    
    return pd.DataFrame(data)


def generate_mock_terrain_data():
    """Generate mock terrain elevation data"""
    np.random.seed(42)
    n_points = 50
    
    data = {
        'h3_cell': [f"8928308284{str(i).zfill(5)}" for i in range(n_points)],
        'elevation': np.random.uniform(0, 2000, n_points),
        'slope': np.random.uniform(0, 30, n_points),
        'aspect': np.random.uniform(0, 360, n_points)
    }
    
    return pd.DataFrame(data)


# Mock h3 module
class MockH3:
    @staticmethod
    def latlng_to_cell(lat, lng, resolution):
        """Mock H3 latlng_to_cell function"""
        # Return a mock H3 cell ID
        return f"8928308284{hash((lat, lng)) % 100000:05d}"


# Create mock h3 module
h3 = MockH3()


# Mock structlog
try:
    import structlog
except ImportError:
    # Create a simple mock logger if structlog is not available
    class MockLogger:
        def __init__(self, name):
            self.name = name
        
        def info(self, message, **kwargs):
            print(f"[INFO] {message}")
        
        def error(self, message, **kwargs):
            print(f"[ERROR] {message}")
        
        def warning(self, message, **kwargs):
            print(f"[WARNING] {message}")
    
    structlog = type('MockStructlog', (), {
        'get_logger': lambda name: MockLogger(name)
    })
