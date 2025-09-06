#!/usr/bin/env node

/**
 * Comprehensive Error Testing - All Phases
 * 
 * Runs the complete error testing playbook across all 5 phases.
 * This is the main entry point for comprehensive error testing.
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Comprehensive Error Testing Playbook');
console.log('=' .repeat(60));
console.log('🎯 Goal: Make "potential errors" first-class, repeatable test fixtures');
console.log('📋 Coverage: All 5 phases of the TDD pipeline');
console.log('');

const testResults = {
  phases: {
    phase1: { passed: 0, failed: 0, errors: [] },
    phase2: { passed: 0, failed: 0, errors: [] },
    phase3: { passed: 0, failed: 0, errors: [] },
    phase4: { passed: 0, failed: 0, errors: [] },
    phase5: { passed: 0, failed: 0, errors: [] }
  },
  total: { passed: 0, failed: 0, errors: [] }
};

// Phase descriptions
const phaseDescriptions = {
  phase1: {
    name: 'Foundation & Basic Functionality',
    description: 'Environment, WebGL, style loading, and basic initialization faults',
    goal: 'App initializes sanely or fails loudly with friendly UI'
  },
  phase2: {
    name: 'Visual Effects & Styling',
    description: 'Style builders, duplicate layer IDs, and visual rendering faults',
    goal: 'Style builders never create invalid styles; invalid inputs are rejected early'
  },
  phase3: {
    name: 'Interactive Elements',
    description: 'Event handling, error boundaries, and user interaction faults',
    goal: 'Input chaos doesn\'t crash handlers; error boundaries work properly'
  },
  phase4: {
    name: 'Advanced Integration & Performance',
    description: 'API failures, state sync issues, and performance degradation',
    goal: 'API + state sync failures are handled; backpressure works'
  },
  phase5: {
    name: 'Stress & Edge Cases',
    description: 'Extreme data scenarios, memory pressure, and system limits',
    goal: 'Extremes don\'t melt the UI; graceful degradation works'
  }
};

// Run a specific phase
function runPhase(phaseKey) {
  const phase = phaseDescriptions[phaseKey];
  console.log(`\n🎯 Phase ${phaseKey.slice(-1)}: ${phase.name}`);
  console.log(`   ${phase.description}`);
  console.log(`   Goal: ${phase.goal}`);
  console.log('   ' + '='.repeat(phase.goal.length + 8));
  
  try {
    const scriptPath = `scripts/test-${phaseKey}-errors.js`;
    console.log(`   🔍 Running: ${scriptPath}`);
    
    const result = execSync(`node ${scriptPath}`, {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    // Parse results from the phase script output
    const lines = result.split('\n');
    const summaryLine = lines.find(line => line.includes('Success Rate:'));
    if (summaryLine) {
      const match = summaryLine.match(/Passed: (\d+).*Failed: (\d+)/);
      if (match) {
        testResults.phases[phaseKey].passed = parseInt(match[1]);
        testResults.phases[phaseKey].failed = parseInt(match[2]);
      }
    }
    
    console.log(`   ✅ Phase ${phaseKey.slice(-1)} completed successfully`);
    
  } catch (error) {
    console.log(`   ❌ Phase ${phaseKey.slice(-1)} failed`);
    console.log(`      Error: ${error.message}`);
    
    // Try to extract error information
    if (error.stdout) {
      const lines = error.stdout.split('\n');
      const errorLines = lines.filter(line => line.includes('❌ FAILED:'));
      errorLines.forEach(line => {
        const testMatch = line.match(/❌ FAILED: (.+)/);
        if (testMatch) {
          testResults.phases[phaseKey].errors.push({
            test: testMatch[1],
            error: 'Phase execution failed'
          });
        }
      });
    }
    
    testResults.phases[phaseKey].failed = 1;
  }
}

// Calculate totals
function calculateTotals() {
  Object.values(testResults.phases).forEach(phase => {
    testResults.total.passed += phase.passed;
    testResults.total.failed += phase.failed;
    testResults.total.errors.push(...phase.errors);
  });
}

// Display comprehensive results
function displayResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE ERROR TESTING RESULTS');
  console.log('='.repeat(60));
  
  // Phase-by-phase breakdown
  Object.entries(testResults.phases).forEach(([phaseKey, phase]) => {
    const phaseNum = phaseKey.slice(-1);
    const phaseName = phaseDescriptions[phaseKey].name;
    const total = phase.passed + phase.failed;
    const successRate = total > 0 ? ((phase.passed / total) * 100).toFixed(1) : '0.0';
    
    console.log(`\n📋 Phase ${phaseNum}: ${phaseName}`);
    console.log(`   ✅ Passed: ${phase.passed}`);
    console.log(`   ❌ Failed: ${phase.failed}`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    
    if (phase.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${phase.errors.length}`);
      phase.errors.slice(0, 3).forEach(({ test, error }) => {
        console.log(`      • ${test}: ${error}`);
      });
      if (phase.errors.length > 3) {
        console.log(`      ... and ${phase.errors.length - 3} more errors`);
      }
    }
  });
  
  // Overall summary
  console.log('\n' + '='.repeat(60));
  console.log('🏆 OVERALL SUMMARY');
  console.log('='.repeat(60));
  console.log(`   ✅ Total Passed: ${testResults.total.passed}`);
  console.log(`   ❌ Total Failed: ${testResults.total.failed}`);
  console.log(`   📈 Overall Success Rate: ${((testResults.total.passed / (testResults.total.passed + testResults.total.failed)) * 100).toFixed(1)}%`);
  console.log(`   🎯 Total Tests: ${testResults.total.passed + testResults.total.failed}`);
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  if (testResults.total.failed === 0) {
    console.log('   🎉 Excellent! All error tests passed.');
    console.log('   🚀 Your error handling is robust and comprehensive.');
    console.log('   🔒 Consider adding mutation testing for even better coverage.');
  } else if (testResults.total.failed < 5) {
    console.log('   👍 Good progress! Most error tests are passing.');
    console.log('   🔧 Focus on fixing the few remaining failures.');
    console.log('   📊 Review error boundary coverage and user experience.');
  } else if (testResults.total.failed < 15) {
    console.log('   ⚠️  Moderate issues detected. Error handling needs attention.');
    console.log('   🎯 Prioritize critical failures (Phase 1 & 2).');
    console.log('   🧪 Consider implementing more error boundaries.');
  } else {
    console.log('   🚨 Significant error handling issues detected.');
    console.log('   🚨 Focus on Phase 1 (Foundation) first.');
    console.log('   🚨 Implement error boundaries and user-friendly error messages.');
    console.log('   🚨 Review error testing strategy and implementation.');
  }
  
  // Next steps
  console.log('\n🔄 NEXT STEPS');
  console.log('='.repeat(60));
  console.log('   1. Fix any failing tests');
  console.log('   2. Review error boundary coverage');
  console.log('   3. Test error scenarios manually');
  console.log('   4. Update error messages for better UX');
  console.log('   5. Consider adding mutation testing');
  console.log('   6. Run performance tests under error conditions');
}

// Main execution
async function runComprehensiveErrorTests() {
  console.log('🎯 Error Testing Strategy Overview:');
  console.log('   • Phase 1: Foundation failures should be graceful');
  console.log('   • Phase 2: Style errors should be caught early');
  console.log('   • Phase 3: User interactions should remain stable');
  console.log('   • Phase 4: API failures should have fallbacks');
  console.log('   • Phase 5: Extreme conditions should degrade gracefully');
  
  // Run all phases
  const phases = Object.keys(testResults.phases);
  for (const phase of phases) {
    runPhase(phase);
  }
  
  // Calculate and display results
  calculateTotals();
  displayResults();
  
  // Exit with appropriate code
  const exitCode = testResults.total.failed > 0 ? 1 : 0;
  console.log(`\n🏁 Error testing completed with exit code: ${exitCode}`);
  process.exit(exitCode);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Comprehensive error testing interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception during error testing:', error);
  process.exit(1);
});

// Run the comprehensive tests
runComprehensiveErrorTests().catch(error => {
  console.error('\n💥 Comprehensive error testing failed:', error);
  process.exit(1);
});
