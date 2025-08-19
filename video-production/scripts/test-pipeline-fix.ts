#!/usr/bin/env ts-node

import { EnhancedFrontendCaptureGenerator } from './enhanced-frontend-captures-with-validation.ts';

async function testPipelineFix() {
  console.log('🧪 Testing pipeline fix...');
  
  const generator = new EnhancedFrontendCaptureGenerator();
  
  try {
    console.log('🚀 Initializing generator...');
    await generator.initialize();
    
    console.log('✅ Generator initialized successfully');
    
    // Test just the first capture to see if it works
    console.log('🎬 Testing first capture...');
    await generator.generatePersonalIntro();
    
    console.log('✅ First capture completed successfully');
    
    const results = generator.getValidationResults();
    console.log(`📊 Validation results: ${results.length} tests`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.success ? '✅' : '❌'} ${result.message}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await generator.cleanup();
    console.log('🧹 Cleanup completed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testPipelineFix().catch(console.error);
}
