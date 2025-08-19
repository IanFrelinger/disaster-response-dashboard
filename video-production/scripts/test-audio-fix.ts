#!/usr/bin/env ts-node

import { QuickCaptureGenerator } from './quick-capture-generator';

async function testAudioFix() {
  console.log('🧪 Testing audio duration fix...\n');
  
  const generator = new QuickCaptureGenerator();
  
  try {
    await generator.initialize();
    
    // Test just one segment to verify audio handling
    console.log('🎬 Testing Personal Introduction with improved audio handling...');
    await generator.generateBeatWithCriticReview('Personal Introduction', generator.generatePersonalIntro.bind(generator));
    
    console.log('\n✅ Audio fix test completed!');
    
  } catch (error) {
    console.error('❌ Audio fix test failed:', error);
    process.exit(1);
  } finally {
    await generator.cleanup();
  }
}

// Run the test
testAudioFix();
