#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🧪 Testing Configuration Files...');

class ConfigurationTester {
  constructor() {
    this.testResults = [];
    this.configDir = path.join(__dirname, '..', 'config');
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

  testTimelineConfiguration() {
    this.log('Testing timeline configuration...', 'info');
    
    const timelineFile = path.join(this.configDir, 'timeline-fixed.yaml');
    
    try {
      // Test file exists
      if (!fs.existsSync(timelineFile)) {
        this.log('Timeline file missing', 'error');
        this.testResults.push({ test: 'Timeline File Exists', status: 'FAIL' });
        return false;
      }
      
      this.log('Timeline file exists', 'success');
      this.testResults.push({ test: 'Timeline File Exists', status: 'PASS' });
      
      // Test file is readable
      const content = fs.readFileSync(timelineFile, 'utf8');
      this.log('Timeline file is readable', 'success');
      this.testResults.push({ test: 'Timeline File Readable', status: 'PASS' });
      
      // Test YAML syntax
      try {
        yaml.load(content);
        this.log('Timeline YAML syntax is valid', 'success');
        this.testResults.push({ test: 'Timeline YAML Syntax', status: 'PASS' });
      } catch (yamlError) {
        this.log('Timeline YAML syntax error', 'error');
        this.testResults.push({ test: 'Timeline YAML Syntax', status: 'FAIL' });
        return false;
      }
      
      // Test required elements
      const requiredElements = [
        'personal_intro',
        'user_persona',
        'foundry_architecture',
        'action_demonstration',
        'strong_cta'
      ];
      
      let elementTests = 0;
      let elementPasses = 0;
      
      requiredElements.forEach(element => {
        elementTests++;
        if (content.includes(element)) {
          this.log(`Required element found: ${element}`, 'success');
          elementPasses++;
        } else {
          this.log(`Required element missing: ${element}`, 'error');
        }
      });
      
      // Test duration
      elementTests++;
      if (content.includes('duration: 420')) {
        this.log('Correct duration: 7 minutes (420 seconds)', 'success');
        elementPasses++;
      } else {
        this.log('Duration not set to 7 minutes', 'error');
      }
      
      const elementScore = (elementPasses / elementTests) * 100;
      if (elementScore >= 80) {
        this.log(`Timeline content score: ${elementScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Timeline Content', status: 'PASS', score: elementScore });
        return true;
      } else {
        this.log(`Timeline content score: ${elementScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Timeline Content', status: 'FAIL', score: elementScore });
        return false;
      }
      
    } catch (error) {
      this.log(`Error testing timeline: ${error}`, 'error');
      this.testResults.push({ test: 'Timeline Configuration', status: 'FAIL' });
      return false;
    }
  }

  testNarrationConfiguration() {
    this.log('Testing narration configuration...', 'info');
    
    const narrationFile = path.join(this.configDir, 'narration-fixed.yaml');
    
    try {
      // Test file exists
      if (!fs.existsSync(narrationFile)) {
        this.log('Narration file missing', 'error');
        this.testResults.push({ test: 'Narration File Exists', status: 'FAIL' });
        return false;
      }
      
      this.log('Narration file exists', 'success');
      this.testResults.push({ test: 'Narration File Exists', status: 'PASS' });
      
      // Test file is readable
      const content = fs.readFileSync(narrationFile, 'utf8');
      this.log('Narration file is readable', 'success');
      this.testResults.push({ test: 'Narration File Readable', status: 'PASS' });
      
      // Test YAML syntax
      try {
        yaml.load(content);
        this.log('Narration YAML syntax is valid', 'success');
        this.testResults.push({ test: 'Narration YAML Syntax', status: 'PASS' });
      } catch (yamlError) {
        this.log('Narration YAML syntax error', 'error');
        this.testResults.push({ test: 'Narration YAML Syntax', status: 'FAIL' });
        return false;
      }
      
      // Test required scenes
      const requiredScenes = [
        'personal_intro',
        'user_persona',
        'api_architecture',
        'map_interaction'
      ];
      
      let sceneTests = 0;
      let scenePasses = 0;
      
      requiredScenes.forEach(scene => {
        sceneTests++;
        if (content.includes(scene)) {
          this.log(`Required scene found: ${scene}`, 'success');
          scenePasses++;
        } else {
          this.log(`Required scene missing: ${scene}`, 'error');
        }
      });
      
      // Test duration
      sceneTests++;
      if (content.includes('duration: 420')) {
        this.log('Correct narration duration: 7 minutes (420 seconds)', 'success');
        scenePasses++;
      } else {
        this.log('Narration duration not set to 7 minutes', 'error');
      }
      
      // Test voice provider
      sceneTests++;
      if (content.includes('voice_provider: "elevenlabs"')) {
        this.log('Voice provider configured correctly', 'success');
        scenePasses++;
      } else {
        this.log('Voice provider not configured', 'error');
      }
      
      const sceneScore = (scenePasses / sceneTests) * 100;
      if (sceneScore >= 80) {
        this.log(`Narration content score: ${sceneScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Narration Content', status: 'PASS', score: sceneScore });
        return true;
      } else {
        this.log(`Narration content score: ${sceneScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Narration Content', status: 'FAIL', score: sceneScore });
        return false;
      }
      
    } catch (error) {
      this.log(`Error testing narration: ${error}`, 'error');
      this.testResults.push({ test: 'Narration Configuration', status: 'FAIL' });
      return false;
    }
  }

  testConfigurationConsistency() {
    this.log('Testing configuration consistency...', 'info');
    
    try {
      const timelineFile = path.join(this.configDir, 'timeline-fixed.yaml');
      const narrationFile = path.join(this.configDir, 'narration-fixed.yaml');
      
      if (!fs.existsSync(timelineFile) || !fs.existsSync(narrationFile)) {
        this.log('Cannot test consistency - files missing', 'error');
        this.testResults.push({ test: 'Configuration Consistency', status: 'FAIL' });
        return false;
      }
      
      const timelineContent = fs.readFileSync(timelineFile, 'utf8');
      const narrationContent = fs.readFileSync(narrationFile, 'utf8');
      
      let consistencyTests = 0;
      let consistencyPasses = 0;
      
      // Test duration consistency
      consistencyTests++;
      if (timelineContent.includes('duration: 420') && narrationContent.includes('duration: 420')) {
        this.log('Duration consistent between files', 'success');
        consistencyPasses++;
      } else {
        this.log('Duration inconsistent between files', 'error');
      }
      
      // Test segment consistency
      consistencyTests++;
      const timelineSegments = ['personal_intro', 'user_persona'];
      const hasTimelineSegments = timelineSegments.every(seg => timelineContent.includes(seg));
      const hasNarrationSegments = timelineSegments.every(seg => narrationContent.includes(seg));
      
      if (hasTimelineSegments && hasNarrationSegments) {
        this.log('Key segments consistent between files', 'success');
        consistencyPasses++;
      } else {
        this.log('Key segments inconsistent between files', 'error');
      }
      
      // Test metadata consistency
      consistencyTests++;
      if (timelineContent.includes('Ian Frelinger') && narrationContent.includes('Ian Frelinger')) {
        this.log('Author metadata consistent', 'success');
        consistencyPasses++;
      } else {
        this.log('Author metadata inconsistent', 'error');
      }
      
      const consistencyScore = (consistencyPasses / consistencyTests) * 100;
      if (consistencyScore >= 80) {
        this.log(`Configuration consistency score: ${consistencyScore.toFixed(1)}%`, 'success');
        this.testResults.push({ test: 'Configuration Consistency', status: 'PASS', score: consistencyScore });
        return true;
      } else {
        this.log(`Configuration consistency score: ${consistencyScore.toFixed(1)}%`, 'error');
        this.testResults.push({ test: 'Configuration Consistency', status: 'FAIL', score: consistencyScore });
        return false;
      }
      
    } catch (error) {
      this.log(`Error testing consistency: ${error}`, 'error');
      this.testResults.push({ test: 'Configuration Consistency', status: 'FAIL' });
      return false;
    }
  }

  runAllTests() {
    this.log('🚀 Starting Configuration File Tests', 'info');
    
    const tests = [
      this.testTimelineConfiguration(),
      this.testNarrationConfiguration(),
      this.testConfigurationConsistency()
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
      this.log('🎉 Configuration file validation passed!', 'success');
      this.log('All configuration files are properly structured and consistent.', 'success');
    } else {
      this.log('❌ Configuration file validation failed!', 'error');
      this.log('Please fix configuration issues before proceeding.', 'error');
    }
    
    return successRate >= 80;
  }
}

// Run tests
if (require.main === module) {
  const tester = new ConfigurationTester();
  const success = tester.runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { ConfigurationTester };
