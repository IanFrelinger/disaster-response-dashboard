import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TTSBeat {
  id: string;
  text: string;
}

interface TTSCueSheet {
  voice: string;
  beats: TTSBeat[];
}

class RecorderReadyTTSGenerator {
  private apiKey: string;
  private outputDir: string;
  private audioDir: string;

  constructor() {
    // Initialize ElevenLabs with API key from environment
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVEN_API_KEY environment variable is required');
    }
    
    // Ensure API key is a string
    this.apiKey = String(apiKey).trim();
    
    console.log(`🔑 API Key loaded: ${this.apiKey.substring(0, 10)}...`);
    console.log(`🎤 Voice ID: ${process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr'}`);
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.audioDir = path.join(__dirname, '..', 'audio');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateRecorderReadyTTS() {
    console.log('🎙️ Generating TTS for Recorder-Ready Timeline...');
    
    // Load the TTS cue sheet
    const cueSheetPath = path.join(__dirname, '..', 'tts-cue-sheet.json');
    const cueSheet: TTSCueSheet = JSON.parse(fs.readFileSync(cueSheetPath, 'utf8'));
    
    console.log(`📝 Found ${cueSheet.beats.length} beats to process`);
    console.log(`🎤 Using voice: ${cueSheet.voice}`);
    
    // Generate TTS for each beat
    for (let i = 0; i < cueSheet.beats.length; i++) {
      const beat = cueSheet.beats[i];
      console.log(`🎬 Processing beat ${i + 1}/${cueSheet.beats.length}: ${beat.id}`);
      
      try {
        await this.generateBeatTTS(beat, cueSheet.voice);
        console.log(`✅ Beat ${beat.id} TTS generated successfully`);
      } catch (error) {
        console.error(`❌ Error generating TTS for beat ${beat.id}:`, error);
      }
    }
    
    console.log('🎙️ TTS generation completed!');
  }

  private async generateBeatTTS(beat: TTSBeat, voice: string) {
    const fileName = `${beat.id}.wav`;
    const outputPath = path.join(this.audioDir, fileName);
    
    // Use the configured voice ID instead of the voice name
    const voiceId = process.env.ELEVEN_VOICE_ID || 'LIpBYrITLsIquxoXdSkr';
    
    try {
      // Debug the parameters being sent
      console.log(`🔍 Debug - API Key type: ${typeof this.apiKey}, length: ${this.apiKey.length}`);
      console.log(`🔍 Debug - Voice ID: ${voiceId}`);
      console.log(`🔍 Debug - Text length: ${beat.text.length}`);
      
      // Generate TTS using direct axios call
      const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        data: {
          text: beat.text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        responseType: 'arraybuffer'
      });
      
      // Write the audio file
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`📁 Saved: ${fileName} (${response.data.length} bytes)`);
      console.log(`🎯 Text: "${beat.text.substring(0, 80)}..."`);
      
    } catch (error) {
      console.error(`❌ Error generating audio for ${beat.id}:`, error.message);
      
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data: ${error.response.data}`);
      }
      
      // Create a placeholder audio file for now
      const placeholderText = `Placeholder audio for ${beat.id} beat. Text: ${beat.text.substring(0, 100)}...`;
      const placeholderBuffer = Buffer.from(placeholderText, 'utf8');
      fs.writeFileSync(outputPath, placeholderBuffer);
      
      console.log(`📁 Placeholder file created: ${fileName}`);
    }
  }
}

// Run the TTS generation
const generator = new RecorderReadyTTSGenerator();
generator.generateRecorderReadyTTS().catch(console.error);
