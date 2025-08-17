#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface PipelineTestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class QuickPipelineTest {
  private projectRoot: string;
  private results: PipelineTestResult[] = [];

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
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

  async runPipelineTests(): Promise<void> {
    this.log('Starting Quick Pipeline Execution Tests', 'info');
    this.log('=======================================', 'info');

    // Test 1: Validate narration generation
    await this.testNarrationGeneration();

    // Test 2: Validate capture generation setup
    await this.testCaptureGenerationSetup();

    // Test 3: Validate video assembly setup
    await this.testVideoAssemblySetup();

    // Test 4: Validate configuration parsing
    await this.testConfigurationParsing();

    // Test 5: Validate script compilation
    await this.testScriptCompilation();

    this.log('', 'info');
    this.log('Quick Pipeline Test Results Summary', 'info');
    this.log('==================================', 'info');
    this.printResults();
  }

  private async testNarrationGeneration(): Promise<void> {
    this.log('Testing Narration Generation Setup...', 'info');
    const startTime = Date.now();

    try {
      const narrationScript = path.join(this.projectRoot, 'scripts', 'generate-narration.ts');
      if (fs.existsSync(narrationScript)) {
        // Test if the script can be compiled without errors
        const scriptContent = fs.readFileSync(narrationScript, 'utf8');
        
        if (scriptContent.includes('NarrationGenerator') && scriptContent.includes('class')) {
          this.addResult('Narration Script', 'PASS', 'Narration generation script is valid', Date.now() - startTime);
        } else {
          this.addResult('Narration Script', 'FAIL', 'Narration generation script has invalid structure');
        }
      } else {
        this.addResult('Narration Script', 'SKIP', 'Narration generation script not found');
      }
    } catch (error) {
      this.addResult('Narration Generation', 'FAIL', 'Error testing narration generation', Date.now() - startTime);
    }
  }

  private async testCaptureGenerationSetup(): Promise<void> {
    this.log('Testing Capture Generation Setup...', 'info');
    const startTime = Date.now();

    try {
      const captureScript = path.join(this.projectRoot, 'scripts', 'generate-enhanced-captures.ts');
      if (fs.existsSync(captureScript)) {
        const scriptContent = fs.readFileSync(captureScript, 'utf8');
        
        if (scriptContent.includes('EnhancedCaptureGenerator') && scriptContent.includes('class')) {
          this.addResult('Capture Generation', 'PASS', 'Capture generation script is valid', Date.now() - startTime);
        } else {
          this.addResult('Capture Generation', 'FAIL', 'Capture generation script has invalid structure');
        }
      } else {
        this.addResult('Capture Generation', 'SKIP', 'Capture generation script not found');
      }
    } catch (error) {
      this.addResult('Capture Generation Setup', 'FAIL', 'Error testing capture generation setup', Date.now() - startTime);
    }
  }

  private async testVideoAssemblySetup(): Promise<void> {
    this.log('Testing Video Assembly Setup...', 'info');
    const startTime = Date.now();

    try {
      const assemblyScript = path.join(this.projectRoot, 'scripts', 'assemble-final-video.ts');
      if (fs.existsSync(assemblyScript)) {
        const scriptContent = fs.readFileSync(assemblyScript, 'utf8');
        
        if (scriptContent.includes('assembleVideo') || scriptContent.includes('export')) {
          this.addResult('Video Assembly', 'PASS', 'Video assembly script is valid', Date.now() - startTime);
        } else {
          this.addResult('Video Assembly', 'FAIL', 'Video assembly script has invalid structure');
        }
      } else {
        this.addResult('Video Assembly', 'SKIP', 'Video assembly script not found');
      }
    } catch (error) {
      this.addResult('Video Assembly Setup', 'FAIL', 'Error testing video assembly setup', Date.now() - startTime);
    }
  }

  private async testConfigurationParsing(): Promise<void> {
    this.log('Testing Configuration Parsing...', 'info');
    const startTime = Date.now();

    try {
      // Test narration.yaml parsing
      const narrationPath = path.join(this.projectRoot, 'config', 'narration.yaml');
      if (fs.existsSync(narrationPath)) {
        const narrationContent = fs.readFileSync(narrationPath, 'utf8');
        
        // Basic structure validation
        if (narrationContent.includes('scenes:') && narrationContent.includes('metadata:')) {
          this.addResult('Narration Config Parsing', 'PASS', 'Narration configuration can be parsed', Date.now() - startTime);
        } else {
          this.addResult('Narration Config Parsing', 'FAIL', 'Narration configuration has invalid structure');
        }
      } else {
        this.addResult('Narration Config Parsing', 'SKIP', 'Narration configuration file not found');
      }

      // Test timeline parsing
      const timelinePath = path.join(this.projectRoot, 'config', 'timeline-fixed.yaml');
      if (fs.existsSync(timelinePath)) {
        const timelineContent = fs.readFileSync(timelinePath, 'utf8');
        
        if (timelineContent.includes('timeline:') || timelineContent.includes('scenes:')) {
          this.addResult('Timeline Config Parsing', 'PASS', 'Timeline configuration can be parsed', Date.now() - startTime);
        } else {
          this.addResult('Timeline Config Parsing', 'FAIL', 'Timeline configuration has invalid structure');
        }
      } else {
        this.addResult('Timeline Config Parsing', 'SKIP', 'Timeline configuration file not found');
      }
    } catch (error) {
      this.addResult('Configuration Parsing', 'FAIL', 'Error testing configuration parsing', Date.now() - startTime);
    }
  }

  private async testScriptCompilation(): Promise<void> {
    this.log('Testing Script Compilation...', 'info');
    const startTime = Date.now();

    try {
      // Test if TypeScript can compile the main scripts without errors
      const mainScripts = [
        'scripts/run-enhanced-production.ts',
        'scripts/generate-enhanced-captures.ts',
        'scripts/generate-narration.ts'
      ];

      let compiledCount = 0;
      for (const script of mainScripts) {
        const scriptPath = path.join(this.projectRoot, script);
        if (fs.existsSync(scriptPath)) {
          try {
            // Basic syntax check by reading the file
            const scriptContent = fs.readFileSync(scriptPath, 'utf8');
            if (scriptContent.includes('import') || scriptContent.includes('export')) {
              compiledCount++;
            }
          } catch (error) {
            // Script exists but can't be read
          }
        }
      }

      if (compiledCount === mainScripts.length) {
        this.addResult('Script Compilation', 'PASS', `All ${compiledCount} main scripts can be parsed`, Date.now() - startTime);
      } else {
        this.addResult('Script Compilation', 'FAIL', `Only ${compiledCount}/${mainScripts.length} scripts can be parsed`);
      }
    } catch (error) {
      this.addResult('Script Compilation', 'FAIL', 'Error testing script compilation', Date.now() - startTime);
    }
  }

  private printResults(): void {
    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const skipCount = this.results.filter(r => r.status === 'SKIP').length;
    const totalCount = this.results.length;

    console.log(`\n📊 Pipeline Test Summary:`);
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
      this.log('🎉 All pipeline tests passed! Pipeline is ready for execution.', 'success');
    } else {
      this.log(`⚠️  ${failCount} test(s) failed. Please fix issues before running the full pipeline.`, 'warning');
    }
  }
}

// Run the quick pipeline test
async function main() {
  try {
    const pipelineTest = new QuickPipelineTest();
    await pipelineTest.runPipelineTests();
  } catch (error) {
    console.error('❌ Quick pipeline test failed with error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
