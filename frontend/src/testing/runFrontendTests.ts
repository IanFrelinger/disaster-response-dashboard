#!/usr/bin/env node
/**
 * Frontend Test Runner - Runs frontend tests using command pattern
 */

import { chromium } from 'playwright';
import { TestOrchestrator, OrchestratorConfig } from './orchestrator/TestOrchestrator';
import { FrontendTestSuites } from './suites/FrontendTestSuites';
import { createProductionTestSuites } from './suites/ProductionTestSuites';
import { createFailFastTestSuites } from './suites/FailFastTestSuites';
import { createDebugTestSuites } from './suites/DebugTestSuites';

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 300000,
  retries: 1,
  failFast: true,
  parallel: false,
  maxConcurrency: 3,
  reportPath: 'test-results/frontend-test-report.json',
  production: false,
  debug: false
};

// Parse arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace('--', '');
  const value = args[i + 1];
  
  if (key && value) {
    if (key === 'timeout' || key === 'retries' || key === 'maxConcurrency') {
      config[key] = parseInt(value);
    } else if (key === 'failFast' || key === 'parallel' || key === 'production' || key === 'debug') {
      config[key] = value === 'true';
    } else {
      config[key] = value;
    }
  }
}

class FrontendTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async run() {
    console.log('🎨 Starting frontend test execution');
    console.log(`⚙️  Configuration:`, config);

    try {
      // Launch browser
      console.log('🌐 Launching browser...');
      this.browser = await chromium.launch({
        headless: process.env.CI === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });

      this.page = await context.newPage();

      // Create orchestrator
      const orchestratorConfig = {
        baseUrl: config.baseUrl,
        timeout: config.timeout,
        retries: config.retries,
        failFast: config.failFast,
        parallel: config.parallel,
        maxConcurrency: config.maxConcurrency,
        reportPath: config.reportPath
      };

      const orchestrator = new TestOrchestrator(orchestratorConfig);

      // Set page in context
      orchestrator.context.page = this.page;
      orchestrator.context.browser = this.browser;

      // Get test suites
      let suites = FrontendTestSuites.getAllSuites(config.baseUrl);
      
      // Add production test suites if production flag is set
      if (config.production) {
        suites = [...suites, ...createProductionTestSuites(config.baseUrl)];
      }
      
      // Add fail-fast test suites if failFast flag is set
      if (config.failFast) {
        suites = [...suites, ...createFailFastTestSuites()];
      }
      
      // Add debug test suites if debug flag is set
      if (config.debug) {
        suites = [...suites, ...createDebugTestSuites()];
      }
      console.log(`📋 Found ${suites.length} test suites`);

      // Run tests
      const report = await orchestrator.runSuites(suites);

      // Print summary
      console.log('\n📊 Frontend Test Summary:');
      console.log(`✅ Passed: ${report.passedTests}`);
      console.log(`❌ Failed: ${report.failedTests}`);
      console.log(`⏭️  Skipped: ${report.skippedTests}`);
      console.log(`⏱️  Duration: ${report.totalDuration}ms`);
      console.log(`📈 Success Rate: ${report.summary.successRate.toFixed(1)}%`);

      // Exit with appropriate code
      const exitCode = report.failedTests === 0 ? 0 : 1;
      process.exit(exitCode);

    } catch (error) {
      console.error('❌ Frontend test execution failed:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the frontend test runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new FrontendTestRunner();
  runner.run().catch(error => {
    console.error('❌ Frontend test runner failed:', error);
    process.exit(1);
  });
}

export { FrontendTestRunner };
