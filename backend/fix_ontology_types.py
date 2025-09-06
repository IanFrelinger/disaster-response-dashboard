#!/usr/bin/env python3
"""
Script to fix type annotations in mock_ontology.py
"""

import re

def fix_ontology_file() -> None:
    file_path = "mock_ontology.py"
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix function definitions without return types
    patterns = [
        # Functions with no return type annotation
        (r'def (\w+)\(([^)]*)\):\s*$', r'def \1(\2) -> None:\n        """Auto-generated return type"""'),
        # Functions with parameters but no type annotations
        (r'def (\w+)\(([^)]*)\) -> None:\s*$', r'def \1(\2) -> None:\n        """Auto-generated return type"""'),
    ]
    
    # More specific patterns for common issues
    fixes = [
        # Fix specific method signatures
        (r'def update_risk_assessment\(self, new_risk_score: float, updated_by: str\):\s*$', 
         'def update_risk_assessment(self, new_risk_score: float, updated_by: str) -> None:'),
        (r'def dispatch\(self, unit_id: str, dispatch_time: datetime\):\s*$', 
         'def dispatch(self, unit_id: str, dispatch_time: datetime) -> None:'),
        (r'def activate_route\(self, route_id: str, activated_by: str\):\s*$', 
         'def activate_route(self, route_id: str, activated_by: str) -> None:'),
        (r'def cancel_order\(self, order_id: str, cancelled_by: str\):\s*$', 
         'def cancel_order(self, order_id: str, cancelled_by: str) -> None:'),
        (r'def update_evacuation_status\(self, status: str, updated_by: str\):\s*$', 
         'def update_evacuation_status(self, status: str, updated_by: str) -> None:'),
    ]
    
    for pattern, replacement in fixes:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print("Fixed type annotations in mock_ontology.py")

if __name__ == "__main__":
    fix_ontology_file()
