#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running All Enhanced Video Production Pipeline Tests...\n');

class MasterTestRunner {
  constructor() {
    this.testResults = [];
    this.testScripts = [
      'test-enhanced-captures.test.cjs',
      'test-production-pipeline.test.cjs',
      'test-configuration.test.cjs'
    ];
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

  async runTest(scriptName) {
    this.log(`Running test: ${scriptName}`, 'info');
    
    try {
      const scriptPath = path.join(__dirname, scriptName);
      const result = execSync(`node "${scriptPath}"`, { 
        stdio: 'pipe',
        cwd: __dirname,
        encoding: 'utf8'
      });
      
      this.log(`✅ ${scriptName} passed`, 'success');
      this.testResults.push({ script: scriptName, status: 'PASS', output: result });
      return true;
      
    } catch (error) {
      this.log(`❌ ${scriptName} failed`, 'error');
      this.testResults.push({ script: scriptName, status: 'FAIL', error: error.message });
      return false;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Pipeline Testing', 'info');
    this.log('This will test all components of the enhanced video production pipeline', 'info');
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING ENHANCED CAPTURE GENERATOR');
    console.log('='.repeat(80));
    
    const captureTestResult = await this.runTest('test-enhanced-captures.test.cjs');
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING PRODUCTION PIPELINE');
    console.log('='.repeat(80));
    
    const pipelineTestResult = await this.runTest('test-production-pipeline.test.cjs');
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING CONFIGURATION FILES');
    console.log('='.repeat(80));
    
    const configTestResult = await this.runTest('test-configuration.test.cjs');
    
    // Final summary
    console.log('\n' + '='.repeat(80));
    this.log('COMPREHENSIVE TEST RESULTS SUMMARY', 'info');
    console.log('='.repeat(80));
    
    const passedTests = [captureTestResult, pipelineTestResult, configTestResult].filter(Boolean).length;
    const totalTests = 3;
    const successRate = (passedTests / totalTests) * 100;
    
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.script}: ${result.status}`);
    });
    
    console.log('\n' + '='.repeat(80));
    this.log(`OVERALL PIPELINE STATUS: ${passedTests}/${totalTests} components passed (${successRate.toFixed(1)}%)`, 
      successRate >= 80 ? 'success' : 'error');
    
    if (successRate >= 80) {
      this.log('🎉 Enhanced Video Production Pipeline is fully validated!', 'success');
      this.log('All components are working correctly and ready for production use.', 'success');
      
      console.log('\n📋 NEXT STEPS AVAILABLE:');
      console.log('1. Generate Enhanced Captures: npx ts-node scripts/generate-enhanced-captures.ts');
      console.log('2. Run Full Production: npx ts-node scripts/run-enhanced-production.ts');
      console.log('3. Generate Narration: npx ts-node scripts/generate-narration.ts --config config/narration-fixed.yaml');
      
    } else {
      this.log('❌ Enhanced Video Production Pipeline validation failed!', 'error');
      this.log('Please fix the failing components before proceeding with production.', 'error');
      
      console.log('\n🔧 COMPONENTS NEEDING ATTENTION:');
      this.testResults.forEach((result, index) => {
        if (result.status === 'FAIL') {
          console.log(`   - ${result.script}: ${result.error || 'Test execution failed'}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
    return successRate >= 80;
  }
}

// Run all tests
if (require.main === module) {
  const runner = new MasterTestRunner();
  runner.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { MasterTestRunner };
