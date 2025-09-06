#!/usr/bin/env python3
"""
Backend Test Runner - Runs backend tests using command pattern
"""

import asyncio
import argparse
import os
import sys
from typing import Dict, Any

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from tests.orchestrator.TestOrchestrator import TestOrchestrator, OrchestratorConfig
from tests.suites.BackendTestSuites import BackendTestSuites

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Backend Test Runner')
    parser.add_argument('--base-url', default='http://localhost:8000', help='Backend base URL')
    parser.add_argument('--timeout', type=int, default=300, help='Test timeout in seconds')
    parser.add_argument('--retries', type=int, default=1, help='Number of retries')
    parser.add_argument('--fail-fast', action='store_true', default=True, help='Stop on first failure')
    parser.add_argument('--parallel', action='store_true', default=False, help='Run tests in parallel')
    parser.add_argument('--max-concurrency', type=int, default=3, help='Max concurrent tests')
    parser.add_argument('--report-path', default='test-results/backend-test-report.json', help='Report path')
    parser.add_argument('--database-url', help='Database URL')
    parser.add_argument('--api-key', help='API key for authentication')
    
    return parser.parse_args()

class BackendTestRunner:
    """Backend test runner using command pattern"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
    
    async def run(self):
        """Run backend tests"""
        print("🔧 Starting backend test execution")
        print(f"⚙️  Configuration: {self.config}")
        
        try:
            # Create orchestrator
            orchestrator_config = OrchestratorConfig(
                base_url=self.config['base_url'],
                timeout=self.config['timeout'],
                retries=self.config['retries'],
                fail_fast=self.config['fail_fast'],
                parallel=self.config['parallel'],
                max_concurrency=self.config['max_concurrency'],
                report_path=self.config['report_path'],
                database_url=self.config.get('database_url'),
                api_key=self.config.get('api_key')
            )
            
            orchestrator = TestOrchestrator(orchestrator_config)
            
            # Get test suites
            suites = BackendTestSuites.get_all_suites(
                self.config['base_url'], 
                self.config.get('database_url')
            )
            print(f"📋 Found {len(suites)} test suites")
            
            # Run tests
            report = await orchestrator.run_suites(suites)
            
            # Print summary
            print("\n📊 Backend Test Summary:")
            print(f"✅ Passed: {report.passed_tests}")
            print(f"❌ Failed: {report.failed_tests}")
            print(f"⏭️  Skipped: {report.skipped_tests}")
            print(f"⏱️  Duration: {report.total_duration:.2f}s")
            print(f"📈 Success Rate: {report.summary['success_rate']:.1f}%")
            
            # Exit with appropriate code
            exit_code = 0 if report.failed_tests == 0 else 1
            sys.exit(exit_code)
            
        except Exception as error:
            print(f"❌ Backend test execution failed: {error}")
            sys.exit(1)

async def main():
    """Main entry point"""
    args = parse_arguments()
    
    config = {
        'base_url': args.base_url,
        'timeout': args.timeout,
        'retries': args.retries,
        'fail_fast': args.fail_fast,
        'parallel': args.parallel,
        'max_concurrency': args.max_concurrency,
        'report_path': args.report_path,
        'database_url': args.database_url,
        'api_key': args.api_key
    }
    
    # Override with environment variables if present
    if os.getenv('DATABASE_URL'):
        config['database_url'] = os.getenv('DATABASE_URL')
    if os.getenv('API_KEY'):
        config['api_key'] = os.getenv('API_KEY')
    
    runner = BackendTestRunner(config)
    await runner.run()

if __name__ == '__main__':
    asyncio.run(main())
