"""
TestOrchestrator - Orchestrates backend test execution with fail-fast behavior
"""

import asyncio
import json
import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from ..commands.BaseCommand import BaseCommand, TestContext, TestResult, TestStatus

@dataclass
class OrchestratorConfig:
    base_url: str
    timeout: int
    retries: int
    fail_fast: bool
    parallel: bool
    max_concurrency: int
    report_path: str
    database_url: Optional[str] = None
    api_key: Optional[str] = None

@dataclass
class TestSuite:
    name: str
    commands: List[BaseCommand]
    timeout: Optional[int] = None
    retries: Optional[int] = None
    fail_fast: Optional[bool] = None

@dataclass
class TestReport:
    timestamp: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    skipped_tests: int
    total_duration: float
    suites: List[Dict[str, Any]]
    summary: Dict[str, Any]

class TestOrchestrator:
    """Orchestrates test execution with fail-fast behavior"""
    
    def __init__(self, config: OrchestratorConfig):
        self.config = config
        self.context = TestContext(
            base_url=config.base_url,
            timeout=config.timeout,
            retries=config.retries,
            fail_fast=config.fail_fast,
            database_url=config.database_url,
            api_key=config.api_key
        )
    
    async def run_suites(self, suites: List[TestSuite]) -> TestReport:
        """Run multiple test suites"""
        start_time = time.time()
        suite_results = []
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        skipped_tests = 0
        
        print(f"🚀 Starting test orchestration with {len(suites)} suites")
        print(f"⚙️  Configuration: failFast={self.config.fail_fast}, parallel={self.config.parallel}")
        
        for suite in suites:
            print(f"\n📋 Running test suite: {suite.name}")
            
            suite_result = await self.run_suite(suite)
            suite_results.append(suite_result)
            
            total_tests += len(suite_result["tests"])
            passed_tests += len([t for t in suite_result["tests"] if t["status"] == TestStatus.SUCCESS.value])
            failed_tests += len([t for t in suite_result["tests"] if t["status"] == TestStatus.FAILURE.value])
            skipped_tests += len([t for t in suite_result["tests"] if t["status"] == TestStatus.SKIPPED.value])
            
            # Fail fast if enabled and suite failed
            if self.config.fail_fast and not suite_result["success"]:
                print(f"❌ Suite '{suite.name}' failed, stopping execution (failFast enabled)")
                break
        
        total_duration = time.time() - start_time
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        report = TestReport(
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            skipped_tests=skipped_tests,
            total_duration=total_duration,
            suites=suite_results,
            summary={
                "success_rate": success_rate,
                "average_duration": total_duration / total_tests if total_tests > 0 else 0,
                "fastest_test": self.find_fastest_test(suite_results),
                "slowest_test": self.find_slowest_test(suite_results)
            }
        )
        
        await self.generate_report(report)
        return report
    
    async def run_suite(self, suite: TestSuite) -> Dict[str, Any]:
        """Run a single test suite"""
        start_time = time.time()
        tests = []
        errors = []
        
        print(f"  📝 Running {len(suite.commands)} commands")
        
        if self.config.parallel and len(suite.commands) > 1:
            # Run commands in parallel with concurrency limit
            test_results = await self.run_commands_parallel(suite.commands, suite)
            tests.extend(test_results)
        else:
            # Run commands sequentially
            for command in suite.commands:
                try:
                    print(f"    🔧 Running: {command.name}")
                    result = await command.run(self.context)
                    tests.append(asdict(result))
                    
                    if result.status == TestStatus.SUCCESS:
                        print(f"    ✅ {command.name} passed ({result.duration:.2f}s)")
                    else:
                        print(f"    ❌ {command.name} failed: {', '.join(result.errors)}")
                        errors.extend(result.errors)
                        
                        # Fail fast if enabled
                        if suite.fail_fast is not False and self.config.fail_fast:
                            print(f"    🛑 Stopping suite execution due to failure (failFast enabled)")
                            break
                            
                except Exception as error:
                    error_result = TestResult(
                        name=command.name,
                        status=TestStatus.ERROR,
                        duration=time.time() - start_time,
                        errors=[f"Command execution failed: {error}"],
                        warnings=[],
                        artifacts=[],
                        metadata={}
                    )
                    tests.append(asdict(error_result))
                    errors.append(f"Command {command.name} failed: {error}")
                    
                    if suite.fail_fast is not False and self.config.fail_fast:
                        print(f"    🛑 Stopping suite execution due to error (failFast enabled)")
                        break
        
        success = all(t["status"] == TestStatus.SUCCESS.value for t in tests)
        duration = time.time() - start_time
        
        print(f"  📊 Suite '{suite.name}' completed: {'PASSED' if success else 'FAILED'} ({duration:.2f}s)")
        
        return {
            "name": suite.name,
            "success": success,
            "duration": duration,
            "tests": tests,
            "errors": errors
        }
    
    async def run_commands_parallel(self, commands: List[BaseCommand], suite: TestSuite) -> List[Dict[str, Any]]:
        """Run commands in parallel with concurrency limit"""
        results = []
        concurrency = min(self.config.max_concurrency, len(commands))
        
        print(f"    🔄 Running {len(commands)} commands in parallel (max {concurrency} concurrent)")
        
        for i in range(0, len(commands), concurrency):
            batch = commands[i:i + concurrency]
            batch_tasks = []
            
            for command in batch:
                task = asyncio.create_task(self.run_single_command(command))
                batch_tasks.append(task)
            
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    error_result = TestResult(
                        name=batch[j].name,
                        status=TestStatus.ERROR,
                        duration=0,
                        errors=[f"Command execution failed: {result}"],
                        warnings=[],
                        artifacts=[],
                        metadata={}
                    )
                    results.append(asdict(error_result))
                    print(f"      ❌ {batch[j].name} error: {result}")
                else:
                    results.append(asdict(result))
                    if result.status == TestStatus.SUCCESS:
                        print(f"      ✅ {result.name} passed ({result.duration:.2f}s)")
                    else:
                        print(f"      ❌ {result.name} failed: {', '.join(result.errors)}")
            
            # Check for failures and fail fast if enabled
            has_failures = any(r["status"] != TestStatus.SUCCESS.value for r in results[-len(batch):])
            if has_failures and suite.fail_fast is not False and self.config.fail_fast:
                print(f"    🛑 Batch failed, stopping parallel execution (failFast enabled)")
                break
        
        return results
    
    async def run_single_command(self, command: BaseCommand) -> TestResult:
        """Run a single command"""
        try:
            print(f"      🔧 Running: {command.name}")
            result = await command.run(self.context)
            return result
        except Exception as error:
            return TestResult(
                name=command.name,
                status=TestStatus.ERROR,
                duration=0,
                errors=[f"Command execution failed: {error}"],
                warnings=[],
                artifacts=[],
                metadata={}
            )
    
    def find_fastest_test(self, suite_results: List[Dict[str, Any]]) -> str:
        """Find the fastest test"""
        fastest = ""
        fastest_time = float('inf')
        
        for suite in suite_results:
            for test in suite["tests"]:
                if test["duration"] < fastest_time:
                    fastest_time = test["duration"]
                    fastest = test["name"]
        
        return fastest or "N/A"
    
    def find_slowest_test(self, suite_results: List[Dict[str, Any]]) -> str:
        """Find the slowest test"""
        slowest = ""
        slowest_time = 0
        
        for suite in suite_results:
            for test in suite["tests"]:
                if test["duration"] > slowest_time:
                    slowest_time = test["duration"]
                    slowest = test["name"]
        
        return slowest or "N/A"
    
    async def generate_report(self, report: TestReport) -> None:
        """Generate test report"""
        try:
            import os
            report_dir = os.path.dirname(self.config.report_path)
            if not os.path.exists(report_dir):
                os.makedirs(report_dir, exist_ok=True)
            
            with open(self.config.report_path, 'w') as f:
                json.dump(asdict(report), f, indent=2)
            
            print(f"📄 Test report saved to: {self.config.report_path}")
        except Exception as error:
            print(f"❌ Failed to save test report: {error}")
