import { ExtendedNarrativeRecorder } from './extended-narrative-recorder';

async function testHazardFix() {
  console.log('🧪 Testing hazard interaction fixes...');
  
  const recorder = new ExtendedNarrativeRecorder();
  
  try {
    // Initialize browser using the correct method
    if (!(await recorder['initialize']())) {
      throw new Error('Failed to initialize browser');
    }

    if (!(await recorder['navigateToApp']())) {
      throw new Error('Failed to navigate to app');
    }
    
    // Get the second beat (hazard detection)
    const beats = recorder['config'].beats;
    const hazardBeat = beats[1]; // Index 1 is the hazard detection beat
    
    console.log(`\n🎬 Testing beat: ${hazardBeat.title}`);
    
    // Record just this beat
    const result = await recorder['recordBeat'](hazardBeat);
    
    console.log(`\n📊 Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up
    if (recorder['page']) {
      await recorder['page'].close();
    }
    if (recorder['context']) {
      await recorder['context'].close();
    }
    if (recorder['browser']) {
      await recorder['browser'].close();
    }
  }
}

// Run the test
testHazardFix().catch(console.error);
