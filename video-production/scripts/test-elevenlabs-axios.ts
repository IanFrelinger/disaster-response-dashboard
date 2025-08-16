import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testElevenLabsAxios() {
  console.log('🧪 Testing ElevenLabs API with direct axios calls...');
  
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
    // Test text
    const testText = "Hello, this is a test of the ElevenLabs API integration.";
    
    console.log(`📝 Test text: "${testText}"`);
    
    // Make direct API call
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      data: {
        text: testText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Speech generated successfully!');
    console.log(`📊 Response size: ${response.data.length} bytes`);
    console.log(`📊 Response type: ${response.headers['content-type']}`);
    
    // Save the audio file
    const outputPath = path.join(__dirname, '..', 'audio', 'test-elevenlabs-axios.wav');
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`📁 Audio saved to: ${outputPath}`);
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testElevenLabsAxios().catch(console.error);
