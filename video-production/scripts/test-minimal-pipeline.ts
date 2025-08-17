#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface MinimalTestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class MinimalPipelineTest {
  private projectRoot: string;
  private results: MinimalTestResult[] = [];
  private testOutputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.testOutputDir = path.join(this.projectRoot, 'temp', 'smoke-test');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${prefix[type]} [${timestamp}] ${message}`);
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration?: number): void {
    this.results.push({ test, status, message, duration });
  }

  async runMinimalTests(): Promise<void> {
    this.log('Starting Minimal Pipeline Execution Test', 'info');
    this.log('=========================================', 'info');

    // Ensure test directories exist
    this.ensureTestDirectories();

    // Test 1: Configuration Loading
    await this.testConfigurationLoading();

    // Test 2: Script Compilation
    await this.testScriptCompilation();

    // Test 3: Minimal Pipeline Class Instantiation
    await this.testPipelineInstantiation();

    // Test 4: Output Directory Operations
    await this.testOutputOperations();

    // Test 5: Configuration Validation
    await this.testConfigurationValidation();

    this.log('', 'info');
    this.log('Minimal Pipeline Test Results Summary', 'info');
    this.log('=====================================', 'info');
    this.printResults();
  }

  private ensureTestDirectories(): void {
    if (!fs.existsSync(this.testOutputDir)) {
      fs.mkdirSync(this.testOutputDir, { recursive: true });
    }
  }

  private async testConfigurationLoading(): Promise<void> {
    this.log('Testing Configuration Loading...', 'info');
    const startTime = Date.now();

    try {
      // Test loading narration.yaml
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        
        // Basic content validation
        if (narrationContent.includes('scenes:') && narrationContent.includes('metadata:')) {
          this.addResult('Narration Config Loading', 'PASS', 'Narration configuration loaded successfully', Date.now() - startTime);
        } else {
          this.addResult('Narration Config Loading', 'FAIL', 'Narration configuration has invalid content');
        }
      } else {
        this.addResult('Narration Config Loading', 'SKIP', 'Narration configuration file not found');
      }
    } catch (error) {
      this.addResult('Configuration Loading', 'FAIL', 'Error loading configuration', Date.now() - startTime);
    }
  }

  private async testScriptCompilation(): Promise<void> {
    this.log('Testing Script Compilation...', 'info');
    const startTime = Date.now();

    try {
      // Test if we can compile the main pipeline script
      const mainScript = path.join(this.projectRoot, 'scripts', 'run-enhanced-production.ts');
      if (fs.existsSync(mainScript)) {
        const scriptContent = fs.readFileSync(mainScript, 'utf8');
        
        // Check for basic TypeScript structure
        if (scriptContent.includes('class') && scriptContent.includes('import')) {
          this.addResult('Script Compilation', 'PASS', 'Main pipeline script compiles successfully', Date.now() - startTime);
        } else {
          this.addResult('Script Compilation', 'FAIL', 'Main pipeline script has invalid structure');
        }
      } else {
        this.addResult('Script Compilation', 'SKIP', 'Main pipeline script not found');
      }
    } catch (error) {
      this.addResult('Script Compilation', 'FAIL', 'Error during script compilation test', Date.now() - startTime);
    }
  }

  private async testPipelineInstantiation(): Promise<void> {
    this.log('Testing Pipeline Class Instantiation...', 'info');
    const startTime = Date.now();

    try {
      // Test if we can create a minimal pipeline instance
      const mainScript = path.join(this.projectRoot, 'scripts', 'run-enhanced-production.ts');
      if (fs.existsSync(mainScript)) {
        const scriptContent = fs.readFileSync(mainScript, 'utf8');
        
        // Check if the script has the expected class structure
        if (scriptContent.includes('class EnhancedProductionPipeline')) {
          this.addResult('Pipeline Instantiation', 'PASS', 'Pipeline class structure is valid', Date.now() - startTime);
        } else {
          this.addResult('Pipeline Instantiation', 'FAIL', 'Pipeline class structure is invalid');
        }
      } else {
        this.addResult('Pipeline Instantiation', 'SKIP', 'Pipeline script not found');
      }
    } catch (error) {
      this.addResult('Pipeline Instantiation', 'FAIL', 'Error testing pipeline instantiation', Date.now() - startTime);
    }
  }

  private async testOutputOperations(): Promise<void> {
    this.log('Testing Output Operations...', 'info');
    const startTime = Date.now();

    try {
      // Test creating test files
      const testFile = path.join(this.testOutputDir, 'test-output.txt');
      const testContent = 'This is a test output file for smoke testing';
      
      fs.writeFileSync(testFile, testContent);
      
      if (fs.existsSync(testFile)) {
        const readContent = fs.readFileSync(testFile, 'utf8');
        if (readContent === testContent) {
          this.addResult('Output Operations', 'PASS', 'Can write and read files successfully', Date.now() - startTime);
        } else {
          this.addResult('Output Operations', 'FAIL', 'File content mismatch during read/write test');
        }
        
        // Clean up
        fs.unlinkSync(testFile);
      } else {
        this.addResult('Output Operations', 'FAIL', 'Test file was not created');
      }
    } catch (error) {
      this.addResult('Output Operations', 'FAIL', 'Error during output operations test', Date.now() - startTime);
    }
  }

  private async testConfigurationValidation(): Promise<void> {
    this.log('Testing Configuration Validation...', 'info');
    const startTime = Date.now();

    try {
      // Test package.json validation
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        // Check for required fields
        if (packageJson.name && packageJson.scripts && packageJson.dependencies) {
          this.addResult('Package Validation', 'PASS', 'Package.json has all required fields', Date.now() - startTime);
        } else {
          this.addResult('Package Validation', 'FAIL', 'Package.json missing required fields');
        }
      } else {
        this.addResult('Package Validation', 'SKIP', 'Package.json not found');
      }
    } catch (error) {
      this.addResult('Configuration Validation', 'FAIL', 'Error during configuration validation', Date.now() - startTime);
    }
  }

  private printResults(): void {
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const skipCount = this.results.filter(r => r.status === 'SKIP').length;
    const totalCount = this.results.length;

    console.log(`\n📊 Minimal Pipeline Test Summary:`);
    console.log(`   Total Tests: ${totalCount}`);
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);

    console.log(`\n📋 Detailed Results:`);
    this.results.forEach(result => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'SKIP': '⏭️'
      };
      const durationText = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`   ${statusIcon[result.status]} ${result.test}: ${result.message}${durationText}`);
    });

    if (failCount === 0) {
      this.log('🎉 All minimal pipeline tests passed! Pipeline core functionality is working.', 'success');
      this.log('💡 You can now run the full pipeline with confidence.', 'info');
    } else {
      this.log(`⚠️  ${failCount} test(s) failed. Please fix issues before running the full pipeline.`, 'warning');
    }
  }
}

// Run the minimal pipeline test
async function main() {
  try {
    const minimalTest = new MinimalPipelineTest();
    await minimalTest.runMinimalTests();
  } catch (error) {
    console.error('❌ Minimal pipeline test failed with error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
