/**
 * Production Test Runner - Runs production-specific validation tests
 */

import { chromium } from 'playwright';
import { TestOrchestrator, OrchestratorConfig } from './orchestrator/TestOrchestrator';
import { createProductionTestSuites } from './suites/ProductionTestSuites';

// Parse command line arguments
const args = process.argv.slice(2);
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 300000,
  retries: 1,
  failFast: true,
  parallel: false,
  maxConcurrency: 3,
  reportPath: 'test-results/production-test-report.json'
};

// Parse arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i]?.replace('--', '');
  const value = args[i + 1];
  
  if (key && value) {
    if (key === 'timeout' || key === 'retries' || key === 'maxConcurrency') {
      (config as any)[key] = parseInt(value);
    } else if (key === 'failFast' || key === 'parallel') {
      (config as any)[key] = value === 'true';
    } else {
      (config as any)[key] = value;
    }
  }
}

class ProductionTestRunner {
  private browser: any;
  private page: any;

  async run(): Promise<void> {
    try {
      console.log('🏭 Starting production test execution');
      console.log(`⚙️  Configuration:`, config);
      
      // Launch browser
      console.log('🌐 Launching browser...');
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Set up context
      const orchestrator = new TestOrchestrator({
        baseUrl: config.baseUrl,
        timeout: config.timeout,
        retries: config.retries,
        failFast: config.failFast,
        parallel: config.parallel,
        maxConcurrency: config.maxConcurrency,
        reportPath: config.reportPath
      });

      // Set page in context
      orchestrator.context.page = this.page;
      orchestrator.context.browser = this.browser;

      // Get production test suites
      const suites = createProductionTestSuites(config.baseUrl);
      console.log(`📋 Found ${suites.length} production test suites`);

      // Run tests
      const report = await orchestrator.runSuites(suites);
      
      // Print summary
      console.log('\n📊 Production Test Summary:');
      console.log(`✅ Passed: ${report.passedTests}`);
      console.log(`❌ Failed: ${report.failedTests}`);
      console.log(`⏭️  Skipped: ${report.skippedTests}`);
      console.log(`⏱️  Duration: ${report.totalDuration}ms`);
      console.log(`📈 Success Rate: ${(report.successRate || 0).toFixed(1)}%`);
      
      if (report.failedTests > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Production test execution failed:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the production test runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new ProductionTestRunner();
  runner.run().catch(error => {
    console.error('❌ Production test runner failed:', error);
    process.exit(1);
  });
}
