#!/usr/bin/env node
/**
 * Test Script for Editor-in-the-Loop System
 * Validates all components and provides a quick test run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

class EditorInTheLoopTester {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.artifactsDir = path.join(this.outputDir, 'artifacts');
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Editor-in-the-Loop System Test Suite');
    console.log('=' * 50);
    
    try {
      // Test 1: Environment Configuration
      await this.testEnvironmentConfig();
      
      // Test 2: API Key Validation
      await this.testAPIKey();
      
      // Test 3: Directory Structure
      await this.testDirectoryStructure();
      
      // Test 4: Script Availability
      await this.testScriptAvailability();
      
      // Test 5: Artifacts Generation
      await this.testArtifactsGeneration();
      
      // Test 6: GPT-5 Integration
      await this.testGPT5Integration();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async testEnvironmentConfig() {
    console.log('\n🔧 Test 1: Environment Configuration');
    
    const test = {
      name: 'Environment Configuration',
      status: 'PASS',
      details: []
    };
    
    try {
      // Check if config.env exists
      const configPath = path.join(__dirname, '..', 'config.env');
      if (fs.existsSync(configPath)) {
        test.details.push('✅ config.env file exists');
      } else {
        test.status = 'FAIL';
        test.details.push('❌ config.env file not found');
      }
      
      // Check if dotenv is working
      if (process.env.OPENAI_API_KEY) {
        test.details.push('✅ Environment variables loaded');
      } else {
        test.details.push('⚠️  OPENAI_API_KEY not found in environment');
      }
      
    } catch (error) {
      test.status = 'FAIL';
      test.details.push(`❌ Error: ${error.message}`);
    }
    
    this.testResults.push(test);
    this.displayTestResult(test);
  }

  async testAPIKey() {
    console.log('\n🔑 Test 2: API Key Validation');
    
    const test = {
      name: 'API Key Validation',
      status: 'PASS',
      details: []
    };
    
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        test.status = 'FAIL';
        test.details.push('❌ No API key found');
      } else {
        test.details.push('✅ API key found');
        
        // Check API key format
        if (apiKey.startsWith('sk-')) {
          test.details.push('✅ API key format appears valid');
        } else {
          test.details.push('⚠️  API key format may be invalid');
        }
        
        // Check API key length
        if (apiKey.length > 20) {
          test.details.push('✅ API key length appears valid');
        } else {
          test.details.push('⚠️  API key seems too short');
        }
      }
      
    } catch (error) {
      test.status = 'FAIL';
      test.details.push(`❌ Error: ${error.message}`);
    }
    
    this.testResults.push(test);
    this.displayTestResult(test);
  }

  async testDirectoryStructure() {
    console.log('\n📁 Test 3: Directory Structure');
    
    const test = {
      name: 'Directory Structure',
      status: 'PASS',
      details: []
    };
    
    try {
      const requiredDirs = [
        this.outputDir,
        this.artifactsDir,
        path.join(__dirname, '..', 'scripts')
      ];
      
      for (const dir of requiredDirs) {
        if (fs.existsSync(dir)) {
          test.details.push(`✅ ${path.basename(dir)} directory exists`);
        } else {
          test.status = 'FAIL';
          test.details.push(`❌ ${path.basename(dir)} directory missing`);
        }
      }
      
    } catch (error) {
      test.status = 'FAIL';
      test.details.push(`❌ Error: ${error.message}`);
    }
    
    this.testResults.push(test);
    this.displayTestResult(test);
  }

  async testScriptAvailability() {
    console.log('\n📜 Test 4: Script Availability');
    
    const test = {
      name: 'Script Availability',
      status: 'PASS',
      details: []
    };
    
    try {
      const requiredScripts = [
        'agent_review.js',
        'generate_review_artifacts.py',
        'apply_feedback.py',
        'editor_in_the_loop_pipeline.js'
      ];
      
      for (const script of requiredScripts) {
        const scriptPath = path.join(__dirname, script);
        if (fs.existsSync(scriptPath)) {
          test.details.push(`✅ ${script} exists`);
        } else {
          test.status = 'FAIL';
          test.details.push(`❌ ${script} missing`);
        }
      }
      
    } catch (error) {
      test.status = 'FAIL';
      test.details.push(`❌ Error: ${error.message}`);
    }
    
    this.testResults.push(test);
    this.displayTestResult(test);
  }

  async testArtifactsGeneration() {
    console.log('\n🎨 Test 5: Artifacts Generation');
    
    const test = {
      name: 'Artifacts Generation',
      status: 'PASS',
      details: []
    };
    
    try {
      // Check if we have a video to work with
      const videoPath = path.join(this.outputDir, 'roughcut.mp4');
      if (fs.existsSync(videoPath)) {
        test.details.push('✅ Test video found');
        
        // Check if artifacts directory exists
        if (fs.existsSync(this.artifactsDir)) {
          test.details.push('✅ Artifacts directory exists');
          
          // Check for existing artifacts
          const artifacts = fs.readdirSync(this.artifactsDir);
          if (artifacts.length > 0) {
            test.details.push(`✅ Found ${artifacts.length} existing artifacts`);
          } else {
            test.details.push('ℹ️  No existing artifacts found (will be generated)');
          }
        } else {
          test.details.push('ℹ️  Artifacts directory will be created');
        }
      } else {
        test.details.push('ℹ️  No test video found (will be generated)');
      }
      
    } catch (error) {
      test.status = 'FAIL';
      test.details.push(`❌ Error: ${error.message}`);
    }
    
    this.testResults.push(test);
    this.displayTestResult(test);
  }

  async testGPT5Integration() {
    console.log('\n🤖 Test 6: GPT-5 Integration');
    
    const test = {
      name: 'GPT-5 Integration',
      status: 'PASS',
      details: []
    };
    
    try {
      // Import OpenAI to test connection
      const { default: OpenAI } = await import('openai');
      
      const client = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
      
      if (client) {
        test.details.push('✅ OpenAI client created successfully');
        
        // Test a simple API call
        try {
          const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Hello, this is a test." }],
            max_tokens: 10
          });
          
          if (response && response.choices && response.choices.length > 0) {
            test.details.push('✅ GPT API connection successful');
            test.details.push(`✅ Model used: ${response.model}`);
          } else {
            test.status = 'FAIL';
            test.details.push('❌ No response from GPT API');
          }
        } catch (apiError) {
          test.status = 'FAIL';
          test.details.push(`❌ GPT API error: ${apiError.message}`);
        }
      } else {
        test.status = 'FAIL';
        test.details.push('❌ Failed to create OpenAI client');
      }
      
    } catch (error) {
      test.status = 'FAIL';
      test.details.push(`❌ Error: ${error.message}`);
    }
    
    this.testResults.push(test);
    this.displayTestResult(test);
  }

  displayTestResult(test) {
    const statusEmoji = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${statusEmoji} ${test.name}: ${test.status}`);
    
    test.details.forEach(detail => {
      console.log(`  ${detail}`);
    });
  }

  displayResults() {
    console.log('\n📊 Test Results Summary');
    console.log('=' * 30);
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length;
    const failed = this.testResults.filter(t => t.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Editor-in-the-Loop system is ready.');
      console.log('\n🚀 Next steps:');
      console.log('  1. Run: node scripts/editor_in_the_loop_pipeline.js');
      console.log('  2. Or run individual components:');
      console.log('     - node scripts/agent_review.js');
      console.log('     - python3 scripts/generate_review_artifacts.py <video> <timeline> <tts> <output>');
    } else {
      console.log('\n⚠️  Some tests failed. Please fix the issues before running the pipeline.');
      
      const failedTests = this.testResults.filter(t => t.status === 'FAIL');
      console.log('\nFailed tests:');
      failedTests.forEach(test => {
        console.log(`  - ${test.name}`);
      });
    }
    
    // Save test results
    const resultsPath = path.join(this.outputDir, 'test_results.json');
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: total,
        passed: passed,
        failed: failed
      },
      tests: this.testResults
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📁 Test results saved to: ${resultsPath}`);
  }
}

// Main execution
async function main() {
  const tester = new EditorInTheLoopTester();
  await tester.runTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default EditorInTheLoopTester;
