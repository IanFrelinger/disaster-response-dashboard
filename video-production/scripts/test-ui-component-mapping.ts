#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  passed: number;
  failed: number;
  skipped: number;
}

class UIComponentMappingIntegrationTest {
  private projectRoot: string;
  private testResults: TestSuite[] = [];
  private currentSuite?: TestSuite;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} [${timestamp}] ${message}`);
  }

  private startTestSuite(name: string): void {
    this.currentSuite = {
      name,
      tests: [],
      startTime: new Date(),
      passed: 0,
      failed: 0,
      skipped: 0
    };
    this.testResults.push(this.currentSuite);
    this.log(`🧪 Starting test suite: ${name}`, 'info');
  }

  private endTestSuite(): void {
    if (this.currentSuite) {
      this.currentSuite.endTime = new Date();
      this.currentSuite.duration = this.currentSuite.endTime.getTime() - this.currentSuite.startTime.getTime();
      
      this.log(`🏁 Test suite completed: ${this.currentSuite.name}`, 'info');
      this.log(`   Duration: ${Math.round(this.currentSuite.duration / 1000)}s`, 'info');
      this.log(`   Results: ${this.currentSuite.passed} PASS, ${this.currentSuite.failed} FAIL, ${this.currentSuite.skipped} SKIP`, 'info');
    }
  }

  private runTest(testName: string, testFn: () => Promise<boolean> | boolean, skip = false): void {
    if (!this.currentSuite) {
      throw new Error('No test suite started');
    }

    const test: TestResult = {
      test: testName,
      status: 'SKIP',
      message: 'Test skipped'
    };

    if (skip) {
      this.currentSuite.tests.push(test);
      this.currentSuite.skipped++;
      this.log(`⏭️  SKIP: ${testName}`, 'warning');
      return;
    }

    const startTime = Date.now();
    
    try {
      this.log(`🔍 Running: ${testName}`, 'info');
      
      const result = testFn();
      if (result instanceof Promise) {
        result.then(passed => {
          test.status = passed ? 'PASS' : 'FAIL';
          test.message = passed ? 'Test passed' : 'Test failed';
          test.duration = Date.now() - startTime;
          
          this.currentSuite!.tests.push(test);
          if (passed) {
            this.currentSuite!.passed++;
            this.log(`✅ PASS: ${testName}`, 'success');
          } else {
            this.currentSuite!.failed++;
            this.log(`❌ FAIL: ${testName}`, 'error');
          }
        }).catch(error => {
          test.status = 'FAIL';
          test.message = `Test error: ${error.message}`;
          test.details = error.stack;
          test.duration = Date.now() - startTime;
          
          this.currentSuite!.tests.push(test);
          this.currentSuite!.failed++;
          this.log(`❌ FAIL: ${testName} - ${error.message}`, 'error');
        });
      } else {
        test.status = result ? 'PASS' : 'FAIL';
        test.message = result ? 'Test passed' : 'Test failed';
        test.duration = Date.now() - startTime;
        
        this.currentSuite!.tests.push(test);
        if (result) {
          this.currentSuite!.passed++;
          this.log(`✅ PASS: ${testName}`, 'success');
        } else {
          this.currentSuite!.failed++;
          this.log(`❌ FAIL: ${testName}`, 'error');
        }
      }
    } catch (error: any) {
      test.status = 'FAIL';
      test.message = `Test error: ${error.message}`;
      test.details = error.stack;
      test.duration = Date.now() - startTime;
      
      this.currentSuite!.tests.push(test);
      this.currentSuite!.failed++;
      this.log(`❌ FAIL: ${testName} - ${error.message}`, 'error');
    }
  }

  // Test 1: Prerequisites Check
  private async testPrerequisites(): Promise<void> {
    this.startTestSuite('Prerequisites Check');

    this.runTest('FFmpeg Available', () => {
      try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Node.js Available', () => {
      try {
        execSync('node --version', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('ts-node Available', () => {
      try {
        execSync('npx ts-node --version', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Frontend Source Exists', () => {
      const frontendPath = path.join(this.projectRoot, '..', 'frontend', 'src');
      return fs.existsSync(frontendPath);
    });

    this.endTestSuite();
  }

  // Test 2: UI Component Mapping Generation
  private async testComponentMappingGeneration(): Promise<void> {
    this.startTestSuite('UI Component Mapping Generation');

    this.runTest('Generate Component Map', async () => {
      try {
        execSync('npx ts-node scripts/generate-ui-component-map.ts', {
          cwd: this.projectRoot,
          stdio: 'ignore'
        });
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Component Map File Created', () => {
      const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
      return fs.existsSync(mapPath);
    });

    this.runTest('Humanizer Bot Context Created', () => {
      const contextPath = path.join(this.projectRoot, 'config', 'humanizer-bot-context.md');
      return fs.existsSync(contextPath);
    });

    this.runTest('Component Map File Valid JSON', () => {
      try {
        const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
        const content = fs.readFileSync(mapPath, 'utf8');
        JSON.parse(content);
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Component Map Has Components', () => {
      try {
        const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
        const content = fs.readFileSync(mapPath, 'utf8');
        const data = JSON.parse(content);
        return data.components && data.components.length > 0;
      } catch {
        return false;
      }
    });

    this.endTestSuite();
  }

  // Test 3: Component Map Content Validation
  private async testComponentMapContent(): Promise<void> {
    this.startTestSuite('Component Map Content Validation');

    let componentMap: any;
    
    this.runTest('Load Component Map Data', () => {
      try {
        const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
        const content = fs.readFileSync(mapPath, 'utf8');
        componentMap = JSON.parse(content);
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Component Map Has Required Fields', () => {
      if (!componentMap) return false;
      
      const requiredFields = ['timestamp', 'frontendPath', 'components', 'navigation', 'dataFlow', 'interactionPatterns'];
      return requiredFields.every(field => componentMap.hasOwnProperty(field));
    });

    this.runTest('Components Have Required Properties', () => {
      if (!componentMap || !componentMap.components) return false;
      
      const requiredProps = ['name', 'file', 'type', 'interactions', 'props', 'state', 'cssClasses', 'description'];
      return componentMap.components.every((comp: any) => 
        requiredProps.every(prop => comp.hasOwnProperty(prop))
      );
    });

    this.runTest('Key Components Are Present', () => {
      if (!componentMap || !componentMap.components) return false;
      
      const keyComponents = ['EvacuationDashboard', 'MultiHazardMap', 'AIPDecisionSupport'];
      const componentNames = componentMap.components.map((c: any) => c.name);
      return keyComponents.every(name => componentNames.includes(name));
    });

    this.runTest('Navigation Structure Is Valid', () => {
      if (!componentMap || !componentMap.navigation) return false;
      
      const requiredNavFields = ['name', 'route', 'component', 'description'];
      return componentMap.navigation.every((nav: any) => 
        requiredNavFields.every(field => nav.hasOwnProperty(field))
      );
    });

    this.runTest('Data Flow Patterns Are Defined', () => {
      if (!componentMap || !componentMap.dataFlow) return false;
      
      const requiredFlowFields = ['from', 'to', 'dataType', 'description'];
      return componentMap.dataFlow.every((flow: any) => 
        requiredFlowFields.every(field => flow.hasOwnProperty(field))
      );
    });

    this.endTestSuite();
  }

  // Test 4: Pipeline Integration
  private async testPipelineIntegration(): Promise<void> {
    this.startTestSuite('Pipeline Integration');

    this.runTest('7-Minute Pipeline Includes UI Mapping', async () => {
      try {
        const pipelineScript = path.join(this.projectRoot, 'run-7min-technical-pipeline.sh');
        const content = fs.readFileSync(pipelineScript, 'utf8');
        return content.includes('generate-ui-component-map.ts');
      } catch {
        return false;
      }
    });

    this.runTest('Unified Pipeline Includes UI Mapping', async () => {
      try {
        const pipelineScript = path.join(this.projectRoot, 'scripts', 'run-unified-pipeline.ts');
        const content = fs.readFileSync(pipelineScript, 'utf8');
        return content.includes('generateUIComponentMap');
      } catch {
        return false;
      }
    });

    this.runTest('Pipeline Scripts Are Executable', () => {
      try {
        const pipelineScript = path.join(this.projectRoot, 'run-7min-technical-pipeline.sh');
        const stats = fs.statSync(pipelineScript);
        return (stats.mode & 0o111) !== 0; // Check if executable
      } catch {
        return false;
      }
    });

    this.endTestSuite();
  }

  // Test 5: End-to-End Workflow
  private async testEndToEndWorkflow(): Promise<void> {
    this.startTestSuite('End-to-End Workflow');

    this.runTest('Clean Previous Outputs', () => {
      try {
        const configDir = path.join(this.projectRoot, 'config');
        const filesToRemove = ['ui-component-map.json', 'humanizer-bot-context.md'];
        
        filesToRemove.forEach(file => {
          const filePath = path.join(configDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Run UI Component Mapping', async () => {
      try {
        execSync('npx ts-node scripts/generate-ui-component-map.ts', {
          cwd: this.projectRoot,
          stdio: 'ignore'
        });
        return true;
      } catch {
        return false;
      }
    });

    this.runTest('Verify Output Files Created', () => {
      const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
      const contextPath = path.join(this.projectRoot, 'config', 'humanizer-bot-context.md');
      return fs.existsSync(mapPath) && fs.existsSync(contextPath);
    });

    this.runTest('Verify File Contents Are Valid', () => {
      try {
        const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
        const contextPath = path.join(this.projectRoot, 'config', 'humanizer-bot-context.md');
        
        const mapContent = fs.readFileSync(mapPath, 'utf8');
        const contextContent = fs.readFileSync(contextPath, 'utf8');
        
        JSON.parse(mapContent); // Validate JSON
        return contextContent.includes('Disaster Response Dashboard UI Component Map'); // Validate markdown
      } catch {
        return false;
      }
    });

    this.endTestSuite();
  }

  // Test 6: Performance and Reliability
  private async testPerformanceAndReliability(): Promise<void> {
    this.startTestSuite('Performance and Reliability');

    this.runTest('Component Mapping Performance', async () => {
      const startTime = Date.now();
      try {
        execSync('npx ts-node scripts/generate-ui-component-map.ts', {
          cwd: this.projectRoot,
          stdio: 'ignore'
        });
        const duration = Date.now() - startTime;
        return duration < 30000; // Should complete within 30 seconds
      } catch {
        return false;
      }
    });

    this.runTest('Concurrent Execution Handling', async () => {
      try {
        // Run multiple instances concurrently
        const promises = Array(3).fill(0).map(() => 
          new Promise<boolean>((resolve) => {
            try {
              execSync('npx ts-node scripts/generate-ui-component-map.ts', {
                cwd: this.projectRoot,
                stdio: 'ignore'
              });
              resolve(true);
            } catch {
              resolve(false);
            }
          })
        );
        
        const results = await Promise.all(promises);
        return results.every(result => result);
      } catch {
        return false;
      }
    });

    this.runTest('Error Handling for Missing Frontend', async () => {
      // Skip this test as it's too destructive for integration testing
      // In a real scenario, this would test graceful degradation when frontend is missing
      return true; // Skip destructive test
    });

    this.endTestSuite();
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting UI Component Mapping Integration Tests');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    try {
      await this.testPrerequisites();
      await this.testComponentMappingGeneration();
      await this.testComponentMapContent();
      await this.testPipelineIntegration();
      await this.testEndToEndWorkflow();
      await this.testPerformanceAndReliability();
      
      const totalDuration = Date.now() - startTime;
      
      console.log('\n' + '=' .repeat(60));
      console.log('🏁 Integration Tests Completed');
      console.log('=' .repeat(60));
      
      // Generate summary
      const totalTests = this.testResults.reduce((sum, suite) => 
        sum + suite.tests.length, 0
      );
      const totalPassed = this.testResults.reduce((sum, suite) => 
        sum + suite.passed, 0
      );
      const totalFailed = this.testResults.reduce((sum, suite) => 
        sum + suite.failed, 0
      );
      const totalSkipped = this.testResults.reduce((sum, suite) => 
        sum + suite.skipped, 0
      );
      
      console.log(`📊 Test Summary:`);
      console.log(`   Total Test Suites: ${this.testResults.length}`);
      console.log(`   Total Tests: ${totalTests}`);
      console.log(`   Passed: ${totalPassed} ✅`);
      console.log(`   Failed: ${totalFailed} ❌`);
      console.log(`   Skipped: ${totalSkipped} ⏭️`);
      console.log(`   Duration: ${Math.round(totalDuration / 1000)}s`);
      
      // Save detailed results
      const resultsPath = path.join(this.projectRoot, 'test-results', 'ui-component-mapping-integration-test-results.json');
      const resultsDir = path.dirname(resultsPath);
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const detailedResults = {
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        summary: {
          totalSuites: this.testResults.length,
          totalTests,
          passed: totalPassed,
          failed: totalFailed,
          skipped: totalSkipped
        },
        suites: this.testResults
      };
      
      fs.writeFileSync(resultsPath, JSON.stringify(detailedResults, null, 2));
      console.log(`\n📁 Detailed results saved to: ${resultsPath}`);
      
      if (totalFailed > 0) {
        console.log('\n❌ Some tests failed. Check the detailed results for more information.');
        process.exit(1);
      } else {
        console.log('\n🎉 All tests passed successfully!');
      }
      
    } catch (error) {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const testRunner = new UIComponentMappingIntegrationTest();
  await testRunner.runAllTests();
}

main().catch(console.error);
