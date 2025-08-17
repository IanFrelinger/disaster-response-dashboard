#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

class UIMappingSmokeTest {
  private projectRoot: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} ${message}`);
  }

  async runSmokeTest(): Promise<void> {
    console.log('🚀 UI Component Mapping Smoke Test');
    console.log('=' .repeat(50));
    
    let allTestsPassed = true;
    
    // Test 1: Generate component map
    this.log('Testing component map generation...', 'info');
    try {
      execSync('npx ts-node scripts/generate-ui-component-map.ts', {
        cwd: this.projectRoot,
        stdio: 'ignore'
      });
      this.log('Component map generation: PASSED', 'success');
    } catch (error) {
      this.log('Component map generation: FAILED', 'error');
      allTestsPassed = false;
    }
    
    // Test 2: Verify output files
    this.log('Testing output file creation...', 'info');
    const mapPath = path.join(this.projectRoot, 'config', 'ui-component-map.json');
    const contextPath = path.join(this.projectRoot, 'config', 'humanizer-bot-context.md');
    
    if (fs.existsSync(mapPath) && fs.existsSync(contextPath)) {
      this.log('Output file creation: PASSED', 'success');
    } else {
      this.log('Output file creation: FAILED', 'error');
      allTestsPassed = false;
    }
    
    // Test 3: Validate JSON structure
    this.log('Testing JSON structure validation...', 'info');
    try {
      const content = fs.readFileSync(mapPath, 'utf8');
      const data = JSON.parse(content);
      
      if (data.components && data.components.length > 0) {
        this.log('JSON structure validation: PASSED', 'success');
      } else {
        this.log('JSON structure validation: FAILED', 'error');
        allTestsPassed = false;
      }
    } catch (error) {
      this.log('JSON structure validation: FAILED', 'error');
      allTestsPassed = false;
    }
    
    // Test 4: Check pipeline integration
    this.log('Testing pipeline integration...', 'info');
    try {
      const pipelineScript = path.join(this.projectRoot, 'run-7min-technical-pipeline.sh');
      const content = fs.readFileSync(pipelineScript, 'utf8');
      
      if (content.includes('generate-ui-component-map.ts')) {
        this.log('Pipeline integration: PASSED', 'success');
      } else {
        this.log('Pipeline integration: FAILED', 'error');
        allTestsPassed = false;
      }
    } catch (error) {
      this.log('Pipeline integration: FAILED', 'error');
      allTestsPassed = false;
    }
    
    // Test 5: Performance check
    this.log('Testing performance...', 'info');
    const startTime = Date.now();
    try {
      execSync('npx ts-node scripts/generate-ui-component-map.ts', {
        cwd: this.projectRoot,
        stdio: 'ignore'
      });
      const duration = Date.now() - startTime;
      
      if (duration < 30000) { // 30 seconds
        this.log(`Performance: PASSED (${duration}ms)`, 'success');
      } else {
        this.log(`Performance: FAILED (${duration}ms - too slow)`, 'error');
        allTestsPassed = false;
      }
    } catch (error) {
      this.log('Performance: FAILED', 'error');
      allTestsPassed = false;
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    if (allTestsPassed) {
      this.log('🎉 All smoke tests PASSED!', 'success');
      this.log('UI Component Mapping is working correctly.', 'success');
    } else {
      this.log('❌ Some smoke tests FAILED!', 'error');
      this.log('Check the output above for details.', 'error');
    }
    console.log('=' .repeat(50));
    
    if (!allTestsPassed) {
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const smokeTest = new UIMappingSmokeTest();
  await smokeTest.runSmokeTest();
}

main().catch(console.error);
