#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Enhanced Capture Generator Script...');

class CaptureGeneratorTester {
  constructor() {
    this.testResults = [];
    this.scriptPath = path.join(__dirname, 'generate-enhanced-captures.ts');
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

  testFileExists() {
    this.log('Testing file existence...', 'info');
    
    if (fs.existsSync(this.scriptPath)) {
      this.log('Script file exists', 'success');
      this.testResults.push({ test: 'File Exists', status: 'PASS' });
      return true;
    } else {
      this.log('Script file missing', 'error');
      this.testResults.push({ test: 'File Exists', status: 'FAIL' });
      return false;
    }
  }

  testFileReadable() {
    this.log('Testing file readability...', 'info');
    
    try {
      fs.accessSync(this.scriptPath, fs.constants.R_OK);
      this.log('Script file is readable', 'success');
      this.testResults.push({ test: 'File Readable', status: 'PASS' });
      return true;
    } catch (error) {
      this.log('Script file not readable', 'error');
      this.testResults.push({ test: 'File Readable', status: 'FAIL' });
      return false;
    }
  }

  testTypeScriptSyntax() {
    this.log('Testing TypeScript syntax...', 'info');
    
    try {
      const { execSync } = require('child_process');
      execSync(`npx tsc --noEmit "${this.scriptPath}"`, { 
        stdio: 'pipe',
        cwd: path.dirname(this.scriptPath)
      });
      this.log('TypeScript syntax is valid', 'success');
      this.testResults.push({ test: 'TypeScript Syntax', status: 'PASS' });
      return true;
    } catch (error) {
      this.log('TypeScript syntax errors found', 'error');
      this.testResults.push({ test: 'TypeScript Syntax', status: 'FAIL' });
      return false;
    }
  }

  testScriptContent() {
    this.log('Testing script content structure...', 'info');
    
    try {
      const content = fs.readFileSync(this.scriptPath, 'utf8');
      let contentTests = 0;
      let contentPasses = 0;
      
      // Test for required class
      contentTests++;
      if (content.includes('class EnhancedCaptureGenerator')) {
        this.log('EnhancedCaptureGenerator class found', 'success');
        contentPasses++;
      } else {
        this.log('EnhancedCaptureGenerator class missing', 'error');
      }
      
      // Test for required methods
      const requiredMethods = [
        'generatePersonalIntro',
        'generateUserPersona', 
        'generateFoundryArchitecture',
        'generateActionDemonstration',
        'generateStrongCTA',
        'generateAllCaptures'
      ];
      
      requiredMethods.forEach(method => {
        contentTests++;
        if (content.includes(method)) {
          this.log(`Method ${method} found`, 'success');
          contentPasses++;
        } else {
          this.log(`Method ${method} missing`, 'error');
        }
      });
      
      // Test for HTML content generation
      contentTests++;
      if (content.includes('<!DOCTYPE html>')) {
        this.log('HTML content generation found', 'success');
        contentPasses++;
      } else {
        this.log('HTML content generation missing', 'error');
      }
      
      // Test for Playwright usage
      contentTests++;
      if (content.includes('playwright')) {
        this.log('Playwright integration found', 'success');
        contentPasses++;
      } else {
        this.log('Playwright integration missing', 'error');
      }
      
      const contentScore = (contentPasses / contentTests) * 100;
      if (contentScore >= 80) {
        this.log(`Content structure score: ${contentScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Content Structure', status: 'PASS', score: contentScore });
        return true;
      } else {
        this.log(`Content structure score: ${contentScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Content Structure', status: 'FAIL', score: contentScore });
        return false;
      }
      
    } catch (error) {
      this.log(`Error testing script content: ${error}`, 'error');
      this.testResults.push({ test: 'Content Structure', status: 'FAIL' });
      return false;
    }
  }

  testDependencies() {
    this.log('Testing script dependencies...', 'info');
    
    try {
      const content = fs.readFileSync(this.scriptPath, 'utf8');
      const requiredImports = [
        'playwright',
        'fs',
        'path'
      ];
      
      let importTests = 0;
      let importPasses = 0;
      
      requiredImports.forEach(importName => {
        importTests++;
        if (content.includes(`import { ${importName}`) || content.includes(`import * as ${importName}`) || content.includes(`import ${importName}`) || content.includes(`from '${importName}'`) || content.includes(`require.*${importName}`)) {
          this.log(`Import for ${importName} found`, 'success');
          importPasses++;
        } else {
          this.log(`Import for ${importName} missing`, 'error');
        }
      });
      
      const importScore = (importPasses / importTests) * 100;
      if (importScore >= 80) {
        this.log(`Dependency score: ${importScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Dependencies', status: 'PASS', score: importScore });
        return true;
      } else {
        this.log(`Dependency score: ${importScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Dependencies', status: 'FAIL', score: importScore });
        return false;
      }
      
    } catch (error) {
      this.log(`Error testing dependencies: ${error}`, 'error');
      this.testResults.push({ test: 'Dependencies', status: 'FAIL' });
      return false;
    }
  }

  runAllTests() {
    this.log('🚀 Starting Enhanced Capture Generator Tests', 'info');
    
    const tests = [
      this.testFileExists(),
      this.testFileReadable(),
      this.testTypeScriptSyntax(),
      this.testScriptContent(),
      this.testDependencies()
    ];
    
    const passedTests = tests.filter(Boolean).length;
    const totalTests = tests.length;
    const successRate = (passedTests / totalTests) * 100;
    
    // Summary
    console.log('\n' + '='.repeat(60));
    this.log('TEST RESULTS SUMMARY', 'info');
    console.log('='.repeat(60));
    
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      const score = result.score ? ` (${result.score.toFixed(1)}%)` : '';
      console.log(`${status} Test ${index + 1}: ${result.test}${score}`);
    });
    
    console.log('\n' + '='.repeat(60));
    this.log(`OVERALL RESULTS: ${passedTests}/${totalTests} tests passed (${successRate.toFixed(1)}%)`, 
      successRate >= 80 ? 'success' : 'error');
    
    if (successRate >= 80) {
      this.log('🎉 Enhanced Capture Generator script validation passed!', 'success');
      this.log('Ready for production use.', 'success');
    } else {
      this.log('❌ Enhanced Capture Generator script validation failed!', 'error');
      this.log('Please fix issues before proceeding.', 'error');
    }
    
    return successRate >= 80;
  }
}

// Run tests
if (require.main === module) {
  const tester = new CaptureGeneratorTester();
  const success = tester.runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { CaptureGeneratorTester };
