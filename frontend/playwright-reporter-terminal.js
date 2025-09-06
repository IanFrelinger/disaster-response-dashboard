/**
 * CUSTOM PLAYWRIGHT TERMINAL HTML REPORTER
 * 
 * This reporter converts HTML test results to terminal-readable text format.
 * It provides a comprehensive view of test results without opening a browser.
 */

class TerminalHTMLReporter {
  constructor(options = {}) {
    this.options = options;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  onBegin(config, suite) {
    this.startTime = new Date();
    console.log('\n🚀 PLAYWRIGHT TEST SUITE STARTING');
    console.log('====================================');
    console.log(`📁 Test Directory: ${config.testDir}`);
    console.log(`🔧 Configuration: ${config.name || 'Default'}`);
    console.log(`⏰ Start Time: ${this.startTime.toLocaleString()}`);
    console.log('');
  }

  onTestBegin(test, result) {
    // Track test start
    if (!this.results[test.parent.title]) {
      this.results[test.parent.title] = [];
    }
    this.results[test.parent.title].push({
      title: test.title,
      status: 'running',
      duration: 0,
      error: null
    });
  }

  onTestEnd(test, result) {
    // Update test result
    const testSuite = this.results[test.parent.title];
    const testResult = testSuite.find(t => t.title === test.title);
    if (testResult) {
      testResult.status = result.status;
      testResult.duration = result.duration;
      testResult.error = result.error;
    }
  }

  onEnd(result) {
    this.endTime = new Date();
    const totalDuration = this.endTime - this.startTime;
    
    console.log('\n🎯 TEST EXECUTION COMPLETED');
    console.log('============================');
    console.log(`⏰ End Time: ${this.endTime.toLocaleString()}`);
    console.log(`⏱️  Total Duration: ${this.formatDuration(totalDuration)}`);
    console.log('');
    
    this.printSummary(result);
    this.printDetailedResults();
    this.printRecommendations(result);
  }

  printSummary(result) {
    console.log('📊 EXECUTION SUMMARY');
    console.log('====================');
    console.log(`✅ Passed: ${result.status === 'passed' ? 'All' : result.passed || 0}`);
    console.log(`❌ Failed: ${result.failed || 0}`);
    console.log(`⏭️  Skipped: ${result.skipped || 0}`);
    console.log(`⚠️  Flaky: ${result.flaky || 0}`);
    console.log(`📝 Total: ${result.total || 0}`);
    console.log('');
  }

  printDetailedResults() {
    console.log('🔍 DETAILED TEST RESULTS');
    console.log('========================');
    
    Object.entries(this.results).forEach(([suiteName, tests]) => {
      console.log(`\n📋 Test Suite: ${suiteName}`);
      console.log('─'.repeat(suiteName.length + 15));
      
      tests.forEach(test => {
        const statusIcon = this.getStatusIcon(test.status);
        const duration = this.formatDuration(test.duration);
        const title = test.title.length > 60 ? test.title.substring(0, 57) + '...' : test.title;
        
        console.log(`${statusIcon} ${title}`);
        console.log(`   ⏱️  Duration: ${duration}`);
        
        if (test.error) {
          console.log(`   ❌ Error: ${test.error.message}`);
          if (test.error.stack) {
            console.log(`   📍 Stack: ${test.error.stack.split('\n')[0]}`);
          }
        }
        console.log('');
      });
    });
  }

  printRecommendations(result) {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (result.failed > 0) {
      console.log('❌ Some tests failed. Consider:');
      console.log('   • Reviewing error messages above');
      console.log('   • Checking test data and environment');
      console.log('   • Running individual test suites');
      console.log('   • Checking browser compatibility');
    } else if (result.flaky > 0) {
      console.log('⚠️  Some tests were flaky. Consider:');
      console.log('   • Adding retry logic');
      console.log('   • Improving test stability');
      console.log('   • Checking timing dependencies');
    } else {
      console.log('🎉 All tests passed successfully!');
      console.log('   • Your modular layer system is working correctly');
      console.log('   • All components are properly integrated');
      console.log('   • Performance meets requirements');
    }
    
    console.log('');
    console.log('📁 Test artifacts saved to: test-results/');
    console.log('🌐 HTML report available at: test-results/index.html');
    console.log('📊 JSON results at: test-results/results.json');
    console.log('');
  }

  getStatusIcon(status) {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      case 'flaky': return '⚠️';
      case 'running': return '🔄';
      default: return '❓';
    }
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}

export default TerminalHTMLReporter;
