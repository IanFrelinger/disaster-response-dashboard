#!/usr/bin/env node

import { UserStoryTestRunner } from './user-stories';

async function main() {
  console.log('🎯 Disaster Response Dashboard - User Story Validation');
  console.log('=====================================================\n');

  try {
    const runner = new UserStoryTestRunner();
    const results = await runner.runAllScenarios();
    
    // Exit with appropriate code
    const passRate = runner.getPassRate();
    if (passRate >= 80) {
      console.log('🎉 Validation successful! System is ready for production use.');
      process.exit(0);
    } else if (passRate >= 60) {
      console.log('⚠️  Validation partially successful. Some issues need attention.');
      process.exit(1);
    } else {
      console.log('❌ Validation failed. System needs significant improvements.');
      process.exit(2);
    }
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(3);
  }
}

// Run the tests
main().catch(console.error);
