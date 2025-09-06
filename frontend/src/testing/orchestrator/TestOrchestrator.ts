/**
 * TestOrchestrator - Orchestrates test execution with fail-fast behavior
 */

import { BaseCommand, TestContext, TestResult } from '../commands/BaseCommand';
import { PipelineController, PipelineConfig } from '../utils/PipelineController';
import { issueTracker } from '../utils/IssueTracker';

export interface OrchestratorConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  failFast: boolean;
  parallel: boolean;
  maxConcurrency: number;
  reportPath: string;
}

export interface TestSuite {
  name: string;
  commands: BaseCommand[];
  timeout?: number;
  retries?: number;
  failFast?: boolean;
}

export interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  suites: TestSuiteResult[];
  summary: {
    successRate: number;
    averageDuration: number;
    fastestTest: string;
    slowestTest: string;
  };
  pipelineResult?: any;
  issues?: any;
}

export interface TestSuiteResult {
  name: string;
  success: boolean;
  duration: number;
  tests: TestResult[];
  errors: string[];
}

export class TestOrchestrator {
  private config: OrchestratorConfig;
  private context: TestContext;
  private pipelineController: PipelineController;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.context = {
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      retries: config.retries,
      failFast: config.failFast,
      page: undefined,
      browser: undefined
    };
    
    // Initialize pipeline controller
    const pipelineConfig: PipelineConfig = {
      failFast: config.failFast,
      maxRetries: config.retries,
      retryDelay: 2000, // 2 seconds
      autoAddressIssues: true,
      criticalIssueThreshold: 3,
      stopOnCriticalIssues: true
    };
    
    this.pipelineController = new PipelineController(pipelineConfig);
  }

  async runSuites(suites: TestSuite[]): Promise<TestReport> {
    const startTime = Date.now();
    this.pipelineController.start();
    
    const suiteResults: TestSuiteResult[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    console.log(`🚀 Starting test orchestration with ${suites.length} suites`);
    console.log(`⚙️  Configuration: failFast=${this.config.failFast}, parallel=${this.config.parallel}`);

    for (const suite of suites) {
      console.log(`\n📋 Running test suite: ${suite.name}`);
      
      const suiteResult = await this.runSuite(suite);
      suiteResults.push(suiteResult);
      
      totalTests += suiteResult.tests.length;
      passedTests += suiteResult.tests.filter(t => t.success).length;
      failedTests += suiteResult.tests.filter(t => !t.success).length;
      skippedTests += suiteResult.tests.filter(t => t.errors && t.errors.some(e => e.includes('skipped'))).length;

      // Handle test failure with pipeline controller
      if (!suiteResult.success) {
        const failedTest = suiteResult.tests.find(t => !t.success);
        if (failedTest) {
          const shouldContinue = this.pipelineController.shouldContinue(
            failedTest.name,
            suite.name,
            (failedTest.errors || []).join('; ')
          );
          
          if (!shouldContinue) {
            console.log(`🛑 Pipeline stopped due to test failure`);
            console.log(`📋 Issue ID: ${failedTest.issueId || 'UNKNOWN'}`);
            console.log(`🔧 Remediation: ${failedTest.remediation || 'Check error details'}`);
            break;
          } else {
            // Attempt to handle the failure
            const retry = await this.pipelineController.handleFailure(
              failedTest.name,
              suite.name,
              (failedTest.errors || []).join('; ')
            );
            
            if (!retry) {
              console.log(`🛑 Pipeline stopped: max retries exceeded`);
              break;
            }
          }
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    // Get pipeline result
    const pipelineResult = this.pipelineController.getResult();

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      totalDuration,
      suites: suiteResults,
      summary: {
        successRate,
        averageDuration: totalTests > 0 ? totalDuration / totalTests : 0,
        fastestTest: this.findFastestTest(suiteResults),
        slowestTest: this.findSlowestTest(suiteResults)
      }
    };

    await this.generateReport(report);
    return report;
  }

  private async runSuite(suite: TestSuite): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const tests: TestResult[] = [];
    const errors: string[] = [];

    console.log(`  📝 Running ${suite.commands.length} commands`);

    if (this.config.parallel && suite.commands.length > 1) {
      // Run commands in parallel with concurrency limit
      const results = await this.runCommandsParallel(suite.commands, suite);
      tests.push(...results);
    } else {
      // Run commands sequentially
      for (const command of suite.commands) {
        try {
          console.log(`    🔧 Running: ${command.name}`);
          const result = await command.run(this.context);
          tests.push(result);
          
          if (result.success) {
            console.log(`    ✅ ${command.name} passed (${result.duration}ms)`);
          } else {
            console.log(`    ❌ ${command.name} failed: ${(result.errors || []).join(', ')}`);
            errors.push(...result.errors);
            
            // Fail fast if enabled
            if (suite.failFast !== false && this.config.failFast) {
              console.log(`    🛑 Stopping suite execution due to failure (failFast enabled)`);
              break;
            }
          }
        } catch (error) {
          const errorResult: TestResult = {
            name: command.name,
            success: false,
            duration: Date.now() - startTime,
            errors: [`Command execution failed: ${error}`],
            warnings: [],
            artifacts: [],
            metadata: {}
          };
          tests.push(errorResult);
          errors.push(`Command ${command.name} failed: ${error}`);
          
          if (suite.failFast !== false && this.config.failFast) {
            console.log(`    🛑 Stopping suite execution due to error (failFast enabled)`);
            break;
          }
        }
      }
    }

    const success = tests.every(t => t.success);
    const duration = Date.now() - startTime;

    console.log(`  📊 Suite "${suite.name}" completed: ${success ? 'PASSED' : 'FAILED'} (${duration}ms)`);

    return {
      name: suite.name,
      success,
      duration,
      tests,
      errors
    };
  }

  private async runCommandsParallel(commands: BaseCommand[], suite: TestSuite): Promise<TestResult[]> {
    const results: TestResult[] = [];
    const concurrency = Math.min(this.config.maxConcurrency, commands.length);
    
    console.log(`    🔄 Running ${commands.length} commands in parallel (max ${concurrency} concurrent)`);

    for (let i = 0; i < commands.length; i += concurrency) {
      const batch = commands.slice(i, i + concurrency);
      const batchPromises = batch.map(async (command) => {
        try {
          console.log(`      🔧 Running: ${command.name}`);
          const result = await command.run(this.context);
          
          if (result.success) {
            console.log(`      ✅ ${command.name} passed (${result.duration}ms)`);
          } else {
            console.log(`      ❌ ${command.name} failed: ${(result.errors || []).join(', ')}`);
          }
          
          return result;
        } catch (error) {
          console.log(`      ❌ ${command.name} error: ${error}`);
          return {
            name: command.name,
            success: false,
            duration: 0,
            errors: [`Command execution failed: ${error}`],
            warnings: [],
            artifacts: [],
            metadata: {}
          } as TestResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Check for failures and fail fast if enabled
      const hasFailures = batchResults.some(r => !r.success);
      if (hasFailures && suite.failFast !== false && this.config.failFast) {
        console.log(`    🛑 Batch failed, stopping parallel execution (failFast enabled)`);
        break;
      }
    }

    return results;
  }

  private findFastestTest(suiteResults: TestSuiteResult[]): string {
    let fastest = '';
    let fastestTime = Infinity;

    for (const suite of suiteResults) {
      for (const test of suite.tests) {
        if (test.duration < fastestTime) {
          fastestTime = test.duration;
          fastest = test.name;
        }
      }
    }

    return fastest || 'N/A';
  }

  private findSlowestTest(suiteResults: TestSuiteResult[]): string {
    let slowest = '';
    let slowestTime = 0;

    for (const suite of suiteResults) {
      for (const test of suite.tests) {
        if (test.duration > slowestTime) {
          slowestTime = test.duration;
          slowest = test.name;
        }
      }
    }

    return slowest || 'N/A';
  }

  private async generateReport(report: TestReport): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    try {
      const reportDir = path.dirname(this.config.reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      fs.writeFileSync(this.config.reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Test report saved to: ${this.config.reportPath}`);
    } catch (error) {
      console.error(`❌ Failed to save test report: ${error}`);
    }
  }
}
