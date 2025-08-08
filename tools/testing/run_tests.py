#!/usr/bin/env python3
"""
Test runner script for the disaster response dashboard backend.
"""

import sys
import subprocess
import argparse
from pathlib import Path


def run_tests(test_path=None, verbose=False, coverage=False, markers=None):
    """Run pytest with the specified configuration."""
    
    # Base pytest command
    cmd = ['python', '-m', 'pytest']
    
    # Add test path if specified
    if test_path:
        cmd.append(test_path)
    else:
        cmd.append('tests/')
    
    # Add verbosity
    if verbose:
        cmd.append('-v')
    
    # Add coverage if requested
    if coverage:
        cmd.extend(['--cov=backend', '--cov-report=term-missing', '--cov-report=html'])
    
    # Add markers if specified
    if markers:
        cmd.extend(['-m', markers])
    
    # Add additional pytest options
    cmd.extend([
        '--tb=short',  # Short traceback format
        '--strict-markers',  # Strict marker checking
        '--disable-warnings'  # Disable warnings for cleaner output
    ])
    
    print(f"Running tests with command: {' '.join(cmd)}")
    print("-" * 60)
    
    # Run the tests
    try:
        result = subprocess.run(cmd, check=False)
        return result.returncode
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        return 1
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1


def run_specific_test_suite(suite_name):
    """Run a specific test suite."""
    test_files = {
        'ingestion': 'tests/test_ingestion.py',
        'routing': 'tests/test_routing.py',
        'compute': 'tests/test_compute_modules.py',
        'functions': 'tests/test_functions.py',
        'sync': 'tests/test_sync_script.py',
        'all': None
    }
    
    if suite_name not in test_files:
        print(f"Unknown test suite: {suite_name}")
        print(f"Available suites: {', '.join(test_files.keys())}")
        return 1
    
    return run_tests(test_files[suite_name], verbose=True)


def main():
    """Main entry point for test runner."""
    parser = argparse.ArgumentParser(description='Run backend tests for disaster response dashboard')
    parser.add_argument('--suite', choices=['ingestion', 'routing', 'compute', 'functions', 'sync', 'all'],
                       default='all', help='Test suite to run')
    parser.add_argument('--path', help='Specific test file or directory to run')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--coverage', '-c', action='store_true', help='Generate coverage report')
    parser.add_argument('--markers', '-m', help='Run tests with specific markers')
    parser.add_argument('--quick', action='store_true', help='Run only fast tests (skip slow markers)')
    
    args = parser.parse_args()
    
    # Handle quick mode
    if args.quick:
        args.markers = 'not slow'
    
    # Run specific suite or all tests
    if args.suite != 'all':
        return run_specific_test_suite(args.suite)
    else:
        return run_tests(args.path, args.verbose, args.coverage, args.markers)


if __name__ == '__main__':
    sys.exit(main()) 