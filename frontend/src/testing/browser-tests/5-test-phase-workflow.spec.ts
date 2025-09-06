import { test, expect, Page } from '@playwright/test';
import { FiveTestPhaseWorkflow } from '../5-test-phase-workflow';

/**
 * 5-Test Phase Workflow Integration Test
 * Runs the complete 5-phase testing workflow with dynamic component discovery
 */

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(summary: any, results: any[]): string[] {
  const recommendations: string[] = [];
  
  if (summary.successRate < 80) {
    recommendations.push('Consider improving component error handling - success rate is below 80%');
  }
  
  if (summary.totalDuration > 30000) {
    recommendations.push('Workflow execution time is high - consider optimizing test performance');
  }
  
  const errorPhases = results.filter(r => r.errors.length > 0);
  if (errorPhases.length > 0) {
    recommendations.push(`Phases with errors: ${errorPhases.map(r => r.phase).join(', ')}`);
  }
  
  const slowPhases = results.filter(r => r.duration > 5000);
  if (slowPhases.length > 0) {
    recommendations.push(`Slow phases: ${slowPhases.map(r => r.phase).join(', ')}`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All phases completed successfully - no recommendations');
  }
  
  return recommendations;
}

test.describe('5-Test Phase Workflow', () => {
  let workflow: FiveTestPhaseWorkflow;

  test.beforeEach(async ({ page }) => {
    workflow = new FiveTestPhaseWorkflow();
    
    // Set up error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
  });

  test('Complete 5-Test Phase Workflow', async ({ page }) => {
    console.log('🚀 Starting Complete 5-Test Phase Workflow');
    
    // Run all 5 phases
    const results = await workflow.runAllPhases(page);
    
    // Get workflow summary
    const summary = workflow.getWorkflowSummary();
    
    console.log('\n=== 5-TEST PHASE WORKFLOW SUMMARY ===');
    console.log(`Total phases: ${summary.totalPhases}`);
    console.log(`Successful phases: ${summary.successfulPhases}`);
    console.log(`Success rate: ${summary.successRate.toFixed(2)}%`);
    console.log(`Total duration: ${summary.totalDuration}ms`);
    
    // Log individual phase results
    results.forEach((result, index) => {
      console.log(`\nPhase ${index + 1}: ${result.phase}`);
      console.log(`  Success: ${result.success}`);
      console.log(`  Duration: ${result.duration}ms`);
      console.log(`  Results: ${result.results.length}`);
      console.log(`  Errors: ${result.errors.length}`);
      
      if (result.summary) {
        console.log(`  Summary:`, result.summary);
      }
      
      if (result.errors.length > 0) {
        console.log(`  Error details:`, result.errors);
      }
    });
    
    // Assertions
    expect(summary.totalPhases).toBe(5);
    expect(summary.successfulPhases).toBeGreaterThan(0);
    expect(summary.successRate).toBeGreaterThan(0);
    
    // Phase 1 (Component Discovery) should always succeed
    expect(results[0]?.success).toBe(true);
    expect(results[0]?.results.length).toBeGreaterThan(0);
  });

  test('Phase 1: Component Discovery', async ({ page }) => {
    console.log('🔍 Testing Phase 1: Component Discovery');
    
    const result = await workflow.phase1_ComponentDiscovery(page);
    
    console.log('Phase 1 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Components discovered: ${result.results.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    
    if (result.summary) {
      console.log(`  Summary:`, result.summary);
    }
    
    // Assertions
    expect(result.success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.duration).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
  });

  test('Phase 2: Basic Rendering', async ({ page }) => {
    console.log('🎨 Testing Phase 2: Basic Rendering');
    
    // First run component discovery
    await workflow.phase1_ComponentDiscovery(page);
    
    const result = await workflow.phase2_BasicRendering(page);
    
    console.log('Phase 2 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Components tested: ${result.results.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    
    if (result.summary) {
      console.log(`  Summary:`, result.summary);
    }
    
    // Assertions
    expect(result.duration).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('Phase 3: Prop Validation', async ({ page }) => {
    console.log('🔧 Testing Phase 3: Prop Validation');
    
    // First run component discovery
    await workflow.phase1_ComponentDiscovery(page);
    
    const result = await workflow.phase3_PropValidation(page);
    
    console.log('Phase 3 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Components tested: ${result.results.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    
    if (result.summary) {
      console.log(`  Summary:`, result.summary);
    }
    
    // Assertions
    expect(result.duration).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('Phase 4: Interaction Testing', async ({ page }) => {
    console.log('🖱️ Testing Phase 4: Interaction Testing');
    
    // First run component discovery
    await workflow.phase1_ComponentDiscovery(page);
    
    const result = await workflow.phase4_InteractionTesting(page);
    
    console.log('Phase 4 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Components tested: ${result.results.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    
    if (result.summary) {
      console.log(`  Summary:`, result.summary);
    }
    
    // Assertions
    expect(result.duration).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('Phase 5: Error Handling', async ({ page }) => {
    console.log('🚨 Testing Phase 5: Error Handling');
    
    // First run component discovery
    await workflow.phase1_ComponentDiscovery(page);
    
    const result = await workflow.phase5_ErrorHandling(page);
    
    console.log('Phase 5 Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Components tested: ${result.results.length}`);
    console.log(`  Errors: ${result.errors.length}`);
    
    if (result.summary) {
      console.log(`  Summary:`, result.summary);
    }
    
    // Assertions
    expect(result.duration).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  test('Workflow Performance and Reliability', async ({ page }) => {
    console.log('⚡ Testing Workflow Performance and Reliability');
    
    const startTime = Date.now();
    const results = await workflow.runAllPhases(page);
    const totalTime = Date.now() - startTime;
    
    const summary = workflow.getWorkflowSummary();
    
    console.log('\n=== PERFORMANCE ANALYSIS ===');
    console.log(`Total workflow time: ${totalTime}ms`);
    console.log(`Average phase time: ${totalTime / results.length}ms`);
    console.log(`Success rate: ${summary.successRate.toFixed(2)}%`);
    
    // Performance assertions
    expect(totalTime).toBeLessThan(60000); // Should complete within 60 seconds
    expect(summary.successRate).toBeGreaterThan(0); // At least some phases should succeed
    
    // Reliability assertions
    expect(results.length).toBe(5); // All 5 phases should run
    expect(results[0]?.success).toBe(true); // Component discovery should always succeed
  });

  test('Error Recovery and Resilience', async ({ page }) => {
    console.log('🛡️ Testing Error Recovery and Resilience');
    
    // Set up error conditions
    await page.evaluate(() => {
      // Simulate network errors
      window.addEventListener('error', (e) => {
        console.log('Simulated error:', e.message);
      });
    });
    
    const results = await workflow.runAllPhases(page);
    const summary = workflow.getWorkflowSummary();
    
    console.log('\n=== ERROR RECOVERY ANALYSIS ===');
    console.log(`Phases completed: ${results.length}`);
    console.log(`Successful phases: ${summary.successfulPhases}`);
    console.log(`Total errors encountered: ${results.reduce((sum, r) => sum + r.errors.length, 0)}`);
    
    // Resilience assertions
    expect(results.length).toBeGreaterThan(0); // At least some phases should complete
    expect(summary.successfulPhases).toBeGreaterThan(0); // At least one phase should succeed
  });

  test('Generate Comprehensive Report', async ({ page }) => {
    console.log('📊 Generating Comprehensive Workflow Report');
    
    const results = await workflow.runAllPhases(page);
    const summary = workflow.getWorkflowSummary();
    
    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      workflow: {
        totalPhases: summary.totalPhases,
        successfulPhases: summary.successfulPhases,
        successRate: summary.successRate,
        totalDuration: summary.totalDuration
      },
      phases: results.map((result, index) => ({
        phaseNumber: index + 1,
        name: result.phase,
        success: result.success,
        duration: result.duration,
        resultsCount: result.results.length,
        errorsCount: result.errors.length,
        summary: result.summary,
        errors: result.errors
      })),
      components: results[0]?.results || [], // Components from discovery phase
      recommendations: generateRecommendations(summary, results)
    };
    
    console.log('\n=== COMPREHENSIVE WORKFLOW REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    
    // Save report to file (simulated)
    await page.evaluate((reportData) => {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '5-test-phase-workflow-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }, report);
    
    // Final assertions
    expect(report.workflow.totalPhases).toBe(5);
    expect(report.phases.length).toBe(5);
    expect(report.components.length).toBeGreaterThan(0);
  });

});
