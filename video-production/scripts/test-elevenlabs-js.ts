import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testElevenLabsJS() {
  console.log('🧪 Testing @elevenlabs/elevenlabs-js library...');
  
  // Get API key from environment
  const apiKey = process.env.ELEVEN_API_KEY;
  const voiceId = process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr';
  
  if (!apiKey) {
    console.error('❌ ELEVEN_API_KEY environment variable is required');
    return;
  }
  
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`🎤 Voice ID: ${voiceId}`);
  
  try {
    // Initialize the client
    const elevenlabs = new ElevenLabsClient({
      apiKey: apiKey
    });
    
    console.log('✅ ElevenLabs client initialized');
    
    // Test text
    const testText = "Hello, this is a test of the ElevenLabs API integration.";
    
    console.log(`📝 Test text: "${testText}"`);
    
    // Generate speech
    const audioBuffer = await elevenlabs.textToSpeech({
      voice_id: voiceId,
      text: testText,
      model_id: 'eleven_monolingual_v1'
    });
    
    console.log('✅ Speech generated successfully!');
    console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Save the audio file
    const outputPath = path.join(__dirname, '..', 'audio', 'test-elevenlabs-js.wav');
    fs.writeFileSync(outputPath, audioBuffer);
    
    console.log(`📁 Audio saved to: ${outputPath}`);
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testElevenLabsJS().catch(console.error);
