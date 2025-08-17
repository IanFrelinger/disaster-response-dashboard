#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Simple Pipeline Functionality...\n');

class SimplePipelineTester {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    console.log(`${emoji[type]} [${timestamp}] ${message}`);
  }

  testBasicFileOperations() {
    this.log('Testing basic file operations...', 'info');
    
    try {
      // Test if we can read the narration config
      const narrationFile = path.join(__dirname, '..', 'config', 'narration.yaml');
      if (fs.existsSync(narrationFile)) {
        const content = fs.readFileSync(narrationFile, 'utf8');
        if (content.includes('capture_method')) {
          this.log('Narration config with capture methods found', 'success');
          this.testResults.push({ test: 'Narration Config', status: 'PASS' });
          return true;
        } else {
          this.log('Narration config missing capture methods', 'error');
          this.testResults.push({ test: 'Narration Config', status: 'FAIL' });
          return false;
        }
      } else {
        this.log('Narration config file not found', 'error');
        this.testResults.push({ test: 'Narration Config', status: 'FAIL' });
        return false;
      }
    } catch (error) {
      this.log(`Error testing file operations: ${error}`, 'error');
      this.testResults.push({ test: 'Narration Config', status: 'FAIL' });
      return false;
    }
  }

  testDirectoryStructure() {
    this.log('Testing directory structure...', 'info');
    
    try {
      const requiredDirs = [
        'config',
        'scripts',
        'captures',
        'output',
        'temp'
      ];
      
      let dirTests = 0;
      let dirPasses = 0;
      
      requiredDirs.forEach(dir => {
        dirTests++;
        const dirPath = path.join(__dirname, '..', dir);
        if (fs.existsSync(dirPath)) {
          this.log(`Directory exists: ${dir}`, 'success');
          dirPasses++;
        } else {
          this.log(`Directory missing: ${dir}`, 'error');
        }
      });
      
      const dirScore = (dirPasses / dirTests) * 100;
      if (dirScore >= 80) {
        this.log(`Directory structure score: ${dirScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Directory Structure', status: 'PASS', score: dirScore });
        return true;
      } else {
        this.log(`Directory structure score: ${dirScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Directory Structure', status: 'FAIL', score: dirScore });
        return false;
      }
    } catch (error) {
      this.log(`Error testing directory structure: ${error}`, 'error');
      this.testResults.push({ test: 'Directory Structure', status: 'FAIL' });
      return false;
    }
  }

  testCaptureConfiguration() {
    this.log('Testing capture configuration...', 'info');
    
    try {
      const narrationFile = path.join(__dirname, '..', 'config', 'narration.yaml');
      const content = fs.readFileSync(narrationFile, 'utf8');
      
      // Check for capture method configurations
      const captureChecks = [
        'capture_method: "screenshot"',
        'capture_method: "video"',
        'capture_settings:',
        'screenshot:',
        'video:'
      ];
      
      let checkTests = 0;
      let checkPasses = 0;
      
      captureChecks.forEach(check => {
        checkTests++;
        if (content.includes(check)) {
          this.log(`Capture config found: ${check}`, 'success');
          checkPasses++;
        } else {
          this.log(`Capture config missing: ${check}`, 'error');
        }
      });
      
      const checkScore = (checkPasses / checkTests) * 100;
      if (checkScore >= 80) {
        this.log(`Capture configuration score: ${checkScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Capture Configuration', status: 'PASS', score: checkScore });
        return true;
      } else {
        this.log(`Capture configuration score: ${checkScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Capture Configuration', status: 'FAIL', score: checkScore });
        return false;
      }
    } catch (error) {
      this.log(`Error testing capture configuration: ${error}`, 'error');
      this.testResults.push({ test: 'Capture Configuration', status: 'FAIL' });
      return false;
    }
  }

  runAllTests() {
    this.log('🚀 Starting Simple Pipeline Tests', 'info');
    
    const test1 = this.testBasicFileOperations();
    const test2 = this.testDirectoryStructure();
    const test3 = this.testCaptureConfiguration();
    
    console.log('\n' + '='.repeat(80));
    this.log('SIMPLE PIPELINE TEST RESULTS', 'info');
    console.log('='.repeat(80));
    
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const score = result.score ? ` (${result.score.toFixed(1)}%)` : '';
      console.log(`${status} ${result.test}: ${result.status}${score}`);
    });
    
    const passedTests = [test1, test2, test3].filter(Boolean).length;
    const totalTests = 3;
    const successRate = (passedTests / totalTests) * 100;
    
    console.log('\n' + '='.repeat(80));
    this.log(`OVERALL STATUS: ${passedTests}/${totalTests} tests passed (${successRate.toFixed(1)}%)`, 
      successRate >= 80 ? 'success' : 'error');
    
    if (successRate >= 80) {
      this.log('🎉 Simple pipeline validation passed!', 'success');
      this.log('Basic functionality is working correctly.', 'success');
    } else {
      this.log('❌ Simple pipeline validation failed!', 'error');
      this.log('Please check the failing components.', 'error');
    }
    
    console.log('='.repeat(80));
    
    return successRate >= 80;
  }
}

// Run tests
if (require.main === module) {
  const tester = new SimplePipelineTester();
  const success = tester.runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { SimplePipelineTester };

