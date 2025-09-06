#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🧪 MAP COMPONENT TDD VALIDATION SUITE');
console.log('=======================================\n');
console.log('Following the Five-Phase Testing Methodology from TDD Document\n');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 300000, // 5 minutes
  retries: 2,
  workers: 1, // Sequential execution for better monitoring
  outputDir: './test-results/map-component-tdd',
  screenshots: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Ensure test-results directory exists for Playwright
const testResultsDir = './test-results';
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// Ensure map-component-tdd subdirectory exists
const tddOutputDir = path.join(testResultsDir, 'map-component-tdd');
if (!fs.existsSync(tddOutputDir)) {
  fs.mkdirSync(tddOutputDir, { recursive: true });
}

// Update config to use the correct path
config.outputDir = tddOutputDir;

// Phase definitions based on TDD document
const validationPhases = [
  {
    name: 'Phase 1: Playwright UI Testing (Headless Mode)',
    description: 'Validate user interface elements and interactions without visual overhead',
    testFile: 'tests/e2e/map-ui-validation-headless.spec.ts',
    successCriteria: [
      'All UI tests pass in headless mode',
      'No visual regression issues',
      'Interactive elements respond correctly',
      'Map components load and display properly'
    ]
  },
  {
    name: 'Phase 2: Integration Testing',
    description: 'Validate system integration and API communication',
    testFile: 'tests/e2e/map-integration-validation.spec.ts',
    successCriteria: [
      'All API endpoints return expected responses',
      'Environment variables are properly configured',
      'Container networking functions correctly',
      'Data transformation and routing work as expected'
    ]
  },
  {
    name: 'Phase 3: Frontend Error Validation',
    description: 'Ensure no errors are being logged in the frontend',
    testFile: 'tests/e2e/map-error-validation.spec.ts',
    successCriteria: [
      'No JavaScript errors in browser console',
      'No React component errors',
      'No network request failures',
      'Clean frontend container logs'
    ]
  },
  {
    name: 'Phase 4: User Story Testing',
    description: 'Validate that the implementation actually solves real user problems',
    testFile: 'tests/e2e/map-user-story-validation.spec.ts',
    successCriteria: [
      'All user story scenarios complete successfully',
      'Feature meets usability requirements',
      'Error scenarios handled gracefully',
      'User experience metrics within acceptable ranges'
    ]
  },
  {
    name: 'Phase 5: Comprehensive Stress Testing',
    description: 'Validate system performance and reliability under demanding conditions',
    testFile: 'tests/e2e/map-stress-validation.spec.ts',
    successCriteria: [
      'System handles expected load without degradation',
      'Graceful degradation under stress conditions',
      'Recovery mechanisms function properly',
      'Performance metrics remain within acceptable ranges'
    ]
  }
];

// Function to run a validation phase
function runValidationPhase(phase, phaseIndex) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 ${phase.name}`);
  console.log(`📝 Description: ${phase.description}`);
  console.log(`🎯 Success Criteria:`);
  phase.successCriteria.forEach((criterion, index) => {
    console.log(`   ${index + 1}. ${criterion}`);
  });
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    const startTime = Date.now();
    
    // Run the validation phase with terminal-only output (no HTML reports)
    const command = `npx playwright test ${phase.testFile} --config=playwright.config.ts --timeout=${config.testTimeout} --retries=${config.retries} --workers=${config.workers} --reporter=list`;
    
    console.log(`🔧 Command: ${command}`);
    console.log('⏳ Starting validation phase...\n');
    
    const result = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`\n✅ ${phase.name} completed successfully in ${duration.toFixed(2)}s`);
    return { 
      success: true, 
      duration, 
      phase: phase.name,
      phaseIndex: phaseIndex + 1
    };
    
  } catch (error) {
    console.log(`\n❌ ${phase.name} failed`);
    console.log(`Error: ${error.message}`);
    return { 
      success: false, 
      error: error.message, 
      phase: phase.name,
      phaseIndex: phaseIndex + 1
    };
  }
}

// Function to generate comprehensive TDD validation report
function generateTDDReport(results) {
  const reportPath = path.join(config.outputDir, 'tdd-validation-report.json');
  const summaryPath = path.join(config.outputDir, 'tdd-validation-summary.txt');
  
  const report = {
    timestamp: new Date().toISOString(),
    config,
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    },
    tddPhaseResults: results.map(r => ({
      phase: r.phaseIndex,
      name: r.phase,
      status: r.success ? 'PASSED' : 'FAILED',
      duration: r.duration || 0,
      error: r.error || null
    }))
  };
  
  // Write detailed report
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Write human-readable summary
  const summary = generateSummaryText(report);
  fs.writeFileSync(summaryPath, summary);
  
  return report;
}

// Function to generate human-readable summary
function generateSummaryText(report) {
  let summary = 'MAP COMPONENT TDD VALIDATION SUMMARY\n';
  summary += '=====================================\n\n';
  summary += `Timestamp: ${report.timestamp}\n`;
  summary += `Total Phases: ${report.summary.total}\n`;
  summary += `Passed: ${report.summary.passed}\n`;
  summary += `Failed: ${report.summary.failed}\n`;
  summary += `Total Duration: ${(report.summary.totalDuration / 60).toFixed(2)} minutes\n\n`;
  
  summary += 'PHASE RESULTS:\n';
  summary += '==============\n\n';
  
  report.tddPhaseResults.forEach(phase => {
    const statusIcon = phase.status === 'PASSED' ? '✅' : '❌';
    summary += `${statusIcon} Phase ${phase.phase}: ${phase.name}\n`;
    summary += `   Status: ${phase.status}\n`;
    summary += `   Duration: ${phase.duration.toFixed(2)}s\n`;
    if (phase.error) {
      summary += `   Error: ${phase.error}\n`;
    }
    summary += '\n';
  });
  
  // Determine implementation effectiveness based on TDD document
  const implementationEffectiveness = determineImplementationEffectiveness(report);
  summary += `IMPLEMENTATION EFFECTIVENESS: ${implementationEffectiveness}\n\n`;
  
  if (implementationEffectiveness === 'Go to Production') {
    summary += '🎉 All validation phases passed! The map component is ready for production.\n';
  } else if (implementationEffectiveness === 'Requires Optimization') {
    summary += '⚠️  The implementation works but could benefit from optimization.\n';
  } else if (implementationEffectiveness === 'Requires Refactoring') {
    summary += '🔄 Significant rework is needed to meet requirements.\n';
  } else {
    summary += '❌ The implementation approach needs complete reconsideration.\n';
  }
  
  return summary;
}

// Function to determine implementation effectiveness based on TDD document
function determineImplementationEffectiveness(report) {
  const allPhasesPassed = report.summary.failed === 0;
  
  if (!allPhasesPassed) {
    return 'Back to Design';
  }
  
  // Check if any phases had performance concerns (this would require additional metrics)
  // For now, if all phases pass, we consider it ready for production
  return 'Go to Production';
}

// Main execution function
async function main() {
  console.log('🚀 Starting Map Component TDD Validation Suite');
  console.log('This will execute all five phases of the TDD methodology\n');
  
  // Check if application is running
  console.log('🔍 Checking if application is accessible...');
  try {
    execSync(`curl -s -o /dev/null -w "%{http_code}" ${config.baseUrl}`, { stdio: 'pipe' });
    console.log('✅ Application is accessible\n');
  } catch (error) {
    console.log('❌ Application is not accessible. Please ensure the frontend is running on port 3001');
    process.exit(1);
  }
  
  const results = [];
  
  // Execute each validation phase sequentially
  for (let i = 0; i < validationPhases.length; i++) {
    const phase = validationPhases[i];
    const result = runValidationPhase(phase, i);
    results.push(result);
    
    // If a phase fails, we can choose to continue or stop
    if (!result.success) {
      console.log(`\n⚠️  Phase ${i + 1} failed. Continuing with remaining phases...\n`);
    }
  }
  
  // Generate comprehensive report
  console.log('\n📊 Generating TDD Validation Report...');
  const report = generateTDDReport(results);
  
  // Display final results
  console.log('\n' + '='.repeat(80));
  console.log('🎯 TDD VALIDATION COMPLETE');
  console.log('='.repeat(80));
  
  console.log(`\n📈 Results Summary:`);
  console.log(`   Total Phases: ${report.summary.total}`);
  console.log(`   Passed: ${report.summary.passed}`);
  console.log(`   Failed: ${report.summary.failed}`);
  console.log(`   Total Duration: ${(report.summary.totalDuration / 60).toFixed(2)} minutes`);
  
  console.log(`\n📋 Implementation Effectiveness: ${determineImplementationEffectiveness(report)}`);
  
  console.log(`\n📊 Test results displayed in terminal above`);
  console.log(`📄 Summary: ${path.join(config.outputDir, 'tdd-validation-summary.txt')}`);
  console.log(`📊 Full Report: ${path.join(config.outputDir, 'tdd-validation-report.json')}`);
  
  // Exit with appropriate code
  if (report.summary.failed > 0) {
    console.log('\n❌ Some validation phases failed. Review the reports for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All validation phases passed! The map component meets TDD requirements.');
    process.exit(0);
  }
}

// Run the validation suite
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Validation suite failed with error:', error);
    process.exit(1);
  });
}
